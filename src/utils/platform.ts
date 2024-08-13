import * as path from 'path';

export function isWindows(): boolean {
    return process.platform === 'win32';
}

export function getPythonCommand(): string {
    return isWindows() ? 'python' : 'python3';
}

export function getEmbeddedPythonPath(): string {
    const typhoonPaths = extractTyphoonPaths();
    const selectedPath = findLatestTyphoonPath(typhoonPaths);
    const cleanedPath = selectedPath.replace(/\\bin\\$/, '');

    return selectedPath ? path.join(cleanedPath, 'python3_portable', 'python.exe') : '';
}

function findLatestTyphoonPath(typhoonPaths: string[]): string {
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

function getVersion(path: string): string {
    const versionMatch = path.match(/Typhoon [^\\\/]*?\b(\d+\.\d+)\b/);
    return versionMatch && versionMatch[1] ? versionMatch[1] : '';
}

function extractTyphoonPaths(): string[] {
    let typhoonPaths: string[] = [];
    const pathEnv = process.env.PATH || '';
    const pathDirs = pathEnv.split(';');

    typhoonPaths = Array.from(new Set(pathDirs.filter(dir => dir.includes('Typhoon'))));

    return typhoonPaths;
}