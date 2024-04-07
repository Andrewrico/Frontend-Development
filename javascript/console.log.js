// An object to store the console logs
const consoleLogs = {};

// A helper function to display messages in the webpage's "console"
function displayInPageConsole(message) {
    const consoleDiv = document.getElementById("console");
    if (!consoleDiv) {
        console.warn("Console div not found.");
        return;
    }
    // Append new messages as paragraphs for better readability
    const messageParagraph = document.createElement("p");
    messageParagraph.textContent = typeof message === 'string' ? message : JSON.stringify(message, null, 2);
    consoleDiv.appendChild(messageParagraph);
}

// Override the original console functions
const originalConsoleLog = console.log;
const originalConsoleWarn = console.warn;
const originalConsoleError = console.error;

console.log = function(...args) {
    const message = args.length === 1 ? args[0] : args;
    const timestamp = new Date().toISOString();
    consoleLogs[timestamp] = message;
    originalConsoleLog.apply(console, args);
    displayInPageConsole(message);
};

console.warn = function(...args) {
    const message = 'Warning: ' + (args.length === 1 ? args[0] : args);
    displayInPageConsole(message);
    originalConsoleWarn.apply(console, args);
};

console.error = function(...args) {
    const message = 'Error: ' + (args.length === 1 ? args[0] : args);
    displayInPageConsole(message);
    originalConsoleError.apply(console, args);
};

// Helper function to clear the webpage's "console"
function clearPageConsole() {
    const consoleDiv = document.getElementById("console");
    if (consoleDiv) {
        consoleDiv.innerHTML = '';
    }
}
