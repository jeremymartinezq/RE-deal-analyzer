export interface ComparableProperty {
  address: string;
  price: number;
  squareFootage: number;
  yearBuilt: number;
  bedrooms: number;
  bathrooms: number;
  daysOnMarket: number;
  distance: number;
  type: string;
  condition: string;
  lastSoldDate?: string;
  lastSoldPrice?: number;
}

export interface MarketData {
  medianHomePrice: number;
  pricePerSqFt: number;
  marketRent: number;
  vacancyRate: number;
  populationGrowth: number;
  jobGrowth: number;
  appreciationRate: number;
  comparables: ComparableProperty[];
  demographics?: {
    population: number;
    medianIncome: number;
    medianAge: number;
    employmentRate: number;
  };
  schoolRatings?: {
    elementary: number;
    middle: number;
    high: number;
  };
  crimeRate?: {
    violent: number;
    property: number;
  };
  amenities?: {
    restaurants: number;
    shopping: number;
    parks: number;
    schools: number;
  };
  transitScore?: number;
  walkScore?: number;
  bikeScore?: number;
  zoning?: {
    current: string;
    future: string;
    restrictions: string[];
  };
} 