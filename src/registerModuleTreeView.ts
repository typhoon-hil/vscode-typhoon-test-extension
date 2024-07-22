import * as vscode from 'vscode';
import { TreeDataProvider } from './TreeDataProvider';

export function registerModuleTreeView(module: string) {
    vscode.window.registerTreeDataProvider('typhoon-test.pythonModuleView', new TreeDataProvider(module));
}