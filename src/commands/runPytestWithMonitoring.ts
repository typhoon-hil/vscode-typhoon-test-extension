import * as cp from 'child_process';
import * as readline from 'readline';
import { TestTreeProvider } from '../views/TestTreeProvider';
import { TestStatus } from '../models/testMonitoring';
import * as vscode from 'vscode';

export function runPytestWithMonitoring(testTreeProvider: TestTreeProvider) {
    hasTestRunEnded().reset();
    testTreeProvider.clearTests();

    const outputChannel = initOutputChannel();

    const pytestProcess = cp.spawn('python', ['-m', 'pytest', '-v'], { shell: true,
        cwd: vscode.workspace.workspaceFolders![0].uri.fsPath
     });

    const rl = readline.createInterface({
        input: pytestProcess.stdout,
        output: pytestProcess.stdin,
        terminal: false
    });

    rl.on('line', (line) => {
        outputChannel.appendLine(line);
        if (!hasTestRunEnded().check(line)) {
            handleTestLine(line, testTreeProvider);
        }
    });
}

function handleTestLine(line: string, testTreeProvider: TestTreeProvider) {
    const testNameMatch = line.match(/^(test_.*|.*_test)$/); // Modify based on actual pytest output
    const passMatch = line.match(/PASSED/i);
    const failMatch = line.match(/FAILED/i);
    const skipMatch = line.match(/SKIPPED/i);
    const xfailMatch = line.match(/XFAIL/i);
    const xpassMatch = line.match(/XPASS/i);

    if (testNameMatch) {
        const testName = testNameMatch[1];
        if (!testTreeProvider.containsTest(testName)) {
            testTreeProvider.addOrUpdateTest(testName, TestStatus.Running);
        }
        if (passMatch) {
            testTreeProvider.addOrUpdateTest(testName, TestStatus.Passed);
        }
        if (failMatch) {
            testTreeProvider.addOrUpdateTest(testName, TestStatus.Failed);
        }
        if (skipMatch) {
            testTreeProvider.addOrUpdateTest(testName, TestStatus.Skipped);
        }
        if (xfailMatch) {
            testTreeProvider.addOrUpdateTest(testName, TestStatus.XFailed);
        }
        if (xpassMatch) {
            testTreeProvider.addOrUpdateTest(testName, TestStatus.XPassed);
        }
    }
}

function initOutputChannel() {
    const outputChannel = vscode.window.createOutputChannel('Pytest Output');
    outputChannel.show();
    return outputChannel;
}

let hasEnded = false;
function hasTestRunEnded() {
    function check(line: string) {
        function isTestRunEnd(line: string) {
            return line.includes('===') && !line.includes('test session starts');
        }
        return hasEnded || (hasEnded = isTestRunEnd(line));
    }

    function reset() {
        hasEnded = false;
    }

    return { check, reset };
}