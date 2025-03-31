describe('Property Analysis E2E', () => {
  beforeEach(() => {
    // Mock API responses
    cy.intercept('GET', '**/api/market-data/*', {
      statusCode: 200,
      body: {
        medianHomePrice: 300000,
        medianRent: 2000,
        priceToRentRatio: 12.5,
        appreciationRate: 0.05,
        averageDaysOnMarket: 30,
        marketScore: 85
      }
    }).as('getMarketData');

    cy.intercept('POST', '**/api/comps', {
      statusCode: 200,
      body: [
        {
          address: '123 Main St',
          price: 290000,
          squareFootage: 2000,
          pricePerSqFt: 145,
          daysOnMarket: 25
        },
        {
          address: '456 Oak Ave',
          price: 310000,
          squareFootage: 2100,
          pricePerSqFt: 148,
          daysOnMarket: 35
        }
      ]
    }).as('getComps');

    cy.intercept('GET', '**/api/mortgage-rates', {
      statusCode: 200,
      body: {
        thirtyYearFixed: 3.5,
        fifteenYearFixed: 2.75,
        sevenYearArm: 2.5
      }
    }).as('getMortgageRates');

    cy.intercept('POST', '**/api/ai-analysis', {
      statusCode: 200,
      body: {
        propertyScore: 85,
        riskFactors: ['high_price_to_rent'],
        appreciationForecast: 0.03,
        recommendedActions: ['consider_long_term_hold']
      }
    }).as('getPropertyAnalysis');

    // Visit the app
    cy.visit('/');
  });

  it('should complete full property analysis workflow', () => {
    // Enter property details
    cy.findByLabelText(/address/i).type('123 Test St');
    cy.findByLabelText(/price/i).type('300000');
    cy.findByLabelText(/square footage/i).type('2000');
    cy.findByLabelText(/bedrooms/i).type('3');
    cy.findByLabelText(/bathrooms/i).type('2');
    cy.findByLabelText(/year built/i).type('2000');

    // Submit analysis
    cy.findByRole('button', { name: /analyze property/i }).click();

    // Wait for market data and verify
    cy.wait('@getMarketData');
    cy.findByText(/median home price/i).should('be.visible');
    cy.findByText(/\$300,000/).should('be.visible');

    // Navigate to financial tab
    cy.findByRole('tab', { name: /financial/i }).click();

    // Wait for mortgage rates and verify
    cy.wait('@getMortgageRates');
    cy.findByText(/30-year fixed/i).should('be.visible');
    cy.findByText(/3.5%/).should('be.visible');

    // Navigate to market data tab
    cy.findByRole('tab', { name: /market/i }).click();

    // Wait for comps and verify
    cy.wait('@getComps');
    cy.findByText(/123 main st/i).should('be.visible');
    cy.findByText(/456 oak ave/i).should('be.visible');

    // Navigate to risk analysis tab
    cy.findByRole('tab', { name: /risk/i }).click();

    // Wait for analysis and verify
    cy.wait('@getPropertyAnalysis');
    cy.findByText(/property score: 85/i).should('be.visible');
    cy.findByText(/high price to rent/i).should('be.visible');

    // Test responsive design
    cy.viewport('iphone-x');
    cy.findByRole('button', { name: /menu/i }).should('be.visible');
    
    // Test offline functionality
    cy.window().then((win) => {
      win.navigator.serviceWorker.register('/service-worker.js');
    });
    
    cy.log('Going offline');
    cy.window().then((win) => {
      win.navigator.onLine = false;
      win.dispatchEvent(new Event('offline'));
    });

    // Should still show cached data
    cy.findByText(/median home price/i).should('be.visible');
    cy.findByText(/\$300,000/).should('be.visible');

    // Test error handling
    cy.intercept('GET', '**/api/market-data/*', {
      statusCode: 500,
      body: { error: 'Internal server error' }
    }).as('getMarketDataError');

    cy.log('Going online');
    cy.window().then((win) => {
      win.navigator.onLine = true;
      win.dispatchEvent(new Event('online'));
    });

    // Refresh analysis
    cy.findByRole('button', { name: /refresh/i }).click();

    // Should show error message
    cy.findByText(/error fetching market data/i).should('be.visible');

    // Test performance monitoring
    cy.window().then((win) => {
      expect(win.performance.getEntriesByType('resource')).to.have.length.greaterThan(0);
    });
  });

  it('should handle form validation', () => {
    // Try to submit without required fields
    cy.findByRole('button', { name: /analyze property/i }).click();
    cy.findByText(/address is required/i).should('be.visible');
    cy.findByText(/price is required/i).should('be.visible');

    // Enter invalid data
    cy.findByLabelText(/price/i).type('-1000');
    cy.findByText(/price must be positive/i).should('be.visible');

    // Enter valid data
    cy.findByLabelText(/address/i).type('123 Test St');
    cy.findByLabelText(/price/i).clear().type('300000');

    // Should allow submission
    cy.findByRole('button', { name: /analyze property/i }).click();
    cy.wait('@getMarketData');
  });

  it('should persist user preferences', () => {
    // Set dark mode
    cy.findByRole('button', { name: /toggle theme/i }).click();
    cy.get('body').should('have.css', 'background-color', 'rgb(18, 18, 18)');

    // Reload page
    cy.reload();

    // Should maintain dark mode
    cy.get('body').should('have.css', 'background-color', 'rgb(18, 18, 18)');
  });
}); 