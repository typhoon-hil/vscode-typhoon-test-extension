import { getPlatform } from "../utils/platform/selector";
import { updateEmbeddedInterpreterPath as update } from "../utils/config";

export function updateEmbeddedInterpreterPath() {
    const embeddedInterpreterPath = getPlatform().getEmbeddedPythonCommand();
    update(embeddedInterpreterPath);
}