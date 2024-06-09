var sellingPlans = parseInt('1')
    
console.log('selling plans', sellingPlans)
var moneyFormat = JSON.parse('"${{amount}}"');
var currencySign = moneyFormat.slice(0,1);

function roundNumber(num, savings) {
  let nummm = num;
  // let nummm = num.toFixed(3).split('.')[1].slice(2)
  if(nummm > 4 && !savings) {
     let number = Math.ceil((num + Number.EPSILON) * 100) / 100
     return number.toFixed(2)  
  } else if (nummm < 6 && savings) {
    let number = Math.floor((num + Number.EPSILON) * 100) / 100
    return number.toFixed(2)
  } else {
      let number = Math.round((num + Number.EPSILON) * 100) / 100
      return number.toFixed(2)
  }
}

function updatePrice(variant) {
  console.log("🚀 ~ updatePrice called")
 console.log("🚀 ~ variant ~ variant:",variant)

  

  

  if (!variant) {
    variant = window.loaded_variant;
  }
  console.log('variant', variant);
  var discountAppliesTo = document.getElementById('discount_applies_to').value;
  var isSiteWideDiscountEnabled = window.themeVariables.settings.isSiteWideDiscountEnabled;
  var isCollectionDiscountEnabled = window.themeVariables.settings.isCollectionDiscountEnabled;
  var collectionDiscountValue = parseFloat(document.getElementById('collection_discount').value);
  var priorityDiscountValue = parseFloat(document.getElementById('priority_discount_value').value);
  var sitewideDiscountValue = window.themeVariables.settings.sitewideDiscountValue;
  var subscriptionDiscountOverride = parseFloat('0.0');
console.log("🚀 ~ updatePrice ~ discountAppliesTo:", discountAppliesTo,isSiteWideDiscountEnabled,isCollectionDiscountEnabled,collectionDiscountValue,priorityDiscountValue,sitewideDiscountValue, subscriptionDiscountOverride)
  var variantPrice = variant.price;
  //var sellingPrice = variant.selling_plan_allocations[0]?.price || variantPrice;
  var sellingPrice = variant.price
  var sellingPlan;

  const sellingPlanDiscountValueDefault = parseFloat('0.0');

  const OGsubsPlanNode = document.querySelector('og-optin-button')
  let OGsellingPlan;
  let sellingPlanDiscountNode = document.querySelector('og-incentive-text')
  let sellingPlanDiscountValue;
  if(sellingPlanDiscountNode) {
   OGsellingPlan = OGsubsPlanNode.getAttribute('frequency')
  }

  if(OGsubsPlanNode && OGsellingPlan) {
   sellingPlan = 'subscription'
   if(sellingPlanDiscountNode) {
     sellingPlanDiscountValue = sellingPlanDiscountNode.innerText.split('%')[0]
     sellingPlanDiscountValue = parseFloat(sellingPlanDiscountValue)
   }
  } else {
    sellingPlan = 'one-time'
  }

  var subsavePercent = sellingPlanDiscountValue || sellingPlanDiscountValueDefault;

  // if(variant.title.toLowerCase().includes('50ml')) {
  //   console.log('50ml oil')
  //   sellingPlanDiscountValue = 30;
  //   subsavePercent = 30
  // }


  if (document.querySelector('#sub .prive_label_title')) {
    document.querySelector('#sub .prive_label_title').textContent = `Subscribe & Save ${subsavePercent ? subsavePercent : '30'}%`;
  }

  var discountedPrice;
  var discountValue = 0;
  if (!isSiteWideDiscountEnabled && !isCollectionDiscountEnabled) {
    discountValue = 0;
    // console.log('I ran -- r1')
  }
  if (isSiteWideDiscountEnabled && sitewideDiscountValue) {
    discountValue = sitewideDiscountValue;
    // console.log('I ran -- r2')
  }
  if (isCollectionDiscountEnabled && collectionDiscountValue) {
    discountValue = collectionDiscountValue
    // console.log('I ran -- r3')
  }
  if(isSiteWideDiscountEnabled && sitewideDiscountValue > collectionDiscountValue) {
    discountValue = sitewideDiscountValue
    // console.log('I ran -- r4')
  }
  if(isSiteWideDiscountEnabled && sitewideDiscountValue < collectionDiscountValue) {
    if(discountAppliesTo == 'one-time' && sellingPlan == 'subscription') {
      discountValue = sitewideDiscountValue
      // console.log('I ran -- r5')
    } else if(discountAppliesTo == 'subscription' && sellingPlan != 'subscription') {
      discountValue = sitewideDiscountValue
      // console.log('I ran -- r6')
    }
  }
  if (priorityDiscountValue || priorityDiscountValue == 0)  {  //P is True or P is 0
    discountValue = priorityDiscountValue;
    // console.log('I ran -- r7')
  }

  const variantsWithDiscounts = []

  
    variantsWithDiscounts.push({"variant_id": 44522319249574, "discount": "", "sub_price_override": "" });
  
    variantsWithDiscounts.push({"variant_id": 44522639720614, "discount": "", "sub_price_override": "" });
  
    variantsWithDiscounts.push({"variant_id": 44522676748454, "discount": "", "sub_price_override": "" });
  
    variantsWithDiscounts.push({"variant_id": 44522639753382, "discount": "", "sub_price_override": "" });
  
    variantsWithDiscounts.push({"variant_id": 44779292065958, "discount": "", "sub_price_override": "" });
  

  const variantDiscount = parseFloat(variantsWithDiscounts.find(v => v.variant_id == variant.id)?.discount || 0);
  const variantSubscriptionDiscountOverride = parseFloat(variantsWithDiscounts.find(v => v.variant_id == variant.id)?.sub_price_override || 0 );

  if (variantDiscount > 0) {
    discountValue = variantDiscount;
  }

  let oneTimeDiscountValue = discountValue;

  if(sellingPlanDiscountValue) {
    discountValue = sellingPlanDiscountValue
  }

  let additonalFixedPrice;
  if(window.addOnDiscount) {
    if(window.addOnDiscount[0].discount_type == 'PERCENTAGE') {
      discountValue += window.addOnDiscount[0].discount_value
    } else {
      additonalFixedPrice = window.addOnDiscount[0].discount_value
    }
  }
 
 console.log('values', sellingPlan,sellingPlanDiscountValue, oneTimeDiscountValue , discountValue)

  try {
    if (sellingPlan == 'subscription') {
      
       // console.log('irun r55')
        var totalDiscount =  subsavePercent;
        var totalDiscountRounded = totalDiscount - totalDiscount % 5;
        //rechargeDiscountedPrice = roundNumber((variantPrice * ((100 - subsavePercent) / 100)) / 100);
          discountedPrice = (sellingPrice * ((100 - subsavePercent) / 100)) / 100

          document.querySelector('#price_element').innerHTML = `${currencySign} ${roundNumber(discountedPrice)}`
          document.querySelector('.price-save-label .case-1').innerHTML = `<span class="product-thumbnail_badge" style="margin-right: 16px;">SAVE ${totalDiscountRounded}% OFF NOW & ON FUTURE ORDERS</span>`;
          //console.log('rechargeDiscountedPrice')
        let savingAmount = roundNumber(variantPrice / 100 - roundNumber(discountedPrice));
        if(additonalFixedPrice) {
          discountedPrice = discountedPrice - additonalFixedPrice
        }

        if (variantSubscriptionDiscountOverride && variantSubscriptionDiscountOverride > 0) {
        //  discountedPrice = variantSubscriptionDiscountOverride;
          subscriptionDiscountOverride = variantSubscriptionDiscountOverride
        } 
        if (subscriptionDiscountOverride > 0) {
         // discountedPrice = variantPrice * (100 - subscriptionDiscountOverride) / 100 / 100;
          savingAmount = roundNumber(variantPrice / 100 - roundNumber(discountedPrice));
          totalDiscountRounded = parseInt(subscriptionDiscountOverride);
        }  
      //  console.log('[sub override]', variantPrice, discountedPrice, totalDiscountRounded, subscriptionDiscountOverride);
   //   document.querySelector('#price_element').innerHTML = `${currencySign} + ${roundNumber(discountedPrice)} >>>>>2`

        if (totalDiscount > 0) {
          if(totalDiscountRounded === subsavePercent) {
            document.querySelector('.price-save-label .case-1').innerHTML = `<span class="product-thumbnail_badge" style="margin-right: 16px;">SAVE ${totalDiscountRounded}% OFF NOW & ON FUTURE ORDERS</span>`;
  //         document.querySelector('.price-save-label .case-1').innerHTML = `<span class="product-thumbnail_badge" style="margin-right: 16px;">SAVE ${totalDiscountRounded}% OFF NOW & ${subsavePercent}% ${' '}OFF ON FUTURE ORDERS</span>`;
          } else {
            document.querySelector('.price-save-label .case-1').innerHTML = `<span class="product-thumbnail_badge" style="margin-right: 16px;">SAVE ${subsavePercent}% OFF NOW & ON FUTURE ORDERS</span>`;
          }
          document.querySelector('.price-save-label .case-2 span').textContent = `SAVE ${currencySign}${savingAmount}`;
          document.querySelector('.price-save-label .case-3 span').textContent = `${discountValue}% OFF + ${subsavePercent}% OFF Extra`;
          document.querySelector('.price-save-label').style.display = 'flex';
        }
        else {
          document.querySelector('.price-save-label').style.display = 'none';
        }

       // chagneStickyText("Add to cart");


    //  console.log('sssss', discountedPrice)
 //   document.querySelector('#price_element').innerHTML = `${currencySign} + ${roundNumber(discountedPrice)} >>>>>3`

      // document.querySelector('.highlight-opt-out-price').textContent = `$${variantPrice/100}`;
    }
    else {
      
      let renwalsSaveLabel = document.getElementById('save-renewals-label')
      if(renwalsSaveLabel) {
        renwalsSaveLabel.style.display = 'none'
      }
      if (discountAppliesTo == 'subscription') {
      //  chagneStickyText("Add to cart");
       // discountedPrice = variantPrice / 100;
        if(additonalFixedPrice) {
          discountedPrice = discountedPrice - additonalFixedPrice
        }
        document.querySelector('.price-save-label').style.display = 'none';
      }
      else {
       // chagneStickyText("Add to cart");
        discountedPrice = (variantPrice * ((100 - discountValue) / 100)) / 100;
        let savingAmount = roundNumber(variantPrice / 100 - roundNumber(discountedPrice));

        function roundNum(value) {
          return Math.round(value);
        }  

        if (discountValue > 0) {
          document.querySelector('.price-save-label .case-1 span').textContent = roundNum(discountValue) + '% OFF';
          document.querySelector('.price-save-label .case-2 span').textContent = `SAVE ${currencySign}${savingAmount}`;
          document.querySelector('.price-save-label .case-3 span').textContent = `${discountValue}% OFF`;

          document.querySelector('.price-save-label').style.display = 'flex';
        }
        else {
          document.querySelector('.price-save-label').style.display = 'none';
        }
      }

      // document.querySelector('.highlight-opt-out-price').textContent = ``;
    }

    if(document.querySelector('.highlight-subscription-price') && sellingPlan == 'subscription') {
      document.querySelector('.highlight-subscription-price').textContent = `${currencySign}${roundNumber(discountedPrice)}`;
      document.querySelector('.highlight-compare-at-price').textContent = `${currencySign}${(variantPrice/100).toFixed(2)}`;
      document.querySelector('.highlight-save-amnt-banner').textContent = `SAVE ${currencySign}${((variantPrice/100)-discountedPrice).toFixed(2)}`;
    }
    if(document.querySelector('.highlight-opt-out-sale-price')) {
      let oneTimediscountedPrice = (variantPrice * ((100 - oneTimeDiscountValue) / 100)) / 100
      if (oneTimediscountedPrice != (variantPrice/100)){
        document.querySelector('.highlight-opt-out-price').textContent = `${currencySign}${(variantPrice / 100).toFixed(2)}`;
        document.querySelector('.highlight-opt-out-sale-price').textContent = `${currencySign}${roundNumber(oneTimediscountedPrice)}`;
      } else {
        document.querySelector('.highlight-opt-out-sale-price').textContent = `${currencySign}${(variantPrice / 100).toFixed(2)}`;
        document.querySelector('.highlight-opt-out-price').textContent = ``;
      }
    }
  
  }
  catch (err) {
    discountedPrice = (variantPrice * ((100 - discountValue) / 100)) / 100
    console.log('[Discount error]', err);
  }

//  console.log('irun66', discountedPrice)
  document.querySelector('#price_element').innerHTML = currencySign + roundNumber((discountedPrice));

  if (discountedPrice == variantPrice / 100) {
    document.querySelector('#price_element').classList.add('price-black');
    document.querySelector('#price_element + s').style.display = 'none';
  }
  else {
    document.querySelector('#price_element').classList.remove('price-black');
    document.querySelector('#price_element + s').style.display = 'inline';
  }
}




