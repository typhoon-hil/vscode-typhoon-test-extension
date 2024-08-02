import {getLineSpacing} from "./config";
import vscode from "vscode";
import {CodeSnippet} from "../view-providers/FormProvider";

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