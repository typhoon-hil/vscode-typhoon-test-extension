import { SidebarProvider } from '../view-providers/SidebarProvider';
import { docstringToHtml } from '../utils/docstringParser';
import {TreeNode} from "../models/TreeNode";

export function showDocstring(sidebarProvider: SidebarProvider , item: TreeNode) {
    const content = docstringToHtml(item.docstring);
    sidebarProvider.update_html(content);
}
