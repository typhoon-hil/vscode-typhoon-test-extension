import fs from 'fs';
import * as path from 'path';

export function doesDirExist(dirPath: string): boolean {
    return fs.existsSync(dirPath);
}

export function deleteFilesWithType(dirPath: string, type: string) {
    if (!doesDirExist(dirPath)) {
        return;
    }

    fs.readdir(dirPath, (err, files) => {
        if (err) {
            console.error(err);
            return;
        }

        files.filter((file) => file.endsWith(type))
        .map(file => path.join(dirPath, file)).forEach(deleteFile);
    });
}

function deleteFile(filePath: string) {
    fs.unlink(filePath, (err) => {
        if (err) {
            console.error(err);
        }
    });
}