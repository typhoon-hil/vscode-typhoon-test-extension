export function isWindows(): boolean {
    return process.platform === 'win32';
}

export function getPythonCommand(): string {
    return isWindows() ? 'python' : 'python3';
}

export function getEmbeddedPythonPath(): string {
    let typhoonPath = '';
    const pathEnv = process.env.PATH || '';
    const pathDirs = pathEnv.split(';');

    for (const dir of pathDirs) {
        if (dir.includes('Typhoon')) {
            typhoonPath = dir;
            break;
        }
    }
    return typhoonPath ? `${typhoonPath}/python` : '';
}