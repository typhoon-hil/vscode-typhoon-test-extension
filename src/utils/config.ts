import vscode from 'vscode';
import { PythonImport } from "../models/pythonEntity";
import { interpreterType, TestRunConfig } from '../models/testRun';

const config = vscode.workspace.getConfiguration('typhoon-test');
const testRunConfig = vscode.workspace.getConfiguration('typhoon-test.testRun');

export function loadWorkspaceElements(): PythonImport[] {
    return config.get<PythonImport[]>('apiWizardWorkspace', []);
}

export async function updateWorkspaceElements(elements: PythonImport[]) {
    config.update('apiWizardWorkspace', elements, vscode.ConfigurationTarget.Global);
}

export function getLineSpacing(): string {
    const lineSpacingCount = config.get<number>('lineSpacing')!;
    return '\n'.repeat(lineSpacingCount);
}

export function getTestRunConfig(): TestRunConfig {
    return {
        interpreterType: getinterpreterType() as interpreterType,
        customInterpreterPath: getcustomInterpreterPath(),
        realTimeLogs: getRealTimeLogs(),
        openReport: getOpenReport(),
        cleanOldResults: getCleanOldResults(),
        pdfReport: getPdfReport(),
        selectTestByName: getSelectTestByName(),
        selectTestByMark: getSelectTestByMark(),
        additionalOptions: getAdditionalOptions()
    };
}

function getinterpreterType(): interpreterType {
    return testRunConfig.get<string>('interpreter', "embedded") as interpreterType;
}

function getcustomInterpreterPath(): string | undefined {
    let path = testRunConfig.get<string | undefined>('customInterpreterPath');
    return path && path.trim() ? path : undefined;
}

function getRealTimeLogs(): boolean {
    return testRunConfig.get<boolean>('realTimeLogs', false);
}

function getOpenReport(): boolean {
    return testRunConfig.get<boolean>('openReport', true);
}

function getCleanOldResults(): boolean {
    return testRunConfig.get<boolean>('cleanOldResults', false);
}

function getPdfReport(): boolean {
    return testRunConfig.get<boolean>('pdfReport', false);
}

function getSelectTestByName(): string | undefined {
    let name = testRunConfig.get<string | undefined>('selectTestByName');
    return name && name.trim() ? name : undefined;
}

function getSelectTestByMark(): string | undefined {
    let mark = testRunConfig.get<string | undefined>('selectTestByMark');
    return mark && mark.trim() ? mark : undefined;
}

function getAdditionalOptions(): string | undefined {
    let options = testRunConfig.get<string | undefined>('additionalOptions');
    return options && options.trim() ? options : undefined;
}

export function updateCustomInterpreterPath(path: string) {
    testRunConfig.update('customInterpreterPath', path, vscode.ConfigurationTarget.Global);
}
