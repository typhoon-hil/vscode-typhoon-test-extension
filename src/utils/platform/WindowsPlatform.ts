import { Platform } from '../../models/Platform';

export class WindowsPlatform implements Platform {
    getPythonCommand(): string {
        return 'python';
    }

    getEmbeddedPythonCommand(): string {
        return 'typhoon-python';
    }

    getPythonExecutableExtension(): string {
        return 'exe';
    }
}
