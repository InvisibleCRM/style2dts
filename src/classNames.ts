import camelcase = require("camelcase");
import { paramCase } from "param-case";

export type ClassName = string;
export type NameFormat = "camel" | "kebab" | "param" | "dashes" | "none";
export type Decorator = (className: ClassName) => string;

export function getDecorator(nameFormat: NameFormat): Decorator {
	switch (nameFormat) {
		case "kebab":
		case "param":
			return className => paramCase(className);
		case "camel":
			return className => camelcase(className);
		case "dashes":
			return className =>
				/-/.test(className) ? camelcase(className) : className;
		case "none":
			return className => className;
	}
};
