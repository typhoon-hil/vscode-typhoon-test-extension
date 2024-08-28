import { Platform as Platform } from "../../models/Platform";
import { LinuxPlatform } from "./LinuxPlatform";
import { WindowsPlatform } from "./WindowsPlatform";

export function isWindows(): boolean {
    return process.platform === 'win32';
}

export function getPlatform(): Platform {
    return isWindows() ? new WindowsPlatform() : new LinuxPlatform();
}