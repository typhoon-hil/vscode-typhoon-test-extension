import * as vscode from 'vscode';
import { exec } from 'child_process';
import * as path from 'path';
import { getDescription } from '../utils/docstringParser';

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

    public async addModule(moduleName: string, type: 'module'|'class', alias: string): Promise<void> {
        try {
            const content = await this.loadPythonModule(moduleName, type);
            const nodes = this.parsePythonContent(content, alias);
            this.rootNodes.push(...nodes);
            this.refresh();
        } catch (error) {
            vscode.window.showErrorMessage(`Error loading module: ${error}`);
        }
    }

    private async loadPythonModule(moduleName: string, type: 'module'|'class'): Promise<string> {
        return new Promise((resolve, reject) => {
            const filePath = path.resolve(__dirname, '..', '..', `get_${type}_source.py`);
            exec(`python ${filePath} ${moduleName}`, (error, stdout, stderr) => {
                if (error) {
                    reject(`Error loading module: ${stderr}, ${error}`);
                } else {
                    resolve(stdout);
                }
            });
        });
    }

    private parsePythonContent(content: string, alias: string): TreeNode[] {
        const contentObj = JSON.parse(content);
        const call = contentObj['class_name'] ? this.parseClass.bind(this) : this.parseModule.bind(this);
        return [call(contentObj, alias)]; 
    }

    private parseClass(cls: any, alias: string): TreeNode {
        const methods = cls['methods'];
        return new TreeNode(cls['class_name'], vscode.TreeItemCollapsibleState.Collapsed, this.parseMethods(methods), 'class', undefined, undefined, alias);
    }

    private parseModule(module: any, alias: string): TreeNode {
        return new TreeNode(module['module_name'], vscode.TreeItemCollapsibleState.Collapsed, this.parseFunctions(module['functions']), 'module', undefined, undefined, alias);
    }
    
    parseFunctions(functions: Array<any>): TreeNode[] | undefined {
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
        public readonly type: 'class' | 'module' | 'method' | 'function',
        public readonly docstring: string = '',
        public readonly args: FunctionArgument[] = [],
        public readonly alias?: string
    ) {
        super(label, collapsibleState);
        this.children = children;
        this.tooltip = `${type}: ${label}`;
        this.description = alias ? `(${alias})` : getDescription(docstring);
        this.iconPath = this.getIconForType(type);
        this.contextValue = type;
    }

    private getIconForType(type: 'class' | 'module' | 'method' | 'function'): vscode.ThemeIcon {
        switch (type) {
            case 'class':
            case 'module':
                return new vscode.ThemeIcon('symbol-class');
            case 'method':
            case 'function':
                return new vscode.ThemeIcon('symbol-method');
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
