import { FinancialCalculator } from '../financialCalculations';

describe('FinancialCalculator', () => {
  describe('calculateMonthlyMortgage', () => {
    it('should calculate monthly mortgage payment correctly', () => {
      const principal = 300000;
      const annualRate = 4.5;
      const years = 30;
      const payment = FinancialCalculator.calculateMonthlyMortgage(principal, annualRate, years);
      expect(payment).toBeCloseTo(1520.06, 2);
    });

    it('should handle zero interest rate', () => {
      const principal = 300000;
      const annualRate = 0;
      const years = 30;
      const payment = FinancialCalculator.calculateMonthlyMortgage(principal, annualRate, years);
      expect(payment).toBeCloseTo(833.33, 2);
    });
  });

  describe('calculateCapRate', () => {
    it('should calculate cap rate correctly', () => {
      const noi = 24000;
      const propertyValue = 300000;
      const capRate = FinancialCalculator.calculateCapRate(noi, propertyValue);
      expect(capRate).toBe(8);
    });
  });

  describe('calculateCashOnCashReturn', () => {
    it('should calculate cash on cash return correctly', () => {
      const annualCashFlow = 12000;
      const totalInvestment = 100000;
      const cashOnCash = FinancialCalculator.calculateCashOnCashReturn(annualCashFlow, totalInvestment);
      expect(cashOnCash).toBe(12);
    });
  });

  describe('calculateNOI', () => {
    it('should calculate NOI correctly', () => {
      const annualRent = 36000;
      const operatingExpenses = 10000;
      const vacancyLoss = 2000;
      const noi = FinancialCalculator.calculateNOI(annualRent, operatingExpenses, vacancyLoss);
      expect(noi).toBe(24000);
    });
  });

  describe('calculateAllMetrics', () => {
    it('should calculate all metrics correctly', () => {
      const inputs = {
        purchasePrice: 300000,
        downPayment: 60000,
        interestRate: 4.5,
        loanTerm: 30,
        propertyTaxRate: 1.2,
        insuranceCost: 1200,
        maintenanceCost: 200,
        hoaFees: 0,
        vacancyRate: 5,
        monthlyRent: 2500,
        propertyManagementFee: 8,
        closingCosts: 5000,
        appreciationRate: 3,
        utilityCosts: 0,
      };

      const metrics = FinancialCalculator.calculateAllMetrics(inputs);

      expect(metrics.monthlyMortgagePayment).toBeCloseTo(1216.04, 2);
      expect(metrics.monthlyCashFlow).toBeGreaterThan(0);
      expect(metrics.capRate).toBeGreaterThan(0);
      expect(metrics.cashOnCashReturn).toBeGreaterThan(0);
      expect(metrics.netOperatingIncome).toBeGreaterThan(0);
      expect(metrics.breakEvenPoint).toBeGreaterThan(0);
    });
  });
}); 