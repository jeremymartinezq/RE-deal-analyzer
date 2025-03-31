import React from 'react';
import {
  Box,
  Grid,
  Paper,
  Typography,
  IconButton,
  Card,
  CardContent,
  useTheme,
} from '@mui/material';
import {
  Edit,
  CurrencyExchange,
  Home,
  AttachMoney,
  AccountBalance,
  TrendingUp,
  Warning,
  MonetizationOn,
  Calculate,
  Assessment,
} from '@mui/icons-material';
import { calculatePropertyMetrics } from '../../utils/propertyCalculations';
import { ExportButton } from '../export';
import { PropertyData } from '../../types/property';
import { MarketData } from '../../types/market';
import { AnalysisData } from '../../types/analysis';

interface OverviewTabProps {
  propertyData: PropertyData;
  marketData: MarketData;
}

const MetricRow: React.FC<{
  icon: React.ReactNode;
  label: string;
  value: string | number;
  editable?: boolean;
  onEdit?: () => void;
}> = ({ icon, label, value, editable, onEdit }) => {
  return (
    <Box
      sx={{
        display: 'flex',
        alignItems: 'center',
        p: 2,
        borderBottom: '1px solid rgba(0, 0, 0, 0.12)',
        '&:last-child': {
          borderBottom: 'none',
        },
      }}
    >
      <Box
        sx={{
          display: 'flex',
          alignItems: 'center',
          minWidth: '40px',
          color: 'primary.main',
        }}
      >
        {icon}
      </Box>
      <Box sx={{ flexGrow: 1, ml: 2 }}>
        <Typography variant="body2" color="textSecondary">
          {label}
        </Typography>
        <Typography variant="h6">
          {typeof value === 'number' ? value.toLocaleString('en-US', {
            style: 'currency',
            currency: 'USD',
            minimumFractionDigits: 0,
            maximumFractionDigits: 0,
          }) : value}
        </Typography>
      </Box>
      {editable && (
        <IconButton onClick={onEdit} size="small">
          <Edit />
        </IconButton>
      )}
    </Box>
  );
};

const MetricBox: React.FC<{
  label: string;
  value: string;
  color?: string;
}> = ({ label, value, color = 'primary.main' }) => {
  return (
    <Box
      sx={{
        display: 'flex',
        alignItems: 'center',
        bgcolor: 'background.paper',
        p: 1,
        borderRadius: 1,
        border: '1px solid',
        borderColor: 'divider',
      }}
    >
      <Typography variant="body2" color="textSecondary" sx={{ flexGrow: 1 }}>
        {label}
      </Typography>
      <Typography variant="body1" sx={{ color }}>
        {value}
      </Typography>
    </Box>
  );
};

