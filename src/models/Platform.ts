export interface Platform {
    getPythonCommand(): string;
    getEmbeddedPythonPath(): string;
    getPythonExecutableExtension(): string;
}
