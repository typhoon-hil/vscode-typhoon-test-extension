import * as vscode from 'vscode';

import {TreeNode} from "../models/TreeNode";

export function handleTreeViewItemClicked(item: TreeNode) {
    vscode.commands.executeCommand('typhoon-test.showDocstring', item);
    vscode.commands.executeCommand('typhoon-test.showForm', item);
}