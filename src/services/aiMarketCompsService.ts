interface PropertyComp {
  address: string;
  price: number;
  squareFootage: number;
  bedrooms: number;
  bathrooms: number;
  yearBuilt: number;
  pricePerSqFt: number;
  daysOnMarket: number;
  distance: number;
  similarity: number;
}

interface CompAnalysis {
  averagePrice: number;
  medianPrice: number;
  priceRange: {
    min: number;
    max: number;
  };
  averagePricePerSqFt: number;
  similarProperties: PropertyComp[];
  marketTrends: {
    priceGrowth: number;
    daysOnMarket: number;
    inventory: number;
  };
}

export async function getAIMarketComps(propertyData: any): Promise<CompAnalysis> {
  try {
    // Extract key property features for comparison
    const baseFeatures = {
      price: parseFloat(propertyData.price?.replace(/[^0-9.]/g, '') || '0'),
      squareFootage: parseFloat(propertyData.squareFootage?.replace(/[^0-9.]/g, '') || '0'),
      bedrooms: parseInt(propertyData.bedrooms || '0'),
      bathrooms: parseInt(propertyData.bathrooms || '0'),
      yearBuilt: parseInt(propertyData.yearBuilt || '0'),
      zipCode: propertyData.zipCode || '',
    };

    // Generate AI-based comparable properties
    const comps = generateComparableProperties(baseFeatures);
    
    // Calculate market analysis
    const analysis = analyzeComps(comps, baseFeatures);

    return {
      averagePrice: analysis.averagePrice,
      medianPrice: analysis.medianPrice,
      priceRange: analysis.priceRange,
      averagePricePerSqFt: analysis.averagePricePerSqFt,
      similarProperties: comps,
      marketTrends: {
        priceGrowth: calculatePriceGrowth(comps),
        daysOnMarket: calculateAverageDaysOnMarket(comps),
        inventory: calculateInventoryLevel(comps),
      },
    };
  } catch (error) {
    console.error('Error generating AI market comps:', error);
    throw error;
  }
}

function generateComparableProperties(baseFeatures: any): PropertyComp[] {
  const comps: PropertyComp[] = [];
  const numComps = 5; // Generate 5 comparable properties

  // Price variation range (±10%)
  const priceVariation = baseFeatures.price * 0.10;
  // Square footage variation range (±15%)
  const sqftVariation = baseFeatures.squareFootage * 0.15;
  // Year built variation range (±5 years)
  const yearVariation = 5;

  for (let i = 0; i < numComps; i++) {
    // Generate random variations within reasonable ranges
    const priceAdjustment = (Math.random() * 2 - 1) * priceVariation;
    const sqftAdjustment = (Math.random() * 2 - 1) * sqftVariation;
    const yearAdjustment = Math.floor((Math.random() * 2 - 1) * yearVariation);
    
    const price = baseFeatures.price + priceAdjustment;
    const squareFootage = baseFeatures.squareFootage + sqftAdjustment;
    const yearBuilt = baseFeatures.yearBuilt + yearAdjustment;

    // Calculate similarity score based on features
    const similarity = calculateSimilarity({
      price,
      squareFootage,
      yearBuilt,
      bedrooms: baseFeatures.bedrooms,
      bathrooms: baseFeatures.bathrooms,
    }, baseFeatures);

    comps.push({
      address: generateNearbyAddress(baseFeatures.zipCode),
      price,
      squareFootage,
      bedrooms: baseFeatures.bedrooms + (Math.random() > 0.8 ? Math.floor(Math.random() * 2) - 1 : 0),
      bathrooms: baseFeatures.bathrooms + (Math.random() > 0.8 ? Math.floor(Math.random() * 2) - 1 : 0),
      yearBuilt,
      pricePerSqFt: price / squareFootage,
      daysOnMarket: Math.floor(Math.random() * 60) + 1, // 1-60 days
      distance: Math.random() * 2, // 0-2 miles
      similarity,
    });
  }

  // Sort by similarity score
  return comps.sort((a, b) => b.similarity - a.similarity);
}

function calculateSimilarity(comp: any, base: any): number {
  const weights = {
    price: 0.3,
    squareFootage: 0.25,
    bedrooms: 0.15,
    bathrooms: 0.15,
    yearBuilt: 0.15,
  };

  const priceSim = 1 - Math.abs(comp.price - base.price) / base.price;
  const sqftSim = 1 - Math.abs(comp.squareFootage - base.squareFootage) / base.squareFootage;
  const bedroomSim = comp.bedrooms === base.bedrooms ? 1 : 0.5;
  const bathroomSim = comp.bathrooms === base.bathrooms ? 1 : 0.5;
  const yearSim = 1 - Math.abs(comp.yearBuilt - base.yearBuilt) / 100;

  return (
    priceSim * weights.price +
    sqftSim * weights.squareFootage +
    bedroomSim * weights.bedrooms +
    bathroomSim * weights.bathrooms +
    yearSim * weights.yearBuilt
  ) * 100;
}

function generateNearbyAddress(zipCode: string): string {
  const streets = [
    'Maple', 'Oak', 'Cedar', 'Pine', 'Elm',
    'Washington', 'Adams', 'Jefferson', 'Madison', 'Monroe',
  ];
  const types = ['St', 'Ave', 'Rd', 'Dr', 'Ln'];
  
  const number = Math.floor(Math.random() * 9000) + 1000;
  const street = streets[Math.floor(Math.random() * streets.length)];
  const type = types[Math.floor(Math.random() * types.length)];
  
  return `${number} ${street} ${type}, ${zipCode}`;
}

function analyzeComps(comps: PropertyComp[], baseFeatures: any) {
  const prices = comps.map(comp => comp.price);
  
  return {
    averagePrice: prices.reduce((a, b) => a + b, 0) / prices.length,
    medianPrice: prices.sort((a, b) => a - b)[Math.floor(prices.length / 2)],
    priceRange: {
      min: Math.min(...prices),
      max: Math.max(...prices),
    },
    averagePricePerSqFt: comps.reduce((acc, comp) => acc + comp.pricePerSqFt, 0) / comps.length,
  };
}

function calculatePriceGrowth(comps: PropertyComp[]): number {
  // Simulate market appreciation (2-8% annually)
  return Math.random() * 6 + 2;
}

function calculateAverageDaysOnMarket(comps: PropertyComp[]): number {
  return Math.floor(comps.reduce((acc, comp) => acc + comp.daysOnMarket, 0) / comps.length);
}

function calculateInventoryLevel(comps: PropertyComp[]): number {
  // Simulate inventory level (months of supply, typically 4-8 months)
  return Math.random() * 4 + 4;
} 