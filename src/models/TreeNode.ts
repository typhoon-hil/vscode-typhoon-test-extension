import vscode, {ThemeIcon, TreeItemCollapsibleState} from "vscode";
import {extractDescription} from "../utils/docstringParser";

import {PythonArgument, PythonCallable, PythonEntity, PythonType} from "./api-call-models";

export class TreeNode extends vscode.TreeItem {
    public children: TreeNode[] = [];

    constructor(
        public readonly parent: TreeNode | undefined,
        public readonly name: string,
        public readonly collapsibleState: TreeItemCollapsibleState,
        public readonly type: PythonType,
        public readonly docstring: string = '',
        public readonly args: PythonArgument[] = [],
        public readonly alias?: string
    ) {
        super(name, collapsibleState);
        this.tooltip = `${type}: ${name}`;
        this.description = alias ? `(${alias})` : extractDescription(docstring);
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

    static parsePythonEntity(entity: PythonEntity, alias: string): TreeNode {
        const callables = entity.callables;
        const node = new TreeNode(
            undefined,
            entity.name,
            vscode.TreeItemCollapsibleState.Collapsed,
            entity.type,
            undefined,
            undefined,
            alias
        );
        node.children = this.parseCallables(node, callables);
        return node;
    }

    private static parseCallables(parent: TreeNode, callables: PythonCallable[]): TreeNode[] {
        return callables.map((callable) => {
            return new TreeNode(parent,
                callable.name,
                vscode.TreeItemCollapsibleState.None,
                callable.type,
                callable.doc,
                callable.args
            );
        });
    }
}