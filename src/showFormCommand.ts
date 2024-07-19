import * as vscode from 'vscode';
import { FormProvider } from "./FormProvider";
import { TreeNode } from "./TreeDataProvider";

export function showFormCommand(formProvider: FormProvider, item: TreeNode) {
    vscode.window.showInformationMessage("Showing form for method");
}