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
import { runTests, stopTests } from './commands/runAndStopTests';
import { TestTreeProvider } from './views/TestTreeProvider';
import { pickOrganizationalLogoFilepath } from './commands/pickOrganizationalLogoFilepath';
import { refreshPdfConfig } from './utils/pdfConfig';
import { getFullTestName } from './utils/editor';
import { ConfigurationWebviewProvider } from './views/PdfConfigurationProvider';
import { TestItem } from './models/testMonitoring';
import { PytestRunner } from './models/testRun';
import { CollectOnlyPytestArgumentBuilder, PytestArgumentBuilder } from './models/PytestArgumentBuilder';
import { PytestCodeLensProvider } from './codelens/PytestCodeLensProvider';

export function activate(context: vscode.ExtensionContext) {
    let sidebarProvider = new DocumentationProvider(context.extensionUri);
    let formProvider = new ArgumentsProvider(context.extensionUri);
    let testTreeProvider = new TestTreeProvider();
    let pdfConfigurationProvider = new ConfigurationWebviewProvider(context.extensionUri, 'typhoon-test.pdfConfiguration');
    let testRunConfigurationProvider = new ConfigurationWebviewProvider(context.extensionUri, 'typhoon-test.testRun');
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
            if (checkTestRunEnd()) {
                return;
            }

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
            if (checkTestRunEnd()) {
                return;
            }

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
            if (checkTestRunEnd()) {
                return;
            }

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
        vscode.commands.registerCommand('typhoon-test.runTestTreeNode', (item: TestItem) => {
            if (checkTestRunEnd()) {
                return;
            }

            const fullTestName = item.identifier;

            vscode.window.withProgress({
                location: vscode.ProgressLocation.Notification,
                title: `Running ${fullTestName}`,
                cancellable: true
            }, (_, token) => {
                return getRunTestPromise(token, fullTestName);
            });
        })
    );

    context.subscriptions.push(
        vscode.commands.registerCommand('typhoon-test.runTestsFromExplorer', (uri: vscode.Uri) => {
            if (checkTestRunEnd()) {
                return;
            }

            vscode.window.withProgress({
                location: vscode.ProgressLocation.Notification,
                title: `Running ${uri.fsPath}`,
                cancellable: true
            }, (_, token) => {
                return getRunTestPromise(token, uri.fsPath, CollectOnlyPytestArgumentBuilder);
            });
        })
    );

    context.subscriptions.push(
        vscode.commands.registerCommand('typhoon-test.collectTests', () => {
            if (checkTestRunEnd()) {
                return;
            }

            vscode.window.withProgress({
                location: vscode.ProgressLocation.Notification,
                title: 'Collecting tests...',
                cancellable: true
            }, (_, token) => {
                return getRunTestPromise(token, undefined, CollectOnlyPytestArgumentBuilder);
            });
        })
    );

    context.subscriptions.push(
        vscode.commands.registerCommand('typhoon-test.runTestCodeLens', (name: string) => {
            if (checkTestRunEnd()) {
                return;
            }

            // vscode.window.withProgress({
            //     location: vscode.ProgressLocation.Notification,
            //     title: `Running ${name}`,
            //     cancellable: true
            // }, (_, token) => {
            //     return getRunTestPromise(token, name);
            // });

            vscode.window.showInformationMessage(`Running ${name}`);
        })
    );

    context.subscriptions.push(vscode.languages.registerCodeLensProvider(
        { scheme: 'file', language: 'python' },
        new PytestCodeLensProvider()
    ));

    context.subscriptions.push(
        vscode.commands.registerCommand('typhoon-test.pickOrganizationalLogoFilepath', () => {
            pickOrganizationalLogoFilepath();
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

    function getRunTestPromise(token: any, testName?: string, builderType: any = PytestArgumentBuilder): Promise<void> {
        return new Promise<void>((resolve, reject) => {
            resolveTestPromise = resolve;

            token.onCancellationRequested(() => {
                vscode.commands.executeCommand('typhoon-test.stopTests').then(() => {
                    vscode.window.showInformationMessage('Test run was cancelled');
                });
            });

            runTests(testTreeProvider, testName, builderType).then(() => {
                resolve();
            }).catch(() => {
                reject();
            });
        });
    }

    function checkTestRunEnd(): boolean {
        const res = PytestRunner.IsRunning;
        if (res) {
            vscode.window.showErrorMessage('Test run is still in progress');
        }
        return res;
    }
}
