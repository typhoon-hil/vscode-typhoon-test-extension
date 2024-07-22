import * as vscode from 'vscode';
import { addModule, registerModuleTreeView } from './registerModuleTreeView';

interface ApiOption {
    path: string;
    type: 'module' | 'class';
}

const apiOptions: { [key: string]: ApiOption } = {
    'Schematic API': { path: 'typhoon.api.schematic_editor.SchematicAPI', type: 'class' },
    'HIL API': { path: 'typhoon.api.hil', type: 'module' },
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

        const { path, type } = apiOptions[selectedOption.label];

        if (alias) {
            addModule(path, type);
        }
    }
}