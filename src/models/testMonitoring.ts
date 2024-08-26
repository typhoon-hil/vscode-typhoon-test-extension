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
    private children: TestItem[] = [];
    parent?: TestItem;

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

    addChild(child: TestItem) {
        this.children.push(child);
        child.parent = this;
    }

    getChildren() {
        return [...this.children];
    }

    private updateStatus() {
        const statuses = this.children.map(child => child.status);
        if (statuses.includes(TestStatus.Running)) {
            this.setStatus(TestStatus.Running);
        } else if (statuses.includes(TestStatus.Failed)) {
            this.setStatus(TestStatus.Failed);
        } else if (statuses.includes(TestStatus.XFailed)) {
            this.setStatus(TestStatus.XFailed);
        } else if (statuses.includes(TestStatus.Skipped)) {
            this.setStatus(TestStatus.Skipped);
        } else if (statuses.includes(TestStatus.XPassed)) {
            this.setStatus(TestStatus.XPassed);
        } else {
            this.setStatus(TestStatus.Passed);
        }

        if (this.parent) {
            this.parent.updateStatus();
        }
    }

    update(status: TestStatus) {
        this.setStatus(status);
        this.description = (status as string).toUpperCase();
        this.parent?.updateStatus();
    }
}

export interface TestNameDetails {
    fullTestName: string;
    testName: string;
    testPath: string;
    params?: string;
}

export function extractTestNameDetails(fullTestName: string): TestNameDetails {
    const testPath = fullTestName.split('::')[0];
    const testName = fullTestName.split('::')[1].split('[')[0];
    const params = fullTestName.split('[')[1]?.split(']')[0];
    return { fullTestName, testName, testPath, params };
}