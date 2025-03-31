interface PropertyData {
  price?: string;
  address?: string;
  squareFootage?: string;
  bedrooms?: string;
  bathrooms?: string;
  propertyType?: string;
  yearBuilt?: string;
  lotSize?: string;
  propertyTaxes?: string;
  hoaFees?: string;
  zestimate?: string;
  rentZestimate?: string;
  timestamp?: string;
  lastSoldPrice?: string;
  lastSoldDate?: string;
  daysOnMarket?: string;
  pricePerSqFt?: string;
  neighborhood?: string;
  zipCode?: string;
  comparables?: Array<{
    address: string;
    price: string;
    squareFootage: string;
    pricePerSqFt: string;
    daysOnMarket: string;
    distance: string;
  }>;
}

class PropertyDataExtractor {
  private async getZillowData(): Promise<PropertyData> {
    const data: PropertyData = {};
    
    try {
      // Basic Property Info
      data.price = await this.getTextContent('[data-testid="price"]');
      data.address = await this.getTextContent('[data-testid="home-details-chip-container"]');
      data.squareFootage = await this.getTextContent('[data-testid="home-facts-item"] [data-testid="bed-bath-beyond"]');
      data.bedrooms = await this.getTextContent('[data-testid="bed-bath-item"] [data-testid="bed-bath-beyond"]');
      data.bathrooms = await this.getTextContent('[data-testid="bed-bath-item"]:nth-child(2) [data-testid="bed-bath-beyond"]');
      data.yearBuilt = await this.getTextContent('[data-testid="facts-card"] span:contains("Year built")');
      data.propertyType = await this.getTextContent('[data-testid="home-facts-item"]:contains("Type:") .Text-c11n-8-84-0__sc-aiai24-0');
      
      // Zestimate and Rent Zestimate
      data.zestimate = await this.getTextContent('[data-testid="zestimate-value"]');
      data.rentZestimate = await this.getTextContent('[data-testid="rental-value"]');
      
      // Additional Property Details
      data.lotSize = await this.getTextContent('[data-testid="facts-card"] span:contains("Lot size")');
      data.hoaFees = await this.getTextContent('[data-testid="facts-card"] span:contains("HOA")');
      data.propertyTaxes = await this.getTextContent('[data-testid="facts-card"] span:contains("Property taxes")');
      data.lastSoldPrice = await this.getTextContent('[data-testid="price-history"] tr:first-child td:nth-child(2)');
      data.lastSoldDate = await this.getTextContent('[data-testid="price-history"] tr:first-child td:first-child');
      data.daysOnMarket = await this.getTextContent('[data-testid="on-market-days"]');
      
      // Calculate price per square foot
      if (data.price && data.squareFootage) {
        const price = parseFloat(data.price.replace(/[^0-9.]/g, ''));
        const sqft = parseFloat(data.squareFootage.replace(/[^0-9.]/g, ''));
        data.pricePerSqFt = (price / sqft).toFixed(2);
      }

      // Extract neighborhood and zip code from address
      if (data.address) {
        const addressParts = data.address.split(',');
        data.neighborhood = addressParts[1]?.trim();
        data.zipCode = addressParts[2]?.trim().match(/\d{5}/)?.[0];
      }

      // Get comparable properties
      data.comparables = await this.getZillowComparables();

    } catch (error) {
      console.error('Error extracting Zillow data:', error);
    }

    return data;
  }

  private async getZillowComparables(): Promise<any[]> {
    const comparables: any[] = [];
    try {
      const compElements = document.querySelectorAll('[data-testid="similar-homes-card"]');
      compElements.forEach(element => {
        const comp = {
          address: this.getTextFromElement(element, '[data-testid="property-card-addr"]'),
          price: this.getTextFromElement(element, '[data-testid="property-card-price"]'),
          squareFootage: this.getTextFromElement(element, '[data-testid="property-card-sqft"]'),
          pricePerSqFt: '',
          daysOnMarket: this.getTextFromElement(element, '[data-testid="property-card-dom"]'),
          distance: this.getTextFromElement(element, '[data-testid="property-card-distance"]')
        };

        // Calculate price per square foot for comparable
        const price = parseFloat(comp.price?.replace(/[^0-9.]/g, '') || '0');
        const sqft = parseFloat(comp.squareFootage?.replace(/[^0-9.]/g, '') || '0');
        if (price && sqft) {
          comp.pricePerSqFt = (price / sqft).toFixed(2);
        }

        comparables.push(comp);
      });
    } catch (error) {
      console.error('Error extracting comparables:', error);
    }
    return comparables;
  }

  private getTextContent(selector: string): Promise<string> {
    return new Promise((resolve) => {
      const element = document.querySelector(selector);
      resolve(element?.textContent?.trim() || '');
    });
  }

