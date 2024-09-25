import * as vscode from 'vscode';
import { TestNameDetails } from '../models/testMonitoring';


export function viewTestInCode(details: TestNameDetails) {
    let paths = [vscode.workspace.workspaceFolders?.[0].uri.fsPath, details.folders.join('/'), details.module];
    const uri = vscode.Uri.file(paths.join('/'));
    vscode.workspace.openTextDocument(uri).then((document) => {
        vscode.window.showTextDocument(document).then((editor) => {
            const line = getLine(document, details);
            const position = new vscode.Position(line, 0);
            editor.selection = new vscode.Selection(position, position);
            editor.revealRange(new vscode.Range(position, position));
        });
    });
}

function getLine(document: vscode.TextDocument, details: TestNameDetails) {
    const lines = document.getText().split('\n');
    const testLine = lines.find((line) => line.includes(details.name));
    return testLine ? lines.indexOf(testLine) : 0;
}
