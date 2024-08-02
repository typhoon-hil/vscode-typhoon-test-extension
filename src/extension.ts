// extension.ts
import * as vscode from 'vscode';
import {DocumentationProvider} from './views/DocumentationProvider';
import {showDocstringView} from './commands/showDocstringView';
import {ArgumentsProvider} from './views/ArgumentsProvider';
import {showArgumentsView} from './commands/showArgumentsView';
import {handleTreeViewItemClicked} from './commands/handleTreeViewItemClicked';
import {showApiOptions} from './commands/showApiOptions';
import {saveApiWizardWorkspace} from './commands/saveApiWizardWorkspace';
import {TreeNode} from "./models/TreeNode";
import {getPythonEntityTreeProvider} from "./views/PythonEntityTreeProvider";

export function activate(context: vscode.ExtensionContext) {
    let sidebarProvider = new DocumentationProvider(context.extensionUri);
    let formProvider = new ArgumentsProvider(context.extensionUri);

    vscode.window.registerWebviewViewProvider('typhoon-test.docstringView', sidebarProvider);
    vscode.window.registerWebviewViewProvider('typhoon-test.formView', formProvider);
    vscode.window.registerTreeDataProvider('typhoon-test.pythonModuleView', getPythonEntityTreeProvider());

    context.subscriptions.push(vscode.commands.registerCommand('typhoon-test.showDocstring', (item: TreeNode) =>
        showDocstringView(sidebarProvider, item)
    ));

    context.subscriptions.push(
        vscode.commands.registerCommand('typhoon-test.showArgumentsView', (item: TreeNode) => {
                showArgumentsView(formProvider, item);
            }
        ));

    context.subscriptions.push(
        vscode.commands.registerCommand('typhoon-test.handleTreeViewItemClicked', (item: TreeNode) => {
                handleTreeViewItemClicked(item);
            }
        ));

    context.subscriptions.push(
        vscode.commands.registerCommand('typhoon-test.showApiOptions', () => {
            showApiOptions().then();
        })
    );

    context.subscriptions.push(
        vscode.commands.registerCommand('typhoon-test.removeModule', (item: TreeNode) => {
            vscode.window.showInformationMessage(`Remove ${item.label}`).then();
        })
    );

    context.subscriptions.push(
        vscode.commands.registerCommand('typhoon-test.saveApiWizardWorkspace', () => {
            saveApiWizardWorkspace();
        })
    );

    vscode.workspace.onDidChangeConfiguration(event => {
        if (event.affectsConfiguration('typhoon-test.apiWizardWorkspace')) {
            getPythonEntityTreeProvider().loadEntitiesFromWorkspace().then();
        }
    });
}

export function deactivate() {
}
