import vscode from 'vscode';
import {PythonImport} from "../models/pythonEntity";

const config = vscode.workspace.getConfiguration('typhoon-test');

export function loadWorkspaceElements(): PythonImport[] {
    return config.get<PythonImport[]>('apiWizardWorkspace', []);
}

export async function saveWorkspaceElements(elements: PythonImport[]) {
    config.update('apiWizardWorkspace', elements, vscode.ConfigurationTarget.Global);
}

export function getLineSpacing(): string {
    const lineSpacingCount = config.get<number>('lineSpacing')!;
    return '\n'.repeat(lineSpacingCount);
}