export const OverviewTab: React.FC<OverviewTabProps> = ({ propertyData, marketData }) => {
  const theme = useTheme();
  const metrics = calculatePropertyMetrics(propertyData);

  const getAnalysisData = (): AnalysisData => {
    return {
      purchasePrice: parseFloat(propertyData.price?.toString() || '0'),
      downPayment: metrics.cashNeeded,
      loanAmount: metrics.loanAmount,
      interestRate: metrics.interestRate,
      loanTerm: metrics.loanTerm,
      monthlyMortgage: metrics.monthlyLoanPayment,
      monthlyIncome: metrics.grossRent,
      monthlyExpenses: metrics.monthlyExpenses,
      noi: metrics.netOperatingIncome,
      capRate: metrics.capRate / 100,
      cashOnCash: metrics.cashOnCash / 100,
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
          rent: metrics.grossRent,
          other: 0,
          total: metrics.grossRent
        },
        monthlyExpenses: {
          mortgage: metrics.monthlyLoanPayment,
          propertyTax: metrics.propertyTax,
          insurance: metrics.insurance,
          utilities: metrics.utilities,
          maintenance: metrics.maintenance,
          propertyManagement: metrics.propertyManagement,
          hoa: metrics.hoa,
          vacancy: metrics.vacancy,
          capEx: metrics.capEx,
          other: 0,
          total: metrics.monthlyExpenses
        },
        netOperatingIncome: metrics.netOperatingIncome,
        cashFlow: metrics.monthlyNetCashFlow
      },
      returns: {
        capRate: metrics.capRate / 100,
        cashOnCash: metrics.cashOnCash / 100,
        irr: metrics.irr / 100,
        roi: metrics.roi / 100,
        paybackPeriod: metrics.paybackPeriod,
        breakEvenPoint: metrics.breakEvenPoint,
        dscr: metrics.dscr,
        grm: metrics.grm
      },
      projections: {
        appreciationRate: 0.03,
        rentGrowthRate: 0.03,
        expenseGrowthRate: 0.02,
        holdingPeriod: 5,
        exitPrice: parseFloat(propertyData.price?.toString() || '0') * Math.pow(1.03, 5),
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
        pricePerSqFt: parseFloat(propertyData.price?.toString() || '0') / (parseFloat(propertyData.squareFootage?.toString() || '1')),
        rentPerSqFt: metrics.grossRent / (parseFloat(propertyData.squareFootage?.toString() || '1')),
        expenseRatio: metrics.monthlyExpenses / metrics.grossRent,
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
        <Typography variant="h5">Property Overview</Typography>
        <ExportButton
          propertyData={propertyData}
          marketData={marketData}
          analysisData={getAnalysisData()}
          variant="contained"
          size="small"
        />
      </Box>

      <Box sx={{ mb: 3 }}>
        <Typography variant="h6" component="div" sx={{ mb: 2 }}>
          Property Details
        </Typography>
        <Paper elevation={0}>
          <MetricRow
            icon={<Home />}
            label="Property Price"
            value={propertyData.price || 'N/A'}
            editable
          />
          <MetricRow
            icon={<CurrencyExchange />}
            label="Property Rent"
            value={metrics.grossRent}
            editable
          />
          <Box sx={{ p: 2 }}>
            <Grid container spacing={2}>
              <Grid item xs={12}>
                <MetricBox
                  label="Gross:"
                  value={`${metrics.capRate.toFixed(0)}%`}
                  color={theme.palette.success.main}
                />
              </Grid>
              <Grid item xs={12}>
                <MetricBox
                  label="Net:"
                  value={`${(metrics.capRate * 0.7).toFixed(0)}%`}
                  color={theme.palette.info.main}
                />
              </Grid>
              <Grid item xs={12}>
                <MetricBox
                  label="COC:"
                  value={`${metrics.cashOnCash.toFixed(0)}%`}
                  color={theme.palette.warning.main}
                />
              </Grid>
            </Grid>
          </Box>
        </Paper>
      </Box>

      <Box sx={{ mb: 3 }}>
        <Typography variant="h6" component="div" sx={{ mb: 2 }}>
          Financial Overview
        </Typography>
        <Paper elevation={0}>
          <MetricRow
            icon={<MonetizationOn />}
            label="Monthly Cash Flow"
            value={metrics.monthlyNetCashFlow}
          />
          <MetricRow
            icon={<Calculate />}
            label="Monthly Expenses"
            value={metrics.monthlyExpenses}
          />
          <MetricRow
            icon={<AccountBalance />}
            label="Loan Payments"
            value={metrics.monthlyLoanPayment}
          />
          <MetricRow
            icon={<Assessment />}
            label="Cash Needed"
            value={metrics.cashNeeded}
          />
        </Paper>
      </Box>

      <Box>
        <Typography variant="h6" component="div" sx={{ mb: 2 }}>
          Area Information
        </Typography>
        <Paper elevation={0}>
          <MetricRow
            icon={<Warning />}
            label="Crime Rate"
            value="C-"
          />
          <MetricRow
            icon={<TrendingUp />}
            label="Median Income"
            value="45,500"
          />
        </Paper>
      </Box>
    </Box>
  );
}; 