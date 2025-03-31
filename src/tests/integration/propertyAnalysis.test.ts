import { render, screen, waitFor, fireEvent } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import { APIService } from '../../services/apiService';
import { PerformanceMonitor } from '../../utils/performanceMonitoring';
import { App } from '../../App';

// Mock API service
jest.mock('../../services/apiService');
const mockedAPIService = APIService as jest.Mocked<typeof APIService>;

// Mock performance monitoring
jest.mock('../../utils/performanceMonitoring');
const mockedPerformanceMonitor = PerformanceMonitor as jest.Mocked<typeof PerformanceMonitor>;

describe('Property Analysis Integration', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should complete full property analysis workflow', async () => {
    // Mock API responses
    mockedAPIService.getMarketData.mockResolvedValue({
      medianHomePrice: 300000,
      medianRent: 2000,
      priceToRentRatio: 12.5,
      appreciationRate: 0.05,
      averageDaysOnMarket: 30,
      marketScore: 85
    });

    mockedAPIService.getComparableProperties.mockResolvedValue([
      {
        address: '123 Main St',
        price: 290000,
        squareFootage: 2000,
        pricePerSqFt: 145,
        daysOnMarket: 25
      },
      {
        address: '456 Oak Ave',
        price: 310000,
        squareFootage: 2100,
        pricePerSqFt: 148,
        daysOnMarket: 35
      }
    ]);

    mockedAPIService.getMortgageRates.mockResolvedValue({
      thirtyYearFixed: 3.5,
      fifteenYearFixed: 2.75,
      sevenYearArm: 2.5
    });

    mockedAPIService.getPropertyAnalysis.mockResolvedValue({
      propertyScore: 85,
      riskFactors: ['high_price_to_rent'],
      appreciationForecast: 0.03,
      recommendedActions: ['consider_long_term_hold']
    });

    // Render app
    render(
      <BrowserRouter>
        <App />
      </BrowserRouter>
    );

    // Enter property details
    const addressInput = screen.getByLabelText(/address/i);
    fireEvent.change(addressInput, { target: { value: '123 Test St' } });

    const priceInput = screen.getByLabelText(/price/i);
    fireEvent.change(priceInput, { target: { value: '300000' } });

    const analyzeButton = screen.getByRole('button', { name: /analyze property/i });
    fireEvent.click(analyzeButton);

    // Wait for market data to load
    await waitFor(() => {
      expect(screen.getByText(/median home price/i)).toBeInTheDocument();
      expect(screen.getByText(/\$300,000/)).toBeInTheDocument();
    });

    // Navigate to financial analysis
    const financialTab = screen.getByRole('tab', { name: /financial/i });
    fireEvent.click(financialTab);

    // Check mortgage rates loaded
    await waitFor(() => {
      expect(screen.getByText(/30-year fixed/i)).toBeInTheDocument();
      expect(screen.getByText(/3.5%/)).toBeInTheDocument();
    });

    // Navigate to market data
    const marketTab = screen.getByRole('tab', { name: /market/i });
    fireEvent.click(marketTab);

    // Check comparable properties loaded
    await waitFor(() => {
      expect(screen.getByText(/123 main st/i)).toBeInTheDocument();
      expect(screen.getByText(/456 oak ave/i)).toBeInTheDocument();
    });

    // Navigate to risk analysis
    const riskTab = screen.getByRole('tab', { name: /risk/i });
    fireEvent.click(riskTab);

    // Check risk analysis loaded
    await waitFor(() => {
      expect(screen.getByText(/property score: 85/i)).toBeInTheDocument();
      expect(screen.getByText(/high price to rent/i)).toBeInTheDocument();
    });

    // Verify API calls
    expect(mockedAPIService.getMarketData).toHaveBeenCalledTimes(1);
    expect(mockedAPIService.getComparableProperties).toHaveBeenCalledTimes(1);
    expect(mockedAPIService.getMortgageRates).toHaveBeenCalledTimes(1);
    expect(mockedAPIService.getPropertyAnalysis).toHaveBeenCalledTimes(1);

    // Verify performance monitoring
    expect(mockedPerformanceMonitor.getInstance().trackAPICall).toHaveBeenCalledTimes(4);
  });

  it('should handle API errors gracefully', async () => {
    // Mock API error
    mockedAPIService.getMarketData.mockRejectedValue(new Error('Network error'));

    // Render app
    render(
      <BrowserRouter>
        <App />
      </BrowserRouter>
    );

    // Enter property details and trigger analysis
    const addressInput = screen.getByLabelText(/address/i);
    fireEvent.change(addressInput, { target: { value: '123 Test St' } });
    
    const analyzeButton = screen.getByRole('button', { name: /analyze property/i });
    fireEvent.click(analyzeButton);

    // Check error message displayed
    await waitFor(() => {
      expect(screen.getByText(/error fetching market data/i)).toBeInTheDocument();
    });

    // Verify error tracking
    expect(mockedPerformanceMonitor.getInstance().trackMetric).toHaveBeenCalledWith(
      expect.objectContaining({
        name: 'api_error',
        tags: expect.objectContaining({
          endpoint: expect.stringContaining('/market-data'),
          error: 'Network error'
        })
      })
    );
  });
}); 