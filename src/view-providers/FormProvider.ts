import * as vscode from 'vscode';
import * as path from 'path';
import * as fs from 'fs';
import {TreeNode} from "../models/TreeNode";
import {PythonArgument} from "../models/api-call-models";

interface Root {
    label: string;
    type: string;
    alias: string;
}

interface CodeSnippet {
    import: string;
    class?: string;
    method: string;
}

interface WebviewRequestMessage {
    root: Root;
    label: string;
    args: PythonArgument[];

}

interface WebviewResponseMessage {
    command: string;
    code?: CodeSnippet;
    log?: string;
}

function convertToWebviewMessage(item: TreeNode): WebviewRequestMessage {
    const root = item.getRootParent();
    return {
        root: {
            label: root.name,
            type: root.type,
            alias: root.alias || ''
        },
        label: item.name,
        args: item.args
    };
}

export class FormProvider implements vscode.WebviewViewProvider {
    private _view?: vscode.WebviewView;
    private readonly mediaPath = vscode.Uri.file(path.join(__dirname, '..', '..', 'media'));

    constructor(private readonly _extensionUri: vscode.Uri) { }

    public resolveWebviewView(
        webviewView: vscode.WebviewView,
        context: vscode.WebviewViewResolveContext,
        token: vscode.CancellationToken
    ) {
        this._view = webviewView;

        webviewView.webview.options = {
            enableScripts: true,
            localResourceRoots: [this._extensionUri]
        };

        const htmlPath = vscode.Uri.file(
            path.join(this.mediaPath.fsPath, 'argumentsWebview.html')
        );
        const htmlContent = fs.readFileSync(htmlPath.fsPath, 'utf8');

        webviewView.webview.html = this.getHtmlForWebview(htmlContent);

        webviewView.webview.onDidReceiveMessage(this.handleMessage);
    }

    private handleMessage(message: WebviewResponseMessage) {
        switch (message.command) {
            case 'copyToClipboard':
                if (!message.code) {
                    vscode.window.showErrorMessage('No code snippet found.');
                    break;
                }
                vscode.env.clipboard.writeText(snippetToString(message.code))
                    .then(() => {
                        vscode.window.showInformationMessage('Copied to clipboard!');
                    });
                break;
            case 'insertToEditor':
                const editor = vscode.window.activeTextEditor;
                if (!editor) {
                    vscode.window.showErrorMessage('No active text editor found.');
                    break;
                }
                if (!message.code) {
                    vscode.window.showErrorMessage('No code snippet found.');
                    break;
                }
                const code: CodeSnippet = message.code;
                editor.edit((editBuilder) => {
                    const document = editor.document;
                    const lastImportIndex = findLastImportIndex(document);
                    const cursorPosition = editor.selection.active;

                    const importPosition = new vscode.Position(lastImportIndex + 1, 0);
                    editBuilder.insert(importPosition, importWithClassSnippetString(code));
                    editBuilder.insert(cursorPosition, code.method + '\n');
                });

                break;
            default:
                break;
        }
    }

    private getHtmlForWebview(htmlContent: string): string {
        const jsPath = vscode.Uri.file(
            path.join(this.mediaPath.fsPath, 'argumentsWebview.js')
        );

        const cssPath = vscode.Uri.file(
            path.join(this.mediaPath.fsPath, 'argumentsWebview.css')
        );

        const scriptUri = this._view!.webview.asWebviewUri(jsPath);
        const styleUri = this._view!.webview.asWebviewUri(cssPath);

        return htmlContent
            .replace('argumentsWebview.js', scriptUri.toString())
            .replace('argumentsWebview.css', styleUri.toString());
    }

    public update_html(item: TreeNode): void {
        if (this._view) {
            const message = convertToWebviewMessage(item);
            this._view.webview.postMessage(
                message
            );
        }
    }
}

function findLastImportIndex(document: vscode.TextDocument) {
    for (let i = 0; i < document.lineCount; i++) {
        const lineText = document.lineAt(i).text;
        if (!lineText.startsWith('import') && !lineText.startsWith('from ')) {
            return i - 1;
        }
    }
    return 0; // If no import statements are found, return the top of the document
}

function importWithClassSnippetString(snippet: CodeSnippet): string {
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


function snippetToString(snippet: CodeSnippet): string {
    const lineSpace = getLineSpacing() + '\n';
    let result = '';

    result += `${snippet.import}${lineSpace}`;

    if (snippet.class) {
        result += `${snippet.class}${lineSpace}`;
    }

    result += `${snippet.method}`;

    return result;
}

function getLineSpacing(): string {
    const lineSpacingCount = vscode.workspace.getConfiguration('typhoon-test').get<number>('lineSpacing')!;
    return '\n'.repeat(lineSpacingCount);
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