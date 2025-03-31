interface PropertyData {
  price?: string;
  address?: string;
  squareFootage?: string;
  bedrooms?: string;
  bathrooms?: string;
  yearBuilt?: string;
  propertyType?: string;
  zestimate?: string;
  rentZestimate?: string;
}

interface PropertyMetrics {
  grossRent: number;
  netRent: number;
  capRate: number;
  cashOnCash: number;
  monthlyExpenses: number;
  monthlyLoanPayment: number;
  cashNeeded: number;
  monthlyNetCashFlow: number;
}

export function calculatePropertyMetrics(propertyData: PropertyData): PropertyMetrics {
  // Parse price and convert to number
  const price = parseFloat(propertyData.price?.replace(/[^0-9.]/g, '') || '0');
  const rentEstimate = parseFloat(propertyData.rentZestimate?.replace(/[^0-9.]/g, '') || '0');
  
  // If no rent estimate is available, estimate based on 1% rule
  const monthlyRent = rentEstimate || (price * 0.01);

  // Calculate monthly expenses (typical percentages based on industry standards)
  const propertyTaxRate = 0.015; // 1.5% annually
  const insuranceRate = 0.005; // 0.5% annually
  const maintenanceRate = 0.05; // 5% of monthly rent
  const vacancyRate = 0.08; // 8% of monthly rent
  const propertyManagementRate = 0.1; // 10% of monthly rent

  // Monthly expense calculations
  const monthlyPropertyTax = (price * propertyTaxRate) / 12;
  const monthlyInsurance = (price * insuranceRate) / 12;
  const monthlyMaintenance = monthlyRent * maintenanceRate;
  const monthlyVacancy = monthlyRent * vacancyRate;
  const monthlyPropertyManagement = monthlyRent * propertyManagementRate;

  // Calculate loan payment (assuming 20% down, 30-year fixed at 7% APR)
  const downPaymentRate = 0.20;
  const downPayment = price * downPaymentRate;
  const loanAmount = price - downPayment;
  const annualInterestRate = 0.07;
  const monthlyInterestRate = annualInterestRate / 12;
  const numberOfPayments = 30 * 12;

  const monthlyLoanPayment = loanAmount * 
    (monthlyInterestRate * Math.pow(1 + monthlyInterestRate, numberOfPayments)) / 
    (Math.pow(1 + monthlyInterestRate, numberOfPayments) - 1);

  // Total monthly expenses
  const totalMonthlyExpenses = 
    monthlyPropertyTax +
    monthlyInsurance +
    monthlyMaintenance +
    monthlyVacancy +
    monthlyPropertyManagement +
    monthlyLoanPayment;

  // Calculate net operating income (NOI)
  const monthlyNOI = monthlyRent - totalMonthlyExpenses + monthlyLoanPayment; // Add back loan payment for NOI
  const annualNOI = monthlyNOI * 12;

  // Calculate cap rate
  const capRate = (annualNOI / price) * 100;

  // Calculate cash needed (down payment + closing costs + reserves)
  const closingCosts = price * 0.03; // Estimated 3% closing costs
  const reserves = totalMonthlyExpenses * 6; // 6 months of expenses
  const totalCashNeeded = downPayment + closingCosts + reserves;

  // Calculate monthly cash flow
  const monthlyCashFlow = monthlyRent - totalMonthlyExpenses;

  // Calculate cash on cash return
  const annualCashFlow = monthlyCashFlow * 12;
  const cashOnCash = (annualCashFlow / totalCashNeeded) * 100;

  return {
    grossRent: monthlyRent,
    netRent: monthlyRent - (monthlyVacancy + monthlyPropertyManagement),
    capRate,
    cashOnCash,
    monthlyExpenses: totalMonthlyExpenses - monthlyLoanPayment,
    monthlyLoanPayment,
    cashNeeded: totalCashNeeded,
    monthlyNetCashFlow: monthlyCashFlow
  };
} 