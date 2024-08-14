import * as vscode from 'vscode';
import { PytestBuilder } from '../utils/pytestBuilder';

export function runTests() {
    const terminal = getTerminal();
    const builder = new PytestBuilder(terminal);
    const command = builder.build();

    terminal.sendText(command);
}

function getTerminal(): vscode.Terminal {
    return vscode.window.activeTerminal || vscode.window.createTerminal();
}
