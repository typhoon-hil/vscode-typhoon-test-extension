import * as vscode from 'vscode';
import { TestItem, TestStatus } from '../models/testMonitoring';


export class TestTreeProvider implements vscode.TreeDataProvider<TestItem> {
    private _onDidChangeTreeData: vscode.EventEmitter<TestItem | undefined | void> = new vscode.EventEmitter<TestItem | undefined | void>();
    readonly onDidChangeTreeData: vscode.Event<TestItem | undefined | void> = this._onDidChangeTreeData.event;

    private tests: TestItem[] = [];

    refresh(): void {
        this._onDidChangeTreeData.fire();
    }

    getTreeItem(element: TestItem): vscode.TreeItem {
        return element;
    }

    getChildren(element?: TestItem): vscode.ProviderResult<TestItem[]> {
        if (element) {
            return [];
        } else {
            return this.tests;
        }
    }

    addTest(testName: string, status: TestStatus): void {
        const newTest = new TestItem(testName, vscode.TreeItemCollapsibleState.None, status);
        this.tests.push(newTest);
        this.refresh();
    }

    updateTestStatus(testName: string, status: TestStatus): void {
        const test = this.tests.find(t => t.label === testName);
        if (test) {
            test.description = status;
            test.iconPath = new vscode.ThemeIcon(status === 'passed' ? 'check' : 'error');
            this.refresh();
        }
    }
}