import * as vscode from 'vscode';

export enum TestStatus {
    Running = 'running',
    Passed = 'passed',
    Failed = 'failed',
    XFailed = 'xfailed',
    Skipped = 'skipped',
    XPassed = 'xpassed',
}

export class TestItem extends vscode.TreeItem {
    constructor(
        public readonly label: string,
        public readonly collapsibleState: vscode.TreeItemCollapsibleState,
        public status: TestStatus,
    ) {
        super(label, collapsibleState);
        this.setIcon();
    }

    setIcon(): void {
        switch (this.status) {
            case TestStatus.Running:
                this.iconPath = new vscode.ThemeIcon('sync~spin');
                break;
            case TestStatus.Passed:
                this.iconPath = new vscode.ThemeIcon('pass');
                break;
            case TestStatus.Failed:
                this.iconPath = new vscode.ThemeIcon('error');
                break;
            case TestStatus.XFailed:
                this.iconPath = new vscode.ThemeIcon('warning');
                break;
            case TestStatus.Skipped:
                this.iconPath = new vscode.ThemeIcon('circle-outline');
                break;
            case TestStatus.XPassed:
                this.iconPath = new vscode.ThemeIcon('check');
                break;
            default:
                this.iconPath = new vscode.ThemeIcon('question');
                break;
        }
    }

    setStatus(status: TestStatus) {
        this.status = status;
        this.setIcon();
    }
}