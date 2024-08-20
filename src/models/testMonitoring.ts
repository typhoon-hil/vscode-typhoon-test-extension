import * as vscode from 'vscode';

export enum TestStatus {
    Running = 'running',
    Passed = 'passed',
    Failed = 'failed',
}

export class TestItem extends vscode.TreeItem {
    constructor(
        public readonly label: string,
        public readonly collapsibleState: vscode.TreeItemCollapsibleState,
        public readonly status: TestStatus,
    ) {
        super(label, collapsibleState);
        this.setIcon();
    }

    private setIcon(): void {
        this.iconPath = new vscode.ThemeIcon(this.status === 'running' ? 'sync~spin' : 
            this.status === 'passed' ? 'check' : 
            'error'
        );
    }
}