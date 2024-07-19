import * as vscode from 'vscode';
import { FunctionArgument } from './TreeDataProvider';

export class FormProvider implements vscode.WebviewViewProvider {
    private _view?: vscode.WebviewView;

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

        webviewView.webview.html = this.getHtmlForWebview(webviewView.webview);
        this.setWebviewMessageListener(webviewView.webview);
    }

    private getHtmlForWebview(webview: vscode.Webview): string {
        return `<h2>Arguments Viewer</h2><h3>Select a method or function to view its arguments</h3>`;
    }

    private setWebviewMessageListener(webview: vscode.Webview): void {
        webview.onDidReceiveMessage((message) => {
            if (message.command === 'submit') {
                vscode.window.showInformationMessage(`You entered: ${message.text}`);
                this._view?.webview.postMessage({ command: 'update', text: `You entered: ${message.text}` });
            }
        });
    }

    public update_html(args: FunctionArgument[]): void {
        let htmlContent = '';

        args.forEach(arg => {
            if (arg.name === 'self') {
                return;
            }

            const label = `<label for="${arg.name}">${arg.name}</label>`;
            const inputType = 'text';
            const inputValue = arg.default !== undefined ? `value="${arg.default}"` : '';
            const input = `<input type="${inputType}" id="${arg.name}" name="${arg.name}" ${inputValue}>`;

            htmlContent += `<div>${label}: ${input}</div>`;
        });

        if (this._view) {
            this._view.webview.html = htmlContent;
        }
    }
}