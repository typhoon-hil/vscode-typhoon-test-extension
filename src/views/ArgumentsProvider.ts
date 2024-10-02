import * as vscode from 'vscode';
import * as path from 'path';
import { TreeNode } from "../models/TreeNode";
import { copyToClipboard, insertToEditor } from "../utils/snippetCreator";
import { TakenActionMessage } from "../models/snippet";

export class ArgumentsProvider implements vscode.WebviewViewProvider {
    private _view?: vscode.WebviewView;
    private readonly mediaPath = vscode.Uri.file(path.join(__dirname, '..', 'media')).fsPath;

    constructor(private readonly _extensionUri: vscode.Uri) {
    }

    public resolveWebviewView(
        webviewView: vscode.WebviewView,
        _: vscode.WebviewViewResolveContext,
        __: vscode.CancellationToken
    ) {
        this._view = webviewView;

        webviewView.webview.options = {
            enableScripts: true,
            localResourceRoots: [this._extensionUri]
        };

        const htmlPath = vscode.Uri.file(
            path.join(this.mediaPath, 'argumentsWebview.html')
        );

        vscode.workspace.fs.readFile(htmlPath).then(content => {
            webviewView.webview.html = this.getInitHtml(content.toString());
            webviewView.webview.onDidReceiveMessage(this.handleMessage);
        });
    }

    public update(item: TreeNode): void {
        if (this._view) {
            const message = item.toRenderArgumentsMessage();
            this._view.webview.postMessage(
                message
            ).then();
        }
    }

    private handleMessage(message: TakenActionMessage) {
        switch (message.command) {
            case 'copyToClipboard':
                copyToClipboard(message);
                break;
            case 'insertToEditor':
                insertToEditor(message);
                break;
        }
    }

    private getInitHtml(htmlContent: string): string {
        const jsPath = vscode.Uri.file(
            path.join(this.mediaPath, 'argumentsWebview.js')
        );

        const cssPath = vscode.Uri.file(
            path.join(this.mediaPath, 'argumentsWebview.css')
        );

        const scriptUri = this._view!.webview.asWebviewUri(jsPath);
        const styleUri = this._view!.webview.asWebviewUri(cssPath);

        return htmlContent
            .replace('argumentsWebview.js', scriptUri.toString())
            .replace('argumentsWebview.css', styleUri.toString());
    }
}
