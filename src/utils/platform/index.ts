import { Platform as Platform } from "../../models/Platform";
import { LinuxPlatform } from "./LinuxPlatform";
import { WindowsPlatform } from "./WindowsPlatform";

export function findLatestTyphoonPath(typhoonPaths: string[]): string {
    let selectedPath = '';
    let selectedVersion = '';

    for (const path of typhoonPaths) {
        const version = getVersion(path);
        if (version && (!selectedVersion || version > selectedVersion)) {
            selectedPath = path;
            selectedVersion = version;
        }
    }

    return selectedPath;
}

export function getVersion(path: string): string {
    const versionMatch = path.match(/Typhoon [^\\\/]*?\b(\d+\.\d+)\b/);
    return versionMatch && versionMatch[1] ? versionMatch[1] : '';
}

export function isWindows(): boolean {
    return process.platform === 'win32';
}

export function getPlatform(): Platform {
    return isWindows() ? new WindowsPlatform() : new LinuxPlatform();
}