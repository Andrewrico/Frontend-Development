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
          
          // Iterate over each matching element
          targetElements.forEach(targetElement => {
              const elementInfo = this.extractElementInfo(targetElement);
              elementsArray.push(elementInfo);
          });
  
          // Log the element info in a subtab, outside of the loop
          console.groupCollapsed("AR Debugger");
          console.log(` AR Debugger | ${currentDate}`)

          console.log("Array:", elementsArray); // Log the array after pushing element info
          console.log("Data:", JSON.stringify(elementsArray, null, 2)); // Log the JSON version of the array

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
              innerHTML: element.innerHTML
          };
  
          // Extract attributes
          Array.from(element.attributes).forEach(attribute => {
              elementInfo.attributes[attribute.name] = attribute.value;
          });
  
          // Extract events
          ['click', 'mouseover', 'load', 'submit'].forEach(eventType => {
              if (typeof element['on' + eventType] === 'function') {
                  elementInfo.events[eventType] = element['on' + eventType].toString();
              }
          });
  
          // Extract ARIA labels
          const ariaLabels = element.querySelectorAll('[aria-label]');
          elementInfo.ariaLabels = Array.from(ariaLabels).map(label => label.getAttribute('aria-label'));
  
          // Recursively extract child elements
          elementInfo.children = Array.from(element.children).map(child => this.extractElementInfo(child));
  
          return elementInfo;
      }
  });