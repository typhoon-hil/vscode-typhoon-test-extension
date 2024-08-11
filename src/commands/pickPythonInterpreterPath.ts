import * as vscode from 'vscode';
import { isWindows } from '../utils/platform';

export function pickPythonInterpreterPath() {
    vscode.window.showOpenDialog({  
        canSelectFiles: true,
        canSelectFolders: false,
        canSelectMany: false,
        filters: {
            'Python Interpreter': isWindows() ? ['exe'] : ['']
        }
    }).then(result => {
        if (result && result.length > 0) {
            const pythonInterpreterPath = result[0].fsPath;
            vscode.workspace.getConfiguration('typhoon-test.testRun').update('customPythonInterpreterPath', pythonInterpreterPath, vscode.ConfigurationTarget.Global);
        }
    });
}