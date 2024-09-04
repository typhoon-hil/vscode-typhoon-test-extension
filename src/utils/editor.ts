import * as vscode from 'vscode';


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