import { PytestArgumentBuilder } from "../models/PytestArgumentBuilder";
import { PytestRunner } from "../models/testRun";
import { TestTreeProvider } from "../views/TestTreeProvider";

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
    pytestRunner?.stop();
}