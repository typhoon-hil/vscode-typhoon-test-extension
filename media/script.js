// media/script.js
window.addEventListener('load', () => {
    const vscode = acquireVsCodeApi();
  
    document.getElementById('submitButton').addEventListener('click', () => {
      const input = document.getElementById('input').value;
      vscode.postMessage({ command: 'submit', text: input });
    });
  
    window.addEventListener('message', event => {
      const message = event.data;
      switch (message.command) {
        case 'update':
          document.getElementById('output').innerText = message.text;
          break;
      }
    });
  });
  