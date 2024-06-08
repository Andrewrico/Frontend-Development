(() => {
  try {
    // Constants and initial variable declarations
    const sellingPlans = parseInt('1');
    const moneyFormat = "${{amount}}";
    const currencySign = moneyFormat.slice(0, 1);
    const elements = {};

    /**
     * Helper function to get and cache DOM elements.
     * @param {string} selector - The CSS selector of the element.
     * @returns {HTMLElement|null} - The cached DOM element or null if not found.
     */
    const getElement = (selector) => {
      try {
        if (!elements[selector]) {
          elements[selector] = document.querySelector(selector);
        }
        return elements[selector];
      } catch (error) {
        console.error('Error in getElement:', error);
        return null;
      }
    };

    /**
     * Round a number to two decimal places based on certain conditions.
     * @param {number} num - The number to round.
     * @param {boolean} [savings=false] - Whether to use the savings rounding rule.
     * @returns {string} - The rounded number as a string.
     */
    const roundNumber = (num, savings = false) => {
      return num > 4 && !savings
        ? (Math.ceil(num * 100) / 100).toFixed(2)
        : num < 6 && savings
        ? (Math.floor(num * 100) / 100).toFixed(2)
        : (Math.round(num * 100) / 100).toFixed(2);
    };

    /**
     * Update the price based on the selected variant and discount variables.
     * @param {object} [variant=window.loaded_variant] - The selected product variant.
     */
    const updatePrice = (variant = window.loaded_variant) => {
      try {
        if (!variant) return;

        const discountAppliesTo = getElement('#discount_applies_to')?.value || '';
        const isSiteWideDiscountEnabled = window.themeVariables.settings.isSiteWideDiscountEnabled;
        const isCollectionDiscountEnabled = window.themeVariables.settings.isCollectionDiscountEnabled;
        const collectionDiscountValue = parseFloat(getElement('#collection_discount')?.value || '0');
        const priorityDiscountValue = parseFloat(getElement('#priority_discount_value')?.value || '0');
        const sitewideDiscountValue = window.themeVariables.settings.sitewideDiscountValue;
        const variantPrice = variant.price;
        const sellingPrice = variant.price;
        let discountValue = 0;
        let additionalFixedPrice = 0;
        let subscriptionDiscountOverride = 0;
        let sellingPlan = 'one-time';
        let subsavePercent = 0;

        console.log("🚀 ~ updatePrice ~ discountAppliesTo:", discountAppliesTo, isSiteWideDiscountEnabled, isCollectionDiscountEnabled, collectionDiscountValue, priorityDiscountValue, sitewideDiscountValue);

        // Determine selling plan and discount values
        const OGsubsPlanNode = getElement('.og-optin-button');
        if (OGsubsPlanNode) {
          const OGsellingPlan = OGsubsPlanNode.getAttribute('frequency');
          const sellingPlanDiscountNode = getElement('.og-incentive-text');
          if (OGsellingPlan) {
            sellingPlan = 'subscription';
            subsavePercent = parseFloat(sellingPlanDiscountNode?.innerText.split('%')[0] || '0');
          }
        }

        if (isSiteWideDiscountEnabled) discountValue = sitewideDiscountValue;
        if (isCollectionDiscountEnabled && collectionDiscountValue > discountValue) discountValue = collectionDiscountValue;
        if (priorityDiscountValue || priorityDiscountValue === 0) discountValue = priorityDiscountValue;

        const variantsWithDiscounts = [
          { "variant_id": 44522319249574, "discount": "", "sub_price_override": "" },
          { "variant_id": 44522639720614, "discount": "", "sub_price_override": "" },
          { "variant_id": 44522676748454, "discount": "", "sub_price_override": "" },
          { "variant_id": 44522639753382, "discount": "", "sub_price_override": "" },
          { "variant_id": 44779292065958, "discount": "", "sub_price_override": "" }
        ];

        const variantDiscount = parseFloat(variantsWithDiscounts.find(v => v.variant_id == variant.id)?.discount || '0');
        const variantSubscriptionDiscountOverride = parseFloat(variantsWithDiscounts.find(v => v.variant_id == variant.id)?.sub_price_override || '0');

        if (variantDiscount > 0) discountValue = variantDiscount;
        if (sellingPlan === 'subscription' && subsavePercent > 0) discountValue = subsavePercent;

        if (window.addOnDiscount) {
          if (window.addOnDiscount[0].discount_type === 'PERCENTAGE') {
            discountValue += window.addOnDiscount[0].discount_value;
          } else {
            additionalFixedPrice = window.addOnDiscount[0].discount_value;
          }
        }

       // console.log('values', sellingPlan, subsavePercent, discountValue);

        // Calculate the discounted price
        let discountedPrice = sellingPlan === 'subscription'
          ? (sellingPrice * ((100 - subsavePercent) / 100)) / 100
          : (sellingPrice * ((100 - discountValue) / 100)) / 100;

        if (additionalFixedPrice) discountedPrice -= additionalFixedPrice;

        updatePriceElement(discountedPrice, variantPrice, discountValue, sellingPlan);

      } catch (error) {
        console.error('Error in updatePrice:', error);
      }
    };

    /**
     * Update the price element in the DOM.
     * @param {number} discountedPrice - The final discounted price.
     * @param {number} variantPrice - The original variant price.
     * @param {number} discountValue - The discount value applied.
     * @param {string} sellingPlan - The selling plan type (subscription or one-time).
     */
    const updatePriceElement = (discountedPrice, variantPrice, discountValue, sellingPlan) => {
      try {
        const priceElement = getElement('#price_element');
        const priceElementSlash = getElement('#price_element + s');

        priceElement.innerHTML = `${currencySign}${roundNumber(discountedPrice)}`;

        if (discountedPrice === variantPrice / 100) {
          priceElement.classList.add('price-black');
          priceElementSlash.style.display = 'none';
        } else {
          priceElement.classList.remove('price-black');
          priceElementSlash.style.display = 'inline';
        }

        if (sellingPlan === 'subscription') {
          updateSubscriptionLabels(discountedPrice, variantPrice, discountValue);
        } else {
          updateOneTimeLabels(discountedPrice, variantPrice, discountValue);
        }
      } catch (error) {
        console.error('Error in updatePriceElement:', error);
      }
    };

    /**
     * Update the labels for subscription-based pricing.
     * @param {number} discountedPrice - The final discounted price.
     * @param {number} variantPrice - The original variant price.
     * @param {number} discountValue - The discount value applied.
     */
    const updateSubscriptionLabels = (discountedPrice, variantPrice, discountValue) => {
      try {
        const totalDiscountRounded = Math.floor(discountValue / 5) * 5;
        const savingAmount = roundNumber(variantPrice / 100 - roundNumber(discountedPrice));

        updateDiscountLabel('.price-save-label .case-1 span', `SAVE ${totalDiscountRounded}% OFF NOW & ON FUTURE ORDERS`);
        updateDiscountLabel('.price-save-label .case-2 span', `SAVE ${currencySign}${savingAmount}`);
        updateDiscountLabel('.price-save-label .case-3 span', `${discountValue}% OFF + ${subsavePercent}% OFF Extra`);

        document.querySelector('.price-save-label').style.display = 'flex';

        const highlightSubscriptionPrice = getElement('.highlight-subscription-price');
        if (highlightSubscriptionPrice) {
          highlightSubscriptionPrice.textContent = `${currencySign}${roundNumber(discountedPrice)}`;
          updateHighlightPrice('.highlight-compare-at-price', `${currencySign}${(variantPrice / 100).toFixed(2)}`);
          updateHighlightPrice('.highlight-save-amnt-banner', `SAVE ${currencySign}${((variantPrice / 100) - discountedPrice).toFixed(2)}`);
        }
      } catch (error) {
        console.error('Error in updateSubscriptionLabels:', error);
      }
    };

     /**
     * Update the labels for one-time purchase pricing.
     * @param {number} discountedPrice - The final discounted price.
     * @param {number} variantPrice - The original variant price.
     * @param {number} discountValue - The discount value applied.
     */
     const updateOneTimeLabels = (discountedPrice, variantPrice, discountValue) => {
      try {
        const savingAmount = roundNumber(variantPrice / 100 - parseFloat(roundNumber(discountedPrice)));

        if (discountValue > 0) {
          updateDiscountLabel('.price-save-label .case-1 span', `${Math.round(discountValue)}% OFF`);
          updateDiscountLabel('.price-save-label .case-2 span', `SAVE ${currencySign}${savingAmount}`);
          updateDiscountLabel('.price-save-label .case-3 span', `${discountValue}% OFF`);

          document.querySelector('.price-save-label').style.display = 'flex';
        } else {
          document.querySelector('.price-save-label').style.display = 'none';
        }

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
        console.error('Error in updateOneTimeLabels:', error);
      }
    };

    /**
     * Helper function to update discount labels.
     * @param {string} selector - The CSS selector of the element.
     * @param {string} textContent - The text content to set.
     */
    const updateDiscountLabel = (selector, textContent) => {
      try {
        const element = getElement(selector);
        if (element) {
          element.innerHTML = textContent;
        }
      } catch (error) {
        console.error('Error in updateDiscountLabel:', error);
      }
    };

    /**
     * Helper function to update highlighted prices.
     * @param {string} selector - The CSS selector of the element.
     * @param {string} textContent - The text content to set.
     */
    const updateHighlightPrice = (selector, textContent) => {
      try {
        const element = getElement(selector);
        if (element) {
          element.textContent = textContent;
        }
      } catch (error) {
        console.error('Error in updateHighlightPrice:', error);
      }
    };

    /**
     * Wait for a specific element to appear in the DOM.
     * @param {string} selector - The CSS selector of the element to wait for.
     * @returns {Promise<Element>} - A promise that resolves with the element once it appears in the DOM.
     */
    const waitForElement = (selector) => {
      return new Promise((resolve) => {
        if (document.querySelector(selector)) {
          return resolve(document.querySelector(selector));
        }

        const observer = new MutationObserver((mutations) => {
          if (document.querySelector(selector)) {
            resolve(document.querySelector(selector));
            observer.disconnect();
          }
        });

        observer.observe(document.body, {
          childList: true,
          subtree: true,
        });
      });
    };

    /**
     *  variant:change <Event Listener>
     *  DOMContentLoaded <Event Listener>
     *  prive-update-status <Event Listener>
     */
    document.addEventListener('variant:change', (e) => {
      const variant = e.detail.variant;
      setTimeout(() => {
        updatePrice(variant);
      }, 500);
    });

    document.addEventListener("DOMContentLoaded", (event) => {
      updatePrice();
      if (sellingPlans > 0) {
        waitForElement(".og-offer").then(() => {
          setTimeout(() => {
        //    updatePrice();
            const OGoptOutBtn = getElement('.og-optout-button');
            const OGoptInBtn = getElement('.og-optin-button');

            OGoptOutBtn.addEventListener('click', function() {
              updatePrice();
            });

            OGoptInBtn.addEventListener('click', function() {
              updatePrice();
            });
          }, 1500);
        }).catch(error => console.error('Error in waitForElement:', error));
      }
    });

    document.addEventListener("prive-update-status", function(e) {
     // console.log(`prive - update status event`);
      const option1 = document.querySelectorAll('.variant-picker__option input:checked')[0]?.value || null;
      const option2 = document.querySelectorAll('.variant-picker__option input:checked')[1]?.value || null;
      const option3 = document.querySelectorAll('.variant-picker__option input:checked')[2]?.value || null;

      const productData = JSON.parse(document.querySelector('#price_element').dataset.product);

      let selectedVariant = productData.variants.find(function (variant) {
        return variant.option1 === option1 && variant.option2 === option2 && variant.option3 === option3;
      });

      if (!selectedVariant && document.querySelector('input[name="id"')) {
        selectedVariant = productData.variants.find(function (variant) {
          return variant.id == document.querySelector('input[name="id"]').value;
        });
      }

      setTimeout(() => {
        document.dispatchEvent(new CustomEvent("variant:change", {
          bubbles: true,
          detail: {
            product: productData,
            variant: selectedVariant
          }
        }));
      }, 200);
    });

  } catch (error) {
    console.error('Error in initializePriceUpdater:', error);
  }
})();
