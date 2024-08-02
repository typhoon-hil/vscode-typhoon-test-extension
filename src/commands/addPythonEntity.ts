import * as vscode from 'vscode';
import {PythonEntityType} from "../models/pythonEntity";
import {getPythonEntityTreeProvider} from "../views/PythonEntityTreeProvider";

interface ApiOption {
    path: string;
    type: PythonEntityType;
}

const apiOptions: { [key: string]: ApiOption } = {
    'Schematic API': { path: 'typhoon.api.schematic_editor.SchematicAPI', type: 'class' },
    'HIL API': { path: 'typhoon.api.hil', type: 'module' },
};

export async function addPythonEntity() {
    const options: vscode.QuickPickItem[] = [
        ...Object.keys(apiOptions).map(label => ({
            label: label
        })),
    ];

    const selectedOption = await vscode.window.showQuickPick(options, {
        placeHolder: 'Select an API to view'
    });

    if (selectedOption) {
        const alias = await getAlias(selectedOption.label);

        const { path, type } = apiOptions[selectedOption.label];

        if (alias) {
            getPythonEntityTreeProvider()
                .addEntity({ name: path, type, alias }).then();
        }
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