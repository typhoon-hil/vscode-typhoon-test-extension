import * as vscode from 'vscode';
import { exec } from 'child_process';
import * as path from 'path';
import { getDescription } from './utils/docstringParser';

export class TreeDataProvider implements vscode.TreeDataProvider<TreeNode> {
    private _onDidChangeTreeData: vscode.EventEmitter<TreeNode | undefined | void> = new vscode.EventEmitter<TreeNode | undefined | void>();
    readonly onDidChangeTreeData: vscode.Event<TreeNode | undefined | void> = this._onDidChangeTreeData.event;

    private rootNodes: TreeNode[] = [];

    constructor() { }

    async getTreeItem(element: TreeNode): Promise<vscode.TreeItem> {
        if (element.type === 'class') {
            return element;
        }

        element.command = { 
            command: 'typhoon-test.handleTreeViewItemClicked', 
            title: 'Show Docstring', 
            arguments: [element]
        };

        return element;
    }

    async getChildren(element?: TreeNode): Promise<TreeNode[]> {
        if (!element) {
            return this.rootNodes;
        } else {
            return element.children;
        }
    }

    refresh(): void {
        this._onDidChangeTreeData.fire();
    }

    async addModule(moduleName: string): Promise<void> {
        try {
            const content = await this.loadPythonModule(moduleName);
            const nodes = this.parsePythonContent(content);
            this.rootNodes = nodes;
            this.refresh();
        } catch (error) {
            vscode.window.showErrorMessage(`Error loading module: ${error}`);
        }
    }

    private async loadPythonModule(moduleName: string): Promise<string> {
        return new Promise((resolve, reject) => {
            const filePath = path.resolve(__dirname, '..', 'get_module_source.py');
            exec(`python ${filePath} ${moduleName}`, (error, stdout, stderr) => {
                if (error) {
                    reject(`Error loading module: ${stderr}, ${error}`);
                } else {
                    resolve(stdout);
                }
            });
        });
    }

    private parsePythonContent(content: string): TreeNode[] {
        const contentObj = JSON.parse(content);
        const functions = contentObj['functions'];
        const classes = contentObj['classes'];
        return [
            ...this.parseClasses(classes),
            ...this.parseFunctions(functions),
        ];
    }

    private parseClasses(classes: any): TreeNode[] {
        return classes.map((cls: any) => {
            const methods = cls['methods'];
            return new TreeNode(cls['class_name'], vscode.TreeItemCollapsibleState.Collapsed, this.parseMethods(methods), 'class');
        });
    }

    private parseFunctions(functions: Array<any>): TreeNode[] {
        return functions.map((func) => {
            return new TreeNode(func['name'], vscode.TreeItemCollapsibleState.None, [], 'function', func['doc'], this.parseArgs(func['args']));
        });
    }

    private parseMethods(methods: Array<any>): TreeNode[] {
        return methods.map((method) => {
            return new TreeNode(method['name'], vscode.TreeItemCollapsibleState.None, [], 'method', method['doc'], this.parseArgs(method['args']));
        });
    }

    private parseArgs(args: Array<any>): FunctionArgument[] {
        return args.map((arg) => {
            return { name: arg['name'], type: arg['type'], default: arg['default'] };
        });
    }
}

export class TreeNode extends vscode.TreeItem {
    children: TreeNode[];

    constructor(
        public readonly label: string,
        public readonly collapsibleState: vscode.TreeItemCollapsibleState,
        children: TreeNode[] = [],
        public readonly type: 'class' | 'method' | 'function',
        public readonly docstring: string = '',
        public readonly args: FunctionArgument[] = [], 
    ) {
        super(label, collapsibleState);
        this.children = children;
        this.tooltip = `${type}: ${label}`;
        this.description = getDescription(docstring);
        this.iconPath = this.getIconForType(type);
    }

    private getIconForType(type: 'class' | 'method' | 'function'): vscode.ThemeIcon {
        switch (type) {
            case 'class':
                return new vscode.ThemeIcon('symbol-class');
            case 'method':
                return new vscode.ThemeIcon('symbol-method');
            case 'function':
                return new vscode.ThemeIcon('symbol-function');
            default:
                return new vscode.ThemeIcon('file');
        }
    }
}

export interface FunctionArgument {
    name: string;
    type: string;
    default: any;
}
