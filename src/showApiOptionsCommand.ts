import * as vscode from 'vscode';
import { addModule, registerModuleTreeView } from './registerModuleTreeView';


const apiOptions: { [key: string]: string } = {
    'Schematic API': 'typhoon.api.schematic_editor',
    'HIL API': 'typhoon.api.hil',
};

export async function showApiOptionsCommand() {
    const options: vscode.QuickPickItem[] = [
        ...Object.keys(apiOptions).map(label => ({
            label: label
        })),
    ];

    const selectedOption = await vscode.window.showQuickPick(options, {
        placeHolder: 'Select an API to view'
    });

    if (selectedOption) {
        const alias = await vscode.window.showInputBox({
            prompt: `Enter an alias for the ${selectedOption.label}:`
        });

        if (alias) {
            addModule(apiOptions[selectedOption.label]);
        }
    }
}