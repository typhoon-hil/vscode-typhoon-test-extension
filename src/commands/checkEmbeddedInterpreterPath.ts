import { getTestRunConfig } from "../utils/config";
import { getPlatform } from "../utils/platform/selector";
import * as vscode from 'vscode';

export function checkEmbeddedInterpreterPath() {
    const currentPath = getTestRunConfig().embeddedInterpreterPath;
    const possiblePath = getPlatform().getEmbeddedPythonCommand();
    
    if (!currentPath) {
        vscode.commands.executeCommand('typhoon-test.updateEmbeddedInterpreterPath');
        return;
    }

    if (currentPath !== possiblePath) {
        vscode.window.showWarningMessage('We have detected a new embedded interpreter path. Do you want to update it?', 'Yes', 'No').then(value => {
            if (value === 'Yes') {
                vscode.commands.executeCommand('typhoon-test.updateEmbeddedInterpreterPath').then(
                    () => vscode.window.showInformationMessage('Embedded interpreter path has been updated'),
                    () => vscode.window.showErrorMessage('Failed to update embedded interpreter path')
                );
            }
        });
    }
}