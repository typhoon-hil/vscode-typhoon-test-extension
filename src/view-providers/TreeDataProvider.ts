import * as vscode from 'vscode';
import {exec} from 'child_process';
import * as path from 'path';
import {TreeNode} from "../models/TreeNode";
import {FunctionArgument, PythonEntityType} from "../models/api-call-models";

export class TreeDataProvider implements vscode.TreeDataProvider<TreeNode> {
    private _onDidChangeTreeData: vscode.EventEmitter<TreeNode | undefined | void> = new vscode.EventEmitter<TreeNode | undefined | void>();
    readonly onDidChangeTreeData: vscode.Event<TreeNode | undefined | void> = this._onDidChangeTreeData.event;

    private rootNodes: TreeNode[] = [];

    constructor() {
    }

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
        this._onDidChangeTreeData.fire(undefined);
    }

    public async addModule(moduleName: string, type: PythonEntityType, alias: string): Promise<void> {
        try {
            const content = await this.loadPythonModule(moduleName, type);
            const nodes = this.parsePythonContent(content, alias);
            this.rootNodes.push(...nodes);
            this.refresh();
        } catch (error) {
            vscode.window.showErrorMessage(`Error loading module: ${error}`);
        }
    }

    doesAliasExist(alias: string): boolean {
        return this.rootNodes.some(node => node.alias === alias);
    }

    public getRootNodes(): TreeNode[] {
        return this.rootNodes;
    }

    private async loadPythonModule(moduleName: string, type: PythonEntityType): Promise<string> {
        return new Promise((resolve, reject) => {
            const filePath = path.resolve(__dirname, '..', '..', 'scripts', `get_${type}_source.py`);
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
        const node = new TreeNode(
            undefined,
            cls['class_name'],
            vscode.TreeItemCollapsibleState.Collapsed,
            'class',
            undefined,
            undefined,
            alias);
        node.children = this.parseMethods(node, methods);
        return node;
    }

    private parseModule(module: any, alias: string): TreeNode {
        const node = new TreeNode(undefined,
            module['module_name'],
            vscode.TreeItemCollapsibleState.Collapsed,
            'module',
            undefined,
            undefined,
            alias);
        node.children = this.parseFunctions(node, module['functions']);
        return node;
    }

    private parseFunctions(parent: TreeNode, functions: Array<any>): TreeNode[] {
        return functions.map((func) => {
            return new TreeNode(parent,
                func['name'],
                vscode.TreeItemCollapsibleState.None,
                'function',
                func['doc'],
                this.parseArgs(func['args'])
            );
        });
    }

    private parseMethods(parent: TreeNode, methods: Array<any>): TreeNode[] {
        return methods.map((method) => {
            return new TreeNode(
                parent,
                method['name'],
                vscode.TreeItemCollapsibleState.None,
                'method',
                method['doc'],
                this.parseArgs(method['args'])
            );
        });
    }

    private parseArgs(args: Array<any>): FunctionArgument[] {
        return args.map((arg) => {
            return {name: arg['name'], default: arg['default']};
        });
    }
}

