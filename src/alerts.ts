import chalk from "chalk";

function addHeader(message: string) {
	return `[Style2DTS] ${message}`;
}

const critical = (message: string) => console.log(chalk.bold.red(addHeader(message)));
const error = (message: string) => console.log(chalk.red(addHeader(message)));
const warn = (message: string) => console.log(chalk.yellowBright(addHeader(message)));
const notice = (message: string) => console.log(chalk.gray(addHeader(message)));
const info = (message: string) => console.log(chalk.blueBright(addHeader(message)));
const success = (message: string) => console.log(chalk.green(addHeader(message)));

export const alerts = { critical, error, warn, notice, info, success };
