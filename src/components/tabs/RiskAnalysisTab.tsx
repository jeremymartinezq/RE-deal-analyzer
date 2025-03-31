import React, { useEffect, useState } from 'react';
import {
  Box,
  Typography,
  Card,
  CardContent,
  Grid,
  LinearProgress,
  Chip,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
} from '@mui/material';
import {
  ExpandMore,
  Warning,
  CheckCircle,
  Info,
  Home,
  TrendingUp,
  AccountBalance,
  LocationCity,
} from '@mui/icons-material';
import { analyzePropertyRisks } from '../../services/aiRiskAnalysisService';
import { ExportButton } from '../export';
import { PropertyData } from '../../types/property';
import { MarketData } from '../../types/market';
import { AnalysisData, RiskAnalysis } from '../../types/analysis';

interface RiskAnalysisTabProps {
  propertyData: PropertyData;
  marketData: MarketData;
}

export const RiskAnalysisTab: React.FC<RiskAnalysisTabProps> = ({ propertyData, marketData }) => {
  const [riskAnalysis, setRiskAnalysis] = useState<RiskAnalysis | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const analyzeRisks = async () => {
      try {
        const analysis = await analyzePropertyRisks(propertyData, marketData);
        setRiskAnalysis(analysis);
      } catch (error) {
        console.error('Error analyzing risks:', error);
      } finally {
        setLoading(false);
      }
    };

    analyzeRisks();
  }, [propertyData, marketData]);

  const getAnalysisData = (): AnalysisData => {
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
      risk: riskAnalysis || {
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
        appreciationRate: 0,
        rentGrowthRate: 0,
        expenseGrowthRate: 0,
        holdingPeriod: 5,
        exitPrice: 0,
        totalReturn: 0
      },
      sensitivityAnalysis: {
        vacancyRate: [0],
        interestRate: [0],
        propertyValue: [0],
        rentalIncome: [0],
        operatingExpenses: [0]
      },
      comparativeAnalysis: {
        pricePerSqFt: 0,
        rentPerSqFt: 0,
        expenseRatio: 0,
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

  if (loading) {
    return (
      <Box sx={{ p: 2 }}>
        <LinearProgress />
        <Typography sx={{ mt: 2, textAlign: 'center' }}>
          Analyzing investment risks...
        </Typography>
      </Box>
    );
  }

  const getRiskColor = (level: string) => {
    switch (level) {
      case 'Low': return 'success';
      case 'Medium': return 'warning';
      case 'High': return 'error';
      default: return 'default';
    }
  };

  const getRiskIcon = (category: string) => {
    switch (category) {
      case 'property': return <Home />;
      case 'market': return <TrendingUp />;
      case 'financial': return <AccountBalance />;
      case 'neighborhood': return <LocationCity />;
      default: return <Info />;
    }
  };

  const formatScore = (score: number) => {
    return Math.round(score);
  };

  return (
    <Box sx={{ p: 2 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h5">Risk Analysis</Typography>
        <ExportButton
          propertyData={propertyData}
          marketData={marketData}
          analysisData={getAnalysisData()}
          variant="contained"
          size="small"
        />
      </Box>

      {/* Overall Risk Score */}
      <Card sx={{ mb: 3 }}>
        <CardContent>
          <Typography variant="h6" gutterBottom>
            Overall Risk Assessment
          </Typography>
          <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
            <Typography variant="h3" sx={{ mr: 2 }}>
              {formatScore(riskAnalysis?.overallRiskScore || 0)}
            </Typography>
            <Chip
              label={riskAnalysis?.riskLevel || 'N/A'}
              color={getRiskColor(riskAnalysis?.riskLevel || '')}
              size="large"
            />
          </Box>
          <LinearProgress
            variant="determinate"
            value={riskAnalysis?.overallRiskScore || 0}
            color={getRiskColor(riskAnalysis?.riskLevel || '')}
            sx={{ height: 10, borderRadius: 5 }}
          />
        </CardContent>
      </Card>

      {/* Risk Categories */}
      <Grid container spacing={3}>
        {/* Property Risks */}
        <Grid item xs={12}>
          <Accordion defaultExpanded>
            <AccordionSummary expandIcon={<ExpandMore />}>
              <Box sx={{ display: 'flex', alignItems: 'center' }}>
                <Home sx={{ mr: 1 }} />
                <Typography variant="h6">Property Risks</Typography>
              </Box>
            </AccordionSummary>
            <AccordionDetails>
              <Grid container spacing={2}>
                {riskAnalysis?.propertyRisks && Object.entries(riskAnalysis.propertyRisks).map(([key, risk]: [string, any]) => (
                  <Grid item xs={12} sm={6} key={key}>
                    <Card>
                      <CardContent>
                        <Typography color="textSecondary" gutterBottom>
                          {risk.description}
                        </Typography>
                        <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                          <Typography variant="h6" sx={{ mr: 1 }}>
                            {formatScore(risk.score)}
                          </Typography>
                          <Chip
                            label={risk.level}
                            size="small"
                            color={getRiskColor(risk.level)}
                          />
                        </Box>
                        <List dense>
                          {risk.recommendations.map((rec: string, index: number) => (
                            <ListItem key={index}>
                              <ListItemIcon>
                                {risk.level === 'High' ? (
                                  <Warning color="error" />
                                ) : (
                                  <CheckCircle color="success" />
                                )}
                              </ListItemIcon>
                              <ListItemText primary={rec} />
                            </ListItem>
                          ))}
                        </List>
                      </CardContent>
                    </Card>
                  </Grid>
                ))}
              </Grid>
            </AccordionDetails>
          </Accordion>
        </Grid>

        {/* Market Risks */}
        <Grid item xs={12}>
          <Accordion>
            <AccordionSummary expandIcon={<ExpandMore />}>
              <Box sx={{ display: 'flex', alignItems: 'center' }}>
                <TrendingUp sx={{ mr: 1 }} />
                <Typography variant="h6">Market Risks</Typography>
              </Box>
            </AccordionSummary>
            <AccordionDetails>
              <Grid container spacing={2}>
                {riskAnalysis?.marketRisks && Object.entries(riskAnalysis.marketRisks).map(([key, risk]: [string, any]) => (
                  <Grid item xs={12} sm={6} key={key}>
                    <Card>
                      <CardContent>
                        <Typography color="textSecondary" gutterBottom>
                          {risk.description}
                        </Typography>
                        <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                          <Typography variant="h6" sx={{ mr: 1 }}>
                            {formatScore(risk.score)}
                          </Typography>
                          <Chip
                            label={risk.level}
                            size="small"
                            color={getRiskColor(risk.level)}
                          />
                        </Box>
                        <List dense>
                          {risk.recommendations.map((rec: string, index: number) => (
                            <ListItem key={index}>
                              <ListItemIcon>
                                {risk.level === 'High' ? (
                                  <Warning color="error" />
                                ) : (
                                  <CheckCircle color="success" />
                                )}
                              </ListItemIcon>
                              <ListItemText primary={rec} />
                            </ListItem>
                          ))}
                        </List>
                      </CardContent>
                    </Card>
                  </Grid>
                ))}
              </Grid>
            </AccordionDetails>
          </Accordion>
        </Grid>

        {/* Financial Risks */}
        <Grid item xs={12}>
          <Accordion>
            <AccordionSummary expandIcon={<ExpandMore />}>
              <Box sx={{ display: 'flex', alignItems: 'center' }}>
                <AccountBalance sx={{ mr: 1 }} />
                <Typography variant="h6">Financial Risks</Typography>
              </Box>
            </AccordionSummary>
            <AccordionDetails>
              <Grid container spacing={2}>
                {riskAnalysis?.financialRisks && Object.entries(riskAnalysis.financialRisks).map(([key, risk]: [string, any]) => (
                  <Grid item xs={12} sm={6} key={key}>
                    <Card>
                      <CardContent>
                        <Typography color="textSecondary" gutterBottom>
                          {risk.description}
                        </Typography>
                        <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                          <Typography variant="h6" sx={{ mr: 1 }}>
                            {formatScore(risk.score)}
                          </Typography>
                          <Chip
                            label={risk.level}
                            size="small"
                            color={getRiskColor(risk.level)}
                          />
                        </Box>
                        <List dense>
                          {risk.recommendations.map((rec: string, index: number) => (
                            <ListItem key={index}>
                              <ListItemIcon>
                                {risk.level === 'High' ? (
                                  <Warning color="error" />
                                ) : (
                                  <CheckCircle color="success" />
                                )}
                              </ListItemIcon>
                              <ListItemText primary={rec} />
                            </ListItem>
                          ))}
                        </List>
                      </CardContent>
                    </Card>
                  </Grid>
                ))}
              </Grid>
            </AccordionDetails>
          </Accordion>
        </Grid>

        {/* Neighborhood Risks */}
        <Grid item xs={12}>
          <Accordion>
            <AccordionSummary expandIcon={<ExpandMore />}>
              <Box sx={{ display: 'flex', alignItems: 'center' }}>
                <LocationCity sx={{ mr: 1 }} />
                <Typography variant="h6">Neighborhood Risks</Typography>
              </Box>
            </AccordionSummary>
            <AccordionDetails>
              <Grid container spacing={2}>
                {riskAnalysis?.neighborhoodRisks && Object.entries(riskAnalysis.neighborhoodRisks).map(([key, risk]: [string, any]) => (
                  <Grid item xs={12} sm={6} key={key}>
                    <Card>
                      <CardContent>
                        <Typography color="textSecondary" gutterBottom>
                          {risk.description}
                        </Typography>
                        <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                          <Typography variant="h6" sx={{ mr: 1 }}>
                            {formatScore(risk.score)}
                          </Typography>
                          <Chip
                            label={risk.level}
                            size="small"
                            color={getRiskColor(risk.level)}
                          />
                        </Box>
                        <List dense>
                          {risk.recommendations.map((rec: string, index: number) => (
                            <ListItem key={index}>
                              <ListItemIcon>
                                {risk.level === 'High' ? (
                                  <Warning color="error" />
                                ) : (
                                  <CheckCircle color="success" />
                                )}
                              </ListItemIcon>
                              <ListItemText primary={rec} />
                            </ListItem>
                          ))}
                        </List>
                      </CardContent>
                    </Card>
                  </Grid>
                ))}
              </Grid>
            </AccordionDetails>
          </Accordion>
        </Grid>
      </Grid>
    </Box>
  );
}; 