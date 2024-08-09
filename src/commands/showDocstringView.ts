import { DocumentationProvider } from '../views/DocumentationProvider';
import { docstringToHtml } from '../utils/docstringParser';
import {TreeNode} from "../models/TreeNode";
import {PythonCallable} from "../models/pythonEntity";

export function showDocstringView(sidebarProvider: DocumentationProvider , node: TreeNode) {
    const content = docstringToHtml((node.item as PythonCallable).doc);
    sidebarProvider.update(content);
}
