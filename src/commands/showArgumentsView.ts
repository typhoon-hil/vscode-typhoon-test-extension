import { ArgumentsProvider } from "../views/ArgumentsProvider";

import {TreeNode} from "../models/TreeNode";

export function showArgumentsView(formProvider: ArgumentsProvider, item: TreeNode) {
    formProvider.update(item);
}