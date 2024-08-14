import * as vscode from 'vscode';
import { deleteFilesWithType } from '../utils/dirManagement';
import * as path from 'path';

export function cleanOldResults() {
    const workingDir = vscode.workspace.workspaceFolders![0].uri.fsPath;
    const reportDir = path.join(workingDir, 'report');
    deleteFilesWithType(reportDir, 'json');
}