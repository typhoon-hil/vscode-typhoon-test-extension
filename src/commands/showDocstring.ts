import { SidebarProvider } from '../view-providers/SidebarProvider';
import { docstringToHtml } from '../utils/docstringParser';
import {TreeNode} from "../models/TreeNode";
import {PythonCallable} from "../models/api-call-models";

export function showDocstring(sidebarProvider: SidebarProvider , node: TreeNode) {
    const content = docstringToHtml((node.item as PythonCallable).doc);
    sidebarProvider.update_html(content);
}
