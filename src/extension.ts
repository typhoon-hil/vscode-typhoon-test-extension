// extension.ts
import * as vscode from 'vscode';
import { SidebarProvider } from './view-providers/SidebarProvider';
import { showDocstring } from './commands/showDocstring';
import { FormProvider } from './view-providers/FormProvider';
import { showForm } from './commands/showForm';
import { handleTreeViewItemClicked } from './commands/handleTreeViewItemClicked';
import { showApiOptions } from './commands/showApiOptions';
import { loadWorkspace, registerModuleTreeView } from './commands/registerModuleTreeView';
import { saveApiWizardWorkspace } from './commands/saveApiWizardWorkspace';
import {TreeNode} from "./models/TreeNode";

export function activate(context: vscode.ExtensionContext) {
  let sidebarProvider = new SidebarProvider(context.extensionUri);
  let formProvider = new FormProvider(context.extensionUri);

  vscode.window.registerWebviewViewProvider('typhoon-test.docstringView', sidebarProvider);
  vscode.window.registerWebviewViewProvider('typhoon-test.formView', formProvider);
  registerModuleTreeView();

  context.subscriptions.push(vscode.commands.registerCommand('typhoon-test.showDocstring', (item: TreeNode) =>
    showDocstring(sidebarProvider, item)
  ));

  context.subscriptions.push(
    vscode.commands.registerCommand('typhoon-test.showForm', (item: TreeNode) => {
      showForm(formProvider, item);
    }
    ));

  context.subscriptions.push(
    vscode.commands.registerCommand('typhoon-test.handleTreeViewItemClicked', (item: TreeNode) => {
      handleTreeViewItemClicked(item);
    }
    ));

  context.subscriptions.push(
    vscode.commands.registerCommand('typhoon-test.showApiOptions', () => {
      showApiOptions();
    })
  );

  context.subscriptions.push(
    vscode.commands.registerCommand('typhoon-test.removeModule', (item: TreeNode) => {
      vscode.window.showInformationMessage(`Remove ${item.label}`);
    })
  );

  context.subscriptions.push(
    vscode.commands.registerCommand('typhoon-test.saveApiWizardWorkspace', () => {
      saveApiWizardWorkspace();
      vscode.window.showInformationMessage('API Wizard workspace saved');
    })
  );

  vscode.workspace.onDidChangeConfiguration(event => {
    if (event.affectsConfiguration('typhoon-test.apiWizardWorkspace')) {
      loadWorkspace();
    }
  });
}

export function deactivate() { }
