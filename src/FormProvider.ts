import * as vscode from 'vscode';
import { FunctionArgument } from './TreeDataProvider';
import * as path from 'path';
import * as fs from 'fs';

export class FormProvider implements vscode.WebviewViewProvider {
    private _view?: vscode.WebviewView;
    private readonly mediaPath = vscode.Uri.file(path.join(__dirname, '..', 'media'));

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

    public update_html(args: FunctionArgument[]): void {
        if (this._view) {
            this._view.webview.postMessage(args);
        }
    }
}