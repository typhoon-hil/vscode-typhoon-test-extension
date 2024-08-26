import * as vscode from 'vscode';
import { PytestBuilder } from '../utils/pytestBuilder';
import { getTestRunConfig } from '../utils/config';

export function runTests() {
    cleanOldResults();
    sendRunCommand();
}

function sendRunCommand() {
    const terminal = getTerminal();
    const builder = new PytestBuilder(terminal);
    const command = builder.build();

    terminal.sendText(command);
}

function getTerminal(): vscode.Terminal {
    return vscode.window.activeTerminal || vscode.window.createTerminal();
}

function cleanOldResults() {
    const config = getTestRunConfig();
    if (config.cleanOldResults) {
        vscode.commands.executeCommand('typhoon-test.cleanOldResults');
    }
}
