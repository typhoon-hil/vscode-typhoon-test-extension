// extension.ts
import * as vscode from 'vscode';
import { DocumentationProvider } from './views/DocumentationProvider';
import { showDocstring } from './commands/showDocstring';
import { FormProvider } from './view-providers/FormProvider';
import { showForm } from './commands/showForm';
import { handleTreeViewItemClicked } from './commands/handleTreeViewItemClicked';
import { showApiOptions } from './commands/showApiOptions';
import { saveApiWizardWorkspace } from './commands/saveApiWizardWorkspace';
import {TreeNode} from "./models/TreeNode";
import {PythonEntityTreeProvider} from "./views/PythonEntityTreeProvider";

export function activate(context: vscode.ExtensionContext) {
  let sidebarProvider = new DocumentationProvider(context.extensionUri);
  let formProvider = new FormProvider(context.extensionUri);

  vscode.window.registerWebviewViewProvider('typhoon-test.docstringView', sidebarProvider);
  vscode.window.registerWebviewViewProvider('typhoon-test.formView', formProvider);
  vscode.window.registerTreeDataProvider('typhoon-test.pythonModuleView', PythonEntityTreeProvider.getInstance());

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
    })
  );

  vscode.workspace.onDidChangeConfiguration(event => {
    if (event.affectsConfiguration('typhoon-test.apiWizardWorkspace')) {
      PythonEntityTreeProvider.getInstance().loadEntitiesFromWorkspace().then();
    }
  });
}

export function deactivate() { }
