class PriceUpdater {
  constructor() {
    // Initialize the selling plans and currency sign
    this.sellingPlans = 1;
    this.currencySign = this.getCurrencySign();
    // Object to cache DOM elements
    this.elements = {};
    // Initialize event listeners
    this.initEventListeners();
  }

  // Function to get the currency sign from the money format
  getCurrencySign() {
    const moneyFormat = "${{amount}}";
    return moneyFormat.slice(0, 1);
  }

  // Function to get and cache DOM elements
  getElement(selector) {
    if (!this.elements[selector]) {
      this.elements[selector] = document.querySelector(selector);
    }
    return this.elements[selector];
  }

  // Initialize event listeners for various events
  initEventListeners() {
    // Listen for variant changes and update the price accordingly
    document.addEventListener('variant:change', (e) => {
      const variant = e.detail.variant;
      setTimeout(() => this.updatePrice(variant), 500);
    });

    // Once the DOM is fully loaded, update the price and initialize buttons
    document.addEventListener("DOMContentLoaded", () => {
      this.updatePrice();

      if (this.sellingPlans > 0) {
        this.waitForElement(".og-offer").then(() => {
          setTimeout(() => this.updatePrice(), 1500);
          this.initOptInOutButtons();
        });
      }
    });

    // Handle custom update status event
    document.addEventListener("prive-update-status", () => {
      this.handlePriveUpdate();
    });
  }

  // Initialize opt-in and opt-out buttons and add event listeners to them
  initOptInOutButtons() {
    const OGoptOutBtn = this.getElement('.og-optout-button');
    const OGoptInBtn = this.getElement('.og-optin-button');

    if (OGoptOutBtn && OGoptInBtn) {
      OGoptOutBtn.addEventListener('click', () => this.updatePrice());
      OGoptInBtn.addEventListener('click', () => this.updatePrice());
    }
  }

  // Handle the prive update status event
  handlePriveUpdate() {
    const selectedVariant = this.getSelectedVariant();
    setTimeout(() => {
      document.dispatchEvent(new CustomEvent("variant:change", {
        bubbles: true,
        detail: { variant: selectedVariant }
      }));
    }, 200);
  }

  // Get the selected variant based on the options selected
  getSelectedVariant() {
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
  }

  // Get the value of a specific option
  getOptionValue(index) {
    return document.querySelectorAll('.variant-picker__option input:checked')[index]?.value || null;
  }

  // Round a number to two decimal places based on certain conditions
  roundNumber(num, savings = false) {
    if (num > 4 && !savings) return (Math.ceil(num * 100) / 100).toFixed(2);
    if (num < 6 && savings) return (Math.floor(num * 100) / 100).toFixed(2);
    return (Math.round(num * 100) / 100).toFixed(2);
  }

  // Update the price based on the selected variant and discount variables
  updatePrice(variant = window.loaded_variant) {
    if (!variant) return;

    const discountVariables = this.getDiscountVariables();
    const discountData = this.calculateDiscounts(variant, discountVariables);

    this.updateDOMElements(discountData, discountVariables);
  }

  // Get discount-related variables from the DOM and settings
  getDiscountVariables() {
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
  }

  // Calculate discounts based on the variant and discount variables
  calculateDiscounts(variant, discountVariables) {
    const {
      isSiteWideDiscountEnabled, collectionDiscountValue, priorityDiscountValue, sitewideDiscountValue
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
  }

  // Get the selling plan type (subscription or one-time)
  getSellingPlan() {
    const OGsubsPlanNode = this.getElement('.og-optin-button');
    const OGsellingPlan = OGsubsPlanNode ? OGsubsPlanNode.getAttribute('frequency') : null;
    return OGsellingPlan ? 'subscription' : 'one-time';
  }

  // Get the subscription save percentage
  getSubsavePercent(sellingPlan) {
    const sellingPlanDiscountNode = this.getElement('.og-incentive-text');
    return sellingPlanDiscountNode ? parseFloat(sellingPlanDiscountNode.innerText.split('%')[0]) : 0;
  }

  // Calculate the initial discount value based on various conditions
  getInitialDiscountValue(isSiteWideDiscountEnabled, collectionDiscountValue, priorityDiscountValue, sitewideDiscountValue) {
    let discountValue = 0;
    if (isSiteWideDiscountEnabled) {
      discountValue = Math.max(sitewideDiscountValue, collectionDiscountValue);
    } else if (isCollectionDiscountEnabled) {
      discountValue = collectionDiscountValue;
    }
    return priorityDiscountValue || discountValue;
  }

  // Get the discount for the specific variant
  getVariantDiscount(variant) {
    const variantsWithDiscounts = [
      { "variant_id": 44522319249574, "discount": "", "sub_price_override": "" },
      { "variant_id": 44522639720614, "discount": "", "sub_price_override": "" },
      { "variant_id": 44522676748454, "discount": "", "sub_price_override": "" },
      { "variant_id": 44522639753382, "discount": "", "sub_price_override": "" },
      { "variant_id": 44779292065958, "discount": "", "sub_price_override": "" }
    ];
    return parseFloat(variantsWithDiscounts.find(v => v.variant_id == variant.id)?.discount || 0);
  }

  // Calculate the final discounted price
  calculateDiscountedPrice(variantPrice, discountValue, sellingPlan, subsavePercent) {
    if (sellingPlan === 'subscription') {
      return (variantPrice * ((100 - subsavePercent) / 100)) / 100;
    } else {
      return (variantPrice * ((100 - discountValue) / 100)) / 100;
    }
  }

  // Get any additional fixed price discount
  getAdditionalFixedPrice() {
    if (window.addOnDiscount && window.addOnDiscount[0].discount_type !== 'PERCENTAGE') {
      return window.addOnDiscount[0].discount_value;
    }
    return 0;
  }

  // Update the DOM elements based on the calculated discount data
  updateDOMElements(discountData, discountVariables) {
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
  }

  // Update the DOM elements for subscription-based pricing
  updateSubscriptionDOM(subsavePercent, discountedPrice, variantPrice, discountValue, additionalFixedPrice) {
    const totalDiscountRounded = subsavePercent - (subsavePercent % 5);
    const savingAmount = this.roundNumber(variantPrice / 100 - this.roundNumber(discountedPrice));

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
  }

  // Update the DOM elements for one-time purchase pricing
  updateOneTimeDOM(discountedPrice, variantPrice, discountValue, additionalFixedPrice) {
    const savingAmount = this.roundNumber(variantPrice / 100 - this.roundNumber(discountedPrice));

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
  }

  // Helper function to update discount labels
  updateDiscountLabel(selector, textContent) {
    const element = this.getElement(selector);
    if (element) {
      element.innerHTML = textContent;
    }
  }

  // Helper function to update highlighted prices
  updateHighlightPrice(selector, textContent) {
    const element = this.getElement(selector);
    if (element) {
      element.textContent = textContent;
    }
  }

  // Wait for a specific element to appear in the DOM
  waitForElement(selector) {
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
  }
}

// Initialize the PriceUpdater class
new PriceUpdater();

