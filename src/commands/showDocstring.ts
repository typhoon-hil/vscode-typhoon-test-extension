import { TreeNode } from '../view-providers/TreeDataProvider';
import { SidebarProvider } from '../view-providers/SidebarProvider';
import { docstringToHtml } from '../utils/docstringParser';

export function showDocstring(sidebarProvider: SidebarProvider , item: TreeNode) {
    const content = docstringToHtml(item.docstring);
    sidebarProvider.update_html(content);
}
