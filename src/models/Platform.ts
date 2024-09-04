export interface Platform {
    getPythonCommand(): string;
    getEmbeddedPythonCommand(): string;
    getPythonExecutableExtension(): string;
    killProcess(pid: number | undefined): void;
}
