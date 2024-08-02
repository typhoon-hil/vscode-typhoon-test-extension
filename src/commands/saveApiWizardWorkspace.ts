import {saveWorkspaceElements} from "../utils/config";
import * as vscode from "vscode";
import {PythonEntityTreeProvider} from "../views/PythonEntityTreeProvider";

export function saveApiWizardWorkspace() {
    const elements = PythonEntityTreeProvider.getInstance().getRootNodesAsPythonImports();
    saveWorkspaceElements(elements)
        .then(_ => vscode.window.showInformationMessage('API Wizard workspace saved'));
}