import * as vscode from 'vscode';

let pdfConfig = vscode.workspace.getConfiguration('typhoon-test.pdfConfiguration');

export function refreshPdfConfig() {
    pdfConfig = vscode.workspace.getConfiguration('typhoon-test.pdfConfiguration');
}

export function getPdfConfig() {
    return {
        pdfCoverageTitle: pdfConfig.get<string>('pdfCoverageTitle'),
        organizationalMotto: pdfConfig.get<string[]>('organizationalMotto'),
        typhoonHilLogo: pdfConfig.get<boolean>('typhoonHilLogo'),
        organizationalLogoFilepath: pdfConfig.get<string>('organizationalLogoFilepath'),
        headerColor: pdfConfig.get<string>('headerColor'),
        trace: pdfConfig.get<boolean>('trace'),
        steps: pdfConfig.get<boolean>('steps'),
        plots: pdfConfig.get<boolean>('plots')
    };
}

export function updateOrganizationalLogoFilepath(filepath: string, isGlobal: boolean) {
    const target = isGlobal ? vscode.ConfigurationTarget.Global : vscode.ConfigurationTarget.Workspace;
    pdfConfig.update('organizationalLogoFilepath', filepath, target).then();
}