// extension.ts
import * as vscode from 'vscode';
import { SidebarProvider } from './view-providers/SidebarProvider';
import { showDocstringCommand } from './commands/showDocstringCommand';
import { TreeNode } from './view-providers/TreeDataProvider';
import { FormProvider } from './view-providers/FormProvider';
import { showFormCommand } from './commands/showFormCommand';
import { handleTreeViewItemClickedCommand } from './commands/handleTreeViewItemClickedCommand';
import { showApiOptionsCommand } from './commands/showApiOptionsCommand';
import { registerModuleTreeView } from './commands/registerModuleTreeView';

export function activate(context: vscode.ExtensionContext) {
  let sidebarProvider = new SidebarProvider(context.extensionUri);
  let formProvider = new FormProvider(context.extensionUri);

  vscode.window.registerWebviewViewProvider('typhoon-test.docstringView', sidebarProvider);
  vscode.window.registerWebviewViewProvider('typhoon-test.formView', formProvider);
  registerModuleTreeView();

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

  context.subscriptions.push(
    vscode.commands.registerCommand('typhoon-test.removeModule', (item: TreeNode) => {
      vscode.window.showInformationMessage(`Remove ${item.label}`);
    })
  );
}

export function deactivate() { }
