import { getPythonInterpreterCommand, getTestRunConfig } from "./config";
import { getPlatform } from "./platform/selector";
import { PdfComposer } from '../models/pdfGenerator';

export class PytestFactory {
    private config = getTestRunConfig();

    constructor(private readonly testScope?: string) {}

    private getTestScope(): string {
        return this.testScope ? `"${this.testScope}"` : '';
    }

    private getInterpreterPath(): string {
        return getPythonInterpreterCommand();
    }

    private getMarks(): string[] {
        if (this.config.selectTestByMark) {
            return ["-m", `${this.config.selectTestByMark}`];
        }
        return [];
    }

    private getNames(): string[] {
        if (this.config.selectTestByName) {
            return ["-k", `${this.config.selectTestByName}`];
        }
        return [];
    }

    private getAdditionalOptions(): string {
        return this.config.additionalOptions || '';
    }

    private getAllureDir(): string[] {
        return ["--alluredir", "report"];
    }

    private getCleanAllResults(): string {
        return this.config.cleanOldResults ? "--clean-alluredir" : '';
    }

    private getRealTimeLogs(): string {
        return this.config.realTimeLogs ? "--log-cli-level=INFO" : '';
    }

    private getPdfConfig(): string {
        if (!this.config.pdfReport) {
            return '';
        }
        return "--generate-pdf " + new PdfComposer().getCommand();
    }

    getFlags(): string[] {
        return concat(
            "-m",
            "pytest",
            this.getTestScope(),
            ...this.getNames(),
            ...this.getMarks(),
            this.getAdditionalOptions(),
            ...this.getAllureDir(),
            this.getCleanAllResults(),
            this.getRealTimeLogs(),
            this.getPdfConfig(),
            "-v"
        );
    }

    getPythonPath(): string {
        return this.getInterpreterPath();
    }
}

function concat(...args: string[]): string[] {
    return args.filter(Boolean);
}