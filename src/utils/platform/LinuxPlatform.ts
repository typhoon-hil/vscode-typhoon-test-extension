import * as path from 'path';
import { Platform } from '../../models/Platform';
import { findLatestTyphoonPath } from '.';

export class LinuxPlatform implements Platform {
    getPythonCommand(): string {
        return 'python3';
    }

    getEmbeddedPythonPath(): string {
        const typhoonPaths = this.extractTyphoonPaths();
        const selectedPath = findLatestTyphoonPath(typhoonPaths);
        const cleanedPath = selectedPath.replace(/\/bin\/$/, '');
        return selectedPath ? path.join(cleanedPath, 'python3_portable', 'python3') : '';
    }

    getPythonExecutableExtension(): string {
        return '';
    }

    private extractTyphoonPaths(): string[] {
        const pathEnv = process.env.PATH || '';
        const pathDirs = pathEnv.split(':');
        return Array.from(new Set(pathDirs.filter(dir => dir.includes('Typhoon'))));
    }
}
