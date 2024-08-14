import * as vscode from 'vscode';
import { getTestRunConfig } from "./config";
import { getPlatform } from "./platform/index";

export class PytestBuilder {
    private config = getTestRunConfig();
    private platform = getPlatform();
    private terminal: vscode.Terminal;

    constructor(terminal: vscode.Terminal) {
        this.terminal = terminal;
    }

    private getInterpreterPath(): string {
        switch (this.config.interpreterType) {
            case 'system':
                return this.platform.getPythonCommand();
            case 'embedded':
                return `"${this.config.embeddedInterpreterPath!}"`;
            case 'custom':
                return `"${this.config.customInterpreterPath!}"`;
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
            return `-k ${this.config.selectTestByName}`;
        }
        return '';
    }

    private getAdditionalOptions(): string {
        return this.config.additionalOptions || '';
    }

    private getAllureDir(): string {
        return "--alluredir report";
    }

    private buildDefaultCommand(): string {
        let command = `${this.getInterpreterPath()} -m pytest ` +
            `${this.getNames()} ${this.getMarks()} ${this.getAdditionalOptions()} ${this.getAllureDir()} -v`;
        return command;
    }

    private buildPowerShellCommand(): string {
        return `& ${this.buildDefaultCommand()}`.replace(/"/g, "'");
    }

    private isPowerShell(): boolean {
        const shell = vscode.env.shell.toLowerCase();
        return shell.includes('powershell') || shell.includes('pwsh');
    }

    build(): string {
        return this.isPowerShell() ? this.buildPowerShellCommand() : this.buildDefaultCommand();
    }
}