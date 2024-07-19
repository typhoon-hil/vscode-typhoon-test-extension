import { FormProvider } from "./FormProvider";
import { TreeNode } from "./TreeDataProvider";

export function showFormCommand(formProvider: FormProvider, item: TreeNode) {
    formProvider.update_html(item.args);
}