import { saveWorkspaceElements } from "../utils/config";
import { getRootNodesAsWorkspaceElements } from "./registerModuleTreeView";

export function saveApiWizardWorkspaceCommand() {
    const elements = getRootNodesAsWorkspaceElements();
    saveWorkspaceElements(elements);
}