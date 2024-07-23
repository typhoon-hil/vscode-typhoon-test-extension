const vscode = acquireVsCodeApi();
let data = {};

(function () {
    window.addEventListener('message', event => {
        data = event.data;
        const args = data.args;
        const content = document.getElementById('content');
        let htmlContent = '';

        args.forEach(arg => {
            if (arg.name === 'self') {
                return;
            }

            const label = `<label for="${arg.name}">${arg.name}</label>`;
            const inputType = 'text';
            const inputValue = arg.default === undefined ? '' : arg.default === null ? 'None' : `value="${arg.default}"`;
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

function splitBeforeLastDot(inputString) {
    const lastDotIndex = inputString.lastIndexOf('.');
    if (lastDotIndex === -1) {
        return inputString;
    }
    return [inputString.slice(0, lastDotIndex), inputString.slice(lastDotIndex + 1)];
}

function generateImport() {
    const alias = data.root.alias;
    const module = data.root.label;
    const type = data.root.type;

    let importStatement = '';

    if (type === 'module') {
        importStatement = `import ${module} as '${alias}'`;
    }
    else if (type === 'class') {
        const [module, className] = splitBeforeLastDot(data.root.label);
        importStatement = `from ${module} import ${className}`;
        importStatement += `\n\n${alias} = ${className}()`;
    }

    return importStatement;
}

function generateMethod() {
    const alias = data.root.alias;
    const methodName = data.label;
    
    const inputs = document.querySelectorAll('input');
    let args = '';

    inputs.forEach(input => {
        // eslint-disable-next-line eqeqeq
        if (input.value != data.args.find(arg => arg.name === input.id).default) {
            args += `${input.id}=${input.value}, `;
        }
    });

    return `${alias}.${methodName}(${args.slice(0, -2)})`;
}

function copyToClipboard() {
    const value = `${generateImport()}\n\n${generateMethod()}`;

    navigator.clipboard.writeText(value)
        .then(() => {
            vscode.postMessage({ command: 'showInfo', text: 'Copied to clipboard!' });
        })
        .catch(error => {
            vscode.postMessage({ command: 'showError', text: `Failed to copy to clipboard: ${error}` });
        });
}

window.addEventListener('load', () => {
    const copyButton = document.getElementById('copyButton');

    copyButton.addEventListener('click', copyToClipboard.bind(this));
});