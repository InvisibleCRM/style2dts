
import * as fs from 'fs';
import * as path from 'path';
import * as glob from 'glob';
import * as minimatch from 'minimatch';
import { promisify } from 'util';
import { Compiler, WebpackPluginInstance } from 'webpack';
import { Dependencies } from './dependencies';
import { generate, makeFileName } from './css2dts';
import { parse } from './parseLess';
import { Config, Options } from './config';
import { alerts } from './alerts';

const globPromise = promisify<string, string[]>(glob);
const removeFile = promisify(fs.unlink);

export class Style2DTS implements WebpackPluginInstance {
	private config: Config;
	private deps = new Dependencies();

	constructor(private options: Options) {
		this.config = new Config(options);
	}

	private matches(filePath: string) {
		if (filePath.toLowerCase().endsWith('d.ts'))
			return false;

		const patterns = typeof this.options.globPattern === 'string' ? [this.options.globPattern] : this.options.globPattern;
		return patterns.some(pattern => minimatch(filePath, pattern));
	}

	private async findFiles() {
		const patterns = typeof this.options.globPattern === 'string' ? [this.options.globPattern] : this.options.globPattern;
		const files = await Promise.all(patterns.map(async (pattern) => await globPromise(pattern)));
		return files.reduce((prev, current) => prev.concat(...current), []);
	}

	private async processChanges(compiler: Compiler) {
		const tasks: Promise<void>[] = [];

		// depending on incremental or install call - process all or only modified files.
		if (!compiler.modifiedFiles) {
			this.deps.clear();
			const files = await this.findFiles();
			alerts.info(`${this.options.globPattern} matches ${files.length} files.`);

			tasks.push(...files.map(async (file) => {
				if (!file.toLowerCase().endsWith('d.ts')) {
					file = path.resolve(file);
					const content = await parse(file);
					this.deps.add(file, content.imports);
					await generate(file, content.css, this.config);
				}
			}));
		}
		else {
			tasks.push(...Array.from(compiler.modifiedFiles.values()).map(async (file) => {
				if (this.deps.isOurFile(file)) {
					await Promise.all(this.deps.mapDeps(file, async (affectedFile) => {
						const content = await parse(file);
						const dtsPath = await generate(file, content.css, this.config);
						alerts.success(`Updated ${dtsPath}`);
					}));
				}
				else {
					if (this.matches(file)) {
						const content = await parse(file);
						this.deps.add(file, content.imports);
						const dtsPath = await generate(file, content.css, this.config);
						alerts.success(`Added ${dtsPath}`);
					}
				}
			}));
		}

		// remove d.ts files if removed files are style sources
		if (compiler.removedFiles) {
			tasks.push(...Array.from(compiler.removedFiles.values()).map(async (file) => {
				if (this.deps.isOurFile(file)) {
					const dtsPath = makeFileName(file);
					await removeFile(dtsPath);
					this.deps.remove(file);
					alerts.success(`Removed ${dtsPath}`);
				}
			}));
		}

		return Promise.all(tasks);
	}

	apply(compiler: Compiler) {
		compiler.hooks.run.tapPromise('TypedLessModulesPlugin', async (compiler) => {
			await this.processChanges(compiler);
		});

		compiler.hooks.watchRun.tapPromise('TypedLessModulesPlugin', async (compiler) => {
			try {
				await this.processChanges(compiler);
			}
			catch (err) {
				alerts.critical(err.toString());
			}
		});
	}
}
