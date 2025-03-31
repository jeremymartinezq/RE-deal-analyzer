export interface RiskFactor {
  score: number;  // 0-10 scale
  description: string;
  impact: string;
  mitigationStrategies: string[];
}

export interface RiskAnalysis {
  marketRisk: RiskFactor;
  financialRisk: RiskFactor;
  propertyRisk: RiskFactor;
  regulatoryRisk: RiskFactor;
  overallRiskScore: number;
  recommendations: string[];
}

export interface CashFlow {
  monthlyIncome: {
    rent: number;
    other: number;
    total: number;
  };
  monthlyExpenses: {
    mortgage: number;
    propertyTax: number;
    insurance: number;
    utilities: number;
    maintenance: number;
    propertyManagement: number;
    hoa: number;
    vacancy: number;
    capEx: number;
    other: number;
    total: number;
  };
  netOperatingIncome: number;
  cashFlow: number;
}

export interface ReturnMetrics {
  capRate: number;
  cashOnCash: number;
  irr: number;
  roi: number;
  paybackPeriod: number;
  breakEvenPoint: number;
  dscr: number;
  grm: number;
}

export interface AnalysisData {
  purchasePrice: number;
  downPayment: number;
  loanAmount: number;
  interestRate: number;
  loanTerm: number;
  monthlyMortgage: number;
  monthlyIncome: number;
  monthlyExpenses: number;
  noi: number;
  capRate: number;
  cashOnCash: number;
  irr: number;
  risk: RiskAnalysis;
  cashFlow: CashFlow;
  returns: ReturnMetrics;
  projections: {
    appreciationRate: number;
    rentGrowthRate: number;
    expenseGrowthRate: number;
    holdingPeriod: number;
    exitPrice: number;
    totalReturn: number;
  };
  sensitivityAnalysis: {
    vacancyRate: number[];
    interestRate: number[];
    propertyValue: number[];
    rentalIncome: number[];
    operatingExpenses: number[];
  };
  comparativeAnalysis: {
    pricePerSqFt: number;
    rentPerSqFt: number;
    expenseRatio: number;
    marketComparison: {
      price: number;
      rent: number;
      metrics: ReturnMetrics;
    };
  };
} 