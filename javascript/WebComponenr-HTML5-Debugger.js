// Step 1: Override addEventListener and removeEventListener to track event listeners
(function() {
    const addEventListenerOriginal = EventTarget.prototype.addEventListener;
    const removeEventListenerOriginal = EventTarget.prototype.removeEventListener;

    EventTarget.prototype.addEventListener = function(type, listener, options) {
        this._eventListeners = this._eventListeners || {};
        this._eventListeners[type] = this._eventListeners[type] || [];
        this._eventListeners[type].push(listener);
        addEventListenerOriginal.call(this, type, listener, options);
    };

    EventTarget.prototype.removeEventListener = function(type, listener, options) {
        if (this._eventListeners && this._eventListeners[type]) {
            const index = this._eventListeners[type].indexOf(listener);
            if (index !== -1) {
                this._eventListeners[type].splice(index, 1);
            }
        }
        removeEventListenerOriginal.call(this, type, listener, options);
    };
})();

// Step 2: Define the custom element and its functionality
const elementsArray = [];

customElements.define('html5-debugger', class extends HTMLElement {
    connectedCallback() {
        const targetElementSelector = this.getAttribute('data-element');

        if (!targetElementSelector) {
            console.error("Target element selector is required.");
            return;
        }

        const targetElements = document.querySelectorAll(targetElementSelector);

        if (!targetElements || targetElements.length === 0) {
            console.error("No matching elements found for the selector:", targetElementSelector);
            return;
        }

        const currentDate = new Date();
        
        targetElements.forEach(targetElement => {
            const elementInfo = this.extractElementInfo(targetElement);
            elementsArray.push(elementInfo);
        });

        console.groupCollapsed("AR Debugger");
        console.log(` AR Debugger | ${currentDate}`);

        console.log("Array:", elementsArray); 
        console.log("Data:", JSON.stringify(elementsArray, null, 2)); 

        console.groupEnd();
    }

    extractElementInfo(element) {
        const elementInfo = {
            tagName: element.tagName.toLowerCase(),
            id: element.id,
            class: element.className,
            attributes: {},
            events: {},
            innerText: element.innerText,
            innerHTML: element.innerHTML,
            ariaLabels: [],
            children: []
        };

        Array.from(element.attributes).forEach(attribute => {
            elementInfo.attributes[attribute.name] = attribute.value;
        });

        if (element._eventListeners) {
            for (const eventType in element._eventListeners) {
                elementInfo.events[eventType] = element._eventListeners[eventType].map(listener => listener.toString());
            }
        }

        const ariaLabels = element.querySelectorAll('[aria-label]');
        elementInfo.ariaLabels = Array.from(ariaLabels).map(label => label.getAttribute('aria-label'));

        elementInfo.children = Array.from(element.children).map(child => this.extractElementInfo(child));

        return elementInfo;
    }
});

// Step 3: Function to log the event listeners of an element
function logEventListeners(element) {
    console.groupCollapsed(`Event Listeners for Element: ${element.tagName}`);
    if (element._eventListeners) {
        for (const eventType in element._eventListeners) {
            console.log(`Event Type: ${eventType}`);
            console.log(element._eventListeners[eventType]);
        }
    }
    console.groupEnd();
}

// Example usage
document.addEventListener('DOMContentLoaded', () => {
    const element = document.querySelector("button");
    if (element) {
        logEventListeners(element);
    }
});
