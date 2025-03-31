// Function to extract property data from Zillow
function extractZillowData() {
  const price = document.querySelector('[data-testid="price"]')?.textContent;
  const address = document.querySelector('[data-testid="home-details-chip-container"]')?.textContent;
  const beds = document.querySelector('[data-testid="bed-bath-item"] > span:first-child')?.textContent;
  const baths = document.querySelector('[data-testid="bed-bath-item"] > span:last-child')?.textContent;
  const sqft = document.querySelector('[data-testid="home-facts-item"] span')?.textContent;

  return {
    price: price ? price.replace(/[^\d.]/g, '') : null,
    address: address || null,
    bedrooms: beds ? parseInt(beds) : null,
    bathrooms: baths ? parseFloat(baths) : null,
    squareFootage: sqft ? sqft.replace(/[^\d.]/g, '') : null,
    source: 'zillow'
  };
}

// Function to extract property data from Realtor.com
function extractRealtorData() {
  const price = document.querySelector('[data-testid="price-section"]')?.textContent;
  const address = document.querySelector('[data-testid="address-section"]')?.textContent;
  const beds = document.querySelector('[data-testid="property-meta-beds"]')?.textContent;
  const baths = document.querySelector('[data-testid="property-meta-baths"]')?.textContent;
  const sqft = document.querySelector('[data-testid="property-meta-sqft"]')?.textContent;

  return {
    price: price ? price.replace(/[^\d.]/g, '') : null,
    address: address || null,
    bedrooms: beds ? parseInt(beds) : null,
    bathrooms: baths ? parseFloat(baths) : null,
    squareFootage: sqft ? sqft.replace(/[^\d.]/g, '') : null,
    source: 'realtor'
  };
}

// Function to extract property data from Redfin
function extractRedfinData() {
  const price = document.querySelector('.price-section')?.textContent;
  const address = document.querySelector('.street-address')?.textContent;
  const beds = document.querySelector('.beds')?.textContent;
  const baths = document.querySelector('.baths')?.textContent;
  const sqft = document.querySelector('.sqft')?.textContent;

  return {
    price: price ? price.replace(/[^\d.]/g, '') : null,
    address: address || null,
    bedrooms: beds ? parseInt(beds) : null,
    bathrooms: baths ? parseFloat(baths) : null,
    squareFootage: sqft ? sqft.replace(/[^\d.]/g, '') : null,
    source: 'redfin'
  };
}

// Function to extract property data from LoopNet
function extractLoopNetData() {
  const price = document.querySelector('.price-display')?.textContent;
  const address = document.querySelector('.property-address')?.textContent;
  const sqft = document.querySelector('.property-size')?.textContent;

  return {
    price: price ? price.replace(/[^\d.]/g, '') : null,
    address: address || null,
    squareFootage: sqft ? sqft.replace(/[^\d.]/g, '') : null,
    source: 'loopnet'
  };
}

// Main function to extract data based on the current website
function extractPropertyData() {
  const url = window.location.href;
  let data = null;

  if (url.includes('zillow.com')) {
    data = extractZillowData();
  } else if (url.includes('realtor.com')) {
    data = extractRealtorData();
  } else if (url.includes('redfin.com')) {
    data = extractRedfinData();
  } else if (url.includes('loopnet.com')) {
    data = extractLoopNetData();
  }

  return data;
}

// Listen for messages from the popup
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.action === 'extractPropertyData') {
    const data = extractPropertyData();
    sendResponse(data);
  }
}); 