document.addEventListener('variant:change', function(e) {
  var variant = e.detail.variant;
  setTimeout(() => {
    updatePrice(variant)
  }, 500);
;
})

function waitForElmentOGG(selector) {
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

document.addEventListener("DOMContentLoaded", (event) => {
  // let firstAvailableVariant = {"id":44522319249574,"title":"Regular \/ 50mL","option1":"Regular","option2":"50mL","option3":null,"sku":"HCFG50FOMYWAY","requires_shipping":true,"taxable":true,"featured_image":{"id":34461264511142,"product_id":5314946072742,"position":1,"created_at":"2022-08-09T12:01:27-04:00","updated_at":"2022-08-09T12:01:29-04:00","alt":null,"width":1786,"height":1786,"src":"\/\/www.hotelcollection.com\/cdn\/shop\/products\/MayWay50.png?v=1660060889","variant_ids":[44522319249574]},"available":true,"name":"My Way - Regular \/ 50mL","public_title":"Regular \/ 50mL","options":["Regular","50mL"],"price":5495,"weight":54,"compare_at_price":null,"inventory_management":"shopify","barcode":"","featured_media":{"alt":null,"id":26865779212454,"position":1,"preview_image":{"aspect_ratio":1.0,"height":1786,"width":1786,"src":"\/\/www.hotelcollection.com\/cdn\/shop\/products\/MayWay50.png?v=1660060889"}},"requires_selling_plan":false,"selling_plan_allocations":[{"price_adjustments":[{"position":1,"price":5495}],"price":5495,"compare_at_price":5495,"per_delivery_price":5495,"selling_plan_id":1363247270,"selling_plan_group_id":"bc6478a662ffae32b3be35b3fe566fa707984433"}],"quantity_rule":{"min":1,"max":null,"increment":1}};
  //     console.log("🚀 ~ document.addEventListener ~ firstAvailableVariant:", firstAvailableVariant)

  updatePrice()
  console.log('sellingPlans', sellingPlans)

  if(sellingPlans > 0) {
    waitForElmentOGG("og-offer").then(() => {
      setTimeout(() => {
        updatePrice()
        const OGoptOutBtn = document.querySelector('og-optout-button')
        const OGoptInBtn = document.querySelector('og-optin-button')

        console.log('og loaded', OGoptInBtn, OGoptOutBtn)
        
        OGoptOutBtn.addEventListener('click', function name(params) {
          console.log('optout')
          updatePrice()
        })
  
        OGoptInBtn.addEventListener('click', function name(params) {
          console.log('optin')
          updatePrice()
        })
       }, 1500)
    })
  }
});

document.addEventListener("prive-update-status", function(e) {
  console.log(`prive - update status event`)
  var option1 = document.querySelectorAll('.variant-picker__option input:checked')[0]?.value || null;
  var option2 = document.querySelectorAll('.variant-picker__option input:checked')[1]?.value || null;
  var option3 = document.querySelectorAll('.variant-picker__option input:checked')[2]?.value || null;

  var productData = JSON.parse(document.querySelector('#price_element').dataset.product);

  var selectedVariant = productData.variants.find(function (variant) {
    return variant.option1 === option1 && variant.option2 === option2 && variant.option3 === option3;
  });

  if (!selectedVariant && document.querySelector('input[name="id"')) {
    selectedVariant = productData.variants.find(function (variant) {
      return variant.id = document.querySelector('input[name="id"').value;
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

