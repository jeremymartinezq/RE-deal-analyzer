interface RiskFactor {
  score: number;
  level: 'Low' | 'Medium' | 'High';
  description: string;
  recommendations: string[];
}

interface RiskAnalysis {
  overallRiskScore: number;
  riskLevel: 'Low' | 'Medium' | 'High';
  propertyRisks: {
    condition: RiskFactor;
    age: RiskFactor;
    floodRisk: RiskFactor;
    naturalDisasters: RiskFactor;
  };
  marketRisks: {
    priceVolatility: RiskFactor;
    demandStability: RiskFactor;
    economicDependence: RiskFactor;
    supplyBalance: RiskFactor;
  };
  financialRisks: {
    cashFlow: RiskFactor;
    appreciationPotential: RiskFactor;
    expenseVolatility: RiskFactor;
    tenantStability: RiskFactor;
  };
  neighborhoodRisks: {
    crimeRate: RiskFactor;
    schoolQuality: RiskFactor;
    amenities: RiskFactor;
    development: RiskFactor;
  };
}

export async function analyzePropertyRisks(propertyData: any, marketData: any): Promise<RiskAnalysis> {
  try {
    // Calculate individual risk factors
    const propertyRisks = analyzePropertyConditionRisks(propertyData);
    const marketRisks = analyzeMarketRisks(marketData);
    const financialRisks = analyzeFinancialRisks(propertyData, marketData);
    const neighborhoodRisks = analyzeNeighborhoodRisks(marketData);

    // Calculate overall risk score (0-100)
    const overallRiskScore = calculateOverallRiskScore({
      propertyRisks,
      marketRisks,
      financialRisks,
      neighborhoodRisks
    });

    return {
      overallRiskScore,
      riskLevel: getRiskLevel(overallRiskScore),
      propertyRisks,
      marketRisks,
      financialRisks,
      neighborhoodRisks
    };
  } catch (error) {
    console.error('Error analyzing property risks:', error);
    throw error;
  }
}

function analyzePropertyConditionRisks(propertyData: any) {
  const yearBuilt = parseInt(propertyData.yearBuilt || new Date().getFullYear());
  const currentYear = new Date().getFullYear();
  const age = currentYear - yearBuilt;

  return {
    condition: {
      score: calculateConditionScore(propertyData),
      level: 'Medium',
      description: 'Property condition based on age and maintenance history',
      recommendations: [
        'Schedule a professional property inspection',
        'Review maintenance records and history',
        'Budget for potential repairs and updates'
      ]
    },
    age: {
      score: Math.max(0, 100 - (age * 2)),
      level: age < 20 ? 'Low' : age < 40 ? 'Medium' : 'High',
      description: `Property is ${age} years old`,
      recommendations: [
        'Consider major system replacement timelines',
        'Plan for age-related maintenance',
        'Budget for modernization costs'
      ]
    },
    floodRisk: {
      score: calculateFloodRiskScore(propertyData),
      level: 'Low',
      description: 'Flood risk based on location and elevation',
      recommendations: [
        'Review flood zone maps',
        'Consider flood insurance costs',
        'Evaluate drainage systems'
      ]
    },
    naturalDisasters: {
      score: calculateNaturalDisasterRiskScore(propertyData),
      level: 'Low',
      description: 'Risk of earthquakes, hurricanes, and other natural disasters',
      recommendations: [
        'Review disaster history in the area',
        'Verify insurance coverage for natural disasters',
        'Assess building resilience to local risks'
      ]
    }
  };
}

function analyzeMarketRisks(marketData: any) {
  return {
    priceVolatility: {
      score: calculatePriceVolatilityScore(marketData),
      level: 'Medium',
      description: 'Market price stability and volatility assessment',
      recommendations: [
        'Monitor local market trends',
        'Diversify investment portfolio',
        'Set price adjustment strategies'
      ]
    },
    demandStability: {
      score: calculateDemandStabilityScore(marketData),
      level: 'Medium',
      description: 'Long-term demand stability in the market',
      recommendations: [
        'Track population growth trends',
        'Monitor job market changes',
        'Assess rental demand patterns'
      ]
    },
    economicDependence: {
      score: calculateEconomicDependenceScore(marketData),
      level: 'Medium',
      description: 'Market dependence on specific industries or employers',
      recommendations: [
        'Research major employers in the area',
        'Evaluate economic diversity',
        'Monitor industry trends'
      ]
    },
    supplyBalance: {
      score: calculateSupplyBalanceScore(marketData),
      level: 'Low',
      description: 'Balance between housing supply and demand',
      recommendations: [
        'Track new construction permits',
        'Monitor inventory levels',
        'Assess competition from new developments'
      ]
    }
  };
}

