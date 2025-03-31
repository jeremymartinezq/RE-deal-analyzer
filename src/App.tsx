import React, { Suspense, lazy } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { CircularProgress, Box } from '@mui/material';
import { ErrorBoundary } from './components/ErrorBoundary';

// Lazy load components
const OverviewTab = lazy(() => import('./components/tabs/OverviewTab'));
const FinancialAnalysisTab = lazy(() => import('./components/tabs/FinancialAnalysisTab'));
const MarketDataTab = lazy(() => import('./components/tabs/MarketDataTab'));
const RiskAnalysisTab = lazy(() => import('./components/tabs/RiskAnalysisTab'));

// Loading fallback component
const LoadingFallback = () => (
  <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
    <CircularProgress />
  </Box>
);

// Prefetch components on idle
const prefetchComponents = () => {
  if ('requestIdleCallback' in window) {
    requestIdleCallback(() => {
      // Prefetch components that are likely to be used
      const prefetchPromises = [
        import('./components/tabs/OverviewTab'),
        import('./components/tabs/FinancialAnalysisTab')
      ];
      
      Promise.all(prefetchPromises).catch(() => {
        // Silently fail prefetch
      });
    });
  }
};

// Start prefetching after initial render
if (typeof window !== 'undefined') {
  prefetchComponents();
}

export const App: React.FC = () => {
  const [propertyData, setPropertyData] = React.useState({});
  const [marketData, setMarketData] = React.useState({});

  return (
    <ErrorBoundary>
      <Router>
        <Suspense fallback={<LoadingFallback />}>
          <Routes>
            <Route 
              path="/" 
              element={
                <Suspense fallback={<LoadingFallback />}>
                  <OverviewTab 
                    propertyData={propertyData}
                    marketData={marketData}
                  />
                </Suspense>
              } 
            />
            <Route 
              path="/financial" 
              element={
                <Suspense fallback={<LoadingFallback />}>
                  <FinancialAnalysisTab 
                    propertyData={propertyData}
                    marketData={marketData}
                  />
                </Suspense>
              } 
            />
            <Route 
              path="/market" 
              element={
                <Suspense fallback={<LoadingFallback />}>
                  <MarketDataTab 
                    propertyData={propertyData}
                    marketData={marketData}
                  />
                </Suspense>
              } 
            />
            <Route 
              path="/risk" 
              element={
                <Suspense fallback={<LoadingFallback />}>
                  <RiskAnalysisTab
                    propertyData={propertyData}
                    marketData={marketData}
                  />
                </Suspense>
              } 
            />
          </Routes>
        </Suspense>
      </Router>
    </ErrorBoundary>
  );
}; 