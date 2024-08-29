import {PythonEntity, PythonEntityType} from "../models/pythonEntity";
import path from "path";
import {exec} from "child_process";

export async function loadPythonEntity(pythonCommand: string, moduleName: string, type: PythonEntityType): Promise<PythonEntity> {
    const plain = await extractPython(pythonCommand, moduleName, type);
    return JSON.parse(plain) as PythonEntity;
}

async function extractPython(pythonCommand: string, moduleName: string, type: PythonEntityType): Promise<string> {
    return new Promise((resolve, reject) => {
        const filePath = path.resolve(__dirname, '..', '..', 'scripts', `get_${type}_source.py`);
        exec(`${pythonCommand} ${filePath} ${moduleName}`, (error, stdout, stderr) => {
            if (error) {
                reject(`Error loading ${type}: ${stderr}, ${error}`);
            } else {
                resolve(stdout);
            }
        });
    });
}
