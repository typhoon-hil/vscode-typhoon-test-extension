import * as vscode from 'vscode';

export enum TestStatus {
    Running = 'running',
    Passed = 'passed',
    Failed = 'failed',
    XFailed = 'xfailed',
    Skipped = 'skipped',
    XPassed = 'xpassed',
    Error = 'error',
    Interrupted = 'interrupted',
    Collected = 'collected',
}

function statusStringToEnum(status: string): TestStatus {
    status = status.trim().toLowerCase();
    switch (status) {
        case 'passed':
            return TestStatus.Passed;
        case 'failed':
            return TestStatus.Failed;
        case 'xfail':
            return TestStatus.XFailed;
        case 'skipped':
            return TestStatus.Skipped;
        case 'xpass':
            return TestStatus.XPassed;
        case 'error':
            return TestStatus.Error;
        default:
            return TestStatus.Running;
    }
}

export function matchStatus(line: string): TestStatus | undefined {
    const passMatch = line.match(/PASSED/i);
    const failMatch = line.match(/FAILED/i);
    const skipMatch = line.match(/SKIPPED/i);
    const xfailMatch = line.match(/XFAIL/i);
    const xpassMatch = line.match(/XPASS/i);
    const errorMatch = line.match(/ERROR/i);

    const statusMatches = [passMatch, failMatch, skipMatch, xfailMatch, xpassMatch, errorMatch];
    const statusString = statusMatches.find(match => match !== null)?.[0];

    return statusString ? statusStringToEnum(statusString) : undefined;
}


export class TestItem extends vscode.TreeItem {
    static readonly IgnoreContextValue = 'ignore context value';
    private children: TestItem[] = [];
    parent?: TestItem;

    constructor(
        public readonly id: string,
        public readonly label: string,
        public readonly collapsibleState: vscode.TreeItemCollapsibleState,
        public status: TestStatus,
        public readonly details: TestNameDetails,
    ) {
        super(label, collapsibleState);
        this.setIcon();
        this.contextValue = id === TestItem.IgnoreContextValue ? TestItem.IgnoreContextValue : 'testItem';
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
            case TestStatus.Error:
                this.iconPath = new vscode.ThemeIcon('error');
                break;
            case TestStatus.Interrupted:
                this.iconPath = new vscode.ThemeIcon('stop');
                break;
            case TestStatus.Collected:
                this.iconPath = this.parent ? new vscode.ThemeIcon('symbol-method') : new vscode.ThemeIcon('symbol-class');
                break;
        }
    }

    setStatus(status: TestStatus) {
        this.status = status;
        this.setIcon();
        this.description = (status as string).toUpperCase();
    }

    addChild(child: TestItem) {
        this.children.push(child);
        child.parent = this;
        this.updateStatus();
    }

    getChildren() {
        return [...this.children];
    }

    private updateStatus() {
        const statuses = this.children.map(child => child.status);
        if (statuses.includes(TestStatus.Collected)) {
            this.setStatus(TestStatus.Collected);
        } else if (statuses.includes(TestStatus.Interrupted)) {
            this.setStatus(TestStatus.Interrupted);
        } else if (statuses.includes(TestStatus.Running)) {
            this.setStatus(TestStatus.Running);
        } else if (statuses.includes(TestStatus.Error)) {
            this.setStatus(TestStatus.Error);
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
        this.parent?.updateStatus();
    }
}

export interface TestNameDetails {
    fullTestName: string; // testPath::testName[params]
    folders: string[];
    name: string;
    module: string;
    params?: string;
}

export function extractTestNameDetails(fullTestName: string): TestNameDetails {
    const testPath = fullTestName.split('::')[0];
    const testName = fullTestName.split('::')[1].split('[')[0];
    const params = fullTestName.split('[')[1]?.split(']')[0];
    const folders = testPath.split('/');
    const module = folders.pop() || testPath;
    return { fullTestName, name: testName, module, params, folders };
}

export function generateDummyTestItem(): TestItem {
    const details = {
        fullTestName: 'Starting...',
        folders: [],
        name: 'Starting...',
        module: 'Starting...',
    };

    return new TestItem(TestItem.IgnoreContextValue, 'Starting...', vscode.TreeItemCollapsibleState.None, TestStatus.Running, details);
}