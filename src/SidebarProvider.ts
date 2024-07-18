// SidebarProvider.ts
import * as vscode from 'vscode';

export class SidebarProvider implements vscode.WebviewViewProvider {
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
    const styleUri = webview.asWebviewUri(vscode.Uri.joinPath(this._extensionUri, 'media', 'style.css'));
    const scriptUri = webview.asWebviewUri(vscode.Uri.joinPath(this._extensionUri, 'media', 'script.js'));

    return `
      <!DOCTYPE html>
      <html lang="en">
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <link href="${styleUri}" rel="stylesheet">
        <title>Custom View</title>
      </head>
      <body>
        <h1>Custom View</h1>
        <form id="myForm">
          <label for="input">Enter something:</label>
          <input type="text" id="input" name="input">
          <button type="button" id="submitButton">Submit</button>
        </form>
        <div id="output"></div>
        <script src="${scriptUri}"></script>
      </body>
      </html>`;
  }

  private setWebviewMessageListener(webview: vscode.Webview): void {
    webview.onDidReceiveMessage((message) => {
      if (message.command === 'submit') {
        vscode.window.showInformationMessage(`You entered: ${message.text}`);
        this._view?.webview.postMessage({ command: 'update', text: `You entered: ${message.text}` });
      }
    });
  }
}
