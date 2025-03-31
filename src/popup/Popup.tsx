import React, { useState, useEffect } from 'react';
import {
  Box,
  Container,
  Typography,
  Tab,
  Tabs,
  Paper,
  CircularProgress,
  IconButton,
  AppBar,
  Toolbar,
  Alert,
} from '@mui/material';
import {
  Brightness4,
  Brightness7,
  Home,
  AttachMoney,
  TrendingUp,
  Warning,
} from '@mui/icons-material';
import { styled } from '@mui/material/styles';
import { useTheme } from '../context/ThemeContext';
import { OverviewTab } from '../components/tabs/OverviewTab';
import { FinancialAnalysisTab } from '../components/tabs/FinancialAnalysisTab';
import { MarketDataTab } from '../components/tabs/MarketDataTab';
import { RiskAnalysisTab } from '../components/tabs/RiskAnalysisTab';
import { getMarketData } from '../services/marketDataService';

interface TabPanelProps {
  children?: React.ReactNode;
  index: number;
  value: number;
}

const PopupContainer = styled(Container)({
  width: '350px',
  minHeight: '600px',
  padding: '0',
  overflow: 'hidden',
  backgroundColor: '#f8f9fe',
});

const StyledAppBar = styled(AppBar)({
  backgroundColor: '#6c5ce7',
  color: 'white',
  boxShadow: 'none',
});

const StyledTabs = styled(Tabs)({
  backgroundColor: 'white',
  '& .MuiTab-root': {
    minWidth: '80px',
    padding: '6px 12px',
    fontSize: '12px',
  },
});

const ContentBox = styled(Box)({
  padding: '16px',
  backgroundColor: '#f8f9fe',
});

function TabPanel(props: TabPanelProps) {
  const { children, value, index, ...other } = props;

  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`tabpanel-${index}`}
      aria-labelledby={`tab-${index}`}
      {...other}
    >
      {value === index && <Box>{children}</Box>}
    </div>
  );
}

