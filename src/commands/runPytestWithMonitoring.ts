import * as cp from 'child_process';
import * as readline from 'readline';
import { TestTreeProvider } from '../views/TestTreeProvider';
import { TestStatus } from '../models/testMonitoring';
import * as vscode from 'vscode';


function runPytestWithMonitoring(testTreeProvider: TestTreeProvider) {
    const pytestProcess = cp.spawn('pytest', ['--tb=short', '-m', 'square'], { shell: true });

    const rl = readline.createInterface({
        input: pytestProcess.stdout,
        output: pytestProcess.stdin,
        terminal: false
    });

    rl.on('line', (line) => {
        // Parse the line to determine test status
        const testNameMatch = line.match(/(test_\w+) || (\w+_test)/); // Modify based on actual pytest output
        const passMatch = line.match(/PASSED/i);
        const failMatch = line.match(/FAILED/i);
        const startMatch = passMatch || failMatch;

        if (testNameMatch) {
            const testName = testNameMatch[1];
            if (startMatch) {
                testTreeProvider.addTest(testName, TestStatus.Running);
            } else if (passMatch) {
                testTreeProvider.updateTestStatus(testName, TestStatus.Passed);
            } else if (failMatch) {
                testTreeProvider.updateTestStatus(testName, TestStatus.Failed);
            }
        }
    });

    pytestProcess.on('exit', (code) => {
        if (code !== 0) {
            vscode.window.showErrorMessage('Tests failed!');
        }
    });
}
