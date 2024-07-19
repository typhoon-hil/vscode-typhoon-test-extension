import * as vscode from 'vscode';
import { TreeNode } from './TreeDataProvider';

export function handleTreeViewItemClickedCommand(item: TreeNode) {
    vscode.commands.executeCommand('typhoon-test.showDocstring', item);
    vscode.commands.executeCommand('typhoon-test.showForm', item);
}