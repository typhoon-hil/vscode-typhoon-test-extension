export function isWindows(): boolean {
    return process.platform === 'win32';
}

export function getPythonCommand(): string {
    return isWindows() ? 'python' : 'python3';
}

export function getEmbeddedPythonPath(): string {
    let typhoonPaths: string[] = [];
    const pathEnv = process.env.PATH || '';
    const pathDirs = pathEnv.split(';');

    for (const dir of pathDirs) {
        if (dir.includes('Typhoon')) {
            typhoonPaths.push(dir);
        }
    }

    let selectedPath = '';
    let selectedVersion = '';

    for (const path of typhoonPaths) {
        const versionMatch = path.match(/Typhoon [^\\\/]*?\b(\d+\.\d+)\b/);
        if (versionMatch) {
            const version = versionMatch[1];
            if (!selectedVersion || version > selectedVersion) {
                selectedPath = path;
                selectedVersion = version;
            }
        }
    }

    selectedPath = selectedPath.replace(/\\bin$/, '');

    return selectedPath ? `${selectedPath}/python3_portable/python.exe` : '';
}