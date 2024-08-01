import * as vscode from 'vscode';
import { TreeDataProvider } from '../view-providers/TreeDataProvider';
import { ApiWizardWorkspaceElement, loadWorkspaceElements } from '../utils/config';
import {PythonEntityType} from "../models/api-call-models";

const treeDataProvider = new TreeDataProvider();

export function registerModuleTreeView() {
    vscode.window.registerTreeDataProvider('typhoon-test.pythonModuleView', treeDataProvider);
    loadWorkspace();
}

export function addModule(moduleName: string, type: PythonEntityType, alias: string) {
    treeDataProvider.addModule(moduleName, type, alias);
}

export function doesAliasExist(alias: string): boolean {
    return treeDataProvider.doesAliasExist(alias);
}

export function loadWorkspace() {
    const elements = loadWorkspaceElements();
    elements.forEach(element => {
        if (!doesAliasExist(element.alias)) {
            addModule(element.path, element.type, element.alias);
        }
    });
}

export function getRootNodesAsWorkspaceElements(): ApiWizardWorkspaceElement[] {
    return treeDataProvider.getRootNodes().map(node => {
        return {
            alias: node.alias!,
            type: node.type as PythonEntityType,
            path: node.label
        };
    });
}