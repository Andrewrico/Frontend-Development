// // Subscribe to the checkout_completed event
// analytics.subscribe('page_viewed', async (event) => {
//     try {
//       // Retrieve the current cookie value (optional)
//       const display_banner = await browser.cookie.get('display_banner');
//       console.log('Current user_id cookie value:', user_id);
  
//       // Delete the cookie by setting its expiration date in the past
//       await browser.cookie.set('display_banner', '', 'Thu, 01 Jan 1970 00:00:00 GMT');
  
//       console.log('Cookie "display_banner" has been deleted.');
  
//     } catch (error) {
//       console.error('Error handling checkout completed event:', error);
//     }
//   });


// Subscribe to the page_viewed event
// analytics.subscribe('page_viewed', async (event) => {
//   try {
//     // Check if the 'display_banner' cookie already exists (optional)
//     const display_banner = await browser.cookie.get('display_banner');
//     console.log('Current display_banner cookie value:', display_banner);

//     // If the cookie doesn't exist, set it with a new value and expiration
//     if (!display_banner) {
//       const expirationDate = new Date();
//       expirationDate.setDate(expirationDate.getDate() + 7); // Set cookie to expire in 7 days

//       await browser.cookie.set(
//         'display_banner',
//         'true', // Value of the cookie
//         expirationDate.toUTCString() // Expiration date in UTC format
//       );

//       console.log('Cookie "display_banner" has been created.');
//     } else {
//       console.log('Cookie "display_banner" already exists.');
//     }

//   } catch (error) {
//     console.error('Error handling page viewed event:', error);
//   }
// });



// Subscribe to the checkout_completed event
analytics.subscribe('page_viewed', async (event) => {
    try {
      // Get the current value of the 'display_banner' cookie
      const display_banner = await browser.cookie.get('display_banner');
          console.log("[display_banner]", display_banner)
      // Check if the cookie exists and its value is 'true'
      if (display_banner === 'true') {
        // Delete the cookie by setting its expiration date in the past
        await browser.cookie.set('display_banner', '', 'Thu, 01 Jan 1970 00:00:00 GMT');
        console.log('Cookie "display_banner" with value "true" has been deleted.');
      } else {
        console.log('Cookie "display_banner" does not exist or its value is not "true".');
      }
  
    } catch (error) {
      console.error('Error handling checkout completed event:', error);
    }
  });
  
  
    