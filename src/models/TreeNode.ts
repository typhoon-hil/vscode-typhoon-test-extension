import vscode, {ThemeIcon} from "vscode";
import {extractDescription} from "../utils/docstringParser";

import {PythonCallable, PythonEntity, PythonEntityType, PythonImport, PythonType} from "./pythonEntity";

export class TreeNode extends vscode.TreeItem {
    public children: TreeNode[] = [];

    constructor(
        public readonly parent: TreeNode | undefined,
        public readonly item: PythonEntity | PythonCallable,
        public readonly alias?: string
    ) {
        const collapsibleState = parent ?
            vscode.TreeItemCollapsibleState.None :
            vscode.TreeItemCollapsibleState.Collapsed;
        super(item.name, collapsibleState);
        this.tooltip = `${item.type}: ${item.name}`;
        this.description = alias ? `(${alias})` : extractDescription((item as PythonCallable).doc);
        this.iconPath = this.getIconForType(item.type);
        this.contextValue = item.type;
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
            entity,
            alias
        );
        node.children = this.parseCallables(node, callables);
        return node;
    }

    private static parseCallables(parent: TreeNode, callables: PythonCallable[]): TreeNode[] {
        return callables.map((callable) => {
            return new TreeNode(
                parent,
                callable
            );
        });
    }

    public toPythonImport(): PythonImport {
        return {
            alias: this.alias!,
            type: this.item.type as PythonEntityType,
            name: this.item.name
        };
    }
}