import * as vscode from 'vscode';

export class PytestCodeLensProvider implements vscode.CodeLensProvider {
    public provideCodeLenses(document: vscode.TextDocument, token: vscode.CancellationToken): vscode.CodeLens[] {
        const codeLenses: vscode.CodeLens[] = [];
        const text = document.getText();

        let currentClass: string | null = null;
        const classRegex = /class\s+(\w+)\s*(\(.*\))?:/g;  // Matches Python class definitions
        const methodRegex = /def\s+(\w+)\s*\(.*\):/g;      // Matches Python method definitions (both inside/outside class)

        let matches;

        // First, find all classes
        while ((matches = classRegex.exec(text)) !== null) {
            const className = matches[1];
            const startPos = document.positionAt(matches.index);
            const endPos = document.positionAt(matches.index + matches[0].length);
            const range = new vscode.Range(startPos, endPos);

            // Save the current class name for later methods
            currentClass = className;

            // Add a CodeLens for the class itself (if you want to run the whole class tests)
            codeLenses.push(new vscode.CodeLens(range, {
                title: "Run With Typhoon Test",
                command: "typhoon-test.runTests",
                arguments: [`${document.fileName}::${currentClass}`]  // Class-level pytest command
            }));
        }

        // Now find all methods or standalone functions
        while ((matches = methodRegex.exec(text)) !== null) {
            const methodName = matches[1];
            const startPos = document.positionAt(matches.index);
            const endPos = document.positionAt(matches.index + matches[0].length);
            const range = new vscode.Range(startPos, endPos);

            if (currentClass) {
                // If inside a class, run the class method
                codeLenses.push(new vscode.CodeLens(range, {
                    title: "Run With Typhoon Test",
                    command: "typhoon-test.runTests",
                    arguments: [`${document.fileName}::${currentClass}::${methodName}`]  // Class + Method pytest command
                }));
            } else {
                // Standalone function (outside any class)
                codeLenses.push(new vscode.CodeLens(range, {
                    title: "Run My Command",
                    command: "typhoon-test.runTests",
                    arguments: [`${document.fileName}::${methodName}`]  // Function pytest command (no class)
                }));
            }
        }

        return codeLenses;
    }
}
