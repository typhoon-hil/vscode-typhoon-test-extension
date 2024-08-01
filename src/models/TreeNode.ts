import vscode, {ThemeIcon, TreeItemCollapsibleState} from "vscode";
import {getDescription} from "../utils/docstringParser";

import {FunctionArgument, PythonType} from "./api-call-models";

export class TreeNode extends vscode.TreeItem {
    public children: TreeNode[] = [];

    constructor(
        public readonly parent: TreeNode | undefined,
        public readonly label: string,
        public readonly collapsibleState: TreeItemCollapsibleState,
        public readonly type: PythonType,
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

    private getIconForType(type: PythonType): ThemeIcon {
        return new vscode.ThemeIcon(
            type === "class" || type === "module" ? "symbol-class" : "symbol-method"
        );
    }

    public getRootParent(): TreeNode {
        let node: TreeNode = this;
        while (node.parent) {
            node = node.parent;
        }
        return node;
    }
}