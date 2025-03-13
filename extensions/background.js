// Function to load cookies from a JSON file
async function loadCookiesFromFile(filename) {
  try {
    // Get the URL to the file within the extension
    const fileUrl = chrome.runtime.getURL(filename);
    
    // Fetch the JSON file
    const response = await fetch(fileUrl);
    if (!response.ok) {
      throw new Error(`Failed to load ${filename}: ${response.status} ${response.statusText}`);
    }
    
    // Parse the JSON
    const cookies = await response.json();
    
    // Set the cookies
    let imported = 0;
    let errors = 0;
    
    for (const cookie of cookies) {
      try {
        // Prepare cookie for setting
        const cookieToSet = {
          url: `https://shopee.tw${cookie.path || '/'}`,
          name: cookie.name,
          value: cookie.value,
          domain: cookie.domain,
          path: cookie.path || '/',
          secure: cookie.secure || true,
          httpOnly: false, // Must be false for JavaScript to set it
          sameSite: cookie.sameSite || 'lax',
          expirationDate: cookie.expirationDate || (Math.floor(Date.now() / 1000) + 31536000) // Default 1 year
        };
        
        await chrome.cookies.set(cookieToSet);
        imported++;
      } catch (e) {
        errors++;
        console.error('Error importing cookie:', e, cookie);
      }
    }
    
    console.log(`Automatically imported ${imported} cookies for Shopee.tw (${errors} errors)`);
  } catch (error) {
    console.error('Error loading cookies:', error);
  }
}

// Listen for extension installation or update
chrome.runtime.onInstalled.addListener(() => {
  console.log('Extension installed or updated. Loading Shopee cookies...');
  loadCookiesFromFile('shopee_cookie.json');
});

// Also load cookies when Chrome starts
chrome.runtime.onStartup.addListener(() => {
  console.log('Chrome started. Loading Shopee cookies...');
  loadCookiesFromFile('shopee_cookie.json');
}); 