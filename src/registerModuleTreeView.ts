import * as vscode from 'vscode';
import { TreeDataProvider } from './TreeDataProvider';

const treeDataProvider = new TreeDataProvider();

export function registerModuleTreeView() {
    vscode.window.registerTreeDataProvider('typhoon-test.pythonModuleView', treeDataProvider);
}

export function addModule(moduleName: string, type: 'module'|'class') {
    treeDataProvider.addModule(moduleName, type);
}