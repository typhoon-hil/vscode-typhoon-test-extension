// extension.ts
import * as vscode from 'vscode';
import { SidebarProvider } from './SidebarProvider';
import { showDocstringCommand } from './showDocstringCommand';
import { TreeNode } from './TreeDataProvider';
import { FormProvider } from './FormProvider';
import { showFormCommand } from './showFormCommand';
import { handleTreeViewItemClickedCommand } from './handleTreeViewItemClickedCommand';
import { showApiOptionsCommand } from './showApiOptionsCommand';
import { registerModuleTreeView } from './registerModuleTreeView';

export function activate(context: vscode.ExtensionContext) {
  let sidebarProvider = new SidebarProvider(context.extensionUri);
  let formProvider = new FormProvider(context.extensionUri);

  vscode.window.registerWebviewViewProvider('typhoon-test.docstringView', sidebarProvider);
  vscode.window.registerWebviewViewProvider('typhoon-test.formView', formProvider);
  registerModuleTreeView('typhoon.api.schematic_editor');

  context.subscriptions.push(vscode.commands.registerCommand('typhoon-test.showDocstring', (item: TreeNode) =>
    showDocstringCommand(sidebarProvider, item)
  ));

  context.subscriptions.push(
    vscode.commands.registerCommand('typhoon-test.showForm', (item: TreeNode) => {
      showFormCommand(formProvider, item);
    }
  ));

  context.subscriptions.push(
    vscode.commands.registerCommand('typhoon-test.handleTreeViewItemClicked', (item: TreeNode) => {
      handleTreeViewItemClickedCommand(item);
    }
  ));

  context.subscriptions.push(
    vscode.commands.registerCommand('typhoon-test.showApiOptions', () => {
      showApiOptionsCommand();
    })
  );
}

export function deactivate() { }
