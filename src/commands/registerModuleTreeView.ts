import * as vscode from 'vscode';
import { PythonEntityTreeProvider } from '../views/PythonEntityTreeProvider';
import { ApiWizardWorkspaceElement, loadWorkspaceElements } from '../utils/config';
import {PythonEntityType} from "../models/pythonEntity";

const treeDataProvider = new PythonEntityTreeProvider();

export function registerModuleTreeView() {
    vscode.window.registerTreeDataProvider('typhoon-test.pythonModuleView', treeDataProvider);
    loadWorkspace();
}

export function addModule(moduleName: string, type: PythonEntityType, alias: string) {
    treeDataProvider.addEntity(moduleName, type, alias);
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
            type: node.item.type as PythonEntityType,
            path: node.item.name
        };
    });
}