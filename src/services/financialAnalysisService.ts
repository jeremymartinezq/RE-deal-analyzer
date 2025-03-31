interface FinancialMetrics {
  capRate: number;
  cashOnCashReturn: number;
  netOperatingIncome: number;
  internalRateOfReturn: number;
  returnOnInvestment: number;
  debtServiceCoverageRatio: number;
  grossRentMultiplier: number;
  breakEvenPoint: number;
  cashFlow: {
    monthly: number;
    annual: number;
  };
}

interface PropertyExpenses {
  propertyTax: number;
  insurance: number;
  utilities: number;
  maintenance: number;
  propertyManagement: number;
  vacancy: number;
  capitalExpenditures: number;
  hoaFees?: number;
}

interface MortgageDetails {
  loanAmount: number;
  interestRate: number;
  termYears: number;
  downPayment: number;
  monthlyPayment?: number;
  pmi?: number;
}

interface RentalIncome {
  monthlyRent: number;
  otherIncome: number;
  vacancyRate: number;
}

export class FinancialAnalysisService {
  /**
   * Calculate complete financial analysis for a property
   */
  static analyzeProperty(
    purchasePrice: number,
    expenses: PropertyExpenses,
    mortgage: MortgageDetails,
    income: RentalIncome
  ): FinancialMetrics {
    const monthlyMortgage = this.calculateMortgagePayment(mortgage);
    const noi = this.calculateNOI(income, expenses);
    const cashFlow = this.calculateCashFlow(income, expenses, monthlyMortgage);
    const capRate = this.calculateCapRate(noi, purchasePrice);
    const cocReturn = this.calculateCashOnCashReturn(cashFlow.annual, mortgage.downPayment, purchasePrice);
    const dscr = this.calculateDSCR(noi, monthlyMortgage * 12);
    const grm = this.calculateGRM(purchasePrice, income);
    const breakEven = this.calculateBreakEven(purchasePrice, cashFlow.monthly);
    const irr = this.calculateIRR(purchasePrice, cashFlow.annual, 0.03); // Assuming 3% appreciation

    return {
      capRate,
      cashOnCashReturn: cocReturn,
      netOperatingIncome: noi,
      internalRateOfReturn: irr,
      returnOnInvestment: (cashFlow.annual / purchasePrice) * 100,
      debtServiceCoverageRatio: dscr,
      grossRentMultiplier: grm,
      breakEvenPoint: breakEven,
      cashFlow: {
        monthly: cashFlow.monthly,
        annual: cashFlow.annual
      }
    };
  }

  /**
   * Calculate Net Operating Income
   */
  private static calculateNOI(income: RentalIncome, expenses: PropertyExpenses): number {
    const effectiveGrossIncome = (income.monthlyRent + income.otherIncome) * 
      (1 - income.vacancyRate) * 12;

    const totalExpenses = 
      expenses.propertyTax +
      expenses.insurance +
      expenses.utilities +
      expenses.maintenance +
      expenses.propertyManagement +
      expenses.vacancy +
      expenses.capitalExpenditures +
      (expenses.hoaFees || 0);

    return effectiveGrossIncome - totalExpenses;
  }

  /**
   * Calculate monthly mortgage payment
   */
  private static calculateMortgagePayment(mortgage: MortgageDetails): number {
    const monthlyRate = mortgage.interestRate / 12 / 100;
    const numberOfPayments = mortgage.termYears * 12;
    const principal = mortgage.loanAmount;

    const payment = principal * 
      (monthlyRate * Math.pow(1 + monthlyRate, numberOfPayments)) /
      (Math.pow(1 + monthlyRate, numberOfPayments) - 1);

    // Add PMI if down payment is less than 20%
    const pmi = mortgage.downPayment / mortgage.loanAmount < 0.2 ? 
      (mortgage.loanAmount * 0.01) / 12 : 0;

    return payment + pmi;
  }

  /**
   * Calculate monthly and annual cash flow
   */
  private static calculateCashFlow(
    income: RentalIncome, 
    expenses: PropertyExpenses,
    monthlyMortgage: number
  ): { monthly: number; annual: number } {
    const monthlyIncome = income.monthlyRent + income.otherIncome;
    const monthlyExpenses = 
      (expenses.propertyTax / 12) +
      (expenses.insurance / 12) +
      (expenses.utilities / 12) +
      (expenses.maintenance / 12) +
      (expenses.propertyManagement / 12) +
      (expenses.vacancy / 12) +
      (expenses.capitalExpenditures / 12) +
      ((expenses.hoaFees || 0) / 12);

    const monthlyCashFlow = monthlyIncome - monthlyExpenses - monthlyMortgage;
    return {
      monthly: monthlyCashFlow,
      annual: monthlyCashFlow * 12
    };
  }

  /**
   * Calculate Capitalization Rate
   */
  private static calculateCapRate(noi: number, purchasePrice: number): number {
    return (noi / purchasePrice) * 100;
  }

