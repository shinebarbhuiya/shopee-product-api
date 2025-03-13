document.addEventListener('DOMContentLoaded', function() {
  const exportBtn = document.getElementById('exportBtn');
  const importBtn = document.getElementById('importBtn');
  const clearBtn = document.getElementById('clearBtn');
  const cookieData = document.getElementById('cookieData');
  const clearBeforeImport = document.getElementById('clearBeforeImport');
  const status = document.getElementById('status');
  
  // Get the current tab's URL
  async function getCurrentTabUrl() {
    let queryOptions = { active: true, currentWindow: true };
    let [tab] = await chrome.tabs.query(queryOptions);
    return tab.url;
  }
  
  // Clear cookies for current domain
  async function clearCookiesForDomain(domain) {
    try {
      // Get all cookies for the current domain
      const cookies = await chrome.cookies.getAll({ domain });
      
      // Delete each cookie
      let cleared = 0;
      for (const cookie of cookies) {
        const url = `http${cookie.secure ? 's' : ''}://${cookie.domain}${cookie.path}`;
        await chrome.cookies.remove({
          url: url,
          name: cookie.name
        });
        cleared++;
      }
      
      return cleared;
    } catch (error) {
      throw error;
    }
  }
  
  // Export cookies button
  exportBtn.addEventListener('click', async function() {
    try {
      const tabUrl = await getCurrentTabUrl();
      const url = new URL(tabUrl);
      const domain = url.hostname;
      
      // Get all cookies for the current domain
      const cookies = await chrome.cookies.getAll({ domain });
      
      // Format the cookies as JSON
      const cookiesJson = JSON.stringify(cookies, null, 2);
      
      // Display in textarea
      cookieData.value = cookiesJson;
      
      // Copy to clipboard
      navigator.clipboard.writeText(cookiesJson).then(() => {
        status.textContent = 'Cookies exported and copied to clipboard!';
        status.className = 'success';
        
        // Also download the cookies
        const blob = new Blob([cookiesJson], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `cookies-${domain}-${new Date().toISOString().slice(0,10)}.json`;
        a.click();
        URL.revokeObjectURL(url);
      });
    } catch (error) {
      status.textContent = 'Error exporting cookies: ' + error.message;
      status.className = 'error';
    }
  });
  
  // Clear cookies button
  clearBtn.addEventListener('click', async function() {
    try {
      const tabUrl = await getCurrentTabUrl();
      const url = new URL(tabUrl);
      const domain = url.hostname;
      
      const clearedCount = await clearCookiesForDomain(domain);
      status.textContent = `Cleared ${clearedCount} cookies for ${domain}`;
      status.className = 'success';
    } catch (error) {
      status.textContent = 'Error clearing cookies: ' + error.message;
      status.className = 'error';
    }
  });
  
  // Import cookies button
  importBtn.addEventListener('click', async function() {
    try {
      const tabUrl = await getCurrentTabUrl();
      const url = new URL(tabUrl);
      const domain = url.hostname;
      
      // Clear existing cookies first if option is checked
      if (clearBeforeImport.checked) {
        const clearedCount = await clearCookiesForDomain(domain);
        status.textContent = `Cleared ${clearedCount} existing cookies. `;
      }
      
      // Parse the cookie data from the textarea
      const cookiesJson = cookieData.value.trim();
      if (!cookiesJson) {
        status.textContent = 'Please enter cookie data to import';
        status.className = 'error';
        return;
      }
      
      const cookies = JSON.parse(cookiesJson);
      if (!Array.isArray(cookies)) {
        status.textContent = 'Invalid cookie format. Must be an array of cookie objects.';
        status.className = 'error';
        return;
      }
      
      // Set each cookie
      let imported = 0;
      let errors = 0;
      let errorDetails = [];
      
      for (const cookie of cookies) {
        try {
          // Adapt cookie domain to match the current site if needed
          let cookieDomain = cookie.domain;
          
          // If cookie domain doesn't start with a dot and doesn't match current domain
          if (!cookieDomain.startsWith('.') && cookieDomain !== domain) {
            // Try to match the base domain (e.g., example.com)
            if (domain.endsWith(cookieDomain) || cookieDomain.endsWith(domain)) {
              cookieDomain = domain;
            } else {
              // Use current domain with dot prefix to allow subdomains
              cookieDomain = '.' + domain;
            }
          }
          
          // Ensure the cookie path exists
          const cookiePath = cookie.path || '/';
          
          // Prepare cookie for setting with adapted values
          const cookieToSet = {
            url: `${url.protocol}//${domain}${cookiePath}`,
            name: cookie.name,
            value: cookie.value,
            domain: cookieDomain,
            path: cookiePath,
            secure: url.protocol === 'https:' ? cookie.secure : false,
            httpOnly: false, // Must be false for JavaScript to set it
            sameSite: cookie.sameSite || 'lax',
            expirationDate: cookie.expirationDate || (Math.floor(Date.now() / 1000) + 31536000) // Default 1 year
          };
          
          await chrome.cookies.set(cookieToSet);
          imported++;
        } catch (e) {
          errors++;
          errorDetails.push(`${cookie.name}: ${e.message}`);
          console.error('Error importing cookie:', e, cookie);
        }
      }
      
      // Show detailed error info in console
      if (errors > 0) {
        console.log('Cookie import errors:', errorDetails);
      }
      
      const resultMessage = clearBeforeImport.checked 
        ? status.textContent + `Imported ${imported} cookies. ${errors ? `(${errors} errors)` : ''}`
        : `Imported ${imported} cookies. ${errors ? `(${errors} errors)` : ''}`;
      
      status.textContent = resultMessage;
      status.className = errors ? 'warning' : 'success';
      
      if (errors > 0) {
        // Add a small link to show error details
        const detailsLink = document.createElement('a');
        detailsLink.href = '#';
        detailsLink.textContent = ' Show error details';
        detailsLink.style.fontSize = '0.8em';
        detailsLink.style.marginLeft = '10px';
        detailsLink.onclick = function(e) {
          e.preventDefault();
          alert('Error details:\n\n' + errorDetails.slice(0, 10).join('\n\n') + 
                (errorDetails.length > 10 ? '\n\n...and ' + (errorDetails.length - 10) + ' more errors' : ''));
        };
        status.appendChild(detailsLink);
      }
    } catch (error) {
      status.textContent = 'Error importing cookies: ' + error.message;
      status.className = 'error';
    }
  });
}); 