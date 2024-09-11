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
    addTextareaEventListeners();
    addCheckboxEventListeners();
};

function addTextareaEventListeners() {
    const textareas = document.querySelectorAll('textarea'); // Catch all textareas

    textareas.forEach(textarea => {
        autoResize(textarea); // Initial resize based on existing content


        // Add input event listener for dynamic resizing
        textarea.addEventListener('input', function () {
            autoResize(this);
        });
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

function sendMessage(configName, value) {
    vscode.postMessage({
        configName: configName,
        value: value
    });
}