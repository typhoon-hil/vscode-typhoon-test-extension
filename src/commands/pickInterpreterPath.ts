import * as vscode from 'vscode';
import {isWindows} from '../utils/platform/selector';
import {updateCustomInterpreterPath} from '../utils/config';

export function pickInterpreterPath() {
    vscode.window.showOpenDialog({  
        canSelectFiles: true,
        canSelectFolders: false,
        canSelectMany: false,
        filters: {
            'Python Interpreter': isWindows() ? ['exe'] : ['']
        }
    }).then(result => {
        if (result && result.length > 0) {
            const interpreterPath = result[0].fsPath;
            updateCustomInterpreterPath(interpreterPath).then(
                () => vscode.window.showInformationMessage('Custom interpreter path updated successfully'),
                () => vscode.window.showErrorMessage('Failed to update custom interpreter path')
            );
        }
    });
}