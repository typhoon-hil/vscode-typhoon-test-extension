import * as vscode from 'vscode';
import { TreeDataProvider } from '../view-providers/TreeDataProvider';

const treeDataProvider = new TreeDataProvider();

export function registerModuleTreeView() {
    vscode.window.registerTreeDataProvider('typhoon-test.pythonModuleView', treeDataProvider);
    addModule('typhoon.api.hil', 'module', 'hil');
}

export function addModule(moduleName: string, type: 'module'|'class', alias: string) {
    treeDataProvider.addModule(moduleName, type, alias);
}