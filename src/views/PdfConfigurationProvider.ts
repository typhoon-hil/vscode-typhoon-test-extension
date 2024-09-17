import * as vscode from 'vscode';
import { generateConfigElements, getConfigs } from '../utils/configWebview';
import { ConfigCommand, ConfigError, ConfigResponse } from '../models/config';

export class ConfigurationWebviewProvider implements vscode.WebviewViewProvider {
    private _view?: vscode.WebviewView;

    constructor(private readonly _extensionUri: vscode.Uri, private readonly _configGroup: string) {
    }

    refresh(): void {
        getConfigs(this._configGroup)
        .forEach(config => {
            this._view?.webview.postMessage({
                configName: config.group + '.' + config.label,
                value: config.value
            });
        });
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

        webviewView.webview.onDidReceiveMessage(this.handleMessage);
    }
    
    private getInitHtml(): string {
        const configs = getConfigs(this._configGroup);
        const elements = generateConfigElements(configs);

        const cssPath = this._view?.webview.asWebviewUri(
            vscode.Uri.joinPath(this._extensionUri, 'media', 'configuration', 'configuration.css')
        );
        
        const jsPath = this._view?.webview.asWebviewUri(
            vscode.Uri.joinPath(this._extensionUri, 'media', 'configuration', 'configuration.js')
        );

        return `
            <!DOCTYPE html>
            <html>
                <head>
                    <link rel="stylesheet" href="${cssPath}" />
                    <script src="${jsPath}"></script>
                </head>
                <body>
                    <div id="pdf-configuration">
                        ${elements}
                    </div>
                </body>
            </html>
        `;
    }

    handleMessage(message: ConfigResponse | ConfigError | ConfigCommand) {
        if ('error' in message) {
            vscode.window.showErrorMessage(message.error);
            return;
        }
        if ('command' in message) {
            vscode.commands.executeCommand(message.command);
            return;
        }
        vscode.workspace.getConfiguration().update(message.configName, message.value, vscode.ConfigurationTarget.Global);
    }
}