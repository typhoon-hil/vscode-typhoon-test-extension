import { getPlatform } from "../utils/platform/index";
import { updateEmbeddedInterpreterPath as update } from "../utils/config";

export function updateEmbeddedInterpreterPath() {
    const embeddedInterpreterPath = getPlatform().getEmbeddedPythonCommand();
    update(embeddedInterpreterPath);
}