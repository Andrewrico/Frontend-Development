class PriceUpdater {
  constructor() {
    try {
      // Initialize the selling plans and currency sign
      this.sellingPlans = 1;
      this.currencySign = this.getCurrencySign();
      // Object to cache DOM elements
      this.elements = {};
      // Initialize event listeners
      this.initEventListeners();
    } catch (error) {
      console.error('Error in constructor:', error);
    }
  }

  /**
   * Function to get the currency sign from the money format.
   * Parses the money format string to extract the currency symbol.
   * Assumes the money format is a template like "${{amount}}".
   * @returns {string} - The currency symbol.
   */
  getCurrencySign() {
    try {
      const moneyFormat = "${{amount}}";
      return moneyFormat.slice(0, 1);
    } catch (error) {
      console.error('Error in getCurrencySign:', error);
    }
  }

  /**
   * Function to get and cache DOM elements.
   * Reduces repeated queries to the DOM for better performance.
   * @param {string} selector - The CSS selector of the element to be cached and retrieved.
   * @returns {Element} - The DOM element corresponding to the selector.
   */
  getElement(selector) {
    try {
      if (!this.elements[selector]) {
        this.elements[selector] = document.querySelector(selector);
      }
      return this.elements[selector];
    } catch (error) {
      console.error('Error in getElement:', error);
    }
  }

  /**
   * Initialize event listeners for various events.
   * Sets up listeners for variant changes, DOM content load, and custom events.
   */
  initEventListeners() {
    try {
      // Listen for variant changes and update the price accordingly
      document.addEventListener('variant:change', (e) => {
        try {
          const variant = e.detail.variant;
          setTimeout(() => this.updatePrice(variant), 500);
        } catch (error) {
          console.error('Error in variant:change event listener:', error);
        }
      });

      // Once the DOM is fully loaded, update the price and initialize buttons
      document.addEventListener("DOMContentLoaded", () => {
        try {
          this.updatePrice();

          if (this.sellingPlans > 0) {
            this.waitForElement(".og-offer").then(() => {
              setTimeout(() => this.updatePrice(), 1500);
              this.initOptInOutButtons();
            }).catch(error => console.error('Error in waitForElement:', error));
          }
        } catch (error) {
          console.error('Error in DOMContentLoaded event listener:', error);
        }
      });

      // Handle custom update status event
      document.addEventListener("prive-update-status", () => {
        try {
          this.handlePriveUpdate();
        } catch (error) {
          console.error('Error in prive-update-status event listener:', error);
        }
      });
    } catch (error) {
      console.error('Error in initEventListeners:', error);
    }
  }

  /**
   * Initialize opt-in and opt-out buttons and add event listeners to them.
   * Adds click event listeners to the opt-in and opt-out buttons for updating the price.
   */
  initOptInOutButtons() {
    try {
      const OGoptOutBtn = this.getElement('.og-optout-button');
      const OGoptInBtn = this.getElement('.og-optin-button');

      if (OGoptOutBtn && OGoptInBtn) {
        OGoptOutBtn.addEventListener('click', () => {
          try {
            this.updatePrice();
          } catch (error) {
            console.error('Error in OGoptOutBtn click event listener:', error);
          }
        });
        OGoptInBtn.addEventListener('click', () => {
          try {
            this.updatePrice();
          } catch (error) {
            console.error('Error in OGoptInBtn click event listener:', error);
          }
        });
      }
    } catch (error) {
      console.error('Error in initOptInOutButtons:', error);
    }
  }

  /**
   * Handle the prive update status event.
   * Triggers a custom variant change event after a short delay.
   */
  handlePriveUpdate() {
    try {
      const selectedVariant = this.getSelectedVariant();
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

  /**
   * Get the selected variant based on the options selected.
   * Matches the selected options with the variant data to find the corresponding variant.
   * @returns {Object|null} - The selected variant object or null if not found.
   */
  getSelectedVariant() {
    try {
      const option1 = this.getOptionValue(0);
      const option2 = this.getOptionValue(1);
      const option3 = this.getOptionValue(2);

      const priceElement = this.getElement('#price_element');
      if (!priceElement) return null;

      const productData = JSON.parse(priceElement.dataset.product);
      return productData.variants.find(variant =>
        variant.option1 === option1 && variant.option2 === option2 && variant.option3 === option3
      ) || productData.variants.find(variant =>
        variant.id === this.getElement('input[name="id"]')?.value
      );
    } catch (error) {
      console.error('Error in getSelectedVariant:', error);
    }
  }

  /**
   * Get the value of a specific option.
   * Retrieves the value of the selected option based on its index.
   * @param {number} index - The index of the option (0, 1, or 2).
   * @returns {string|null} - The value of the selected option or null if not found.
   */
  getOptionValue(index) {
    try {
      return document.querySelectorAll('.variant-picker__option input:checked')[index]?.value || null;
    } catch (error) {
      console.error('Error in getOptionValue:', error);
    }
  }

  /**
   * Round a number to two decimal places based on certain conditions.
   * Rounds up, down, or normally depending on the input conditions.
   * @param {number} num - The number to be rounded.
   * @param {boolean} [savings=false] - Whether the rounding is for savings calculation.
   * @returns {string} - The rounded number as a string with two decimal places.
   */
  roundNumber(num, savings = false) {
    try {
      if (num > 4 && !savings) return (Math.ceil(num * 100) / 100).toFixed(2);
      if (num < 6 && savings) return (Math.floor(num * 100) / 100).toFixed(2);
      return (Math.round(num * 100) / 100).toFixed(2);
    } catch (error) {
      console.error('Error in roundNumber:', error);
    }
  }

  /**
   * Update the price based on the selected variant and discount variables.
   * Calculates and updates the displayed price based on the variant and applicable discounts.
   * @param {Object} [variant=window.loaded_variant] - The selected variant object.
   */
  updatePrice(variant = window.loaded_variant) {
    try {
      if (!variant) return;

      const discountVariables = this.getDiscountVariables();
      const discountData = this.calculateDiscounts(variant, discountVariables);

      this.updateDOMElements(discountData, discountVariables);
    } catch (error) {
      console.error('Error in updatePrice:', error);
    }
  }

  /**
   * Get discount-related variables from the DOM and settings.
   * Retrieves various discount settings and values from the DOM and global variables.
   * @returns {Object} - An object containing discount-related variables.
   */
  getDiscountVariables() {
    try {
      const discountAppliesToElement = this.getElement('#discount_applies_to');
      const collectionDiscountElement = this.getElement('#collection_discount');
      const priorityDiscountElement = this.getElement('#priority_discount_value');

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

  /**
   * Calculate discounts based on the variant and discount variables.
   * Determines the final discounted price based on various discount conditions.
   * @param {Object} variant - The selected variant object.
   * @param {Object} discountVariables - The discount-related variables.
   * @returns {Object} - An object containing calculated discount data.
   */
  calculateDiscounts(variant, discountVariables) {
    try {
      const {
        isSiteWideDiscountEnabled, collectionDiscountValue, priorityDiscountValue        , sitewideDiscountValue
      } = discountVariables;

      const sellingPlan = this.getSellingPlan();
      const subsavePercent = this.getSubsavePercent(sellingPlan);

      let discountValue = this.getInitialDiscountValue(isSiteWideDiscountEnabled, collectionDiscountValue, priorityDiscountValue, sitewideDiscountValue);
      const variantDiscount = this.getVariantDiscount(variant);
      discountValue = Math.max(discountValue, variantDiscount);

      const discountedPrice = this.calculateDiscountedPrice(variant.price, discountValue, sellingPlan, subsavePercent);
      const additionalFixedPrice = this.getAdditionalFixedPrice();

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

  /**
   * Get the selling plan type (subscription or one-time).
   * Determines the selling plan based on the presence and attributes of the subscription button.
   * @returns {string} - The selling plan type ('subscription' or 'one-time').
   */
  getSellingPlan() {
    try {
      const OGsubsPlanNode = this.getElement('.og-optin-button');
      const OGsellingPlan = OGsubsPlanNode ? OGsubsPlanNode.getAttribute('frequency') : null;
      return OGsellingPlan ? 'subscription' : 'one-time';
    } catch (error) {
      console.error('Error in getSellingPlan:', error);
    }
  }

  /**
   * Get the subscription save percentage.
   * Retrieves the subscription discount percentage from the DOM.
   * @param {string} sellingPlan - The current selling plan type.
   * @returns {number} - The subscription save percentage.
   */
  getSubsavePercent(sellingPlan) {
    try {
      const sellingPlanDiscountNode = this.getElement('.og-incentive-text');
      return sellingPlanDiscountNode ? parseFloat(sellingPlanDiscountNode.innerText.split('%')[0]) : 0;
    } catch (error) {
      console.error('Error in getSubsavePercent:', error);
    }
  }

  /**
   * Calculate the initial discount value based on various conditions.
   * Determines the highest applicable discount value from site-wide, collection, and priority discounts.
   * @param {boolean} isSiteWideDiscountEnabled - Whether site-wide discounts are enabled.
   * @param {number} collectionDiscountValue - The value of the collection discount.
   * @param {number} priorityDiscountValue - The value of the priority discount.
   * @param {number} sitewideDiscountValue - The value of the site-wide discount.
   * @returns {number} - The initial discount value.
   */
  getInitialDiscountValue(isSiteWideDiscountEnabled, collectionDiscountValue, priorityDiscountValue, sitewideDiscountValue) {
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

  /**
   * Get the discount for the specific variant.
   * Finds and returns the discount value for the given variant from a predefined list.
   * @param {Object} variant - The selected variant object.
   * @returns {number} - The discount value for the variant.
   */
  getVariantDiscount(variant) {
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

  /**
   * Calculate the final discounted price.
   * Applies the highest discount value and subscription discount to determine the final price.
   * @param {number} variantPrice - The original price of the variant.
   * @param {number} discountValue - The calculated discount value.
   * @param {string} sellingPlan - The current selling plan type ('subscription' or 'one-time').
   * @param {number} subsavePercent - The subscription save percentage.
   * @returns {number} - The final discounted price.
   */
  calculateDiscountedPrice(variantPrice, discountValue, sellingPlan, subsavePercent) {
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

  /**
   * Get any additional fixed price discount.
   * Checks for any additional fixed price discount available in global settings.
   * @returns {number} - The additional fixed price discount value.
   */
  getAdditionalFixedPrice() {
    try {
      if (window.addOnDiscount && window.addOnDiscount[0].discount_type !== 'PERCENTAGE') {
        return window.addOnDiscount[0].discount_value;
      }
      return 0;
    } catch (error) {
      console.error('Error in getAdditionalFixedPrice:', error);
    }
  }

  /**
   * Update the DOM elements based on the calculated discount data.
   * Updates the displayed price and discount labels in the DOM based on the discount calculations.
   * @param {Object} discountData - The calculated discount data.
   * @param {Object} discountVariables - The discount-related variables.
   */
  updateDOMElements(discountData, discountVariables) {
    try {
      const {
        sellingPlan, subsavePercent, discountedPrice, discountValue, additionalFixedPrice
      } = discountData;

      if (sellingPlan === 'subscription') {
        this.updateSubscriptionDOM(subsavePercent, discountedPrice, discountVariables.variantPrice, discountValue, additionalFixedPrice);
      } else {
        this.updateOneTimeDOM(discountedPrice, discountVariables.variantPrice, discountValue, additionalFixedPrice);
      }

      const priceElement = this.getElement('#price_element');
      priceElement.innerHTML = this.currencySign + this.roundNumber(discountedPrice);
      priceElement.classList.toggle('price-black', discountedPrice === discountVariables.variantPrice / 100);
      this.getElement('#price_element + s').style.display = (discountedPrice === discountVariables.variantPrice / 100) ? 'none' : 'inline';
    } catch (error) {
      console.error('Error in updateDOMElements:', error);
    }
  }

  /**
   * Update the DOM elements for subscription-based pricing.
   * Sets the discounted price and updates the corresponding discount labels for subscription plans.
   * @param {number} subsavePercent - The subscription save percentage.
   * @param {number} discountedPrice - The final discounted price.
   * @param {number} variantPrice - The original price of the variant.
   * @param {number} discountValue - The calculated discount value.
   * @param {number} additionalFixedPrice - Any additional fixed price discount.
   */
  updateSubscriptionDOM(subsavePercent, discountedPrice, variantPrice, discountValue, additionalFixedPrice) {
    try {
      const totalDiscountRounded = subsavePercent - (subsavePercent % 5);
      const savingAmount = this.roundNumber(variantPrice / 100 - discountedPrice);

      // Update the main price element
      const priceElement = this.getElement('#price_element');
      priceElement.innerHTML = `${this.currencySign} ${this.roundNumber(discountedPrice)}`;

      // Update the discount labels
      this.updateDiscountLabel('.price-save-label .case-1', `<span class="product-thumbnail_badge" style="margin-right: 16px;">SAVE ${totalDiscountRounded}% OFF NOW & ON FUTURE ORDERS</span>`);
      this.updateDiscountLabel('.price-save-label .case-2 span', `SAVE ${this.currencySign}${savingAmount}`);
      this.updateDiscountLabel('.price-save-label .case-3 span', `${discountValue}% OFF + ${subsavePercent}% OFF Extra`);

      // Show the price save label
      this.getElement('.price-save-label').style.display = 'flex';

       // Update highlighted prices if elements are present
       const highlightSubscriptionPrice = this.getElement('.highlight-subscription-price');
       if (highlightSubscriptionPrice) {
         highlightSubscriptionPrice.textContent = `${this.currencySign}${this.roundNumber(discountedPrice)}`;
         this.updateHighlightPrice('.highlight-compare-at-price', `${this.currencySign}${(variantPrice / 100).toFixed(2)}`);
         this.updateHighlightPrice('.highlight-save-amnt-banner', `SAVE ${this.currencySign}${((variantPrice / 100) - discountedPrice).toFixed(2)}`);
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
   updateOneTimeDOM(discountedPrice, variantPrice, discountValue, additionalFixedPrice) {
     try {
       const savingAmount = this.roundNumber(variantPrice / 100 - discountedPrice);
 
       // Update the main price element
       const priceElement = this.getElement('#price_element');
       priceElement.innerHTML = `${this.currencySign}${this.roundNumber(discountedPrice)}`;
 
       // Update the discount labels
       this.updateDiscountLabel('.price-save-label .case-1 span', `${Math.round(discountValue)}% OFF`);
       this.updateDiscountLabel('.price-save-label .case-2 span', `SAVE ${this.currencySign}${savingAmount}`);
       this.updateDiscountLabel('.price-save-label .case-3 span', `${discountValue}% OFF`);
 
       // Show or hide the price save label based on discount value
       const priceSaveLabelElement = this.getElement('.price-save-label');
       priceSaveLabelElement.style.display = discountValue > 0 ? 'flex' : 'none';
 
       // Update highlighted prices if elements are present
       const highlightOptOutSalePrice = this.getElement('.highlight-opt-out-sale-price');
       if (highlightOptOutSalePrice) {
         const oneTimeDiscountedPrice = (variantPrice * ((100 - discountValue) / 100)) / 100;
         if (oneTimeDiscountedPrice != (variantPrice / 100)) {
           this.updateHighlightPrice('.highlight-opt-out-price', `${this.currencySign}${(variantPrice / 100).toFixed(2)}`);
           highlightOptOutSalePrice.textContent = `${this.currencySign}${this.roundNumber(oneTimeDiscountedPrice)}`;
         } else {
           highlightOptOutSalePrice.textContent = `${this.currencySign}${(variantPrice / 100).toFixed(2)}`;
           this.updateHighlightPrice('.highlight-opt-out-price', ``);
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
   updateDiscountLabel(selector, textContent) {
     try {
       const element = this.getElement(selector);
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
   updateHighlightPrice(selector, textContent) {
     try {
       const element = this.getElement(selector);
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
   waitForElement(selector) {
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
 }
 
 // Initialize the PriceUpdater class
 new PriceUpdater();
 

