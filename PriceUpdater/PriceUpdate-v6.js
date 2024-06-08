function initializePriceUpdater() {
  try {
    // Initialize the selling plans and currency sign
    const sellingPlans = 1;
    const currencySign = getCurrencySign();
    const elements = {};

    // Function to get the currency sign from the money format
    function getCurrencySign() {
      try {
        const moneyFormat = "${{amount}}";
        return moneyFormat.slice(0, 1);
      } catch (error) {
        console.error('Error in getCurrencySign:', error);
      }
    }

    // Function to get and cache DOM elements
    function getElement(selector) {
      try {
        if (!elements[selector]) {
          elements[selector] = document.querySelector(selector);
        }
        return elements[selector];
      } catch (error) {
        console.error('Error in getElement:', error);
      }
    }

    // Get the selected variant based on the options selected
    function getSelectedVariant() {
      try {
        const option1 = getOptionValue(0);
        const option2 = getOptionValue(1);
        const option3 = getOptionValue(2);

        const priceElement = getElement('#price_element');
        if (!priceElement) return null;

        const productData = JSON.parse(priceElement.dataset.product);
        return productData.variants.find(variant =>
          variant.option1 === option1 && variant.option2 === option2 && variant.option3 === option3
        ) || productData.variants.find(variant =>
          variant.id === getElement('input[name="id"]')?.value
        );
      } catch (error) {
        console.error('Error in getSelectedVariant:', error);
      }
    }

    // Get the value of a specific option
    function getOptionValue(index) {
      try {
        return document.querySelectorAll('.variant-picker__option input:checked')[index]?.value || null;
      } catch (error) {
        console.error('Error in getOptionValue:', error);
      }
    }

    // Round a number to two decimal places based on certain conditions
    function roundNumber(num, savings = false) {
      try {
        if (num > 4 && !savings) return (Math.ceil(num * 100) / 100).toFixed(2);
        if (num < 6 && savings) return (Math.floor(num * 100) / 100).toFixed(2);
        return (Math.round(num * 100) / 100).toFixed(2);
      } catch (error) {
        console.error('Error in roundNumber:', error);
      }
    }

    // Update the price based on the selected variant and discount variables
    function updatePrice(variant = window.loaded_variant) {
      try {
        if (!variant) return;

        const discountVariables = getDiscountVariables();
        const discountData = calculateDiscounts(variant, discountVariables);

        updateDOMElements(discountData, discountVariables);
      } catch (error) {
        console.error('Error in updatePrice:', error);
      }
    }

    // Get discount-related variables from the DOM and settings
    function getDiscountVariables() {
      try {
        const discountAppliesToElement = getElement('#discount_applies_to');
        const collectionDiscountElement = getElement('#collection_discount');
        const priorityDiscountElement = getElement('#priority_discount_value');

        return {
          discountAppliesTo: discountAppliesToElement?.value || '',
          isSiteWideDiscountEnabled: window.themeVariables.settings.isSiteWideDiscountEnabled,
          isCollectionDiscountEnabled: window.themeVariables.settings.isCollectionDiscountEnabled,
          collectionDiscountValue: parseFloat(collectionDiscountElement?.value) || 0,
          priorityDiscountValue: parseFloat(priorityDiscountElement?.value) || 0,
          sitewideDiscountValue: window.themeVariables.settings.sitewideDiscountValue,
          variantPrice: window.loaded_variant.price
        };
      } catch (error) {
        console.error('Error in getDiscountVariables:', error);
      }
    }

    // Calculate discounts based on the variant and discount variables
    function calculateDiscounts(variant, discountVariables) {
      try {
        const {
          isSiteWideDiscountEnabled, collectionDiscountValue, priorityDiscountValue, sitewideDiscountValue
        } = discountVariables;

        const sellingPlan = getSellingPlan();
        const subsavePercent = getSubsavePercent(sellingPlan);

        let discountValue = getInitialDiscountValue(isSiteWideDiscountEnabled, collectionDiscountValue, priorityDiscountValue, sitewideDiscountValue);
        const variantDiscount = getVariantDiscount(variant);
        discountValue = Math.max(discountValue, variantDiscount);

        const discountedPrice = calculateDiscountedPrice(variant.price, discountValue, sellingPlan, subsavePercent);
        const additionalFixedPrice = getAdditionalFixedPrice();

        return {
          sellingPlan,
          subsavePercent,
          discountValue,
          discountedPrice,
          additionalFixedPrice
        };
      } catch (error) {
        console.error('Error in calculateDiscounts:', error);
      }
    }

    // Get the selling plan type (subscription or one-time)
    function getSellingPlan() {
      try {
        const OGsubsPlanNode = getElement('.og-optin-button');
        const OGsellingPlan = OGsubsPlanNode ? OGsubsPlanNode.getAttribute('frequency') : null;
        return OGsellingPlan ? 'subscription' : 'one-time';
      } catch (error) {
        console.error('Error in getSellingPlan:', error);
      }
    }

    // Get the subscription save percentage
    function getSubsavePercent(sellingPlan) {
      try {
        const sellingPlanDiscountNode = getElement('.og-incentive-text');
        return sellingPlanDiscountNode ? parseFloat(sellingPlanDiscountNode.innerText.split('%')[0]) : 0;
      } catch (error) {
        console.error('Error in getSubsavePercent:', error);
      }
    }

    // Calculate the initial discount value based on various conditions
    function getInitialDiscountValue(isSiteWideDiscountEnabled, collectionDiscountValue, priorityDiscountValue, sitewideDiscountValue) {
      try {
        let discountValue = 0;
        if (isSiteWideDiscountEnabled) {
          discountValue = Math.max(sitewideDiscountValue, collectionDiscountValue);
        } else if (isCollectionDiscountEnabled) {
          discountValue = collectionDiscountValue;
        }
        return priorityDiscountValue || discountValue;
      } catch (error) {
        console.error('Error in getInitialDiscountValue:', error);
      }
    }

    // Get the discount for the specific variant
    function getVariantDiscount(variant) {
      try {
        const variantsWithDiscounts = [
          { "variant_id": 44522319249574, "discount": "", "sub_price_override": "" },
          { "variant_id": 44522639720614, "discount": "", "sub_price_override": "" },
          { "variant_id": 44522676748454, "discount": "", "sub_price_override": "" },
          { "variant_id": 44522639753382, "discount": "", "sub_price_override": "" },
          { "variant_id": 44779292065958, "discount": "", "sub_price_override": "" }
        ];
        return parseFloat(variantsWithDiscounts.find(v => v.variant_id == variant.id)?.discount || 0);
      } catch (error) {
        console.error('Error in getVariantDiscount:', error);
      }
    }

    // Calculate the final discounted price
    function calculateDiscountedPrice(variantPrice, discountValue, sellingPlan, subsavePercent) {
      try {
        if (sellingPlan === 'subscription') {
          return (variantPrice * ((100 - subsavePercent) / 100)) / 100;
        } else {
          return (variantPrice * ((100 - discountValue) / 100)) / 100;
        }
      } catch (error) {
        console.error('Error in calculateDiscountedPrice:', error);
      }
    }

    // Get any additional fixed price discount
    function getAdditionalFixedPrice() {
      try {
        if (window.addOnDiscount && window.addOnDiscount[0].discount_type !== 'PERCENTAGE') {
          return window.addOnDiscount[0].discount_value;
        }
        return 0;
      } catch (error) {
        console.error('Error in getAdditionalFixedPrice:', error);
      }
    }

    // Update the DOM elements based on the calculated discount data
    function updateDOMElements(discountData, discountVariables) {
      try {
        const {
          sellingPlan, subsavePercent, discountedPrice, discountValue, additionalFixedPrice
        } = discountData;

        if (sellingPlan === 'subscription') {
          updateSubscriptionDOM(subsavePercent, discountedPrice, discountVariables.variantPrice, discountValue, additionalFixedPrice);
        } else {
          updateOneTimeDOM(discountedPrice, discountVariables.variantPrice, discountValue, additionalFixedPrice);
        }

        const priceElement = getElement('#price_element');
        priceElement.innerHTML = currencySign + roundNumber(discountedPrice);
        priceElement.classList.toggle('price-black', discountedPrice === discountVariables.variantPrice / 100);
        getElement('#price_element + s').style.display = (discountedPrice === discountVariables.variantPrice / 100) ? 'none' : 'inline';
      } catch (error) {
        console.error('Error in updateDOMElements:', error);
      }
    }

    // Update the DOM elements for subscription-based pricing
    function updateSubscriptionDOM(subsavePercent, discountedPrice, variantPrice, discountValue, additionalFixedPrice) {
      try {
        const totalDiscountRounded = subsavePercent - (subsavePercent % 5);
        const savingAmount = roundNumber(variantPrice / 100 - discountedPrice);

        // Update the main price element
        const priceElement = getElement('#price_element');
        priceElement.innerHTML = `${currencySign} ${roundNumber(discountedPrice)}`;

        // Update the discount labels
        updateDiscountLabel('.price-save-label .case-1', `<span class="product-thumbnail_badge" style="margin-right: 16px;">SAVE ${totalDiscountRounded}% OFF NOW & ON FUTURE ORDERS</span>`);
        updateDiscountLabel('.price-save-label .case-2 span', `SAVE ${currencySign}${savingAmount}`);
        updateDiscountLabel('.price-save-label .case-3 span', `${discountValue}% OFF + ${subsavePercent}% OFF Extra`);

        // Show the price save label
        getElement('.price-save-label').style.display = 'flex';

        // Update highlighted prices if elements are present
        const highlightSubscriptionPrice = getElement('.highlight-subscription-price');
        if (highlightSubscriptionPrice) {
          highlightSubscriptionPrice.textContent = `${currencySign}${roundNumber(discountedPrice)}`;
          updateHighlightPrice('.highlight-compare-at-price', `${currencySign}${(variantPrice / 100).toFixed(2)}`);
          updateHighlightPrice('.highlight-save-amnt-banner', `SAVE ${currencySign}${((variantPrice / 100) - discountedPrice).toFixed(2)}`);
        }
      } catch (error) {
        console.error('Error in updateSubscriptionDOM:', error);
      }
    }

    /**
     * Update the DOM elements for one-time purchase pricing.
     * Sets the discounted price and updates the corresponding discount labels for one-time purchases.
     * @param {number} discountedPrice - The final discounted price.
     * @param {number} variantPrice - The original price of the variant.
     * @param {number} discountValue - The calculated discount value.
     * @param {number} additionalFixedPrice - Any additional fixed price discount.
     */
    function updateOneTimeDOM(discountedPrice, variantPrice, discountValue, additionalFixedPrice) {
      try {
        const savingAmount = roundNumber(variantPrice / 100 - discountedPrice);

        // Update the main price element
        const priceElement = getElement('#price_element');
        priceElement.innerHTML = `${currencySign}${roundNumber(discountedPrice)}`;

        // Update the discount labels
        updateDiscountLabel('.price-save-label .case-1 span', `${Math.round(discountValue)}% OFF`);
        updateDiscountLabel('.price-save-label .case-2 span', `SAVE ${currencySign}${savingAmount}`);
        updateDiscountLabel('.price-save-label .case-3 span', `${discountValue}% OFF`);

        // Show or hide the price save label based on discount value
        const priceSaveLabelElement = getElement('.price-save-label');
        priceSaveLabelElement.style.display = discountValue > 0 ? 'flex' : 'none';

        // Update highlighted prices if elements are present
        const highlightOptOutSalePrice = getElement('.highlight-opt-out-sale-price');
        if (highlightOptOutSalePrice) {
          const oneTimeDiscountedPrice = (variantPrice * ((100 - discountValue) / 100)) / 100;
          if (oneTimeDiscountedPrice != (variantPrice / 100)) {
            updateHighlightPrice('.highlight-opt-out-price', `${currencySign}${(variantPrice / 100).toFixed(2)}`);
            highlightOptOutSalePrice.textContent = `${currencySign}${roundNumber(oneTimeDiscountedPrice)}`;
          } else {
            highlightOptOutSalePrice.textContent = `${currencySign}${(variantPrice / 100).toFixed(2)}`;
            updateHighlightPrice('.highlight-opt-out-price', ``);
          }
        }
      } catch (error) {
        console.error('Error in updateOneTimeDOM:', error);
      }
    }

    /**
     * Helper function to update discount labels.
     * Sets the inner HTML of the specified element to the given text content.
     * @param {string} selector - The CSS selector of the element to be updated.
     * @param {string} textContent - The text content to set in the element.
     */
    function updateDiscountLabel(selector, textContent) {
      try {
        const element = getElement(selector);
        if (element) {
          element.innerHTML = textContent;
        }
      } catch (error) {
        console.error('Error in updateDiscountLabel:', error);
      }
    }

    /**
     * Helper function to update highlighted prices.
     * Sets the text content of the specified element to the given value.
     * @param {string} selector - The CSS selector of the element to be updated.
     * @param {string} textContent - The text content to set in the element.
     */
    function updateHighlightPrice(selector, textContent) {
      try {
        const element = getElement(selector);
        if (element) {
          element.textContent = textContent;
        }
      } catch (error) {
        console.error('Error in updateHighlightPrice:', error);
      }
    }

    /**
     * Wait for a specific element to appear in the DOM.
     * Observes the DOM for changes and resolves the promise when the specified element appears.
     * @param {string} selector - The CSS selector of the element to wait for.
     * @returns {Promise<Element>} - A promise that resolves with the element once it appears in the DOM.
     */
    function waitForElement(selector) {
      return new Promise((resolve, reject) => {
        try {
          if (document.querySelector(selector)) {
            return resolve(document.querySelector(selector));
          }

          const observer = new MutationObserver((mutations) => {
            try {
              if (document.querySelector(selector)) {
                resolve(document.querySelector(selector));
                observer.disconnect();
              }
            } catch (error) {
              observer.disconnect();
              reject(error);
            }
          });

          observer.observe(document.body, {
            childList: true,
            subtree: true,
          });
        } catch (error) {
          console.error('Error in waitForElement:', error);
          reject(error);
        }
      });
    }

    // Event Listeners
    document.addEventListener('variant:change', (e) => {
      try {
        const variant = e.detail.variant;
        setTimeout(() => updatePrice(variant), 500);
      } catch (error) {
        console.error('Error in variant:change event listener:', error);
      }
    });

    document.addEventListener("DOMContentLoaded", () => {
      try {
        updatePrice();

        if (sellingPlans > 0) {
          waitForElement(".og-offer").then(() => {
            setTimeout(() => updatePrice(), 1500);
            initOptInOutButtons();
          }).catch(error => console.error('Error in waitForElement:', error));
        }
      } catch (error) {
        console.error('Error in DOMContentLoaded event listener:', error);
      }
    });

    document.addEventListener("prive-update-status", () => {
      try {
        handlePriveUpdate();
      } catch (error) {
        console.error('Error in prive-update-status event listener:', error);
      }
    });

    // Initialize opt-in and opt-out buttons and add event listeners to them.
    function initOptInOutButtons() {
      try {
        const OGoptOutBtn = getElement('.og-optout-button');
        const OGoptInBtn = getElement('.og-optin-button');

        if (OGoptOutBtn && OGoptInBtn) {
          OGoptOutBtn.addEventListener('click', () => {
            try {
              updatePrice();
            } catch (error) {
              console.error('Error in OGoptOutBtn click event listener:', error);
            }
          });
          OGoptInBtn.addEventListener('click', () => {
            try {
              updatePrice();
            } catch (error) {
              console.error('Error in OGoptInBtn click event listener:', error);
            }
          });
        }
      } catch (error) {
        console.error('Error in initOptInOutButtons:', error);
      }
    }

    // Handle the prive update status event.
    function handlePriveUpdate() {
      try {
        const selectedVariant = getSelectedVariant();
        setTimeout(() => {
          try {
            document.dispatchEvent(new CustomEvent("variant:change", {
              bubbles: true,
              detail: { variant: selectedVariant }
            }));
          } catch (error) {
            console.error('Error in handlePriveUpdate setTimeout:', error);
          }
        }, 200);
      } catch (error) {
        console.error('Error in handlePriveUpdate:', error);
      }
    }
  } catch (error) {
    console.error('Error in initializePriceUpdater:', error);
  }
}

// Initialize the PriceUpdater function
initializePriceUpdater();
