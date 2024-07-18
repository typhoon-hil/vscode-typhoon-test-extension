import { TreeNode } from './TreeDataProvider';
import { SidebarProvider } from './SidebarProvider';
import { docstringToHtml } from './utils/docstringParser';

export function showDocstringCommand(sidebarProvider: SidebarProvider ,item: TreeNode) {
    const content = docstringToHtml(item.docstring);
    sidebarProvider.update_html(content);
}
