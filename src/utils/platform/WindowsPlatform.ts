import { Platform } from '../../models/Platform';
import { spawn } from 'child_process';

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

    killProcess(pid: number | undefined): void {
        if (pid) {
            spawn('taskkill', ['/pid', pid.toString(), '/T', '/F']);
        }
    }
}
