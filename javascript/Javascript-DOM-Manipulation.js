document.addEventListener('DOMContentLoaded', function() {
    function extractListInfoToListArray(elementId) {
        const element = document.getElementById(elementId);
        if (!element) {
            console.error("Element not found");
            return [];
        }

        const listArray = [];

        const isOrdered = element.tagName.toLowerCase() === 'body';

        const listItems = element.querySelectorAll('*');
        listItems.forEach(item => {
            const listItemInfo = {};

            const clonedItem = item.cloneNode(true);

            listItemInfo.id = clonedItem.id;
            listItemInfo.class = clonedItem.className;
            listItemInfo.attributes = {};
            Array.from(clonedItem.attributes).forEach(attribute => {
                listItemInfo.attributes[attribute.name] = attribute.value;
            });

            if (isOrdered) {
                listItemInfo.order = clonedItem.dataset.order;
            }

            listItemInfo.innerText = clonedItem.innerText;
            listItemInfo.innerHTML = clonedItem.innerHTML;

            listItemInfo.eventListeners = {};

            const eventTypes = ['click', 'mouseover', 'load', 'submit'];
            eventTypes.forEach(eventType => {
                if (typeof item['on' + eventType] === 'function') {
                    listItemInfo.eventListeners[eventType] = item['on' + eventType].toString();
                } else {
                    listItemInfo.eventListeners[eventType] = null;
                }
            });

            listArray.push(listItemInfo);
        });
        
        return listArray;
    }

    const orderedListInfo = extractListInfoToListArray('body');
    console.log("Ordered List Info:", orderedListInfo);
});