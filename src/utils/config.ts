import * as vscode from 'vscode';

export interface ApiWizardWorkspaceElement {
    path: string;
    type: 'module' | 'class';
    alias: string;
}

export function loadWorkspaceElements(): ApiWizardWorkspaceElement[] {
    const config = vscode.workspace.getConfiguration('api-wizard');
    const elements = config.get<ApiWizardWorkspaceElement[]>('workspaceElements', []);
    return elements;
}

export function saveWorkspaceElements(elements: ApiWizardWorkspaceElement[]) {
    const config = vscode.workspace.getConfiguration('api-wizard');
    config.update('workspaceElements', elements, vscode.ConfigurationTarget.Global);
}
