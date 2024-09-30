import * as vscode from 'vscode';

export class PytestCodeLensProvider implements vscode.CodeLensProvider {
    public provideCodeLenses(document: vscode.TextDocument, token: vscode.CancellationToken): vscode.CodeLens[] {
        if (!vscode.workspace.workspaceFolders?.[0]) {
            return [];
        }

        const workspaceFolder = vscode.workspace.getWorkspaceFolder(document.uri);
        if (!workspaceFolder) {
            return [];
        }

        const codeLenses: vscode.CodeLens[] = [];
        let text = document.getText();

        const classRegex = /class\s+(\w+)\s*(\(.*\))?:/g;  // Matches Python class definitions
        const endOfClassRegex = /^(?:[\r\n]+)?(def|class)\s+\w+(\s*\(.*\))?:/m;  // Matches the end of a class definition
        let matches;

        // First, find all classes
        while ((matches = classRegex.exec(text)) !== null) {
            const className = matches[1];

            const args = [document.fileName, className];

            // Now find all methods inside the class
            const classText = text.slice(classRegex.lastIndex);
            const endOfClass = classText.search(endOfClassRegex);
            const offset = classRegex.lastIndex;

            classRegex.lastIndex += endOfClass === -1 ? classText.length : endOfClass;
            
            if (className.startsWith("Test")) {
                codeLenses.push(createCodeLens(matches, document, 0, ...args));
                
                const classMethods = classText.slice(0, endOfClass === -1 ? undefined : endOfClass);
                const methods = this.findMethods(classMethods, document, className, offset);
                codeLenses.push(...methods);
            }
        }

        const methods = this.findMethods(text, document);
        codeLenses.push(...methods);

        return codeLenses;
    }

    private findMethods(text: string, document: vscode.TextDocument, className?: string, offset: number = 0): vscode.CodeLens[] {
        const methodRegex = /def\s+(\w+)(\s*\(.*\))?:/g;
        const codeLenses: vscode.CodeLens[] = [];

        let matches;
        while ((matches = methodRegex.exec(text)) !== null) {
            const methodName = matches[1];
            if (!methodName.startsWith("test")) {
                continue;
            }
            if (!className) {
                if (["\t", " "].includes(text[matches.index - 1])) {
                    continue;
                }
            }
            const args = [document.fileName, className, methodName].filter(Boolean) as string[];
            codeLenses.push(createCodeLens(matches, document, offset, ...args));
        }
        return codeLenses;
    }
}

function createCodeLens(match: RegExpExecArray, document: vscode.TextDocument, offset: number = 0, ...args: string[]): vscode.CodeLens {
    const startPos = document.positionAt(match.index + offset);
    const endPos = document.positionAt(match.index + offset + match[0].length);
    const range = new vscode.Range(startPos, endPos);
    return new vscode.CodeLens(range, {
        title: "Run With Typhoon Test",
        command: "typhoon-test.runTests",
        arguments: [args.join("::")]
    });
}
