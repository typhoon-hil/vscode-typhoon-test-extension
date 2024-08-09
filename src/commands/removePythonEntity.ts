import {getPythonEntityTreeProvider} from "../views/PythonEntityTreeProvider";
import {TreeNode} from "../models/TreeNode";

export async function removePythonEntity(item: TreeNode) {
    getPythonEntityTreeProvider().removeEntity(item).then();
}