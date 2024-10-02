import {PythonEntity, PythonEntityType} from "../models/pythonEntity";
import path from "path";
import * as vscode from "vscode";
import {exec} from "child_process";

const scriptsDir = vscode.Uri.file(path.join(__dirname, '..', 'scripts')).fsPath;

export async function loadPythonEntity(pythonCommand: string, moduleName: string, type: PythonEntityType): Promise<PythonEntity> {
    const plain = await extractPython(pythonCommand, moduleName, type);
    return JSON.parse(plain) as PythonEntity;
}

async function extractPython(pythonCommand: string, moduleName: string, type: PythonEntityType): Promise<string> {
    const filePath = path.join(scriptsDir, `get_${type}_source.py`);
    return new Promise((resolve, reject) => {
        exec(`${pythonCommand} ${filePath} ${moduleName}`, (error, stdout, _) => {
            return error ? reject(error) : resolve(stdout);
        });
    });
}
