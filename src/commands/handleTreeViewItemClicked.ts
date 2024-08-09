import * as vscode from 'vscode';

import {TreeNode} from "../models/TreeNode";

export function handleTreeViewItemClicked(item: TreeNode) {
    vscode.commands.executeCommand('typhoon-test.showDocstringView', item).then();
    vscode.commands.executeCommand('typhoon-test.showArgumentsView', item).then();
}