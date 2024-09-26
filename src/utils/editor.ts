import * as vscode from 'vscode';
import * as fs from 'fs';
import * as path from 'path';

export function getFullTestName(): string {
    const activeFile = getActiveFileName();
    const testName = getSelectedTestName();

    return (activeFile && testName) ? `${activeFile}::${testName}` : '';
}

export function getActiveFileName(): string {
    const activeEditor = vscode.window.activeTextEditor;
    if (activeEditor) {
        return activeEditor.document.fileName;
    }
    return '';
}

function getSelectedTestName(): string {
    const editor = vscode.window.activeTextEditor;
    if (!editor) {
        vscode.window.showErrorMessage('No file is currently open');
        return '';
    }

    const document = editor.document;
    const position = editor.selection.active;
    const wordRange = document.getWordRangeAtPosition(position, /\w+/);

    if (!wordRange) {
        vscode.window.showErrorMessage('No test name found at the cursor position');
        return '';
    }

    const testName = document.getText(wordRange);
    return testName;
}

export async function findAllPackages(): Promise<string[]> {
    const workspaceFolders = vscode.workspace.workspaceFolders;
    const packagePaths: string[] = [];

    if (!workspaceFolders) {
        vscode.window.showErrorMessage('No workspace folder is open.');
        return [];
    }

    // Get the first workspace folder (assuming single-folder workspace)
    const workspaceRoot = workspaceFolders[0].uri.fsPath;

    // Recursive function to search for packages (directories with __init__.py)
    function findPackages(dir: string) {
        const files = fs.readdirSync(dir);

        for (const file of files) {
            const filePath = path.join(dir, file);
            const stat = fs.statSync(filePath);

            // If it's a directory, check for __init__.py
            if (stat.isDirectory()) {
                const initFilePath = path.join(filePath, '__init__.py');
                
                if (fs.existsSync(initFilePath)) {
                    // If __init__.py exists, this is a package
                    packagePaths.push(path.relative(workspaceRoot, filePath));
                }
                
                // Recursively search subdirectories
                findPackages(filePath);
            }
        }
    }

    // Start searching from the workspace root
    findPackages(workspaceRoot);

    return packagePaths;
}
