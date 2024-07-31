import * as vscode from 'vscode';
import { TreeNode } from '../view-providers/TreeDataProvider';

export function handleTreeViewItemClicked(item: TreeNode) {
    vscode.commands.executeCommand('typhoon-test.showDocstring', item);
    vscode.commands.executeCommand('typhoon-test.showForm', item);
}