  /**
   * Calculate Cash on Cash Return
   */
  private static calculateCashOnCashReturn(
    annualCashFlow: number,
    downPayment: number,
    purchasePrice: number
  ): number {
    const totalInvestment = downPayment + (purchasePrice * 0.03); // Including closing costs
    return (annualCashFlow / totalInvestment) * 100;
  }

  /**
   * Calculate Debt Service Coverage Ratio
   */
  private static calculateDSCR(noi: number, annualDebtService: number): number {
    return noi / annualDebtService;
  }

  /**
   * Calculate Gross Rent Multiplier
   */
  private static calculateGRM(purchasePrice: number, income: RentalIncome): number {
    const annualRent = income.monthlyRent * 12;
    return purchasePrice / annualRent;
  }

  /**
   * Calculate Break-even Point (in months)
   */
  private static calculateBreakEven(purchasePrice: number, monthlyCashFlow: number): number {
    return Math.ceil(purchasePrice / monthlyCashFlow);
  }

  /**
   * Calculate Internal Rate of Return
   */
  private static calculateIRR(
    initialInvestment: number,
    annualCashFlow: number,
    appreciationRate: number,
    years: number = 5
  ): number {
    const cashFlows = [-initialInvestment];
    let propertyValue = initialInvestment;

    for (let i = 1; i <= years; i++) {
      propertyValue *= (1 + appreciationRate);
      const yearCashFlow = i === years ? 
        annualCashFlow + propertyValue : // Include property sale in final year
        annualCashFlow;
      cashFlows.push(yearCashFlow);
    }

    // Newton-Raphson method to calculate IRR
    let irr = 0.1; // Initial guess
    const tolerance = 0.0001;
    const maxIterations = 100;

    for (let i = 0; i < maxIterations; i++) {
      const npv = this.calculateNPV(cashFlows, irr);
      const derivativeNPV = this.calculateNPVDerivative(cashFlows, irr);
      
      const newIRR = irr - npv / derivativeNPV;
      
      if (Math.abs(newIRR - irr) < tolerance) {
        return newIRR * 100;
      }
      
      irr = newIRR;
    }

    return irr * 100;
  }

  /**
   * Calculate Net Present Value for IRR calculation
   */
  private static calculateNPV(cashFlows: number[], rate: number): number {
    return cashFlows.reduce((npv, cf, t) => 
      npv + cf / Math.pow(1 + rate, t), 0
    );
  }

  /**
   * Calculate NPV derivative for IRR calculation
   */
  private static calculateNPVDerivative(cashFlows: number[], rate: number): number {
    return cashFlows.reduce((npv, cf, t) => 
      npv - (t * cf) / Math.pow(1 + rate, t + 1), 0
    );
  }

  /**
   * Generate amortization schedule
   */
  static generateAmortizationSchedule(mortgage: MortgageDetails): Array<{
    payment: number;
    principal: number;
    interest: number;
    balance: number;
  }> {
    const monthlyRate = mortgage.interestRate / 12 / 100;
    const numberOfPayments = mortgage.termYears * 12;
    let balance = mortgage.loanAmount;
    const monthlyPayment = this.calculateMortgagePayment(mortgage);
    const schedule = [];

    for (let i = 1; i <= numberOfPayments; i++) {
      const interest = balance * monthlyRate;
      const principal = monthlyPayment - interest;
      balance -= principal;

      schedule.push({
        payment: monthlyPayment,
        principal: principal,
        interest: interest,
        balance: Math.max(0, balance)
      });
    }

    return schedule;
  }

  /**
   * Calculate investment metrics for different scenarios
   */
  static analyzeScenarios(
    baseAnalysis: FinancialMetrics,
    purchasePrice: number,
    expenses: PropertyExpenses,
    mortgage: MortgageDetails,
    income: RentalIncome
  ): {
    conservative: FinancialMetrics;
    moderate: FinancialMetrics;
    optimistic: FinancialMetrics;
  } {
    // Conservative scenario: Higher expenses, lower rent
    const conservativeAnalysis = this.analyzeProperty(
      purchasePrice,
      {
        ...expenses,
        maintenance: expenses.maintenance * 1.2,
        vacancy: expenses.vacancy * 1.2,
        capitalExpenditures: expenses.capitalExpenditures * 1.2
      },
      mortgage,
      {
        ...income,
        monthlyRent: income.monthlyRent * 0.9,
        vacancyRate: income.vacancyRate * 1.2
      }
    );

    // Optimistic scenario: Lower expenses, higher rent
    const optimisticAnalysis = this.analyzeProperty(
      purchasePrice,
      {
        ...expenses,
        maintenance: expenses.maintenance * 0.8,
        vacancy: expenses.vacancy * 0.8,
        capitalExpenditures: expenses.capitalExpenditures * 0.8
      },
      mortgage,
      {
        ...income,
        monthlyRent: income.monthlyRent * 1.1,
        vacancyRate: income.vacancyRate * 0.8
      }
    );

    return {
      conservative: conservativeAnalysis,
      moderate: baseAnalysis,
      optimistic: optimisticAnalysis
    };
  }
} 