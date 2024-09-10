import * as vscode from 'vscode';

export class PdfConfigurationProvider implements vscode.WebviewViewProvider {
    private _view?: vscode.WebviewView;

    constructor(private readonly _extensionUri: vscode.Uri) {
    }

    public resolveWebviewView(
        webviewView: vscode.WebviewView,
        _: vscode.WebviewViewResolveContext,
        __: vscode.CancellationToken
    ) {
        this._view = webviewView;

        webviewView.webview.options = {
            enableScripts: true
        };

        webviewView.webview.html = this.getInitHtml();
    }

    private getInitHtml(): string {
        return `
            <h1>PDF Configuration</h1>
            <p>Configure your PDF settings here.</p>
        `;
    }
}