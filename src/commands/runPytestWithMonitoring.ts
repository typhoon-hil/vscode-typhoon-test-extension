import * as cp from 'child_process';
import { TestTreeProvider } from '../views/TestTreeProvider';
import { extractTestNameDetails, TestStatus } from '../models/testMonitoring';
import * as vscode from 'vscode';
import { PytestFactory } from '../utils/pytestFactory';
import { getTestRunConfig } from '../utils/config';

export function runPytestWithMonitoring(testTreeProvider: TestTreeProvider) {
    if (!vscode.workspace.workspaceFolders) {
        vscode.window.showErrorMessage('No workspace is open');
        return;
    }

    resetTestRun(testTreeProvider);

    const factory = new PytestFactory();
    const path = factory.getPythonPath();
    const flags = factory.getFlags();

    const pytestProcess = cp.spawn(path, flags, {
        shell: true,
        cwd: vscode.workspace.workspaceFolders[0].uri.fsPath
    });
    
    const outputChannel = initOutputChannel();
    pytestProcess.stdout.on('data', (data: Buffer) => {
        const output = data.toString();
        outputChannel.append(output);

        const lines = output.split('\n');
        lines.forEach(line => {
            if (!hasTestRunEnded().check(line)) {
                handleTestLine(line, testTreeProvider);
            }
        });
    });

    pytestProcess.stdout.on('end', () => {
        runAllureReport();
    });

    pytestProcess.stderr.on('data', (data: Buffer) => {
        const output = data.toString();
        outputChannel.append(output);
    });
}

function resetTestRun(testTreeProvider: TestTreeProvider) {
    hasTestRunEnded().reset();
    testTreeProvider.clearTests();
}

function handleTestLine(line: string, testTreeProvider: TestTreeProvider) {
    line = line.replace(/\s+/g, ' ').trim();

    const testNameMatch = line.split(' ')[0]?.match(/^(test_.*|.*_test)/); // TODO: Improve regex
    const passMatch = line.match(/PASSED/i);
    const failMatch = line.match(/FAILED/i);
    const skipMatch = line.match(/SKIPPED/i);
    const xfailMatch = line.match(/XFAIL/i);
    const xpassMatch = line.match(/XPASS/i);
    const errorMatch = line.match(/ERROR/i);

    const statusMatches = [passMatch, failMatch, skipMatch, xfailMatch, xpassMatch, errorMatch];
    const statusString = statusMatches.find(match => match !== null)?.[0];

    if (testNameMatch) {
        const TestNameDetails = extractTestNameDetails(testNameMatch[0]);
        const testName = TestNameDetails.fullTestName;

        if (!testTreeProvider.containsTest(testName)) {
            testTreeProvider.addOrUpdateTest(TestNameDetails, TestStatus.Running);
        }
        
        if (statusString) {
            const status = statusStringToEnum(statusString);
            testTreeProvider.addOrUpdateTest(TestNameDetails, status);
        }
    }
    else if (statusString) {
        testTreeProvider.updateLastTest(statusStringToEnum(statusString));
    }
}

function statusStringToEnum(status: string): TestStatus {
    status = status.trim().toLowerCase();
    switch (status) {
        case 'passed':
            return TestStatus.Passed;
        case 'failed':
            return TestStatus.Failed;
        case 'xfail':
            return TestStatus.XFailed;
        case 'skipped':
            return TestStatus.Skipped;
        case 'xpass':
            return TestStatus.XPassed;
        case 'error':
            return TestStatus.Error;
        default:
            return TestStatus.Running;
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

function runAllureReport() {
    if (getTestRunConfig().openReport) {
        const terminal = vscode.window.createTerminal('Allure Report');
        terminal.show();
        terminal.sendText('allure serve report');
    }
}
