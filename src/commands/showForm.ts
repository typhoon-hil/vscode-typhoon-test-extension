import { FormProvider } from "../view-providers/FormProvider";

import {TreeNode} from "../models/TreeNode";

export function showForm(formProvider: FormProvider, item: TreeNode) {
    formProvider.update_html(item);
}