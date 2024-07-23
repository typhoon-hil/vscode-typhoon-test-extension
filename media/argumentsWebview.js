(function () {
    const vscode = acquireVsCodeApi();
    window.addEventListener('message', event => {
        const args = event.data;
        const content = document.getElementById('content');
        let htmlContent = '';

        args.forEach(arg => {
            if (arg.name === 'self') {
                return;
            }

            const label = `<label for="${arg.name}">${arg.name}</label>`;
            const inputType = 'text';
            const inputValue = arg.default === undefined ? '': arg.default === null ? 'None' : `value="${arg.default}"`;
            const input = `<input type="${inputType}" id="${arg.name}" name="${arg.name}" ${inputValue}>`;

            htmlContent += `
                <tr class="form-group">
                    <td>${label}</td>
                    <td>${input}</td>
                </tr>
            `;
        });

        content.innerHTML = htmlContent;
    });
})();

function copyToClipboard() {
    const vscode = acquireVsCodeApi();
    const inputs = document.querySelectorAll('input');
    let values = '';

    inputs.forEach(input => {
        values += `${input.id}: ${input.value}\n`;
    });

    vscode.postMessage({ command: 'showInfo', text: 'Copying to clipboard...' });
    navigator.clipboard.writeText(values)
        .then(() => {
            vscode.postMessage({ command: 'showInfo', text: 'Copied to clipboard!' });
        })
        .catch(error => {
            vscode.postMessage({ command: 'showError', text: `Failed to copy to clipboard: ${error}` });
        });
}

const copyButton = document.getElementById('copyButton');
copyButton.addEventListener('click', copyToClipboard);
