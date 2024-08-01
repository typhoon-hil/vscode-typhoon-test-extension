import * as vscode from 'vscode';
import { PythonEntityTreeProvider } from '../views/PythonEntityTreeProvider';
import { loadWorkspaceElements } from '../utils/config';
import {PythonEntityType, PythonImport} from "../models/pythonEntity";

const treeDataProvider = new PythonEntityTreeProvider();

export function registerModuleTreeView() {
    vscode.window.registerTreeDataProvider('typhoon-test.pythonModuleView', treeDataProvider);
    loadWorkspace();
}

export function addModule(name: string, type: PythonEntityType, alias: string) {
    treeDataProvider.addEntity({name, type, alias});
}

export function doesAliasExist(alias: string): boolean {
    return treeDataProvider.doesAliasExist(alias);
}

export function loadWorkspace() {
    const elements = loadWorkspaceElements();
    elements.forEach(element => {
        if (!doesAliasExist(element.alias)) {
            addModule(element.name, element.type, element.alias);
        }
    });
}

export function getRootNodesAsWorkspaceElements(): PythonImport[] {
    return treeDataProvider.getRootNodes().map(node => {
        return {
            alias: node.alias!,
            type: node.item.type as PythonEntityType,
            name: node.item.name
        };
    });
}