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

function createImport() {
    const alias = data.root.alias;
    const module = data.root.name;
    const type = data.root.type;

    let importStatement = '';

    if (type === 'module') {
        importStatement = `import ${module} as ${alias}`;
    }
    else if (type === 'class') {
        const [module, className] = splitBeforeLastDot(data.root.name);
        importStatement = `from ${module} import ${className}`;
    }

    return importStatement;
}

function generateClass() {
    const type = data.root.type;
    if (type !== 'class') {
        return '';
    }
    const alias = data.root.alias;
    const className = splitBeforeLastDot(data.root.name)[1];
    return `${alias} = ${className}()`;
}

function generateMethod() {
    const alias = data.root.alias;
    const methodName = data.name;
    
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

function generateSnippet() {    
    let snippet = {};
    snippet.import = createImport();
    let classSnippet = generateClass();
    if (classSnippet) {
        snippet.class = classSnippet;
    }
    snippet.method = generateMethod();
    return snippet;
}

function copyToClipboard() {
    const snippet = generateSnippet();
    vscode.postMessage({ command: 'copyToClipboard', code: snippet });
}

function insertToEditor() {
    const snippet = generateSnippet();
    vscode.postMessage({ command: 'insertToEditor', code: snippet });
}

window.addEventListener('load', () => {
    const copyButton = document.getElementById('copyButton');
    const insertButton = document.getElementById('insertButton');

    copyButton.addEventListener('click', copyToClipboard.bind(this));
    insertButton.addEventListener('click', insertToEditor.bind(this));
});