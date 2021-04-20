import CssCore = require("css-modules-loader-core");
import { Config } from "./config";
import { writeFile } from "fs";
import { promisify } from 'util'

const cssCore = new CssCore();

const writeFileAsync = promisify(writeFile);

export function makeFileName(styleFile: string) {
	return `${styleFile}.d.ts`;
}

export async function generate(styleFile: string, css: string, config: Pick<Config, 'decorator' | 'formatter'>) {
	const cssData = await cssCore.load(css);
	const classNames = Object.keys(cssData.exportTokens);
	const dts = config.formatter(classNames.map(config.decorator));
	const dtsPath = makeFileName(styleFile);
	await writeFileAsync(dtsPath, dts);
	return dtsPath;
}