export default function Popup() {
  const { mode, toggleTheme } = useTheme();
  const [tabValue, setTabValue] = useState(0);
  const [loading, setLoading] = useState(true);
  const [propertyData, setPropertyData] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);
  const [marketData, setMarketData] = useState<any>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
        const url = tab.url || '';
        const isSupported = 
          url.includes('zillow.com') ||
          url.includes('realtor.com') ||
          url.includes('redfin.com') ||
          url.includes('loopnet.com');

        if (!isSupported) {
          setError('This website is not supported. Please visit Zillow, Realtor.com, Redfin, or LoopNet.');
          setLoading(false);
          return;
        }

        // Get property data from content script
        chrome.tabs.sendMessage(
          tab.id!,
          { action: 'extractPropertyData' },
          async (response) => {
            if (chrome.runtime.lastError) {
              setError('Unable to extract property data. Please refresh the page and try again.');
              console.error('Error:', chrome.runtime.lastError);
              setLoading(false);
            } else if (!response) {
              setError('No property data found. Please make sure you are on a property listing page.');
              setLoading(false);
            } else {
              setPropertyData(response);
              
              // Fetch market data with all available parameters
              if (response.zipCode) {
                try {
                  const marketInfo = await getMarketData(
                    response.zipCode,
                    response.address,
                    response.latitude,
                    response.longitude
                  );
                  setMarketData(marketInfo);
                } catch (error) {
                  console.error('Error fetching market data:', error);
                  setError('Error fetching market data. Some features may be limited.');
                }
              }
              
              setLoading(false);
            }
          }
        );
      } catch (error) {
        console.error('Error:', error);
        setError('An error occurred. Please try again.');
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
    setTabValue(newValue);
  };

  const exportToPDF = async () => {
    if (!propertyData || !marketData) return;
    
    const reportData = {
      property: propertyData,
      market: marketData,
      analysis: {
        financial: {
          grossRent: propertyData.rentZestimate || 'N/A',
          netRent: marketData.medianRent || 'N/A',
          capRate: marketData.marketHealthIndex ? `${marketData.marketHealthIndex.toFixed(1)}%` : 'N/A',
          cashOnCash: marketData.yearOverYearAppreciation ? `${marketData.yearOverYearAppreciation.toFixed(1)}%` : 'N/A'
        },
        market: {
          medianHomeValue: marketData.medianHomeValue,
          medianRent: marketData.medianRent,
          appreciation: marketData.yearOverYearAppreciation,
          daysOnMarket: marketData.medianDaysOnMarket
        },
        risk: {
          crimeRate: marketData.crimeRate.score,
          schoolRating: marketData.schoolRating,
          walkScore: marketData.walkScore,
          transitScore: marketData.transitScore
        }
      }
    };

    // Send message to background script to generate PDF
    chrome.runtime.sendMessage({
      action: 'generatePDF',
      data: reportData
    });
  };

  const exportToCSV = () => {
    if (!propertyData || !marketData) return;

    const data = [
      ['Property Analysis Report'],
      ['Generated on:', new Date().toLocaleString()],
      [],
      ['Property Details'],
      ['Address:', propertyData.address],
      ['Price:', propertyData.price],
      ['Square Footage:', propertyData.squareFootage],
      ['Bedrooms:', propertyData.bedrooms],
      ['Bathrooms:', propertyData.bathrooms],
      [],
      ['Financial Analysis'],
      ['Gross Rent:', propertyData.rentZestimate],
      ['Net Rent:', marketData.medianRent],
      ['Cap Rate:', `${marketData.marketHealthIndex}%`],
      ['Cash on Cash:', `${marketData.yearOverYearAppreciation}%`],
      [],
      ['Market Data'],
      ['Median Home Value:', marketData.medianHomeValue],
      ['Median Rent:', marketData.medianRent],
      ['Year Over Year Appreciation:', `${marketData.yearOverYearAppreciation}%`],
      ['Days on Market:', marketData.medianDaysOnMarket],
      [],
      ['Risk Assessment'],
      ['Crime Rate:', marketData.crimeRate.score],
      ['School Rating:', marketData.schoolRating],
      ['Walk Score:', marketData.walkScore],
      ['Transit Score:', marketData.transitScore]
    ];

    const csvContent = data.map(row => row.join(',')).join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `property-analysis-${new Date().toISOString().split('T')[0]}.csv`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    window.URL.revokeObjectURL(url);
  };

  if (loading) {
    return (
      <PopupContainer>
        <Box
          sx={{
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'center',
            alignItems: 'center',
            height: '600px',
          }}
        >
          <CircularProgress />
          <Typography sx={{ mt: 2 }}>
            Analyzing property data...
          </Typography>
        </Box>
      </PopupContainer>
    );
  }

  if (error) {
    return (
      <PopupContainer>
        <StyledAppBar position="static">
          <Toolbar>
            <Box sx={{ display: 'flex', alignItems: 'center', flexGrow: 1 }}>
              <img 
                src="/icons/icon.svg" 
                alt="Logo" 
                style={{ 
                  width: 24, 
                  height: 24, 
                  marginRight: '8px' 
                }} 
              />
              <Typography variant="h6" component="h1">
                BetterDeal
              </Typography>
            </Box>
            <IconButton 
              onClick={exportToPDF} 
              sx={{ color: 'white', mr: 1 }}
              title="Export to PDF"
            >
              <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
                <path d="M20 2H8c-1.1 0-2 .9-2 2v12c0 1.1.9 2 2 2h12c1.1 0 2-.9 2-2V4c0-1.1-.9-2-2-2zm-8.5 7.5c0 .83-.67 1.5-1.5 1.5H9v2H7.5V7H10c.83 0 1.5.67 1.5 1.5v1zm5 2c0 .83-.67 1.5-1.5 1.5h-2.5V7H15c.83 0 1.5.67 1.5 1.5v3zm4-3H19v1h1.5V11H19v2h-1.5V7h3v1.5zM9 9.5h1v-1H9v1zM4 6H2v14c0 1.1.9 2 2 2h14v-2H4V6zm10 5.5h1v-3h-1v3z"/>
              </svg>
            </IconButton>
            <IconButton 
              onClick={exportToCSV}
              sx={{ color: 'white', mr: 1 }}
              title="Export to CSV"
            >
              <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
                <path d="M14 2H6c-1.1 0-1.99.9-1.99 2L4 20c0 1.1.89 2 1.99 2H18c1.1 0 2-.9 2-2V8l-6-6zM6 20V4h7v5h5v11H6z"/>
                <path d="M8 12h8v2H8zm0 4h8v2H8zm0-8h5v2H8z"/>
              </svg>
            </IconButton>
            <IconButton onClick={toggleTheme} sx={{ color: 'white' }}>
              {mode === 'dark' ? <Brightness7 /> : <Brightness4 />}
            </IconButton>
          </Toolbar>
        </StyledAppBar>
        <Box sx={{ p: 3 }}>
          <Alert severity="warning" sx={{ mt: 2 }}>
            {error}
          </Alert>
        </Box>
      </PopupContainer>
    );
  }

  return (
    <PopupContainer>
      <StyledAppBar position="static">
        <Toolbar>
          <Box sx={{ display: 'flex', alignItems: 'center', flexGrow: 1 }}>
            <img 
              src="/icons/icon.svg" 
              alt="Logo" 
              style={{ 
                width: 24, 
                height: 24, 
                marginRight: '8px' 
              }} 
            />
            <Typography variant="h6" component="h1">
              BetterDeal
            </Typography>
          </Box>
          <IconButton 
            onClick={exportToPDF} 
            sx={{ color: 'white', mr: 1 }}
            title="Export to PDF"
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
              <path d="M20 2H8c-1.1 0-2 .9-2 2v12c0 1.1.9 2 2 2h12c1.1 0 2-.9 2-2V4c0-1.1-.9-2-2-2zm-8.5 7.5c0 .83-.67 1.5-1.5 1.5H9v2H7.5V7H10c.83 0 1.5.67 1.5 1.5v1zm5 2c0 .83-.67 1.5-1.5 1.5h-2.5V7H15c.83 0 1.5.67 1.5 1.5v3zm4-3H19v1h1.5V11H19v2h-1.5V7h3v1.5zM9 9.5h1v-1H9v1zM4 6H2v14c0 1.1.9 2 2 2h14v-2H4V6zm10 5.5h1v-3h-1v3z"/>
            </svg>
          </IconButton>
          <IconButton 
            onClick={exportToCSV}
            sx={{ color: 'white', mr: 1 }}
            title="Export to CSV"
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
              <path d="M14 2H6c-1.1 0-1.99.9-1.99 2L4 20c0 1.1.89 2 1.99 2H18c1.1 0 2-.9 2-2V8l-6-6zM6 20V4h7v5h5v11H6z"/>
              <path d="M8 12h8v2H8zm0 4h8v2H8zm0-8h5v2H8z"/>
            </svg>
          </IconButton>
          <IconButton onClick={toggleTheme} sx={{ color: 'white' }}>
            {mode === 'dark' ? <Brightness7 /> : <Brightness4 />}
          </IconButton>
        </Toolbar>
      </StyledAppBar>

      <Paper 
        elevation={0} 
        square 
        sx={{ 
          bgcolor: '#f8f9fe',
          minHeight: 'calc(100vh - 64px)'
        }}
      >
        <StyledTabs
          value={tabValue}
          onChange={handleTabChange}
          aria-label="analysis tabs"
          variant="fullWidth"
          indicatorColor="primary"
          textColor="primary"
        >
          <Tab
            icon={<Home sx={{ fontSize: 20 }} />}
            label="Overview"
            iconPosition="start"
          />
          <Tab
            icon={<AttachMoney sx={{ fontSize: 20 }} />}
            label="Financial"
            iconPosition="start"
          />
          <Tab
            icon={<TrendingUp sx={{ fontSize: 20 }} />}
            label="Market"
            iconPosition="start"
          />
          <Tab
            icon={<Warning sx={{ fontSize: 20 }} />}
            label="Risk"
            iconPosition="start"
          />
        </StyledTabs>

        <ContentBox>
          <TabPanel value={tabValue} index={0}>
            <OverviewTab 
              propertyData={propertyData}
              marketData={marketData}
            />
          </TabPanel>

          <TabPanel value={tabValue} index={1}>
            <FinancialAnalysisTab 
              propertyData={propertyData}
              marketData={marketData}
            />
          </TabPanel>

          <TabPanel value={tabValue} index={2}>
            <MarketDataTab 
              propertyData={propertyData}
              marketData={marketData}
            />
          </TabPanel>

          <TabPanel value={tabValue} index={3}>
            <RiskAnalysisTab
              propertyData={propertyData}
              marketData={marketData}
            />
          </TabPanel>
        </ContentBox>
      </Paper>
    </PopupContainer>
  );
} 