function analyzeFinancialRisks(propertyData: any, marketData: any) {
  return {
    cashFlow: {
      score: calculateCashFlowRiskScore(propertyData, marketData),
      level: 'Medium',
      description: 'Cash flow stability and risk assessment',
      recommendations: [
        'Maintain cash reserves',
        'Implement strict tenant screening',
        'Monitor expense trends'
      ]
    },
    appreciationPotential: {
      score: calculateAppreciationRiskScore(marketData),
      level: 'Low',
      description: 'Long-term appreciation potential and risks',
      recommendations: [
        'Research development plans',
        'Monitor market appreciation trends',
        'Plan for value-add improvements'
      ]
    },
    expenseVolatility: {
      score: calculateExpenseRiskScore(propertyData),
      level: 'Medium',
      description: 'Stability and predictability of expenses',
      recommendations: [
        'Budget for maintenance reserves',
        'Monitor utility costs',
        'Plan for tax assessments'
      ]
    },
    tenantStability: {
      score: calculateTenantStabilityRiskScore(marketData),
      level: 'Medium',
      description: 'Tenant turnover and vacancy risk',
      recommendations: [
        'Implement tenant retention strategies',
        'Monitor local employment trends',
        'Maintain competitive amenities'
      ]
    }
  };
}

function analyzeNeighborhoodRisks(marketData: any) {
  return {
    crimeRate: {
      score: calculateCrimeRiskScore(marketData),
      level: 'Medium',
      description: 'Crime rate and safety assessment',
      recommendations: [
        'Review crime statistics trends',
        'Evaluate security features',
        'Consider security system installation'
      ]
    },
    schoolQuality: {
      score: calculateSchoolQualityScore(marketData),
      level: 'Low',
      description: 'School district quality and stability',
      recommendations: [
        'Monitor school ratings',
        'Track school funding',
        'Assess impact on property value'
      ]
    },
    amenities: {
      score: calculateAmenitiesScore(marketData),
      level: 'Low',
      description: 'Access to amenities and services',
      recommendations: [
        'Monitor new business development',
        'Track infrastructure improvements',
        'Assess transportation access'
      ]
    },
    development: {
      score: calculateDevelopmentScore(marketData),
      level: 'Low',
      description: 'Neighborhood development and growth potential',
      recommendations: [
        'Research zoning changes',
        'Monitor development projects',
        'Track property value trends'
      ]
    }
  };
}

// Helper functions for risk calculations
function calculateConditionScore(propertyData: any): number {
  const baseScore = 80;
  const yearBuilt = parseInt(propertyData.yearBuilt || new Date().getFullYear());
  const age = new Date().getFullYear() - yearBuilt;
  return Math.max(0, baseScore - (age * 0.5));
}

function calculateFloodRiskScore(propertyData: any): number {
  // Use FEMA flood zone data if available
  const floodZone = propertyData.floodZone || 'X';
  const zoneScores: { [key: string]: number } = {
    'X': 90, // Minimal flood risk
    'B': 80, // Moderate flood risk
    'C': 70, // Moderate flood risk
    'A': 40, // High flood risk
    'AE': 30, // High flood risk
    'V': 20, // Very high flood risk
    'VE': 10 // Very high flood risk
  };
  return zoneScores[floodZone] || 70;
}

function calculateNaturalDisasterRiskScore(propertyData: any): number {
  const location = propertyData.location || {};
  let score = 100;

  // Earthquake risk
  if (location.seismicZone) {
    score -= location.seismicZone * 10;
  }

  // Hurricane risk (based on coastal proximity)
  if (location.coastalDistance && location.coastalDistance < 50) {
    score -= Math.max(0, (50 - location.coastalDistance) / 2);
  }

  // Wildfire risk
  if (location.fireRiskLevel) {
    const fireRiskScores: { [key: string]: number } = {
      'Low': 0,
      'Moderate': 10,
      'High': 20,
      'Very High': 30,
      'Extreme': 40
    };
    score -= fireRiskScores[location.fireRiskLevel] || 0;
  }

  return Math.max(0, score);
}

function calculatePriceVolatilityScore(marketData: any): number {
  const volatility = marketData?.priceVolatility || marketData?.yearOverYearAppreciation || 5;
  const medianVolatility = 5; // Typical market volatility
  const score = 100 - Math.abs(volatility - medianVolatility) * 10;
  return Math.max(0, Math.min(100, score));
}

