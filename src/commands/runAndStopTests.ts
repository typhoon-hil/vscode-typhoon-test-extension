import { PytestArgumentBuilder } from "../models/PytestArgumentBuilder";
import { PytestRunner } from "../models/testRun";
import { TestTreeProvider } from "../views/TestTreeProvider";
import * as vscode from 'vscode';

let pytestRunner: PytestRunner | undefined;

export async function runTests(testTreeProvider: TestTreeProvider, testScope?: string, builderType: new (testScope?: string) => PytestArgumentBuilder = PytestArgumentBuilder) {
    if (PytestRunner.IsRunning) {
        return;
    } 
    
    pytestRunner = new PytestRunner(testTreeProvider, testScope, builderType);
    await pytestRunner.run().then().catch((e) => {
        PytestRunner.IsRunning = false;
        throw e;
    });
}

export function stopTests() {
    try {
        pytestRunner?.stop();
    }
    catch (e) {
        vscode.window.showErrorMessage('Failed to stop tests: ' + e);
    }
}