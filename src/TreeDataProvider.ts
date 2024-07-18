import * as vscode from 'vscode';
import { exec } from 'child_process';
import Parser from 'tree-sitter';
import Python from 'tree-sitter-python';
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

    private async parsePythonContent(content: string): Promise<TreeNode[]> {
        const parser = new Parser();
        parser.setLanguage(Python);
        const tree = parser.parse(content);

        const classes: TreeNode[] = [];
        const methods: TreeNode[] = [];

        function traverse(node: any, parent?: TreeNode) {
            switch (node.type) {
                case 'class_definition':
                    const className = node.childForFieldName('name').text;
                    const classNode = new TreeNode(className, vscode.TreeItemCollapsibleState.Collapsed, [], 'class');
                    classes.push(classNode);
                    traverseChildren(node, classNode);
                    break;
                case 'function_definition':
                    const methodName = node.childForFieldName('name').text;
                    const methodNode = new TreeNode(methodName, vscode.TreeItemCollapsibleState.None, [], parent ? 'method' : 'function');
                    if (parent) {
                        parent.children.push(methodNode);
                    } else {
                        methods.push(methodNode);
                    }
                    break;
                default:
                    traverseChildren(node, parent);
                    break;
            }
        }

        function traverseChildren(node: any, parent?: TreeNode) {
            for (let i = 0; i < node.namedChildCount; i++) {
                traverse(node.namedChild(i), parent);
            }
        }

        traverse(tree.rootNode);

        return [...classes, ...methods];
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
