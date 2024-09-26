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
        if (!element.IsFolder) {
            element.command = {
                command: 'typhoon-test.viewTestInCode',
                title: 'View Test In Code',
                arguments: [element]
            };
        }
        return element;
    }

    getChildren(element?: TestItem): vscode.ProviderResult<TestItem[]> {
        return element?.getChildren() || this.rootItems;
    }

    private updateTest(testNameDetails: TestNameDetails, status: TestStatus): void {
        const test = this.findTestItem(testNameDetails.fullTestName)!;
        test.update(status);
    }

    private addTest(testNameDetails: TestNameDetails, status: TestStatus): void {
        const lastFolder = this.createTestFolders(testNameDetails);
        const testModuleItem = this.createTestModuleItem(testNameDetails, lastFolder);
        const testClassItem = this.createClassItem(testNameDetails, testModuleItem);
        const newTest = this.createTestNameItem(testNameDetails, status, testClassItem);
        this.createParametrizedTestItem(testNameDetails, status, newTest);
    }

    private createTestFolders(testNameDetails: TestNameDetails): TestItem | undefined {
        Object.assign({}, testNameDetails, { params: undefined, fullTestName: "", module: "" });
        const folders = testNameDetails.folders;
        let currentFolder = this.rootItems;
        let lastFolder: TestItem | undefined;

        folders.forEach(folder => {
            let folderItem = currentFolder.find(t => t.identifier === folder);
            if (!folderItem) {
                folderItem = new TestItem(folder, folder + '/', vscode.TreeItemCollapsibleState.Collapsed, TestStatus.Running);
                lastFolder ? lastFolder.addChild(folderItem) : this.rootItems.push(folderItem);
            }
            currentFolder = folderItem.getChildren();
            lastFolder = folderItem;
        });

        return lastFolder;
    }

    private createParametrizedTestItem(testNameDetails: TestNameDetails, status: TestStatus, parent: TestItem) {
        if (!testNameDetails.params) {
            return;
        }
        const parametrizedTest = new TestItem(testNameDetails.fullTestName, testNameDetails.params, vscode.TreeItemCollapsibleState.None, status);
        parent.addChild(parametrizedTest);
        this.lastTest = parametrizedTest;
    }

    private createTestNameItem(testNameDetails: TestNameDetails, status: TestStatus, parent: TestItem): TestItem {
        const id = testNameDetails.params ? testNameDetails.fullTestName.split('[')[0] : testNameDetails.fullTestName;
        let testNameItem = this.findTestItem(id);
        if (testNameItem) {
            return testNameItem;
        }
        const collapsibleState = testNameDetails.params ? vscode.TreeItemCollapsibleState.Collapsed : vscode.TreeItemCollapsibleState.None;

        const newTest = new TestItem(id, testNameDetails.name, collapsibleState, status);
        parent.addChild(newTest);
        this.lastTest = newTest;
        return newTest;
    }

    private createTestModuleItem(testNameDetails: TestNameDetails, nearestFolder: TestItem | undefined): TestItem {
        const path = testNameDetails.folders.join('/');
        const module = path ? '/' + testNameDetails.module : testNameDetails.module;
            
        let testPathItem = this.findTestItem(path + module);
        if (!testPathItem) {
            testPathItem = new TestItem(path + module, testNameDetails.module, vscode.TreeItemCollapsibleState.Collapsed, TestStatus.Running);
            if (!nearestFolder) {
                this.rootItems.push(testPathItem);
            } else {
                nearestFolder.addChild(testPathItem);
            }
        }
        return testPathItem;
    }

    private createClassItem(testNameDetails: TestNameDetails, module: TestItem): TestItem {
        if (!testNameDetails.class) {
            return module;
        }
        const id = testNameDetails.fullTestName.split('::').slice(0, 2).join('::');
        const classItem = this.findTestItem(id);
        if (classItem) {
            return classItem;
        }
        const newClass = new TestItem(id, testNameDetails.class, vscode.TreeItemCollapsibleState.Collapsed, TestStatus.Running);
        module.addChild(newClass);
        return newClass;
    }

    addOrUpdateTest(testName: TestNameDetails, status: TestStatus): void {
        this.clearInit();
        const test = this.findTestItem(testName.fullTestName);
        test ? this.updateTest(testName, status) : this.addTest(testName, status);
        this.refresh();
    }

    addCollectOnlyTest(testName: TestNameDetails): void {
        this.clearInit();
        this.addTest(testName, TestStatus.Collected);
        this.lastTest?.setStatus(TestStatus.Collected);
        this.refresh();
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
            
            this.addOrUpdateTest(testNameDetails, TestStatus.Running);

            if (statusMatch) {
                this.addOrUpdateTest(testNameDetails, statusMatch);
            }
        }
        else if (statusMatch) {
            this.updateLastTest(statusMatch);
        }
    }
}