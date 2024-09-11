import * as vscode from 'vscode';
import { DocumentationProvider } from './views/DocumentationProvider';
import { showDocstringView } from './commands/showDocstringView';
import { ArgumentsProvider } from './views/ArgumentsProvider';
import { showArgumentsView } from './commands/showArgumentsView';
import { handleTreeViewItemClicked } from './commands/handleTreeViewItemClicked';
import { addPythonEntity } from './commands/addPythonEntity';
import { saveApiWizardWorkspace } from './commands/saveApiWizardWorkspace';
import { TreeNode } from "./models/TreeNode";
import { getPythonEntityTreeProvider } from "./views/PythonEntityTreeProvider";
import { removePythonEntity } from "./commands/removePythonEntity";
import { pickInterpreterPath } from "./commands/pickInterpreterPath";
import { refreshConfigs } from './utils/config';
import { runTests } from './commands/runTests';
import { TestTreeProvider } from './views/TestTreeProvider';
import { pickOrganizationalLogoFilepath } from './commands/pickOrganizationalLogoFilepath';
import { refreshPdfConfig } from './utils/pdfConfig';
import { stopTests } from './commands/stopTests';
import { getFullTestName } from './utils/editor';
import { PdfConfigurationProvider } from './views/PdfConfigurationProvider';

export function activate(context: vscode.ExtensionContext) {
    let sidebarProvider = new DocumentationProvider(context.extensionUri);
    let formProvider = new ArgumentsProvider(context.extensionUri);
    let testTreeProvider = new TestTreeProvider();
    let pdfConfigurationProvider = new PdfConfigurationProvider(context.extensionUri, 'typhoon-test.pdfConfiguration');
    let testRunConfigurationProvider = new PdfConfigurationProvider(context.extensionUri, 'typhoon-test.testRun');
    let resolveTestPromise: (() => void) | undefined;

    vscode.window.registerWebviewViewProvider('typhoon-test.docstringView', sidebarProvider);
    vscode.window.registerWebviewViewProvider('typhoon-test.argumentsView', formProvider);
    vscode.window.registerTreeDataProvider('typhoon-test.pythonEntityView', getPythonEntityTreeProvider());
    vscode.window.registerTreeDataProvider('typhoon-test.pytestMonitorView', testTreeProvider);
    vscode.window.registerWebviewViewProvider('typhoon-test.pdfConfigurationView', pdfConfigurationProvider);
    vscode.window.registerWebviewViewProvider('typhoon-test.testRunConfigurationView', testRunConfigurationProvider);

    context.subscriptions.push(vscode.commands.registerCommand('typhoon-test.showDocstringView', (item: TreeNode) =>
        showDocstringView(sidebarProvider, item)
    ));

    context.subscriptions.push(
        vscode.commands.registerCommand('typhoon-test.showArgumentsView', (item: TreeNode) => {
            showArgumentsView(formProvider, item);
        })
    );

    context.subscriptions.push(
        vscode.commands.registerCommand('typhoon-test.handleTreeViewItemClicked', (item: TreeNode) => {
            handleTreeViewItemClicked(item);
        })
    );

    context.subscriptions.push(
        vscode.commands.registerCommand('typhoon-test.addPythonEntity', () => {
            addPythonEntity().then();
        })
    );

    context.subscriptions.push(
        vscode.commands.registerCommand('typhoon-test.removePythonEntity', (item: TreeNode) => {
            removePythonEntity(item).then();
        })
    );

    context.subscriptions.push(
        vscode.commands.registerCommand('typhoon-test.saveApiWizardWorkspace', () => {
            saveApiWizardWorkspace();
        })
    );

    context.subscriptions.push(
        vscode.commands.registerCommand('typhoon-test.openTestRunConfiguration', () => {
            vscode.commands.executeCommand('workbench.action.openSettings', 'typhoon-test.testRun').then();
        })
    );

    context.subscriptions.push(
        vscode.commands.registerCommand('typhoon-test.openPdfConfiguration', () => {
            vscode.commands.executeCommand('workbench.action.openSettings', 'typhoon-test.pdfConfiguration').then();
        })
    );

    context.subscriptions.push(
        vscode.commands.registerCommand('typhoon-test.pickInterpreterPath', () => {
            pickInterpreterPath();
        })
    );

    context.subscriptions.push(
        vscode.commands.registerCommand('typhoon-test.stopTests', () => {
            stopTests();
            resolveTestPromise?.();
            resolveTestPromise = undefined;
        })
    );

    context.subscriptions.push(
        vscode.commands.registerCommand('typhoon-test.runTests', () => {
            const rootDir = vscode.workspace.workspaceFolders?.[0].uri.fsPath;
            if (!rootDir) {
                vscode.window.showErrorMessage('No workspace is open');
                return;
            }

            vscode.window.withProgress({
                location: vscode.ProgressLocation.Notification,
                title: `Running tests from ${rootDir}`,
                cancellable: true
            }, (_, token) => {
                return getRunTestPromise(token);
            });
        })
    );

    context.subscriptions.push(
        vscode.commands.registerCommand('typhoon-test.runTestsFromFile', () => {
            const activeFile = vscode.window.activeTextEditor?.document.fileName;
            if (!activeFile) {
                vscode.window.showErrorMessage('No file is currently open');
                return;
            }

            vscode.window.withProgress({
                location: vscode.ProgressLocation.Notification,
                title: `Running tests from ${activeFile}`,
                cancellable: true
            }, (_, token) => {
                return getRunTestPromise(token, activeFile);
            });
        })
    );  

    context.subscriptions.push(
        vscode.commands.registerCommand('typhoon-test.runCurrentlySelectedTest', () => {
            const fullTestName = getFullTestName();

            if (!fullTestName) {
                vscode.window.showErrorMessage('No test is currently selected');
                return;
            }

            vscode.window.withProgress({
                location: vscode.ProgressLocation.Notification,
                title: `Running test ${fullTestName}`,
                cancellable: true
            }, (_, token) => {
                return getRunTestPromise(token, fullTestName);
            });
        })
    );

    context.subscriptions.push(
        vscode.commands.registerCommand('typhoon-test.pickOrganizationalLogoFilepath', (isGlobal) => {
            pickOrganizationalLogoFilepath(isGlobal);
        })
    );

    vscode.workspace.onDidChangeConfiguration(event => {
        if (event.affectsConfiguration('typhoon-test.apiWizardWorkspace')) {
            refreshConfigs();
            getPythonEntityTreeProvider().loadEntitiesFromWorkspace().then();
        }
        if (event.affectsConfiguration('typhoon-test.testRun')) {
            refreshConfigs();
            testRunConfigurationProvider.refresh();
        }
        if (event.affectsConfiguration('typhoon-test')) {
            refreshConfigs();
        }
        if (event.affectsConfiguration('typhoon-test.pdfConfiguration')) {
            refreshPdfConfig();
            pdfConfigurationProvider.refresh();
        }
    });

    function getRunTestPromise(token: any, testName?: string): Promise<void> {
        return new Promise<void>((resolve, reject) => {
            resolveTestPromise = resolve;

            token.onCancellationRequested(() => {
                vscode.commands.executeCommand('typhoon-test.stopTests').then(() => {
                    vscode.window.showInformationMessage('Test run was cancelled');
                });
            });

            runTests(testTreeProvider, testName).then(() => {
                resolve();
            }).catch(() => {
                reject();
            });
        });
    }
}
