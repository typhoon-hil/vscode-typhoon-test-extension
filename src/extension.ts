// extension.ts
import * as vscode from 'vscode';
import { SidebarProvider } from './SidebarProvider';
import { TreeDataProvider } from './TreeDataProvider';
import { showDocstringCommand } from './showDocstringCommand';
import { TreeNode } from './TreeDataProvider';

export function activate(context: vscode.ExtensionContext) {
  let sidebarProvider = new SidebarProvider(context.extensionUri);
  vscode.window.registerWebviewViewProvider('typhoon-test.docstringView', sidebarProvider);
  vscode.window.registerTreeDataProvider('typhoon-test.pythonModuleView', new TreeDataProvider('typhoon.api.schematic_editor'));
  context.subscriptions.push(vscode.commands.registerCommand('typhoon-test.showDocstring', (item:TreeNode) => 
    showDocstringCommand(sidebarProvider, item)
));
}

export function deactivate() {}
