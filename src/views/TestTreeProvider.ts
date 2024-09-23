import * as vscode from 'vscode';
import { extractTestNameDetails, generateDummyTestItem, matchStatus, TestItem, TestNameDetails, TestStatus } from '../models/testMonitoring';


export class TestTreeProvider implements vscode.TreeDataProvider<TestItem> {
    private _onDidChangeTreeData: vscode.EventEmitter<TestItem | undefined | void> = new vscode.EventEmitter<TestItem | undefined | void>();
    readonly onDidChangeTreeData: vscode.Event<TestItem | undefined | void> = this._onDidChangeTreeData.event;

    private rootItems: TestItem[] = [];
    private lastTest: TestItem | undefined;
    private readonly dummyTest = generateDummyTestItem();

    refresh(): void {
        this._onDidChangeTreeData.fire();
    }

    getTreeItem(element: TestItem): vscode.TreeItem {
        return element;
    }

    getChildren(element?: TestItem): vscode.ProviderResult<TestItem[]> {
        if (element) {
            return element.getChildren();
        } else {
            return this.rootItems;
        }
    }

    private updateTest(testNameDetails: TestNameDetails, status: TestStatus): void {
        const test = this.findTestItem(testNameDetails.fullTestName)!;
        test.update(status);
    }

    private addTest(testNameDetails: TestNameDetails, status: TestStatus): void {
        const isParametrized = testNameDetails.params !== undefined;
        const lastFolder = this.createTestFolders(testNameDetails);
        const testModuleItem = this.createTestModuleItem(testNameDetails, lastFolder);
        const newTest = this.createChildTestItem(testNameDetails, status, testModuleItem, isParametrized);
        if (isParametrized) {
            this.createParametrizedTestItem(testNameDetails, status, newTest);
        }
    }

    private createTestFolders(testNameDetails: TestNameDetails): TestItem | undefined {
        Object.assign({}, testNameDetails, { params: undefined, fullTestName: "", module: "" });
        const folders = testNameDetails.folders;
        let currentFolder = this.rootItems;
        let lastFolder: TestItem | undefined;

        folders.forEach(folder => {
            let folderItem = currentFolder.find(t => t.label === folder);
            if (!folderItem) {
                folderItem = new TestItem(folder, folder, vscode.TreeItemCollapsibleState.Collapsed, TestStatus.Running, testNameDetails);
                lastFolder ? lastFolder.addChild(folderItem) : this.rootItems.push(folderItem);
            }
            currentFolder = folderItem.getChildren();
            lastFolder = folderItem;
        });

        return lastFolder;
    }

    private createParametrizedTestItem(testNameDetails: TestNameDetails, status: TestStatus, parent: TestItem) {
        const parametrizedTest = new TestItem(testNameDetails.fullTestName, testNameDetails.params!, vscode.TreeItemCollapsibleState.None, status, testNameDetails);
        parent.addChild(parametrizedTest);
        this.lastTest = parametrizedTest;
    }

    private createChildTestItem(testNameDetails: TestNameDetails, status: TestStatus, parent: TestItem, isExpandable: boolean): TestItem {
        let testNameItem = parent.getChildren().find(t => t.label === testNameDetails.name);
        if (testNameItem) {
            return testNameItem;
        }
        const collapsibleState = isExpandable ? vscode.TreeItemCollapsibleState.Collapsed : vscode.TreeItemCollapsibleState.None;
        const id = testNameDetails.params ? testNameDetails.fullTestName.split('[')[0] : testNameDetails.fullTestName;

        const newTest = new TestItem(id, testNameDetails.name, collapsibleState, status, testNameDetails);
        parent.addChild(newTest);
        this.lastTest = newTest;
        return newTest;
    }

    private createTestModuleItem(testNameDetails: TestNameDetails, nearestFolder: TestItem | undefined): TestItem {
        const path = testNameDetails.folders.join('/');
        const module = path ? '/' + testNameDetails.module : testNameDetails.module;
            
        let testPathItem = this.findTestItem(path + module);
        if (!testPathItem) {
            testPathItem = new TestItem(path + module, testNameDetails.module, vscode.TreeItemCollapsibleState.Collapsed, TestStatus.Running, testNameDetails);
            if (!nearestFolder) {
                this.rootItems.push(testPathItem);
            } else {
                nearestFolder.addChild(testPathItem);
            }
        }
        return testPathItem;
    }

    addOrUpdateTest(testName: TestNameDetails, status: TestStatus): void {
        this.clearInit();
        const test = this.findTestItem(testName.fullTestName);
        test ? this.updateTest(testName, status) : this.addTest(testName, status);
        this.refresh();
    }

    addCollectOnlyTest(testName: TestNameDetails): void {
        this.addTest(testName, TestStatus.Collected);
        this.lastTest?.setStatus(TestStatus.Collected);
        this.refresh();
    }

    containsTest(testName: string): boolean {
        return this.rootItems.some(t => t.label === testName);
    }

    private findTestItem(identifier: string): TestItem | undefined {
        return this.getFlattenTests().find(test => test.identifier === identifier);
    }

    clearTests(): void {
        this.rootItems = [];
        this.lastTest = undefined;
        this.refresh();
    }

    updateLastTest(status: TestStatus) {
        if (this.rootItems) {
            const lastTest = this.lastTest;
            if (!lastTest) {
                return;
            }
            const lastTestNameDetails = lastTest.details;
            this.updateTest(lastTestNameDetails, status);
            this.refresh();
        }
    }

    init() {
        this.rootItems.push(this.dummyTest);
        this.refresh();
    }

    clearInit() {
        if (this.rootItems.includes(this.dummyTest)) {
            this.rootItems.splice(this.rootItems.indexOf(this.dummyTest), 1);
        }
        this.refresh();
    }

    private getRunningTests(): TestItem[] {
        return this.getFlattenTests().filter(test => test.status === TestStatus.Running)
            .filter(test => test.getChildren().length === 0);
    }

    private getFlattenTests(tests: TestItem[] = this.rootItems): TestItem[] {
        return tests.flatMap(test => [test, ...this.getFlattenTests(test.getChildren())]);
    }

    handleInterrupt() {
        let t = this.getFlattenTests(this.rootItems);
        this.getRunningTests().forEach(test => test.update(TestStatus.Interrupted));
        this.refresh();
    }

    handleTestOutput(line: string) {
        line = line.replace(/\s+/g, ' ').trim();

        const testNameMatch = line.split(' ')[0]?.match(/([^\s]+\.py::(?:[^\s]+::)?[^\s]+)/); // TODO: Improve regex
        const testDetailsString = line.split(' ')[0];
        const statusMatch = matchStatus(line);

        if (testNameMatch) {
            const testNameDetails = extractTestNameDetails(testDetailsString);
            const testName = testNameDetails.fullTestName;

            if (!this.containsTest(testName)) {
                this.addOrUpdateTest(testNameDetails, TestStatus.Running);
            }

            if (statusMatch) {
                this.addOrUpdateTest(testNameDetails, statusMatch);
            }
        }
        else if (statusMatch) {
            this.updateLastTest(statusMatch);
        }
    }
}