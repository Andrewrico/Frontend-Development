document.addEventListener('rebuy:cart.change', (event) => {
    const currentCart = event.detail;
    const previousCart = window.Rebuy.Cart.getCart(); // Get the previous state of the cart
  
    let quantityIncreased = false;
  
    // Check each item to see if the quantity has increased
    currentCart.items.forEach((currentItem, index) => {
      const previousItem = previousCart.items.find(item => item.id === currentItem.id);
      if (previousItem && currentItem.quantity > previousItem.quantity) {
        quantityIncreased = true;
      }
    });
  
    // If any item's quantity was increased, run the function
    if (quantityIncreased) {
      runMyFunction();
    }
  });
  




  /////////////////////////////////////




  document.addEventListener('rebuy:cart.change', (event) => {
    const currentCart = event.detail;
    const previousCart = window.Rebuy.Cart.getCart(); // Get the previous state of the cart
  
    let quantityIncreased = false;
  
    // Check each item to see if the quantity has increased
    currentCart.items.forEach((currentItem, index) => {
      const previousItem = previousCart.items.find(item => item.id === currentItem.id);
      if (previousItem && currentItem.quantity > previousItem.quantity) {
        quantityIncreased = true;
      }
    });
  
    // If any item's quantity was increased, run the function
    if (quantityIncreased) {
      runMyFunction();
    }
  });
  
  // Define the function that should run when quantity increases
  function runMyFunction() {
    console.log('Running my function because an item quantity was increased');
  }
  
  // Define the function that should run when quantity increases
  function runMyFunction() {
    console.log('Running my function because an item quantity was increased');
  }
  

  //////////////////////////////////////////////



  document.addEventListener('DOMContentLoaded', function() {
    var addToCartButton = document.querySelector('.add-to-cart-button'); // Adjust this selector to match your button
    var rebuyContainer = document.querySelector('.rebuy-widget-container');

    addToCartButton.addEventListener('click', function(event) {
        // Always add the 'is-hidden' class when the button is clicked
        rebuyContainer.classList.add('is-hidden');

        // Prevent any further action if 'is-hidden' is meant to stay
        event.preventDefault();
        console.log('Add to cart clicked. Widget is now hidden.');
    });
});

  //////////////////////////////////////////////



  document.addEventListener('DOMContentLoaded', function() {
    var addToCartButton = document.querySelector('.add-to-cart-button'); // Adjust the selector as needed
    addToCartButton.addEventListener('click', function(event) {
        var rebuyContainer = document.querySelector('.rebuy-widget-container');
        // Check if the rebuy widget is visible
        if (rebuyContainer.classList.contains('is-hidden')) {
            // If the widget is hidden, run the function
            someFunction();
        } else {
            // If the widget is not hidden, prevent the default function
            event.preventDefault();
            event.stopPropagation();
            console.log('Default function prevented due to visible Rebuy widget.');
        }
    });
});

function someFunction() {
    console.log('The normal Add to Cart function ran.');
}
