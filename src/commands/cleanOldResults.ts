import * as vscode from 'vscode';
import { deleteFilesWithType } from '../utils/dirManagement';

export function cleanOldResults() {
    const workingDir = vscode.workspace.workspaceFolders![0].uri.fsPath;
    const reportDir = `${workingDir}/report`;
    deleteFilesWithType(reportDir, 'json');
}