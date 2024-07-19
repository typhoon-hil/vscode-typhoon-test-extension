// extension.ts
import * as vscode from 'vscode';
import { SidebarProvider } from './SidebarProvider';
import { TreeDataProvider } from './TreeDataProvider';
import { showDocstringCommand } from './showDocstringCommand';
import { TreeNode } from './TreeDataProvider';
import { FormProvider } from './FormProvider';
import { showFormCommand } from './showFormCommand';
import { handleTreeViewItemClickedCommand } from './handleTreeViewItemClickedCommand';

export function activate(context: vscode.ExtensionContext) {
  let sidebarProvider = new SidebarProvider(context.extensionUri);
  let formProvider = new FormProvider(context.extensionUri);
  vscode.window.registerWebviewViewProvider('typhoon-test.docstringView', sidebarProvider);
  vscode.window.registerTreeDataProvider('typhoon-test.pythonModuleView', new TreeDataProvider('typhoon.api.schematic_editor'));
  vscode.window.registerWebviewViewProvider('typhoon-test.formView', formProvider);
  context.subscriptions.push(vscode.commands.registerCommand('typhoon-test.showDocstring', (item: TreeNode) =>
    showDocstringCommand(sidebarProvider, item)
  ));

  context.subscriptions.push(
    vscode.commands.registerCommand('typhoon-test.helloWorld', () => {
      vscode.window.showInformationMessage('Hello, World!');
    })
  );
}

export function deactivate() { }
