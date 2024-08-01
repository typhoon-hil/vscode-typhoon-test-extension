import vscode from 'vscode';
import {PythonEntityType} from "../models/pythonEntity";

export interface ApiWizardWorkspaceElement {
    path: string;
    type: PythonEntityType;
    alias: string;
}

export function loadWorkspaceElements(): ApiWizardWorkspaceElement[] {
    const config = vscode.workspace.getConfiguration('typhoon-test');
    return config.get<ApiWizardWorkspaceElement[]>('apiWizardWorkspace', []);
}

export async function saveWorkspaceElements(elements: ApiWizardWorkspaceElement[]) {
    const config = vscode.workspace.getConfiguration('typhoon-test');
    config.update('apiWizardWorkspace', elements, vscode.ConfigurationTarget.Global);
}

export function getLineSpacing(): string {
    const lineSpacingCount = vscode.workspace.getConfiguration('typhoon-test').get<number>('lineSpacing')!;
    return '\n'.repeat(lineSpacingCount);
}