function calculateDemandStabilityScore(marketData: any): number {
  const factors = {
    vacancyRate: marketData?.rentalVacancyRate || 5,
    daysOnMarket: marketData?.medianDaysOnMarket || 30,
    populationGrowth: marketData?.populationGrowth || 1,
    employmentGrowth: marketData?.employmentGrowth || 1
  };

  let score = 100;
  
  // Vacancy rate impact (ideal is 5%)
  score -= Math.abs(factors.vacancyRate - 5) * 5;
  
  // Days on market impact (ideal is 30 days)
  score -= Math.abs(factors.daysOnMarket - 30) * 0.5;
  
  // Population growth impact
  score += factors.populationGrowth * 5;
  
  // Employment growth impact
  score += factors.employmentGrowth * 5;

  return Math.max(0, Math.min(100, score));
}

function calculateEconomicDependenceScore(marketData: any): number {
  const factors = {
    majorEmployers: marketData?.majorEmployers || 1,
    industryDiversity: marketData?.industryDiversity || 0.5,
    employmentGrowth: marketData?.employmentGrowth || 1,
    unemploymentRate: marketData?.unemploymentRate || 5
  };

  let score = 70; // Base score

  // Major employers impact
  score += Math.min(20, factors.majorEmployers * 5);

  // Industry diversity impact (0-1 scale)
  score += factors.industryDiversity * 20;

  // Employment growth impact
  score += factors.employmentGrowth * 5;

  // Unemployment rate impact (ideal is 4-5%)
  score -= Math.abs(factors.unemploymentRate - 4.5) * 3;

  return Math.max(0, Math.min(100, score));
}

function calculateSupplyBalanceScore(marketData: any): number {
  const factors = {
    monthsOfInventory: marketData?.monthsOfInventory || 6,
    newConstructionRate: marketData?.newConstructionRate || 2,
    absorptionRate: marketData?.absorptionRate || 20,
    permitActivity: marketData?.permitActivity || 100
  };

  let score = 100;

  // Months of inventory impact (ideal is 6 months)
  score -= Math.abs(factors.monthsOfInventory - 6) * 5;

  // New construction rate impact
  if (factors.newConstructionRate > 5) {
    score -= (factors.newConstructionRate - 5) * 4;
  }

  // Absorption rate impact
  if (factors.absorptionRate < 15) {
    score -= (15 - factors.absorptionRate) * 2;
  }

  // Permit activity impact (normalized to 100)
  score += (factors.permitActivity - 100) * 0.1;

  return Math.max(0, Math.min(100, score));
}

function calculateCashFlowRiskScore(propertyData: any, marketData: any): number {
  const rentEstimate = parseFloat(propertyData.rentZestimate?.replace(/[^0-9.]/g, '') || '0');
  const price = parseFloat(propertyData.price?.replace(/[^0-9.]/g, '') || '0');
  const expenses = calculateMonthlyExpenses(propertyData, price);
  const monthlyMortgage = calculateMonthlyMortgage(price);
  
  const monthlyCashFlow = rentEstimate - expenses - monthlyMortgage;
  const cashFlowRatio = (monthlyCashFlow * 12) / price * 100;

  // Score based on cash flow ratio
  let score = 50 + (cashFlowRatio * 10);

  // Adjust for market factors
  if (marketData?.rentalDemand) score += marketData.rentalDemand * 5;
  if (marketData?.rentalGrowth) score += marketData.rentalGrowth * 5;

  return Math.max(0, Math.min(100, score));
}

function calculateMonthlyExpenses(propertyData: any, price: number): number {
  const propertyTax = (price * 0.015) / 12; // 1.5% annual property tax
  const insurance = (price * 0.005) / 12; // 0.5% annual insurance
  const maintenance = price * 0.0025; // 3% annual maintenance
  const propertyManagement = parseFloat(propertyData.rentZestimate?.replace(/[^0-9.]/g, '') || '0') * 0.1; // 10% of rent
  const utilities = 200; // Base utility costs
  const hoaFees = parseFloat(propertyData.hoaFees?.replace(/[^0-9.]/g, '') || '0');

  return propertyTax + insurance + maintenance + propertyManagement + utilities + hoaFees;
}

function calculateMonthlyMortgage(price: number): number {
  const downPayment = price * 0.2; // 20% down payment
  const loanAmount = price - downPayment;
  const annualRate = 0.07; // 7% interest rate
  const monthlyRate = annualRate / 12;
  const terms = 30 * 12; // 30-year mortgage

  return loanAmount * (monthlyRate * Math.pow(1 + monthlyRate, terms)) / (Math.pow(1 + monthlyRate, terms) - 1);
}

