import * as vscode from 'vscode';
import {updateOrganizationalLogoFilepath} from "../utils/pdfConfig";

export function pickOrganizationalLogoFilepath(isGlobal: boolean) {
    vscode.window.showOpenDialog({  
        canSelectFiles: true,
        canSelectFolders: false,
        canSelectMany: false,
        filters: {
            'Images': ['png', 'jpg', 'jpeg']
        }
    }).then(result => {
        if (result && result.length > 0) {
            const logoPath = result[0].fsPath;
            updateOrganizationalLogoFilepath(logoPath, isGlobal);
        }
    });
}