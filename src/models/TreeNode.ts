import vscode, {ThemeIcon, TreeItemCollapsibleState} from "vscode";
import {getDescription} from "../utils/docstringParser";
import {FunctionArgument} from "../view-providers/TreeDataProvider";

export class TreeNode extends vscode.TreeItem {
    public children: TreeNode[] = [];

    constructor(
        public readonly parent: TreeNode | undefined,
        public readonly label: string,
        public readonly collapsibleState: TreeItemCollapsibleState,
        public readonly type: 'class' | 'module' | 'method' | 'function',
        public readonly docstring: string = '',
        public readonly args: FunctionArgument[] = [],
        public readonly alias?: string
    ) {
        super(label, collapsibleState);
        this.tooltip = `${type}: ${label}`;
        this.description = alias ? `(${alias})` : getDescription(docstring);
        this.iconPath = this.getIconForType(type);
        this.contextValue = type;
    }

    private getIconForType(type: 'class' | 'module' | 'method' | 'function'): ThemeIcon {
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

    public getRootParent(): TreeNode {
        let node: TreeNode = this;
        while (node.parent) {
            node = node.parent;
        }
        return node;
    }
}