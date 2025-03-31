import { RateLimiter } from '../utils/rateLimiter';
import { Cache } from '../utils/cache';

interface MarketData {
  medianHomePrice: number;
  medianRent: number;
  priceToRentRatio: number;
  appreciationRate: number;
  averageDaysOnMarket: number;
  marketScore: number;
}

interface PropertyComps {
  address: string;
  price: number;
  squareFootage: number;
  pricePerSqFt: number;
  daysOnMarket: number;
  dateOfSale?: string;
}

export class APIService {
  private static API_KEYS = {
    rapidapi: process.env.REACT_APP_RAPIDAPI_KEY || '',
    walkscore: process.env.REACT_APP_WALKSCORE_KEY || '',
    attomData: process.env.REACT_APP_ATTOMDATA_KEY || '',
    realtor: process.env.REACT_APP_REALTOR_KEY || '',
    zillow: process.env.REACT_APP_ZILLOW_KEY || ''
  };

  private static cache = new Cache();
  private static rateLimiter = new RateLimiter({
    maxRequests: 10,
    perMilliseconds: 1000
  });

  private static async retryWithBackoff<T>(fn: () => Promise<T>, maxRetries = 3): Promise<T> {
    for (let i = 0; i < maxRetries; i++) {
      try {
        await this.rateLimiter.waitForToken();
        return await fn();
      } catch (error) {
        if (i === maxRetries - 1) throw error;
        await new Promise(resolve => setTimeout(resolve, Math.pow(2, i) * 1000));
      }
    }
    throw new Error('Max retries exceeded');
  }

  /**
   * Set the API key
   */
  static setApiKey(apiKey: string) {
    this.API_KEYS.rapidapi = apiKey;
  }

  /**
   * Get market data for a specific location
   */
  static async getMarketData(zipCode: string): Promise<MarketData> {
    const cacheKey = `market-data-${zipCode}`;
    const cachedData = this.cache.get<MarketData>(cacheKey);
    if (cachedData) return cachedData;

    try {
      // Get data from ATTOM API
      const attomData = await this.retryWithBackoff(async () => {
        const response = await fetch(
          `https://api.gateway.attomdata.com/propertyapi/v1.0.0/avm/detail/${zipCode}`,
          {
            headers: {
              'apikey': this.API_KEYS.attomData,
              'Accept': 'application/json'
            }
          }
        );
        if (!response.ok) throw new Error('ATTOM API request failed');
        return await response.json();
      });

      // Get Realtor.com data
      const realtorData = await this.retryWithBackoff(async () => {
        const response = await fetch(
          `https://realtor.p.rapidapi.com/locations/v2/auto-complete?input=${zipCode}`,
          {
            headers: {
              'x-rapidapi-host': 'realtor.p.rapidapi.com',
              'x-rapidapi-key': this.API_KEYS.rapidapi
            }
          }
        );
        if (!response.ok) throw new Error('Realtor API request failed');
        return await response.json();
      });

      // Combine and process data
      const marketData: MarketData = {
        medianHomePrice: attomData.property[0].avm.amount.value,
        medianRent: realtorData.rent.median,
        priceToRentRatio: attomData.property[0].avm.amount.value / (realtorData.rent.median * 12),
        appreciationRate: attomData.property[0].avm.percentile.forecast,
        averageDaysOnMarket: realtorData.market.averageDaysOnMarket,
        marketScore: this.calculateMarketScore(attomData, realtorData)
      };

      this.cache.set(cacheKey, marketData, 60 * 60); // Cache for 1 hour
      return marketData;
    } catch (error) {
      console.error('Error fetching market data:', error);
      throw new APIError('Failed to fetch market data', { cause: error });
    }
  }

