import { APIService } from '../services/apiService';
import { Cache } from '../utils/cache';
import { RateLimiter } from '../utils/rateLimiter';

// Mock fetch
global.fetch = jest.fn();

describe('APIService', () => {
  beforeEach(() => {
    // Clear all mocks before each test
    jest.clearAllMocks();
    // Reset API key
    APIService.setApiKey('test-api-key');
  });

  describe('getMarketData', () => {
    it('should fetch market data successfully', async () => {
      const mockResponse = {
        medianHomePrice: 300000,
        medianRent: 2000,
        priceToRentRatio: 12.5,
        appreciationRate: 0.05,
        averageDaysOnMarket: 30,
        marketScore: 85
      };

      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: async () => mockResponse
      });

      const result = await APIService.getMarketData('12345');
      expect(result).toEqual(mockResponse);
      expect(global.fetch).toHaveBeenCalledWith(
        expect.stringContaining('/market-data/12345'),
        expect.objectContaining({
          headers: {
            'Authorization': 'Bearer test-api-key',
            'Content-Type': 'application/json'
          }
        })
      );
    });

    it('should return cached data if available', async () => {
      const mockResponse = {
        medianHomePrice: 300000,
        medianRent: 2000
      };

      // First call to populate cache
      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: async () => mockResponse
      });

      await APIService.getMarketData('12345');
      
      // Second call should use cache
      const result = await APIService.getMarketData('12345');
      
      expect(result).toEqual(mockResponse);
      expect(global.fetch).toHaveBeenCalledTimes(1);
    });

    it('should retry on failure', async () => {
      (global.fetch as jest.Mock)
        .mockRejectedValueOnce(new Error('Network error'))
        .mockRejectedValueOnce(new Error('Network error'))
        .mockResolvedValueOnce({
          ok: true,
          json: async () => ({ medianHomePrice: 300000 })
        });

      const result = await APIService.getMarketData('12345');
      expect(result).toEqual({ medianHomePrice: 300000 });
      expect(global.fetch).toHaveBeenCalledTimes(3);
    });

    it('should throw APIError on failure after max retries', async () => {
      (global.fetch as jest.Mock).mockRejectedValue(new Error('Network error'));

      await expect(APIService.getMarketData('12345')).rejects.toThrow('Unknown error occurred');
      expect(global.fetch).toHaveBeenCalledTimes(3);
    });
  });

  describe('getComparableProperties', () => {
    it('should fetch comparable properties successfully', async () => {
      const mockResponse = [
        {
          address: '123 Main St',
          price: 300000,
          squareFootage: 2000,
          pricePerSqFt: 150,
          daysOnMarket: 30
        }
      ];

      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: async () => mockResponse
      });

      const result = await APIService.getComparableProperties('123 Main St', 'single_family', 5);
      expect(result).toEqual(mockResponse);
      expect(global.fetch).toHaveBeenCalledWith(
        expect.stringContaining('/comps'),
        expect.objectContaining({
          method: 'POST',
          body: JSON.stringify({
            address: '123 Main St',
            propertyType: 'single_family',
            radius: 5
          })
        })
      );
    });
  });

  describe('getMortgageRates', () => {
    it('should fetch mortgage rates successfully', async () => {
      const mockResponse = {
        thirtyYearFixed: 3.5,
        fifteenYearFixed: 2.75,
        sevenYearArm: 2.5
      };

      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: async () => mockResponse
      });

      const result = await APIService.getMortgageRates();
      expect(result).toEqual(mockResponse);
    });
  });

  describe('getPropertyAnalysis', () => {
    it('should fetch property analysis successfully', async () => {
      const mockResponse = {
        propertyScore: 85,
        riskFactors: ['high_price_to_rent'],
        appreciationForecast: 0.03,
        recommendedActions: ['consider_long_term_hold']
      };

      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: async () => mockResponse
      });

      const result = await APIService.getPropertyAnalysis(
        { price: 300000 },
        { medianHomePrice: 280000 }
      );
      expect(result).toEqual(mockResponse);
    });
  });
}); 