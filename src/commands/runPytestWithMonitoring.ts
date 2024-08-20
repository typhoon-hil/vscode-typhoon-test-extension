import * as cp from 'child_process';
import { TestTreeProvider } from '../views/TestTreeProvider';
import { TestStatus } from '../models/testMonitoring';
import * as vscode from 'vscode';

export function runPytestWithMonitoring(testTreeProvider: TestTreeProvider) {
    hasTestRunEnded().reset();
    testTreeProvider.clearTests();

    const outputChannel = initOutputChannel();

    const pytestProcess = cp.spawn('python', ['-m', 'pytest', '-v'], {
        shell: true,
        cwd: vscode.workspace.workspaceFolders![0].uri.fsPath
    });

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
}

function handleTestLine(line: string, testTreeProvider: TestTreeProvider) {
    line = line.replace(/\s+/g, ' ').trim();

    const testNameMatch = line.split(' ')[0]?.match(/^(test_.*|.*_test)/); // TODO: Improve regex
    const passMatch = line.match(/PASSED/i);
    const failMatch = line.match(/FAILED/i);
    const skipMatch = line.match(/SKIPPED/i);
    const xfailMatch = line.match(/XFAIL/i);
    const xpassMatch = line.match(/XPASS/i);

    const statusMatches = [passMatch, failMatch, skipMatch, xfailMatch, xpassMatch];
    const statusString = statusMatches.find(match => match !== null)?.[0];

    if (testNameMatch) {
        const testName = testNameMatch[1];
        if (!testTreeProvider.containsTest(testName)) {
            testTreeProvider.addOrUpdateTest(testName, TestStatus.Running);
        }
        
        if (statusString) {
            const status = statusStringToEnum(statusString);
            testTreeProvider.addOrUpdateTest(testName, status);
        }
    }
    else if (statusString) {
        testTreeProvider.updateLastTest(statusStringToEnum(statusString!));
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