import * as cp from 'child_process';
import * as readline from 'readline';
import { TestTreeProvider } from '../views/TestTreeProvider';
import { TestStatus } from '../models/testMonitoring';
import * as vscode from 'vscode';

export function runPytestWithMonitoring(testTreeProvider: TestTreeProvider) {
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
        const testNameMatch = line. match(/^(test_.*|.*_test)$/); // Modify based on actual pytest output
        const passMatch = line.match(/PASSED/i);
        const failMatch = line.match(/FAILED/i);
        const startMatch = !(passMatch || failMatch);

        writeLineToOutputChannel(line, outputChannel);

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
}

function writeLineToOutputChannel(line: string, outputChannel: vscode.OutputChannel) {
    outputChannel.appendLine(line);
}

function initOutputChannel() {
    const outputChannel = vscode.window.createOutputChannel('Pytest Output');
    outputChannel.show();
    return outputChannel;
}