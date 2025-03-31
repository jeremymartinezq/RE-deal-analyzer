// Format currency values
function formatCurrency(value) {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0
  }).format(value);
}

// Format percentage values
function formatPercentage(value) {
  return `${value.toFixed(1)}%`;
}

// Update the report with the provided data
function updateReport(data) {
  // Set report date
  document.getElementById('report-date').textContent = 
    `Generated on ${new Date().toLocaleDateString()} at ${new Date().toLocaleTimeString()}`;

  // Property Details
  document.getElementById('address').textContent = data.property.address || 'N/A';
  document.getElementById('price').textContent = formatCurrency(data.property.price) || 'N/A';
  document.getElementById('sqft').textContent = data.property.squareFootage || 'N/A';
  document.getElementById('beds-baths').textContent = 
    `${data.property.bedrooms || 'N/A'} beds / ${data.property.bathrooms || 'N/A'} baths`;

  // Financial Analysis
  document.getElementById('gross-rent').textContent = formatCurrency(data.analysis.financial.grossRent) || 'N/A';
  document.getElementById('net-rent').textContent = formatCurrency(data.analysis.financial.netRent) || 'N/A';
  document.getElementById('cap-rate').textContent = data.analysis.financial.capRate || 'N/A';
  document.getElementById('coc-return').textContent = data.analysis.financial.cashOnCash || 'N/A';

  // Market Analysis
  document.getElementById('median-value').textContent = formatCurrency(data.analysis.market.medianHomeValue) || 'N/A';
  document.getElementById('median-rent').textContent = formatCurrency(data.analysis.market.medianRent) || 'N/A';
  document.getElementById('appreciation').textContent = 
    data.analysis.market.appreciation ? formatPercentage(data.analysis.market.appreciation) : 'N/A';
  document.getElementById('days-on-market').textContent = data.analysis.market.daysOnMarket || 'N/A';

  // Risk Assessment
  document.getElementById('crime-rate').textContent = data.analysis.risk.crimeRate || 'N/A';
  document.getElementById('school-rating').textContent = 
    data.analysis.risk.schoolRating ? data.analysis.risk.schoolRating.toFixed(1) : 'N/A';
  document.getElementById('walk-score').textContent = data.analysis.risk.walkScore || 'N/A';
  document.getElementById('transit-score').textContent = data.analysis.risk.transitScore || 'N/A';

  // Generate PDF after a short delay to ensure all content is rendered
  setTimeout(() => {
    window.print();
  }, 1000);
}

// Listen for messages from the background script
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.action === 'GENERATE_PDF' && request.data) {
    updateReport(request.data);
  }
}); 