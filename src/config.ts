import { Decorator, getDecorator, NameFormat } from "./classNames";
import { ExportType, Formatter, getFormatter } from "./dtsBody";

export interface Options {
	globPattern: string | string[];
	nameFormat?: NameFormat;
	exportType?: ExportType;
}

export class Config {
	readonly decorator: Decorator;
	readonly formatter: Formatter;

	constructor(options: Options) {
		this.decorator = getDecorator(options.nameFormat || 'camel');
		this.formatter = getFormatter(options.exportType || 'default');
	}
}
