import * as vscode from 'vscode';

export class SidebarProvider implements vscode.WebviewViewProvider {
    private _view?: vscode.WebviewView;

    constructor(private readonly _extensionUri: vscode.Uri) {
    }

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

        webviewView.webview.html = this.getInitHtml();
    }

    public update(docstring: string) {
        if (this._view) {
            this._view.webview.html = docstring;
        }
    }

    private getInitHtml(): string {
        return `<h2>Docstring Viewer</h2><h3>Select a method or function to view its docstring</h3>`;
    }
}
