import * as vscode from 'vscode';

export function pickOrganizationalLogoFilepath() {
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
            // updateOrganizationalLogoPath(logoPath);
        }
    });
}