  /**
   * Get comparable properties
   */
  static async getComparableProperties(
    address: string,
    propertyType: string,
    radius: number
  ): Promise<PropertyComps[]> {
    try {
      // Get Zillow comparables
      const zillowComps = await this.retryWithBackoff(async () => {
        const response = await fetch(
          `https://api.bridgedataoutput.com/api/v2/zestimates/comps?access_token=${this.API_KEYS.zillow}&address=${encodeURIComponent(address)}&radius=${radius}`,
          {
            headers: { 'Accept': 'application/json' }
          }
        );
        if (!response.ok) throw new Error('Zillow API request failed');
        return await response.json();
      });

      // Get Realtor.com comparables
      const realtorComps = await this.retryWithBackoff(async () => {
        const response = await fetch(
          `https://realtor.p.rapidapi.com/properties/v2/list-similar?property_id=${address}&limit=10`,
          {
            headers: {
              'x-rapidapi-host': 'realtor.p.rapidapi.com',
              'x-rapidapi-key': this.API_KEYS.rapidapi
            }
          }
        );
        if (!response.ok) throw new Error('Realtor API request failed');
        return await response.json();
      });

      // Combine and normalize data
      const properties = this.normalizeComparableProperties([...zillowComps.properties, ...realtorComps.properties]);
      return properties;
    } catch (error) {
      console.error('Error fetching comparable properties:', error);
      throw new APIError('Failed to fetch comparable properties', { cause: error });
    }
  }

  /**
   * Get current mortgage rates
   */
  static async getMortgageRates(): Promise<{
    thirtyYearFixed: number;
    fifteenYearFixed: number;
    sevenYearArm: number;
  }> {
    try {
      const response = await fetch(
        `https://api.example.com/v1/mortgage-rates`,
        {
          headers: {
            'Authorization': `Bearer ${this.API_KEYS.rapidapi}`,
            'Content-Type': 'application/json'
          }
        }
      );

      if (!response.ok) {
        throw new Error('Failed to fetch mortgage rates');
      }

      return await response.json();
    } catch (error) {
      console.error('Error fetching mortgage rates:', error);
      throw error;
    }
  }

  /**
   * Get AI-powered property score and risk analysis
   */
  static async getPropertyAnalysis(
    propertyData: any,
    marketData: MarketData
  ): Promise<{
    propertyScore: number;
    riskFactors: string[];
    appreciationForecast: number;
    recommendedActions: string[];
  }> {
    try {
      const response = await fetch(
        `https://api.example.com/v1/ai-analysis`,
        {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${this.API_KEYS.rapidapi}`,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            propertyData,
            marketData
          })
        }
      );

      if (!response.ok) {
        throw new Error('Failed to fetch property analysis');
      }

      return await response.json();
    } catch (error) {
      console.error('Error fetching property analysis:', error);
      throw error;
    }
  }

  static async getWalkScore(lat: string, lon: string, address: string): Promise<any> {
    try {
      return await this.retryWithBackoff(async () => {
        const response = await fetch(
          `https://api.walkscore.com/score?format=json&address=${encodeURIComponent(address)}&lat=${lat}&lon=${lon}&wsapikey=${this.API_KEYS.walkscore}`,
          {
            headers: { 'Accept': 'application/json' }
          }
        );
        if (!response.ok) throw new Error('WalkScore API request failed');
        return await response.json();
      });
    } catch (error) {
      console.error('Error fetching walk score:', error);
      throw new APIError('Failed to fetch walk score', { cause: error });
    }
  }

  private static calculateMarketScore(attomData: any, realtorData: any): number {
    // Implement market score calculation based on various factors
    const priceGrowth = attomData.property[0].avm.percentile.forecast;
    const daysOnMarket = realtorData.market.averageDaysOnMarket;
    const demandScore = Math.max(0, 100 - daysOnMarket);
    const appreciationScore = priceGrowth * 20;
    
    return Math.min(100, (demandScore + appreciationScore) / 2);
  }

  private static normalizeComparableProperties(properties: any[]): PropertyComps[] {
    return properties.map(prop => ({
      address: prop.address || prop.location.address,
      price: prop.price || prop.listPrice,
      squareFootage: prop.squareFootage || prop.building.size.value,
      bedrooms: prop.bedrooms || prop.building.rooms.bedrooms,
      bathrooms: prop.bathrooms || prop.building.rooms.bathrooms,
      yearBuilt: prop.yearBuilt || prop.building.yearBuilt,
      pricePerSqFt: (prop.price || prop.listPrice) / (prop.squareFootage || prop.building.size.value),
      daysOnMarket: prop.daysOnMarket || 0
    }));
  }
}

class APIError extends Error {
  constructor(message: string, public details?: any) {
    super(message);
    this.name = 'APIError';
  }
} 