import * as vscode from 'vscode';
import { getTestRunConfig } from "./config";
import { getPlatform } from "./platform/index";

export class PytestFactory {
    private config = getTestRunConfig();
    private platform = getPlatform();

    constructor() {
    }

    private getInterpreterPath(): string {
        switch (this.config.interpreterType) {
            case 'embedded':
                return `"${this.config.embeddedInterpreterPath!}"`;
            case 'custom':
                return `"${this.config.customInterpreterPath!}"`;
            case 'system':
            default:
                return this.platform.getPythonCommand();
        }
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
        return this.config.realTimeLogs ? "-s" : '';
    }

    getFlags(): string[] {
        return concat(
            "-m",
            "pytest",
            ...this.getNames(),
            ...this.getMarks(),
            this.getAdditionalOptions(),
            ...this.getAllureDir(),
            this.getCleanAllResults(),
            this.getRealTimeLogs(),
            "-v"
        );
    }

    getPythonPath(): string {
        return this.getInterpreterPath();
    }
}

function isPowerShell(): boolean {
    const shell = vscode.env.shell.toLowerCase();
    return shell.includes('powershell') || shell.includes('pwsh');
}

function concat(...args: string[]): string[] {
    return args.filter(Boolean);
}