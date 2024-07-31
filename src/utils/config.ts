import * as vscode from 'vscode';

export interface ApiWizardWorkspaceElement {
    path: string;
    type: 'module' | 'class';
    alias: string;
}

export function loadWorkspaceElements(): ApiWizardWorkspaceElement[] {
    const config = vscode.workspace.getConfiguration('typhoon-test');
    const elements = config.get<ApiWizardWorkspaceElement[]>('apiWizardWorkspace', []);
    return elements;
}

export function saveWorkspaceElements(elements: ApiWizardWorkspaceElement[]) {
    const config = vscode.workspace.getConfiguration('typhoon-test');
    config.update('apiWizardWorkspace', elements, vscode.ConfigurationTarget.Global);
}
