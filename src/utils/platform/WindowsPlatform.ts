import { Platform } from '../../models/Platform';
import { spawnSync } from 'child_process';

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
        const taskkillPath = 'C:\\Windows\\System32\\taskkill.exe';
        
        if (pid) {
            const args = ['/pid', pid.toString(), '/T', '/F'];
            const result = spawnSync(taskkillPath, args);

            if (result.error) {
                const res = spawnSync('taskkill', args);
                if (res.error) {
                    throw res.error;
                }
            } 
        }
    }
}
