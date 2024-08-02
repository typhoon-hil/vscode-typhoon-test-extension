import { ArgumentsProvider } from "../views/ArgumentsProvider";

import {TreeNode} from "../models/TreeNode";

export function showForm(formProvider: ArgumentsProvider, item: TreeNode) {
    formProvider.update(item);
}