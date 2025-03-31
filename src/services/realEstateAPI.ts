interface ApiKeys {
  censusApi: string;
  fredApi: string;
}

const API_KEYS: ApiKeys = {
  censusApi: 'YOUR_CENSUS_API_KEY', // Get free key from: https://api.census.gov/data/key_signup.html
  fredApi: 'YOUR_FRED_API_KEY', // Get free key from: https://fred.stlouisfed.org/docs/api/api_key.html
};

export async function getPropertyValuation(address: string, zipCode: string) {
  try {
    // Using OpenHouse Project API (no key required)
    const response = await fetch(
      `https://api.openhouseproject.co/api/v1/properties?address=${encodeURIComponent(address)}&zip=${zipCode}`
    );
    return await response.json();
  } catch (error) {
    console.error('Error fetching property valuation:', error);
    throw error;
  }
}

export async function getAreaStats(zipCode: string) {
  try {
    // Using Census Bureau API for demographic and housing data
    const response = await fetch(
      `https://api.census.gov/data/2021/acs/acs5?` +
      `get=B25077_001E,B25071_001E,B25105_001E&` + // Median home value, rent, income
      `for=zip%20code%20tabulation%20area:${zipCode}&` +
      `key=${API_KEYS.censusApi}`
    );
    const data = await response.json();
    
    // Get economic indicators from FRED
    const fredResponse = await fetch(
      `https://api.stlouisfed.org/fred/series/observations?` +
      `series_id=MEDLISPRI${zipCode.slice(0, 3)}` + // Median list price by metro area
      `&api_key=${API_KEYS.fredApi}&file_type=json`
    );
    const fredData = await fredResponse.json();

    return {
      medianHomeValue: parseInt(data[1][0]),
      medianRent: parseInt(data[1][1]),
      medianIncome: parseInt(data[1][2]),
      priceHistory: fredData.observations
    };
  } catch (error) {
    console.error('Error fetching area stats:', error);
    throw error;
  }
}

export async function getRentalComps(address: string, zipCode: string) {
  try {
    // Using HUD Fair Market Rents API
    const response = await fetch(
      `https://www.huduser.gov/hudapi/public/fmr/data/METRO${zipCode.slice(0, 5)}`
    );
    const hudData = await response.json();

    // Using OpenHouse Project API for nearby rentals
    const openHouseResponse = await fetch(
      `https://api.openhouseproject.co/api/v1/properties/rentals?zip=${zipCode}`
    );
    const rentalData = await openHouseResponse.json();

    return {
      fairMarketRent: hudData.data.basic.rent_50_pct,
      comparableRentals: rentalData.properties
    };
  } catch (error) {
    console.error('Error fetching rental comps:', error);
    throw error;
  }
}

export async function getMarketTrends(zipCode: string) {
  try {
    // Get housing market trends from FRED
    const indicators = [
      'MSPUS', // Median Sales Price
      'HOUST', // Housing Starts
      'RRVRUSQ156N', // Rental Vacancy Rate
    ];
    
    const promises = indicators.map(indicator => 
      fetch(`https://api.stlouisfed.org/fred/series/observations?` +
        `series_id=${indicator}&api_key=${API_KEYS.fredApi}&` +
        `sort_order=desc&limit=12&file_type=json`
      ).then(res => res.json())
    );

    const [priceData, startsData, vacancyData] = await Promise.all(promises);

    return {
      medianSalesPriceHistory: priceData.observations,
      housingStartsTrend: startsData.observations,
      rentalVacancyRate: vacancyData.observations[0].value
    };
  } catch (error) {
    console.error('Error fetching market trends:', error);
    throw error;
  }
}

// Helper function to calculate price trends
export function calculatePriceTrends(priceHistory: any[]) {
  if (!priceHistory || priceHistory.length < 2) return { appreciation: 0, trend: 'stable' };
  
  const latest = parseFloat(priceHistory[0].value);
  const previous = parseFloat(priceHistory[priceHistory.length - 1].value);
  const appreciation = ((latest - previous) / previous) * 100;
  
  return {
    appreciation,
    trend: appreciation > 5 ? 'increasing' : appreciation < -5 ? 'decreasing' : 'stable'
  };
} 