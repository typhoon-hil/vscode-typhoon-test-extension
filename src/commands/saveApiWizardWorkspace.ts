import { saveWorkspaceElements } from "../utils/config";
import { getRootNodesAsWorkspaceElements } from "./registerModuleTreeView";

export function saveApiWizardWorkspace() {
    const elements = getRootNodesAsWorkspaceElements();
    saveWorkspaceElements(elements);
}