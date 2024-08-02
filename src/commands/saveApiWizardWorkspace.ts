import {saveWorkspaceElements} from "../utils/config";
import * as vscode from "vscode";
import {getPythonEntityTreeProvider} from "../views/PythonEntityTreeProvider";

export function saveApiWizardWorkspace() {
    const elements = getPythonEntityTreeProvider().getRootNodesAsPythonImports();
    saveWorkspaceElements(elements)
        .then(_ => vscode.window.showInformationMessage('API Wizard workspace saved'));
}