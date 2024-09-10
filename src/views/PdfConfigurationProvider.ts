import * as vscode from 'vscode';
import { generateConfigHtml, getConfigs } from '../utils/configWebview';

export class PdfConfigurationProvider implements vscode.WebviewViewProvider {
    private _view?: vscode.WebviewView;
    private _cssPath: vscode.Uri;
    private _jsPath: vscode.Uri;

    constructor(private readonly _extensionUri: vscode.Uri) {
        this._cssPath = vscode.Uri.joinPath(this._extensionUri, 'media', 'argumentsWebview.css');
        this._jsPath = vscode.Uri.joinPath(this._extensionUri, 'media', 'pdfConfiguration', 'pdfConfiguration.js');
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
        const configs = getConfigs('typhoon-test.pdfConfiguration');
        const elements = generateConfigHtml(configs);
        return `
            <!DOCTYPE html>
            <html>
                <head>
                    <link rel="stylesheet" type="text/css" href="${this._cssPath}" />
                    <script src="${this._jsPath}"></script>
                </head>
                <body>
                    <div id="pdf-configuration">
                        ${elements}
                    </div>
                </body>
            </html>
        `;
    }
}