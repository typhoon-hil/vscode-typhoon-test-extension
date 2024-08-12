import * as vscode from 'vscode';
import { isWindows } from '../utils/platform';
import { updateCustomInterpreterPath } from '../utils/config';

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
            updateCustomInterpreterPath(interpreterPath);
        }
    });
}