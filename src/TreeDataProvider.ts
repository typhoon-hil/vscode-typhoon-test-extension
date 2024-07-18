import * as vscode from 'vscode';
import { exec } from 'child_process';
import * as path from 'path';

export class TreeDataProvider implements vscode.TreeDataProvider<TreeNode> {
    private _onDidChangeTreeData: vscode.EventEmitter<TreeNode | undefined | void> = new vscode.EventEmitter<TreeNode | undefined | void>();
    readonly onDidChangeTreeData: vscode.Event<TreeNode | undefined | void> = this._onDidChangeTreeData.event;

    constructor(private moduleName: string | undefined = undefined) {}

    async getTreeItem(element: TreeNode): Promise<vscode.TreeItem> {
        return element;
    }

    async getChildren(element?: TreeNode): Promise<TreeNode[]> {
        if (!element) {
            if (!this.moduleName) {
                return [];
            }
            // Load and parse the Python module from the interpreter
            const content = await this.loadPythonModule(this.moduleName);
            return this.parsePythonContent(content);
        } else {
            // Return children of the given element, if any
            return element.children;
        }
    }

    refresh(): void {
        this._onDidChangeTreeData.fire();
    }

    private async loadPythonModule(moduleName: string): Promise<string> {
        return new Promise((resolve, reject) => {
            // Get the file path of the Python script located one folder above the current directory
            const filePath = path.resolve(__dirname, '..', 'get_module_source.py');
            exec(`py ${filePath} ${moduleName}`, (error, stdout, stderr) => {
                if (error) {
                    reject(`Error loading module: ${stderr}`);
                } else {
                    resolve(stdout);
                }
            });
        });
    }

    private parsePythonContent(content: string): TreeNode[] {
        // Add your logic here to parse the Python content and return an array of TreeNodes
        const contentObj = JSON.parse(content);
        const methods = contentObj['methods'];

        return methods.map((method: string) => {
            return new TreeNode(method, vscode.TreeItemCollapsibleState.None, [], 'method');
        });
    }
}

class TreeNode extends vscode.TreeItem {
    children: TreeNode[];

    constructor(
        public readonly label: string,
        public readonly collapsibleState: vscode.TreeItemCollapsibleState,
        children: TreeNode[],
        public readonly type: 'class' | 'method' | 'function'
    ) {
        super(label, collapsibleState);
        this.children = children;
        this.tooltip = `${type}: ${label}`;
        this.description = type;
    }
}
