import {PythonEntity, PythonEntityType} from "../models/api-call-models";
import path from "path";
import {exec} from "child_process";

export async function loadPythonEntity(moduleName: string, type: PythonEntityType): Promise<PythonEntity> {
    const plain = await extractPython(moduleName, type);
    return JSON.parse(plain) as PythonEntity;
}

async function extractPython(moduleName: string, type: PythonEntityType): Promise<string> {
    return new Promise((resolve, reject) => {
        const filePath = path.resolve(__dirname, '..', '..', 'scripts', `get_${type}_source.py`);
        exec(`python ${filePath} ${moduleName}`, (error, stdout, stderr) => {
            if (error) {
                reject(`Error loading module: ${stderr}, ${error}`);
            } else {
                resolve(stdout);
            }
        });
    });
}
