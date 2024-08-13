import { getTestRunConfig } from "./config";
import { getPlatform } from "./platform/index";

export class PytestBuilder {
    private config = getTestRunConfig();
    private platform = getPlatform();

    private getInterpreterPath(): string {
        switch (this.config.interpreterType) {
            case 'system':
                return this.platform.getPythonCommand();
            case 'embedded':
                return `'${this.config.embeddedInterpreterPath!}'`;
            case 'custom':
                return `'${this.config.customInterpreterPath!}'`;
            default:
                return '';
        }
    }

    private getMarks(): string {
        if (this.config.selectTestByMark) {
            return `-m ${this.config.selectTestByMark}`;
        }
        return '';
    }

    private getNames(): string {
        if (this.config.selectTestByName) {
            return this.config.selectTestByName;
        }
        return '';
    }

    private getAdditionalOptions(): string {
        return this.config.additionalOptions || '';
    }

    build(): string {
        let command = `${this.getInterpreterPath()} -m pytest ${this.getNames()} ${this.getMarks()} ${this.getAdditionalOptions()}`;
        return command;
    }
}