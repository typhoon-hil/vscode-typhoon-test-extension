const vscode = acquireVsCodeApi();
const interface = { // This is the data format that should be sent to the backend
    configName: "",
    value: "",
};

function autoResize(textarea) {
    textarea.style.height = 'auto'; // Reset height
    textarea.style.height = textarea.scrollHeight + 'px'; // Set new height based on content
}

// Function to add event listeners to all textareas on page load
window.onload = function() {
    addWindowMessageListener();
    addTextareaEventListeners();
    addCheckboxEventListeners();
    addTextInputEventListeners();
};

function addWindowMessageListener() {
    window.addEventListener('message', event => {
        const data = event.data;

        if (data.configName === undefined || data.value === undefined) {
            return;
        }

        const element = document.getElementById(data.configName);

        const originalDispatchEvent = element.dispatchEvent;
        element.dispatchEvent = () => true; // Override to suppress events

        try {
            if (element.type === 'checkbox') {
                element.checked = data.value;
            }
            if (element.type === 'text') {
                element.value = data.value;
            }
            if (element.tagName === 'TEXTAREA') {
                element.value = JSON.stringify(data.value, null, 2);
                autoResize(element);
            }
        } finally {
            element.dispatchEvent = originalDispatchEvent;
        }
    });
}

function addTextareaEventListeners() {
    const textareas = document.querySelectorAll('textarea'); // Catch all textareas

    textareas.forEach(textarea => {
        autoResize(textarea); // Initial resize based on existing content

        // Add input event listener for dynamic resizing
        textarea.addEventListener('input', debounce(handleTextareaChange, 500));
    });
}

function addCheckboxEventListeners() {
    const checkboxes = document.querySelectorAll('input[type="checkbox"]'); // Catch all checkboxes

    checkboxes.forEach(checkbox => {
        checkbox.addEventListener('change', function () {
            let value = this.checked;
            let configName = this.id;
            sendMessage(configName, value);
        });
    });
}

function addTextInputEventListeners() {
    const textInputs = document.querySelectorAll('input[type="text"]'); // Catch all text inputs

    textInputs.forEach(textInput => {
        textInput.addEventListener('input', debounce(handleInputChange, 500));
    });
}

// Debounce function
function debounce(func, delay) {
    let timeoutId;
    return function(...args) {
        clearTimeout(timeoutId);
        timeoutId = setTimeout(() => func.apply(this, args), delay);
    };
}

// Function to be executed after debouncing
function handleInputChange(event) {
    let value = event.target.value;
    let configName = event.target.id;
    sendMessage(configName, value);
}

function handleTextareaChange(event) {
    let value;
    try {
        value = JSON.parse(event.target.value);
    } catch (error) {
        return sendErrorMessage("Invalid JSON format");
    }
    let configName = event.target.id;
    sendMessage(configName, value);
}

function sendMessage(configName, value) {
    vscode.postMessage({
        configName: configName,
        value: value
    });
}

function sendErrorMessage(message) {
    vscode.postMessage({
        error: message
    });
}