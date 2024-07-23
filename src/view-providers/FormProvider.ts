import * as vscode from 'vscode';
import * as path from 'path';
import * as fs from 'fs';
import { FunctionArgument, TreeNode } from './TreeDataProvider';

interface WebviewMessage {
    root: Root;
    label: string;
    args: FunctionArgument[];

}

interface Root {
    label: string;
    type: string;
    alias: string;
}

function convertToWebviewMessage(item: TreeNode): WebviewMessage {
    const root = item.getRootParent();
    return {
        root: {
            label: root.label,
            type: root.type,
            alias: root.alias || ''
        },
        label: item.label,
        args: item.args
    };
}

export class FormProvider implements vscode.WebviewViewProvider {
    private _view?: vscode.WebviewView;
    private readonly mediaPath = vscode.Uri.file(path.join(__dirname, '..', '..', 'media'));

    constructor(private readonly _extensionUri: vscode.Uri) {}

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

    private handleMessage(message: any): any {
        // Possible commands:
        // - showInfo
        // - showError
        // - Command 3
        switch (message.command) {
            case 'showInfo':
                vscode.window.showInformationMessage(message.text);
                break;
            case 'showError':
                vscode.window.showErrorMessage(message.text);
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