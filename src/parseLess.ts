import * as fs from 'fs';
import * as Less from 'less';
import { promisify } from 'util';
import { alerts } from './alerts';
const NpmImportPlugin = require('less-plugin-npm-import');
const CssModulesLessPlugin = require('less-plugin-css-modules');

const readFile = promisify(fs.readFile);

export async function parse(filepath: string) {
	const contents = await readFile(filepath, 'utf8');
	try {
		const result = await Less.render(contents, {
			filename: filepath,
			plugins: [
				new NpmImportPlugin({ prefix: '~' }),
				new CssModulesLessPlugin.default({ mode: 'global' }),
			]
		});

		return result;
	}
	catch (e) {
		const location = e.filename ? `(${e.filename}[${e.line}:${e.column}])` : '';
		const message = `${e.message} ${location}`;
		alerts.error(message);
		throw new Error(message)
	}
}
