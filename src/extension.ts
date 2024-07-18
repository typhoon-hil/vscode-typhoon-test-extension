// extension.ts
import * as vscode from 'vscode';
import { SidebarProvider } from './SidebarProvider';

export function activate(context: vscode.ExtensionContext) {
  console.log('Extension "typhoon-test" is now active!');

  let disposable = vscode.commands.registerCommand('helloworld.helloWorld', async () => {
    await vscode.commands.executeCommand('workbench.action.files.newUntitledFile');
    await vscode.commands.executeCommand('workbench.view.explorer');
    await vscode.commands.executeCommand('workbench.action.terminal.toggleTerminal');
  });

  context.subscriptions.push(disposable);

  const sidebarProvider = new SidebarProvider(context.extensionUri);
  context.subscriptions.push(
    vscode.window.registerWebviewViewProvider('customView', sidebarProvider)
  );
}

export function deactivate() {}