function calculateAppreciationRiskScore(marketData: any): number {
  const factors = {
    historicalAppreciation: marketData?.yearOverYearAppreciation || 3,
    projectedGrowth: marketData?.projectedGrowth || 2,
    marketCycle: marketData?.marketCycle || 'neutral',
    economicIndicators: marketData?.economicIndicators || 'stable'
  };

  let score = 60; // Base score

  // Historical appreciation impact
  if (factors.historicalAppreciation > 0) {
    score += Math.min(20, factors.historicalAppreciation * 4);
  } else {
    score += Math.max(-30, factors.historicalAppreciation * 6);
  }

  // Projected growth impact
  score += factors.projectedGrowth * 5;

  // Market cycle impact
  const cycleScores: { [key: string]: number } = {
    'growth': 10,
    'neutral': 0,
    'decline': -10
  };
  score += cycleScores[factors.marketCycle] || 0;

  // Economic indicators impact
  const economicScores: { [key: string]: number } = {
    'strong': 10,
    'stable': 5,
    'weak': -5,
    'declining': -10
  };
  score += economicScores[factors.economicIndicators] || 0;

  return Math.max(0, Math.min(100, score));
}

function calculateExpenseRiskScore(propertyData: any): number {
  const age = parseInt(propertyData.yearBuilt || new Date().getFullYear()) - new Date().getFullYear();
  const propertyType = propertyData.propertyType || 'single_family';
  const hoaFees = parseFloat(propertyData.hoaFees?.replace(/[^0-9.]/g, '') || '0');
  const price = parseFloat(propertyData.price?.replace(/[^0-9.]/g, '') || '0');

  let score = 100;

  // Age impact
  score -= Math.max(0, -age * 0.5);

  // Property type impact
  const typeScores: { [key: string]: number } = {
    'single_family': 0,
    'multi_family': -5,
    'condo': -10,
    'townhouse': -5
  };
  score += typeScores[propertyType] || 0;

  // HOA fees impact
  const hoaRatio = (hoaFees * 12) / price * 100;
  score -= hoaRatio * 5;

  // Maintenance requirements
  if (propertyData.maintenanceLevel) {
    const maintenanceScores: { [key: string]: number } = {
      'low': 0,
      'medium': -10,
      'high': -20
    };
    score += maintenanceScores[propertyData.maintenanceLevel] || 0;
  }

  return Math.max(0, Math.min(100, score));
}

function calculateTenantStabilityRiskScore(marketData: any): number {
  const vacancyRate = marketData?.rentalVacancyRate || 5;
  return Math.max(0, 100 - (vacancyRate * 8));
}

function calculateCrimeRiskScore(marketData: any): number {
  const crimeScore = marketData?.crimeRate?.score || 'C';
  const scoreMap: { [key: string]: number } = { 'A': 90, 'B': 75, 'C': 60, 'D': 45, 'F': 30 };
  return scoreMap[crimeScore] || 60;
}

function calculateSchoolQualityScore(marketData: any): number {
  return marketData?.schoolRating ? marketData.schoolRating * 10 : 70;
}

function calculateAmenitiesScore(marketData: any): number {
  return marketData?.walkScore || 70;
}

function calculateDevelopmentScore(marketData: any): number {
  return marketData?.marketHealthIndex || 70;
}

function calculateOverallRiskScore(risks: any): number {
  const weights = {
    property: 0.25,
    market: 0.25,
    financial: 0.3,
    neighborhood: 0.2
  };

  const propertyScore = Object.values(risks.propertyRisks).reduce((acc: number, risk: any) => acc + risk.score, 0) / 4;
  const marketScore = Object.values(risks.marketRisks).reduce((acc: number, risk: any) => acc + risk.score, 0) / 4;
  const financialScore = Object.values(risks.financialRisks).reduce((acc: number, risk: any) => acc + risk.score, 0) / 4;
  const neighborhoodScore = Object.values(risks.neighborhoodRisks).reduce((acc: number, risk: any) => acc + risk.score, 0) / 4;

  return (
    propertyScore * weights.property +
    marketScore * weights.market +
    financialScore * weights.financial +
    neighborhoodScore * weights.neighborhood
  );
}

function getRiskLevel(score: number): 'Low' | 'Medium' | 'High' {
  if (score >= 75) return 'Low';
  if (score >= 50) return 'Medium';
  return 'High';
} 