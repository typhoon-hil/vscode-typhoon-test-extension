function autoResize(textarea) {
    textarea.style.height = 'auto'; // Reset height
    textarea.style.height = textarea.scrollHeight + 'px'; // Set new height based on content
}

// Function to add event listeners to all textareas on page load
window.onload = function() {
    const textareas = document.querySelectorAll('textarea'); // Catch all textareas

    textareas.forEach(textarea => {
        autoResize(textarea); // Initial resize based on existing content
        
        // Add input event listener for dynamic resizing
        textarea.addEventListener('input', function() {
            autoResize(this);
        });
    });
};