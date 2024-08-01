import {saveWorkspaceElements} from "../utils/config";
import {getRootNodesAsWorkspaceElements} from "./registerModuleTreeView";
import * as vscode from "vscode";

export function saveApiWizardWorkspace() {
    const elements = getRootNodesAsWorkspaceElements();
    saveWorkspaceElements(elements)
        .then(_ => vscode.window.showInformationMessage('API Wizard workspace saved'));
}