import React, { useEffect, useState } from 'react';
import {
  Box,
  Typography,
  Card,
  CardContent,
  Grid,
  Divider,
  LinearProgress,
  Chip,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
} from '@mui/material';
import { Home, TrendingUp, Timer, LocalOffer } from '@mui/icons-material';
import { 
  getPropertyValuation,
  getAreaStats,
  getRentalComps,
  getMarketTrends,
  calculatePriceTrends
} from '../../services/realEstateAPI';
import { ExportButton } from '../export';
import { PropertyData } from '../../types/property';
import { MarketData } from '../../types/market';
import { AnalysisData } from '../../types/analysis';

interface MarketDataTabProps {
  propertyData: PropertyData;
  marketData: MarketData;
}

interface MarketAnalysis {
  medianPrice: number;
  averagePricePerSqFt: number;
  marketTrends: {
    priceGrowth: number;
    daysOnMarket: number;
    inventory: number;
  };
  comparableProperties: Array<{
    address: string;
    price: number;
    squareFootage: number;
    bedrooms: number;
    bathrooms: number;
    pricePerSqFt: number;
    daysOnMarket: number;
    similarity: number;
  }>;
  priceRange: {
    min: number;
    max: number;
  };
}

export const MarketDataTab: React.FC<MarketDataTabProps> = ({ propertyData, marketData }) => {
  const [marketAnalysis, setMarketAnalysis] = useState<MarketAnalysis | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchMarketData = async () => {
      try {
        setLoading(true);
        console.log('Fetching market data for:', propertyData);

        // Fetch all market data in parallel
        const [
          propertyVal,
          areaStats,
          rentalData,
          marketTrendsData
        ] = await Promise.all([
          getPropertyValuation(propertyData.address, propertyData.zipCode),
          getAreaStats(propertyData.zipCode),
          getRentalComps(propertyData.address, propertyData.zipCode),
          getMarketTrends(propertyData.zipCode)
        ]);

        // Calculate price trends
        const priceTrends = calculatePriceTrends(marketTrendsData.medianSalesPriceHistory);

        setMarketAnalysis({
          medianPrice: areaStats.medianHomeValue,
          averagePricePerSqFt: areaStats.medianHomeValue / parseFloat(propertyData.squareFootage || '1'),
          marketTrends: {
            priceGrowth: priceTrends.appreciation,
            daysOnMarket: 30, // Default value from market trends
            inventory: parseFloat(marketTrendsData.housingStartsTrend[0].value)
          },
          comparableProperties: rentalData.comparableRentals.map((comp: any) => ({
            address: comp.address,
            price: comp.price,
            squareFootage: comp.squareFootage,
            bedrooms: comp.bedrooms,
            bathrooms: comp.bathrooms,
            pricePerSqFt: comp.price / comp.squareFootage,
            daysOnMarket: comp.daysOnMarket || 30,
            similarity: calculateSimilarity(propertyData, comp)
          })),
          priceRange: {
            min: Math.min(...rentalData.comparableRentals.map((c: any) => c.price)),
            max: Math.max(...rentalData.comparableRentals.map((c: any) => c.price))
          }
        });

        console.log('Market analysis:', marketAnalysis);
      } catch (error) {
        console.error('Error fetching market data:', error);
      } finally {
        setLoading(false);
      }
    };

    if (propertyData?.address && propertyData?.zipCode) {
      fetchMarketData();
    }
  }, [propertyData]);

  // Helper function to calculate similarity score
  const calculateSimilarity = (base: PropertyData, comp: any) => {
    const features = ['price', 'squareFootage', 'bedrooms', 'bathrooms'];
    let similarity = 100;
    
    features.forEach(feature => {
      const baseVal = parseFloat(base[feature as keyof PropertyData]?.toString() || '0');
      const compVal = parseFloat(comp[feature]?.toString() || '0');
      if (baseVal && compVal) {
        const diff = Math.abs(baseVal - compVal) / baseVal;
        similarity -= diff * 25; // Reduce similarity based on difference
      }
    });
    
    return Math.max(0, Math.min(100, similarity));
  };

  const getAnalysisData = (): AnalysisData => {
    if (!marketAnalysis) return {} as AnalysisData;

    return {
      purchasePrice: parseFloat(propertyData.price?.toString() || '0'),
      downPayment: 0,
      loanAmount: 0,
      interestRate: 0,
      loanTerm: 30,
      monthlyMortgage: 0,
      monthlyIncome: 0,
      monthlyExpenses: 0,
      noi: 0,
      capRate: 0,
      cashOnCash: 0,
      irr: 0,
      risk: {
        marketRisk: { score: 0, description: '', impact: '', mitigationStrategies: [] },
        financialRisk: { score: 0, description: '', impact: '', mitigationStrategies: [] },
        propertyRisk: { score: 0, description: '', impact: '', mitigationStrategies: [] },
        regulatoryRisk: { score: 0, description: '', impact: '', mitigationStrategies: [] },
        overallRiskScore: 0,
        recommendations: []
      },
      cashFlow: {
        monthlyIncome: { rent: 0, other: 0, total: 0 },
        monthlyExpenses: {
          mortgage: 0,
          propertyTax: 0,
          insurance: 0,
          utilities: 0,
          maintenance: 0,
          propertyManagement: 0,
          hoa: 0,
          vacancy: 0,
          capEx: 0,
          other: 0,
          total: 0
        },
        netOperatingIncome: 0,
        cashFlow: 0
      },
      returns: {
        capRate: 0,
        cashOnCash: 0,
        irr: 0,
        roi: 0,
        paybackPeriod: 0,
        breakEvenPoint: 0,
        dscr: 0,
        grm: 0
      },
      projections: {
        appreciationRate: marketAnalysis.marketTrends.priceGrowth / 100,
        rentGrowthRate: 0.03,
        expenseGrowthRate: 0.02,
        holdingPeriod: 5,
        exitPrice: parseFloat(propertyData.price?.toString() || '0') * Math.pow(1 + marketAnalysis.marketTrends.priceGrowth / 100, 5),
        totalReturn: 0
      },
      sensitivityAnalysis: {
        vacancyRate: [3, 5, 7, 10],
        interestRate: [3, 4, 5, 6],
        propertyValue: [-5, 0, 5, 10],
        rentalIncome: [-10, -5, 0, 5],
        operatingExpenses: [-5, 0, 5, 10]
      },
      comparativeAnalysis: {
        pricePerSqFt: marketAnalysis.averagePricePerSqFt,
        rentPerSqFt: 0,
        expenseRatio: 0,
        marketComparison: {
          price: marketAnalysis.medianPrice,
          rent: 0,
          metrics: {
            capRate: 0,
            cashOnCash: 0,
            irr: 0,
            roi: 0,
            paybackPeriod: 0,
            breakEvenPoint: 0,
            dscr: 0,
            grm: 0
          }
        }
      }
    };
  };

  if (loading) {
    return (
      <Box sx={{ p: 2 }}>
        <LinearProgress />
        <Typography sx={{ mt: 2, textAlign: 'center' }}>
          Analyzing market data...
        </Typography>
      </Box>
    );
  }

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(value);
  };

  const formatPercentage = (value: number) => {
    return `${value.toFixed(1)}%`;
  };

  return (
    <Box sx={{ p: 2 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h5">Market Analysis</Typography>
        <ExportButton
          propertyData={propertyData}
          marketData={marketData}
          analysisData={getAnalysisData()}
          variant="contained"
          size="small"
        />
      </Box>

      {/* Market Overview */}
      <Typography variant="h6" gutterBottom>
        Market Overview
      </Typography>
      <Grid container spacing={2} sx={{ mb: 3 }}>
        <Grid item xs={6}>
          <Card>
            <CardContent>
              <Typography color="textSecondary" gutterBottom>
                Median Price
              </Typography>
              <Typography variant="h5">
                {formatCurrency(marketAnalysis?.medianPrice || 0)}
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={6}>
          <Card>
            <CardContent>
              <Typography color="textSecondary" gutterBottom>
                Price/Sqft
              </Typography>
              <Typography variant="h5">
                {formatCurrency(marketAnalysis?.averagePricePerSqFt || 0)}
              </Typography>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Market Trends */}
      <Typography variant="h6" gutterBottom>
        Market Trends
      </Typography>
      <Grid container spacing={2} sx={{ mb: 3 }}>
        <Grid item xs={4}>
          <Card>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                <TrendingUp color="primary" sx={{ mr: 1 }} />
                <Typography color="textSecondary">
                  Price Growth
                </Typography>
              </Box>
              <Typography variant="h6">
                {formatPercentage(marketAnalysis?.marketTrends?.priceGrowth || 0)}
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={4}>
          <Card>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                <Timer color="primary" sx={{ mr: 1 }} />
                <Typography color="textSecondary">
                  Days on Market
                </Typography>
              </Box>
              <Typography variant="h6">
                {marketAnalysis?.marketTrends?.daysOnMarket || 0}
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={4}>
          <Card>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                <Home color="primary" sx={{ mr: 1 }} />
                <Typography color="textSecondary">
                  Inventory
                </Typography>
              </Box>
              <Typography variant="h6">
                {marketAnalysis?.marketTrends?.inventory?.toFixed(1) || 0} mo
              </Typography>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Comparable Properties */}
      <Typography variant="h6" gutterBottom>
        Comparable Properties
      </Typography>
      <TableContainer 
        component={Paper} 
        sx={{ 
          mb: 3,
          flexGrow: 1,
          width: '100%',
          height: 'calc(100vh - 450px)', // Adjust height to fill remaining space
          overflow: 'auto',
          border: '1px solid rgba(224, 224, 224, 1)',
          borderRadius: 1,
          '& .MuiTable-root': {
            borderCollapse: 'separate',
            borderSpacing: 0,
          },
          '& .MuiTableHead-root': {
            position: 'sticky',
            top: 0,
            bgcolor: 'background.paper',
            zIndex: 1,
          },
          '& .MuiTableCell-root': {
            borderBottom: '1px solid rgba(224, 224, 224, 1)',
            padding: '8px 16px',
          },
          '& .MuiTableRow-root:hover': {
            bgcolor: 'action.hover',
          }
        }}
      >
        <Table>
          <TableHead>
            <TableRow>
              <TableCell style={{ minWidth: 200 }}>Address</TableCell>
              <TableCell align="right" style={{ minWidth: 100 }}>Price</TableCell>
              <TableCell align="right" style={{ minWidth: 80 }}>Sqft</TableCell>
              <TableCell align="right" style={{ minWidth: 100 }}>Bed/Bath</TableCell>
              <TableCell align="right" style={{ minWidth: 100 }}>$/Sqft</TableCell>
              <TableCell align="right" style={{ minWidth: 80 }}>DOM</TableCell>
              <TableCell align="right" style={{ minWidth: 80 }}>Match</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {marketAnalysis?.comparableProperties?.map((comp, index) => (
              <TableRow key={index} hover>
                <TableCell>{comp.address}</TableCell>
                <TableCell align="right">{formatCurrency(comp.price)}</TableCell>
                <TableCell align="right">{Math.round(comp.squareFootage).toLocaleString()}</TableCell>
                <TableCell align="right">{comp.bedrooms}/{comp.bathrooms}</TableCell>
                <TableCell align="right">{formatCurrency(comp.pricePerSqFt)}</TableCell>
                <TableCell align="right">{comp.daysOnMarket}</TableCell>
                <TableCell align="right">
                  <Chip
                    label={`${Math.round(comp.similarity)}%`}
                    size="small"
                    color={comp.similarity > 85 ? "success" : comp.similarity > 70 ? "primary" : "default"}
                    sx={{ minWidth: 60 }}
                  />
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>

      {/* Price Range Analysis */}
      <Typography variant="h6" gutterBottom>
        Price Range Analysis
      </Typography>
      <Card>
        <CardContent>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
            <Typography color="textSecondary">
              Market Range
            </Typography>
            <Typography>
              {formatCurrency(marketAnalysis?.priceRange?.min || 0)} - {formatCurrency(marketAnalysis?.priceRange?.max || 0)}
            </Typography>
          </Box>
          <Divider sx={{ my: 1 }} />
          <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
            <Typography color="textSecondary">
              Subject Property
            </Typography>
            <Typography>
              {formatCurrency(parseFloat(propertyData.price?.toString() || '0'))}
            </Typography>
          </Box>
        </CardContent>
      </Card>
    </Box>
  );
}; 