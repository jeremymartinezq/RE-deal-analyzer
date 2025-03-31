import {
  getPropertyValuation,
  getRentalComps,
  getWalkScore,
  getAreaStats,
  getCrimeData,
  getSchoolData
} from './realEstateAPI';

interface MarketData {
  medianHomeValue: number;
  medianRent: number;
  priceToRentRatio: number;
  yearOverYearAppreciation: number;
  medianDaysOnMarket: number;
  marketHealthIndex: number;
  rentalVacancyRate: number;
  populationGrowth: number;
  employmentGrowth: number;
  medianIncome: number;
  crimeRate: {
    score: string;
    details: {
      violent: number;
      property: number;
    };
  };
  schoolRating: number;
  walkScore: number;
  transitScore: number;
}

export async function getMarketData(zipCode: string, address?: string, lat?: string, lon?: string): Promise<MarketData> {
  try {
    // Ensure we have required parameters
    if (!zipCode) {
      throw new Error('Zip code is required for market data analysis');
    }

    // Fetch all data in parallel with error handling for each request
    const [
      propertyDataResponse,
      rentalDataResponse,
      walkScoreResponse,
      areaStatsResponse,
      crimeStatsResponse,
      schoolStatsResponse
    ] = await Promise.allSettled([
      getPropertyValuation(address || '', zipCode),
      getRentalComps(address || '', zipCode),
      lat && lon ? getWalkScore(lat, lon, address || '') : Promise.resolve(null),
      getAreaStats(zipCode),
      getCrimeData(zipCode),
      lat && lon ? getSchoolData(lat, lon) : Promise.resolve(null)
    ]);

    // Extract data with fallbacks
    const propertyData = propertyDataResponse.status === 'fulfilled' ? propertyDataResponse.value : null;
    const rentalData = rentalDataResponse.status === 'fulfilled' ? rentalDataResponse.value : null;
    const walkScoreData = walkScoreResponse.status === 'fulfilled' ? walkScoreResponse.value : null;
    const areaStats = areaStatsResponse.status === 'fulfilled' ? areaStatsResponse.value : null;
    const crimeStats = crimeStatsResponse.status === 'fulfilled' ? crimeStatsResponse.value : null;
    const schoolStats = schoolStatsResponse.status === 'fulfilled' ? schoolStatsResponse.value : null;

    // Process property valuation data with fallbacks
    const medianHomeValue = propertyData?.price || 0;
    const yearOverYearAppreciation = propertyData?.appreciationRate || 0;

    // Process rental data with fallbacks
    const rentalComps = rentalData?.results || [];
    const medianRent = calculateMedianRent(rentalComps);
    const priceToRentRatio = medianHomeValue > 0 && medianRent > 0 ? medianHomeValue / (medianRent * 12) : 0;
    const rentalVacancyRate = calculateVacancyRate(areaStats);

    // Process area statistics with fallbacks
    const {
      populationGrowth,
      employmentGrowth,
      medianIncome,
      medianDaysOnMarket
    } = processAreaStats(areaStats);

    // Calculate market health index
    const marketHealthIndex = calculateMarketHealthIndex({
      appreciationRate: yearOverYearAppreciation,
      daysOnMarket: medianDaysOnMarket,
      priceToRent: priceToRentRatio,
      employmentGrowth,
      populationGrowth
    });

    // Process crime data with fallbacks
    const crimeRate = processCrimeStats(crimeStats);

    // Process school data with fallbacks
    const schoolRating = processSchoolData(schoolStats);

    // Process walk score data with fallbacks
    const { walkScore = 0, transitScore = 0 } = walkScoreData || {};

    return {
      medianHomeValue,
      medianRent,
      priceToRentRatio,
      yearOverYearAppreciation,
      medianDaysOnMarket,
      marketHealthIndex,
      rentalVacancyRate,
      populationGrowth,
      employmentGrowth,
      medianIncome,
      crimeRate,
      schoolRating,
      walkScore,
      transitScore,
    };
  } catch (error) {
    console.error('Error fetching market data:', error);
    // Return default values instead of throwing
    return {
      medianHomeValue: 0,
      medianRent: 0,
      priceToRentRatio: 0,
      yearOverYearAppreciation: 0,
      medianDaysOnMarket: 0,
      marketHealthIndex: 0,
      rentalVacancyRate: 0,
      populationGrowth: 0,
      employmentGrowth: 0,
      medianIncome: 0,
      crimeRate: {
        score: 'N/A',
        details: {
          violent: 0,
          property: 0
        }
      },
      schoolRating: 0,
      walkScore: 0,
      transitScore: 0,
    };
  }
}

function calculateMedianRent(rentalComps: any[]): number {
  if (!rentalComps.length) return 0;
  const rents = rentalComps.map(comp => comp.price).sort((a, b) => a - b);
  const mid = Math.floor(rents.length / 2);
  return rents.length % 2 ? rents[mid] : (rents[mid - 1] + rents[mid]) / 2;
}

function calculateVacancyRate(areaStats: any): number {
  // Extract vacancy rate from area stats
  return areaStats.vacancy_rate || 5; // Default to 5% if not available
}

function processAreaStats(areaStats: any) {
  return {
    populationGrowth: areaStats.population_growth || 0,
    employmentGrowth: areaStats.employment_growth || 0,
    medianIncome: areaStats.median_income || 0,
    medianDaysOnMarket: areaStats.median_dom || 30
  };
}

function calculateMarketHealthIndex(params: {
  appreciationRate: number;
  daysOnMarket: number;
  priceToRent: number;
  employmentGrowth: number;
  populationGrowth: number;
}): number {
  // Weight factors for each component
  const weights = {
    appreciation: 0.3,
    daysOnMarket: 0.2,
    priceToRent: 0.2,
    employment: 0.15,
    population: 0.15
  };

  // Normalize and score each component
  const appreciationScore = Math.min(params.appreciationRate * 10, 100);
  const domScore = Math.max(0, 100 - (params.daysOnMarket * 2));
  const priceToRentScore = Math.max(0, 100 - (params.priceToRent * 3));
  const employmentScore = params.employmentGrowth * 20;
  const populationScore = params.populationGrowth * 20;

  // Calculate weighted average
  return (
    (appreciationScore * weights.appreciation) +
    (domScore * weights.daysOnMarket) +
    (priceToRentScore * weights.priceToRent) +
    (employmentScore * weights.employment) +
    (populationScore * weights.population)
  );
}

function processCrimeStats(crimeStats: any) {
  const violent = crimeStats.violent_crime || 0;
  const property = crimeStats.property_crime || 0;
  const total = violent + property;

  // Calculate crime score (A-F)
  let score;
  if (total < 20) score = 'A';
  else if (total < 40) score = 'B';
  else if (total < 60) score = 'C';
  else if (total < 80) score = 'D';
  else score = 'F';

  return {
    score,
    details: {
      violent,
      property
    }
  };
}

function processSchoolData(schoolStats: any) {
  if (!schoolStats?.schools?.length) return 0;
  
  // Calculate average rating of nearby schools
  const ratings = schoolStats.schools.map((school: any) => school.rating || 0);
  const average = ratings.reduce((a: number, b: number) => a + b, 0) / ratings.length;
  return Math.round(average * 10) / 10; // Round to 1 decimal place
} 