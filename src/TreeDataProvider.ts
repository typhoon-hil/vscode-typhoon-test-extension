import * as vscode from 'vscode';
import { exec } from 'child_process';
import * as path from 'path';
import { getDescription } from './utils/docstringParser';

export class TreeDataProvider implements vscode.TreeDataProvider<TreeNode> {
    private _onDidChangeTreeData: vscode.EventEmitter<TreeNode | undefined | void> = new vscode.EventEmitter<TreeNode | undefined | void>();
    readonly onDidChangeTreeData: vscode.Event<TreeNode | undefined | void> = this._onDidChangeTreeData.event;

    constructor(private moduleName: string | undefined = undefined) { }

    async getTreeItem(element: TreeNode): Promise<vscode.TreeItem> {
        if (element.type === 'class') {
            return element;
        }
        
        // Add helloworld command to the element
        element.command = { 
            command: 'typhoon-test.handleTreeViewItemClicked', 
            title: 'Show Docstring', 
            arguments: [element]
        };

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
        // Add your logic here to parse the Python content and return an array of TreeNodes
        const contentObj = JSON.parse(content);
        const functions = contentObj['functions'];
        const classes = contentObj['classes'];
        return [
            ...this.parseClasses(classes),
            ...this.parseFunctions(functions),
        ];
    }

    parseClasses(classes: any) {
        return classes.map((cls: any) => {
            const methods = cls['methods'];
            return new TreeNode(cls['class_name'], vscode.TreeItemCollapsibleState.Collapsed, this.parseMethods(methods), 'class');
        });
    }

    parseFunctions(functions: Array<any>) {
        return functions.map((func) => {
            return new TreeNode(func['name'], vscode.TreeItemCollapsibleState.None, [], 'function', func['doc'], this.parseArgs(func['args']));
        });
    }

    parseMethods(methods: Array<any>) {
        return methods.map((method) => {
            return new TreeNode(method["name"], vscode.TreeItemCollapsibleState.None, [], 'method', method['doc'], this.parseArgs(method['args']));
        });
    }

    parseArgs(args: Array<any>): FunctionArgument[] {
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
        children: TreeNode[],
        public readonly type: 'class' | 'method' | 'function',
        public readonly docstring: string = '',
        public readonly args: FunctionArgument[] = [], 
    ) {
        super(label, collapsibleState);
        this.children = children;
        this.tooltip = `${type}: ${label}`;
        this.description = getDescription(docstring);
    }
}

export interface FunctionArgument {
    name: string;
    type: string;
    default: any;
}
