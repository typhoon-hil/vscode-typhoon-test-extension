import {getLineSpacing} from "./config";
import vscode from "vscode";

import {CodeSnippet, TakenActionMessage} from "../models/argumentsView.model";

export function findLastImportIndex(document: vscode.TextDocument) {
    for (let i = 0; i < document.lineCount; i++) {
        const lineText = document.lineAt(i).text;
        if (!lineText.startsWith('import') && !lineText.startsWith('from ')) {
            return i - 1;
        }
    }
    return 0; // If no import statements are found, return the top of the document
}

export function importWithClassSnippetString(snippet: CodeSnippet): string {
    const document = vscode.window.activeTextEditor!.document;
    const lineSpace = getLineSpacing();
    let importExists = doesImportExist(document, snippet.import);
    const importWithSeparator = importExists ? '' : snippet.import + '\n';

    let classWithSeparator = '';
    if (snippet.class) {
        let classExists = doesClassExist(document, snippet.class);
        if (!classExists) {
            classWithSeparator = `${lineSpace}${snippet.class}\n`;
        }
    }

    return `${importWithSeparator}${classWithSeparator}`;
}

export function snippetToString(snippet: CodeSnippet): string {
    const lineSpace = getLineSpacing() + '\n';
    let result = '';

    result += `${snippet.import}${lineSpace}`;

    if (snippet.class) {
        result += `${snippet.class}${lineSpace}`;
    }

    result += `${snippet.method}`;

    return result;
}

function doesImportExist(document: vscode.TextDocument, importStatement: string): boolean {
    for (let i = 0; i < document.lineCount; i++) {
        const lineText = document.lineAt(i).text;
        if (lineText.trimEnd() === importStatement) {
            return true;
        }
    }
    return false;
}

function doesClassExist(document: vscode.TextDocument, className: string): boolean {
    for (let i = 0; i < document.lineCount; i++) {
        const lineText = document.lineAt(i).text;
        if (lineText.trimEnd() === className) {
            return true;
        }
    }
    return false;
}

export function copyToClipboard(message: TakenActionMessage) {
    if (!message.code) {
        vscode.window.showErrorMessage('No code snippet found.').then();
        return;
    }
    vscode.env.clipboard.writeText(snippetToString(message.code))
        .then(() => {
            vscode.window.showInformationMessage('Copied to clipboard!').then();
        });
}

export function insertToEditor(message: TakenActionMessage) {
    const editor = vscode.window.activeTextEditor;
    if (!checkValidity(editor, message)) {
        return;
    }
    const code: CodeSnippet = message.code;
    editor.edit((editBuilder) => {
        const document = editor.document;
        const lastImportIndex = findLastImportIndex(document);
        const cursorPosition = editor.selection.active;

        const importPosition = new vscode.Position(lastImportIndex + 1, 0);
        editBuilder.insert(importPosition, importWithClassSnippetString(code));
        editBuilder.insert(cursorPosition, code.method + '\n');
    }).then();
}

function checkValidity(editor: vscode.TextEditor, message: TakenActionMessage): boolean {
    if (!editor) {
        vscode.window.showErrorMessage('No active text editor found.').then();
        return false;
    }
    if (!message.code) {
        vscode.window.showErrorMessage('No code snippet found.').then();
        return false;
    }
    return true;
}