  private getTextFromElement(element: Element, selector: string): string {
    return element.querySelector(selector)?.textContent?.trim() || '';
  }

  private async getRealtorData(): Promise<PropertyData> {
    const data: PropertyData = {};
    
    try {
      // Price
      const priceElement = document.querySelector('[data-testid="price-section"]');
      if (priceElement) {
        data.price = priceElement.textContent?.trim();
      }

      // Address
      const addressElement = document.querySelector('[data-testid="address"]');
      if (addressElement) {
        data.address = addressElement.textContent?.trim();
      }

      // Property details
      const detailsContainer = document.querySelector('[data-testid="property-details"]');
      if (detailsContainer) {
        const details = Array.from(detailsContainer.querySelectorAll('[data-testid="property-detail-item"]'));
        details.forEach(detail => {
          const label = detail.querySelector('[data-testid="label"]')?.textContent?.toLowerCase();
          const value = detail.querySelector('[data-testid="value"]')?.textContent?.trim();

          if (label && value) {
            if (label.includes('bed')) data.bedrooms = value;
            if (label.includes('bath')) data.bathrooms = value;
            if (label.includes('sq ft')) data.squareFootage = value;
            if (label.includes('year built')) data.yearBuilt = value;
            if (label.includes('property type')) data.propertyType = value;
            if (label.includes('lot size')) data.lotSize = value;
            if (label.includes('hoa')) data.hoaFees = value;
          }
        });
      }
    } catch (error) {
      console.error('Error extracting Realtor.com data:', error);
    }

    return data;
  }

  private async getRedfinData(): Promise<PropertyData> {
    const data: PropertyData = {};
    
    try {
      // Price
      const priceElement = document.querySelector('.price-section');
      if (priceElement) {
        data.price = priceElement.textContent?.trim();
      }

      // Address
      const addressElement = document.querySelector('.street-address');
      if (addressElement) {
        data.address = addressElement.textContent?.trim();
      }

      // Property details
      const detailsContainer = document.querySelector('.home-main-stats-container');
      if (detailsContainer) {
        const details = Array.from(detailsContainer.querySelectorAll('.stats-row'));
        details.forEach(detail => {
          const label = detail.querySelector('.label')?.textContent?.toLowerCase();
          const value = detail.querySelector('.value')?.textContent?.trim();

          if (label && value) {
            if (label.includes('beds')) data.bedrooms = value;
            if (label.includes('baths')) data.bathrooms = value;
            if (label.includes('sq ft')) data.squareFootage = value;
            if (label.includes('year built')) data.yearBuilt = value;
            if (label.includes('property type')) data.propertyType = value;
            if (label.includes('lot size')) data.lotSize = value;
            if (label.includes('hoa')) data.hoaFees = value;
          }
        });
      }
    } catch (error) {
      console.error('Error extracting Redfin data:', error);
    }

    return data;
  }

  private getLoopNetData(): PropertyData {
    const data: PropertyData = {};
    
    try {
      // Price
      const priceElement = document.querySelector('.price-display');
      if (priceElement) {
        data.price = priceElement.textContent?.trim();
      }

      // Address
      const addressElement = document.querySelector('.property-address');
      if (addressElement) {
        data.address = addressElement.textContent?.trim();
      }

      // Property details
      const detailsContainer = document.querySelector('.property-details');
      if (detailsContainer) {
        const details = Array.from(detailsContainer.querySelectorAll('.detail-row'));
        details.forEach(detail => {
          const label = detail.querySelector('.label')?.textContent?.toLowerCase();
          const value = detail.querySelector('.value')?.textContent?.trim();

          if (label && value) {
            if (label.includes('building size')) data.squareFootage = value;
            if (label.includes('property type')) data.propertyType = value;
            if (label.includes('lot size')) data.lotSize = value;
            if (label.includes('year built')) data.yearBuilt = value;
          }
        });
      }
    } catch (error) {
      console.error('Error extracting LoopNet data:', error);
    }

    return data;
  }

  public async extractData(): Promise<PropertyData> {
    const hostname = window.location.hostname;
    let data: PropertyData = {};
    
    if (hostname.includes('zillow.com')) {
      data = await this.getZillowData();
    } else if (hostname.includes('realtor.com')) {
      data = await this.getRealtorData();
    } else if (hostname.includes('redfin.com')) {
      data = await this.getRedfinData();
    } else if (hostname.includes('loopnet.com')) {
      data = this.getLoopNetData();
    }

    // Add timestamp for caching purposes
    const timestamp = new Date().toISOString();
    return { ...data, timestamp };
  }
}

// Initialize data extraction
const extractor = new PropertyDataExtractor();

// Listen for messages from the popup
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.action === 'extractPropertyData') {
    extractor.extractData().then(data => {
      sendResponse(data);
    });
    return true; // Required for async response
  }
}); 