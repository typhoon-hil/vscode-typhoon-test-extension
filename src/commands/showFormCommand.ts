import { FormProvider } from "../view-providers/FormProvider";
import { TreeNode } from "../view-providers/TreeDataProvider";

export function showFormCommand(formProvider: FormProvider, item: TreeNode) {
    formProvider.update_html(item.args);
}