// Listen for installation
chrome.runtime.onInstalled.addListener(() => {
  console.log('Real Estate Deal Analyzer extension installed');
  
  // Create context menu on installation
  chrome.contextMenus.create({
    id: 'analyzeProperty',
    title: 'Analyze Property',
    contexts: ['page'],
    documentUrlPatterns: [
      '*://*.zillow.com/*',
      '*://*.realtor.com/*',
      '*://*.redfin.com/*',
      '*://*.loopnet.com/*'
    ]
  }, () => {
    if (chrome.runtime.lastError) {
      console.error('Context menu creation error:', chrome.runtime.lastError);
    }
  });
});

// Listen for messages from content script
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  try {
    if (request.type === 'PROPERTY_DATA') {
      // Store property data in extension storage
      chrome.storage.local.set({ propertyData: request.data }, () => {
        if (chrome.runtime.lastError) {
          console.error('Storage error:', chrome.runtime.lastError);
          sendResponse({ status: 'error', message: chrome.runtime.lastError });
        } else {
          sendResponse({ status: 'success' });
        }
      });
      return true; // Required for async response
    }
    
    if (request.action === 'generatePDF') {
      generatePDF(request.data);
      return true;
    }
  } catch (error) {
    console.error('Message handling error:', error);
    sendResponse({ status: 'error', message: error.message });
  }
});

async function generatePDF(data: any) {
  try {
    // Create a new tab with the report data
    const tab = await chrome.tabs.create({
      url: chrome.runtime.getURL('report.html'),
      active: false
    });

    // Wait for the tab to be ready
    chrome.tabs.onUpdated.addListener(function listener(tabId, info) {
      if (tabId === tab.id && info.status === 'complete') {
        chrome.tabs.onUpdated.removeListener(listener);
        
        // Send the data to the report page
        chrome.tabs.sendMessage(tab.id!, {
          action: 'GENERATE_PDF',
          data: data
        });
      }
    });
  } catch (error) {
    console.error('Error generating PDF:', error);
  }
}

// Context menu click handler
chrome.contextMenus.onClicked.addListener((info, tab) => {
  if (info.menuItemId === 'analyzeProperty' && tab?.id) {
    try {
      chrome.tabs.sendMessage(tab.id, { action: 'extractPropertyData' }, (response) => {
        if (chrome.runtime.lastError) {
          console.error('Tab message error:', chrome.runtime.lastError);
        }
      });
    } catch (error) {
      console.error('Context menu click error:', error);
    }
  }
});

// Listen for tab updates to show/hide the extension icon
chrome.tabs.onUpdated.addListener((tabId, changeInfo, tab) => {
  if (changeInfo.status === 'complete' && tab.url) {
    try {
      const url = tab.url;
      // Enable the extension icon only on supported real estate websites
      const isEnabled = 
        url.includes('zillow.com') ||
        url.includes('realtor.com') ||
        url.includes('redfin.com') ||
        url.includes('loopnet.com');

      // Update the extension action badge
      chrome.action.setBadgeText({
        text: isEnabled ? '' : 'OFF',
        tabId
      });
      
      chrome.action.setBadgeBackgroundColor({
        color: isEnabled ? '#4CAF50' : '#666666',
        tabId
      });
      
    } catch (error) {
      console.error('Tab update handling error:', error);
    }
  }
}); 