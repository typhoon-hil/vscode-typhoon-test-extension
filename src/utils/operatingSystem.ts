export function isWindows(): boolean {
    return process.platform === 'win32';
}

export function getPythonCommand(): string {
    return isWindows() ? 'python' : 'python3';
}