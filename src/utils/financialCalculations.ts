export interface FinancialInputs {
  purchasePrice: number;
  downPayment: number;
  interestRate: number;
  loanTerm: number;
  propertyTaxRate: number;
  insuranceCost: number;
  maintenanceCost: number;
  hoaFees: number;
  vacancyRate: number;
  monthlyRent: number;
  propertyManagementFee: number;
  closingCosts: number;
  appreciationRate: number;
  utilityCosts: number;
}

export interface FinancialMetrics {
  monthlyMortgagePayment: number;
  monthlyExpenses: number;
  monthlyCashFlow: number;
  capRate: number;
  cashOnCashReturn: number;
  grossRentMultiplier: number;
  netOperatingIncome: number;
  returnOnInvestment: number;
  breakEvenPoint: number;
  debtServiceCoverageRatio: number;
}

export class FinancialCalculator {
  /**
   * Calculate monthly mortgage payment
   */
  static calculateMonthlyMortgage(principal: number, annualRate: number, years: number): number {
    const monthlyRate = annualRate / 12 / 100;
    const numberOfPayments = years * 12;
    return (
      (principal * monthlyRate * Math.pow(1 + monthlyRate, numberOfPayments)) /
      (Math.pow(1 + monthlyRate, numberOfPayments) - 1)
    );
  }

  /**
   * Calculate Cap Rate
   */
  static calculateCapRate(noi: number, propertyValue: number): number {
    return (noi / propertyValue) * 100;
  }

  /**
   * Calculate Cash on Cash Return
   */
  static calculateCashOnCashReturn(
    annualCashFlow: number,
    totalInvestment: number
  ): number {
    return (annualCashFlow / totalInvestment) * 100;
  }

  /**
   * Calculate Net Operating Income
   */
  static calculateNOI(
    annualRent: number,
    operatingExpenses: number,
    vacancyLoss: number
  ): number {
    return annualRent - operatingExpenses - vacancyLoss;
  }

  /**
   * Calculate Debt Service Coverage Ratio
   */
  static calculateDSCR(noi: number, annualDebtService: number): number {
    return noi / annualDebtService;
  }

  /**
   * Calculate all financial metrics
   */
  static calculateAllMetrics(inputs: FinancialInputs): FinancialMetrics {
    const loanAmount = inputs.purchasePrice - inputs.downPayment;
    const monthlyMortgage = this.calculateMonthlyMortgage(
      loanAmount,
      inputs.interestRate,
      inputs.loanTerm
    );

    const monthlyExpenses =
      (inputs.purchasePrice * inputs.propertyTaxRate) / 12 +
      inputs.insuranceCost / 12 +
      inputs.maintenanceCost +
      inputs.hoaFees +
      inputs.utilityCosts;

    const annualRent = inputs.monthlyRent * 12;
    const vacancyLoss = annualRent * (inputs.vacancyRate / 100);
    const operatingExpenses = monthlyExpenses * 12;
    const noi = this.calculateNOI(annualRent, operatingExpenses, vacancyLoss);

    const monthlyCashFlow =
      inputs.monthlyRent -
      monthlyMortgage -
      monthlyExpenses -
      (inputs.monthlyRent * inputs.propertyManagementFee) / 100;

    const totalInvestment =
      inputs.downPayment + inputs.closingCosts;

    return {
      monthlyMortgagePayment: monthlyMortgage,
      monthlyExpenses: monthlyExpenses,
      monthlyCashFlow: monthlyCashFlow,
      capRate: this.calculateCapRate(noi, inputs.purchasePrice),
      cashOnCashReturn: this.calculateCashOnCashReturn(
        monthlyCashFlow * 12,
        totalInvestment
      ),
      grossRentMultiplier: inputs.purchasePrice / annualRent,
      netOperatingIncome: noi,
      returnOnInvestment:
        ((monthlyCashFlow * 12 + inputs.purchasePrice * (inputs.appreciationRate / 100)) /
          totalInvestment) *
        100,
      breakEvenPoint: totalInvestment / (monthlyCashFlow * 12),
      debtServiceCoverageRatio: this.calculateDSCR(noi, monthlyMortgage * 12),
    };
  }
} 