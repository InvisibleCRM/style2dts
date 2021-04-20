import * as reserved from "reserved-words";
import { alerts } from "./alerts";
import { ClassName } from "./classNames";

export type ExportType = "named" | "default";
export const EXPORT_TYPES: ExportType[] = ["named", "default"];

const classNameToNamedTypeDefinition = (className: ClassName) =>
	`export const ${className}: string;`;

const classNameToInterfaceKey = (className: ClassName) =>
	`  '${className}': string;`;

const isReservedKeyword = (className: ClassName) =>
	reserved.check(className, "es5", true) ||
	reserved.check(className, "es6", true);

const isValidName = (className: ClassName) => {
	if (isReservedKeyword(className)) {
		alerts.warn(
			`[SKIPPING] '${className}' is a reserved keyword (consider renaming or using --exportType default).`
		);
		return false;
	} else if (/-/.test(className)) {
		alerts.warn(
			`[SKIPPING] '${className}' contains dashes (consider using 'camelCase' or 'dashes' for --nameFormat or using --exportType default).`
		);
		return false;
	}

	return true;
};

export type Formatter = (classNames: ClassName[]) => string;

function defaultFormatter(classNames: ClassName[]) {
	let result = "export interface Styles {\n";
	result += classNames.map(classNameToInterfaceKey).join("\n");
	result += "\n}\n\n";
	result += "export type ClassNames = keyof Styles;\n\n";
	result += "declare const styles: Styles;\n\n";
	result += "export default styles;\n";
	return result;
}

function namedFormatter(classNames: ClassName[]) {
	let result = classNames
		.filter(isValidName)
		.map(classNameToNamedTypeDefinition);

	// Sepearte all type definitions be a newline with a trailing newline.
	return result.join("\n") + "\n";
}

export function getFormatter(exportType: ExportType) {
	switch (exportType) {
		case "default":
			return defaultFormatter;
		case "named":
			return namedFormatter;
	}
};
