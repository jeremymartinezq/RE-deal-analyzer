import React, { useState, useEffect } from 'react';
import {
  Box,
  Grid,
  Paper,
  Typography,
  TextField,
  Button,
  Card,
  CardContent,
  Slider,
  InputAdornment,
  useTheme,
} from '@mui/material';
import { FinancialInputs, FinancialMetrics, FinancialCalculator } from '../../utils/financialCalculations';
import { ExportButton } from '../export';
import { PropertyData } from '../../types/property';
import { MarketData } from '../../types/market';
import { AnalysisData } from '../../types/analysis';

interface FinancialAnalysisTabProps {
  propertyData: PropertyData;
  marketData: MarketData;
}

export const FinancialAnalysisTab: React.FC<FinancialAnalysisTabProps> = ({ propertyData, marketData }) => {
  const theme = useTheme();
  const [inputs, setInputs] = useState<FinancialInputs>({
    purchasePrice: parseFloat(propertyData.price?.toString() || '0'),
    downPayment: 20,
    interestRate: 4.5,
    loanTerm: 30,
    propertyTaxRate: 1.2,
    insuranceCost: 1200,
    maintenanceCost: 200,
    hoaFees: propertyData.hoa || 0,
    vacancyRate: 5,
    monthlyRent: 0,
    propertyManagementFee: 8,
    closingCosts: 5000,
    appreciationRate: 3,
    utilityCosts: 0,
  });

  const [metrics, setMetrics] = useState<FinancialMetrics | null>(null);

  useEffect(() => {
    calculateMetrics();
  }, [inputs]);

  const calculateMetrics = () => {
    const results = FinancialCalculator.calculateAllMetrics(inputs);
    setMetrics(results);
  };

  const handleInputChange = (field: keyof FinancialInputs) => (
    event: React.ChangeEvent<HTMLInputElement> | Event,
    value?: number | number[]
  ) => {
    let newValue: number;
    
    if (event.type === 'change' && 'target' in event) {
      newValue = parseFloat((event.target as HTMLInputElement).value);
    } else {
      newValue = value as number;
    }

    setInputs((prev) => ({
      ...prev,
      [field]: newValue,
    }));
  };

  const MetricDisplay = ({ label, value, unit = '' }: { label: string; value: number; unit?: string }) => (
    <Card sx={{ height: '100%', bgcolor: theme.palette.background.paper }}>
      <CardContent>
        <Typography variant="subtitle2" color="textSecondary" gutterBottom>
          {label}
        </Typography>
        <Typography variant="h6">
          {typeof value === 'number' ? value.toLocaleString('en-US', {
            minimumFractionDigits: 2,
            maximumFractionDigits: 2,
          }) : value}
          {unit}
        </Typography>
      </CardContent>
    </Card>
  );

  // Convert metrics to AnalysisData format for export
  const getAnalysisData = (): AnalysisData => {
    if (!metrics) return {} as AnalysisData;

    return {
      purchasePrice: inputs.purchasePrice,
      downPayment: inputs.purchasePrice * (inputs.downPayment / 100),
      loanAmount: inputs.purchasePrice * (1 - inputs.downPayment / 100),
      interestRate: inputs.interestRate,
      loanTerm: inputs.loanTerm,
      monthlyMortgage: metrics.monthlyMortgagePayment,
      monthlyIncome: inputs.monthlyRent,
      monthlyExpenses: metrics.monthlyExpenses,
      noi: metrics.netOperatingIncome,
      capRate: metrics.capRate / 100,
      cashOnCash: metrics.cashOnCashReturn / 100,
      irr: metrics.irr / 100,
      risk: {
        marketRisk: { score: 0, description: '', impact: '', mitigationStrategies: [] },
        financialRisk: { score: 0, description: '', impact: '', mitigationStrategies: [] },
        propertyRisk: { score: 0, description: '', impact: '', mitigationStrategies: [] },
        regulatoryRisk: { score: 0, description: '', impact: '', mitigationStrategies: [] },
        overallRiskScore: 0,
        recommendations: []
      },
      cashFlow: {
        monthlyIncome: {
          rent: inputs.monthlyRent,
          other: 0,
          total: inputs.monthlyRent
        },
        monthlyExpenses: {
          mortgage: metrics.monthlyMortgagePayment,
          propertyTax: inputs.propertyTaxRate * inputs.purchasePrice / 1200,
          insurance: inputs.insuranceCost / 12,
          utilities: inputs.utilityCosts,
          maintenance: inputs.maintenanceCost,
          propertyManagement: inputs.monthlyRent * inputs.propertyManagementFee / 100,
          hoa: inputs.hoaFees,
          vacancy: inputs.monthlyRent * inputs.vacancyRate / 100,
          capEx: 200,
          other: 0,
          total: metrics.monthlyExpenses
        },
        netOperatingIncome: metrics.netOperatingIncome,
        cashFlow: metrics.monthlyCashFlow
      },
      returns: {
        capRate: metrics.capRate / 100,
        cashOnCash: metrics.cashOnCashReturn / 100,
        irr: metrics.irr / 100,
        roi: metrics.roi / 100,
        paybackPeriod: metrics.paybackPeriod,
        breakEvenPoint: metrics.breakEvenPoint,
        dscr: metrics.dscr,
        grm: metrics.grm
      },
      projections: {
        appreciationRate: inputs.appreciationRate / 100,
        rentGrowthRate: 0.03,
        expenseGrowthRate: 0.02,
        holdingPeriod: 5,
        exitPrice: inputs.purchasePrice * Math.pow(1 + inputs.appreciationRate / 100, 5),
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
        pricePerSqFt: inputs.purchasePrice / (propertyData.squareFootage || 1),
        rentPerSqFt: inputs.monthlyRent / (propertyData.squareFootage || 1),
        expenseRatio: metrics.monthlyExpenses / inputs.monthlyRent,
        marketComparison: {
          price: 0,
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

  return (
    <Box sx={{ p: 2 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h5">Financial Analysis</Typography>
        <ExportButton
          propertyData={propertyData}
          marketData={marketData}
          analysisData={getAnalysisData()}
          variant="contained"
          size="small"
        />
      </Box>

      <Grid container spacing={3}>
        {/* Input Section */}
        <Grid item xs={12} md={6}>
          <Paper sx={{ p: 2, bgcolor: theme.palette.background.paper }}>
            <Typography variant="h6" gutterBottom>
              Financial Inputs
            </Typography>
            
            <Grid container spacing={2}>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="Purchase Price"
                  type="number"
                  value={inputs.purchasePrice}
                  onChange={handleInputChange('purchasePrice')}
                  InputProps={{
                    startAdornment: <InputAdornment position="start">$</InputAdornment>,
                  }}
                />
              </Grid>
              <Grid item xs={12}>
                <Typography gutterBottom>Down Payment (%)</Typography>
                <Slider
                  value={inputs.downPayment}
                  onChange={handleInputChange('downPayment')}
                  min={0}
                  max={100}
                  valueLabelDisplay="auto"
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="Interest Rate"
                  type="number"
                  value={inputs.interestRate}
                  onChange={handleInputChange('interestRate')}
                  InputProps={{
                    endAdornment: <InputAdornment position="end">%</InputAdornment>,
                  }}
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="Loan Term"
                  type="number"
                  value={inputs.loanTerm}
                  onChange={handleInputChange('loanTerm')}
                  InputProps={{
                    endAdornment: <InputAdornment position="end">years</InputAdornment>,
                  }}
                />
              </Grid>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="Monthly Rent"
                  type="number"
                  value={inputs.monthlyRent}
                  onChange={handleInputChange('monthlyRent')}
                  InputProps={{
                    startAdornment: <InputAdornment position="start">$</InputAdornment>,
                  }}
                />
              </Grid>
            </Grid>
          </Paper>
        </Grid>

        {/* Results Section */}
        <Grid item xs={12} md={6}>
          <Paper sx={{ p: 2, bgcolor: theme.palette.background.paper }}>
            <Typography variant="h6" gutterBottom>
              Financial Analysis
            </Typography>
            <Grid container spacing={2}>
              {metrics && (
                <>
                  <Grid item xs={12} sm={6}>
                    <MetricDisplay
                      label="Monthly Mortgage"
                      value={metrics.monthlyMortgagePayment}
                      unit="$"
                    />
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <MetricDisplay
                      label="Monthly Cash Flow"
                      value={metrics.monthlyCashFlow}
                      unit="$"
                    />
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <MetricDisplay
                      label="Cap Rate"
                      value={metrics.capRate}
                      unit="%"
                    />
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <MetricDisplay
                      label="Cash on Cash Return"
                      value={metrics.cashOnCashReturn}
                      unit="%"
                    />
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <MetricDisplay
                      label="NOI"
                      value={metrics.netOperatingIncome}
                      unit="$"
                    />
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <MetricDisplay
                      label="Break Even (Years)"
                      value={metrics.breakEvenPoint}
                    />
                  </Grid>
                </>
              )}
            </Grid>
          </Paper>
        </Grid>
      </Grid>
    </Box>
  );
}; 