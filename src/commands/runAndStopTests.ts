import { PytestRunner } from "../models/testRun";
import { TestTreeProvider } from "../views/TestTreeProvider";

let pytestRunner: PytestRunner | undefined;

export async function runTests(testTreeProvider: TestTreeProvider, testScope?: string) {
    if (PytestRunner.IsRunning) {
        return;
    } 
    
    pytestRunner = new PytestRunner(testTreeProvider, testScope);
    await pytestRunner.run();
}

export function stopTests() {
    pytestRunner?.stop();
}