export interface PropertyData {
  address: string;
  type: string;
  squareFootage: number;
  yearBuilt: number;
  bedrooms: number;
  bathrooms: number;
  lotSize: string;
  zoning: string;
  features?: string[];
  condition?: string;
  parking?: string;
  utilities?: string[];
  propertyTaxes?: number;
  insurance?: number;
  hoa?: number;
  lastSoldDate?: string;
  lastSoldPrice?: number;
  estimatedValue?: number;
  images?: string[];
} 