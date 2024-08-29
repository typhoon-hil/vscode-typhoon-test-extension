import * as vscode from 'vscode';
import { PythonEntityType } from "../models/pythonEntity";
import { getPythonEntityTreeProvider } from "../views/PythonEntityTreeProvider";

interface ApiOption {
    path: string;
    type: PythonEntityType;
}

const apiOptions: { [key: string]: ApiOption } = {
    'Schematic API': { path: 'typhoon.api.schematic_editor.SchematicAPI', type: 'class' },
    'HIL API': { path: 'typhoon.api.hil', type: 'module' },
};

const importOptions: { label: string, type: PythonEntityType }[] = [
    { label: 'Import another class', type: 'class' },
    { label: 'Import another module', type: 'module' }
];

export async function addPythonEntity() {
    const options: vscode.QuickPickItem[] = [
        ...Object.keys(apiOptions).map(label => ({
            label: label
        })),
        ...importOptions.map(option => ({
            label: option.label,
            iconPath: new vscode.ThemeIcon('add')
        }))
    ];

    const selectedOption = await vscode.window.showQuickPick(options, {
        placeHolder: 'Select one of the following options to add a Python entity:'
    });

    if (!selectedOption) {
        return;
    }

    if (selectedOption.label in apiOptions) {
        let alias = await getAlias(selectedOption.label);
        let { path, type } = apiOptions[selectedOption.label];

        if (alias) {
            getPythonEntityTreeProvider()
                .addEntity({ name: path, type, alias }).then();
        }
        return;
    }
    let path = await vscode.window.showInputBox({
        prompt: 'Enter the path of the Python entity:'
    });

    if (!path) {
        return;
    }

    let alias = await getAlias(path);
    let type = importOptions.find(option => option.label === selectedOption.label)!.type;

    if (alias) {
        getPythonEntityTreeProvider()
            .addEntity({ name: path, type, alias }).then();
    }
}

async function getAlias(entity_name: string): Promise<string> {
    const alias = await vscode.window.showInputBox({
        prompt: `Enter an alias for the ${entity_name}:`
    });

    if (!alias) {
        return '';
    }

    if (getPythonEntityTreeProvider().doesAliasExist(alias)) {
        vscode.window.showErrorMessage(`Alias '${alias}' already exists. Please choose another name.`);
        return getAlias(entity_name);
    }

    return alias;
}