import * as vscode from 'vscode';
import * as path from 'path';
import * as fs from 'fs';
import {TreeNode} from "../models/TreeNode";
import {PythonArgument, PythonCallable} from "../models/pythonEntity";
import {findLastImportIndex, importWithClassSnippetString, snippetToString} from "../utils/snippet";

interface Root {
    label: string;
    type: string;
    alias: string;
}

export interface CodeSnippet {
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
            label: root.item.name,
            type: root.item.type,
            alias: root.alias || ''
        },
        label: item.item.name,
        args: (item.item as PythonCallable).args
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


