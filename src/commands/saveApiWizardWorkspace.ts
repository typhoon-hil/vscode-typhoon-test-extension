import {updateWorkspaceElements} from "../utils/config";
import * as vscode from "vscode";
import {getPythonEntityTreeProvider} from "../views/PythonEntityTreeProvider";

export function saveApiWizardWorkspace() {
    const elements = getPythonEntityTreeProvider().getRootNodesAsPythonImports();
    updateWorkspaceElements(elements)
        .then(_ => vscode.window.showInformationMessage('API Wizard workspace saved'));
}