# Real Estate Deal Analyzer

A comprehensive real estate investment analysis tool that helps investors evaluate properties and market conditions, leveraging advanced AI algorithms and machine learning models to provide detailed financial analysis, risk assessment, and market insights. The tool combines traditional real estate metrics with cutting-edge technology to deliver accurate property valuations, generate professional investment reports, and offer data-driven recommendations for investment decisions across residential, commercial, and mixed-use properties.

## Features

- Property valuation and analysis
- Market data and trends
- Comparable properties analysis
- Investment risk assessment
- Mortgage rate comparison
- Walk Score integration
- Offline support
- Real-time market data
- Advanced financial modeling
- Risk-adjusted return analysis
- AI-powered report generation
- Excel and PDF exports

### Financial Analysis Features

- **Investment Metrics**
  - Cap Rate
  - Cash on Cash Return
  - Net Operating Income (NOI)
  - Internal Rate of Return (IRR)
  - Return on Investment (ROI)
  - Debt Service Coverage Ratio (DSCR)
  - Gross Rent Multiplier (GRM)
  - Break-even Analysis
  - Price to Rent Ratio
  - Equity Multiple
  - Net Present Value (NPV)
  - Modified Internal Rate of Return (MIRR)

- **Cash Flow Analysis**
  - Monthly and Annual Cash Flow
  - Income Analysis
  - Expense Tracking
  - Vacancy Rate Impact
  - Operating Expense Ratio
  - Net Income Multiplier
  - Debt Coverage Analysis
  - Cash Reserve Requirements

- **Mortgage Analysis**
  - Monthly Payment Calculation
  - PMI Estimation
  - Amortization Schedule
  - Early Payoff Scenarios
  - Refinancing Analysis
  - Interest Rate Sensitivity
  - Loan-to-Value Ratio
  - Debt-to-Income Ratio

- **Scenario Analysis**
  - Conservative Estimates
  - Moderate Projections
  - Optimistic Scenarios
  - Risk Assessment
  - Monte Carlo Simulation
  - Sensitivity Analysis
  - Market Cycle Impact
  - Economic Factor Analysis

- **Operating Expenses**
  - Property Tax
  - Insurance
  - Utilities
  - Maintenance
  - Property Management
  - Vacancy Reserves
  - Capital Expenditures
  - HOA Fees
  - Special Assessments
  - Professional Services
  - Marketing Costs
  - Emergency Reserves

- **Tax Analysis**
  - Depreciation Schedule
  - Tax Deductions
  - Capital Gains Estimation
  - 1031 Exchange Analysis
  - Cost Segregation
  - Tax-Equivalent Yield

### Export and Reporting Features

- **AI-Generated Investment Memo**
  - Executive Summary
  - Property Overview
  - Market Analysis
  - Financial Projections
  - Risk Assessment
  - Investment Recommendations
  - Supporting Documentation
  - Custom Branding Options
  - Professional Formatting
  - Automated Data Population

- **Excel Export Features**
  - Investment Analysis Spreadsheet
  - Amortization Schedule
  - Cash Flow Projections
  - Operating Expense Breakdown
  - Comparative Market Analysis
  - Custom Financial Models
  - Scenario Analysis Tables
  - Tax Planning Worksheets
  - Auto-updating Formulas
  - Template Customization

- **Export Options**
  - One-Click PDF Generation
  - Excel Workbook Export
  - Cloud Storage Integration
  - Email Sharing
  - Batch Export
  - Version Control
  - Auto-Save Feature
  - Custom Report Templates
  - Data Backup
  - Secure File Handling

### AI Integration

The application leverages artificial intelligence for:

- **Report Generation**
  - Natural Language Processing for narrative sections
  - Automated data analysis and insights
  - Market trend interpretation
  - Risk factor identification
  - Investment recommendation generation
  - Dynamic content organization

- **Financial Analysis**
  - Pattern recognition in market data
  - Predictive modeling
  - Anomaly detection
  - Investment scenario optimization
  - Automated data validation
  - Trend forecasting

- **Data Processing**
  - Automated data cleaning
  - Format standardization
  - Error detection
  - Missing data imputation
  - Outlier identification
  - Data consistency checks

### Report Template Customization

- **Branding Elements**
  - Company logo placement
  - Custom color schemes
  - Font selection and styling
  - Header and footer customization
  - Watermark options
  - Page layout templates

- **Content Modules**
  - Drag-and-drop section arrangement
  - Custom section creation
  - Dynamic chart templates
  - Conditional content blocks
  - Custom metric displays
  - Interactive elements

- **Document Settings**
  - Page size and orientation
  - Margin configuration
  - Multi-language support
  - Accessibility options
  - Print optimization
  - Digital signature integration

### AI Models and Analysis

- **Natural Language Processing**
  - GPT-4 for narrative generation
  - BERT for market sentiment analysis
  - T5 for data summarization
  - RoBERTa for risk assessment
  - XLNet for trend analysis

- **Financial Modeling**
  - Random Forest for price prediction
  - LSTM for time series forecasting
  - XGBoost for risk modeling
  - Neural Networks for market analysis
  - Gradient Boosting for yield optimization

- **Computer Vision**
  - ResNet for property image analysis
  - YOLO for property condition assessment
  - ViT for aerial imagery analysis
  - Mask R-CNN for property feature detection

### Document Management Integration

- **Cloud Storage**
  - Google Drive integration
  - Dropbox sync
  - OneDrive connection
  - Box enterprise support
  - iCloud compatibility

- **Document Management Systems**
  - SharePoint integration
  - DocuSign compatibility
  - Salesforce document sync
  - HubSpot CRM connection
  - Custom DMS API support

- **Collaboration Features**
  - Real-time co-editing
  - Version control
  - Comment tracking
  - Change history
  - Access control
  - Audit logging

### Enhanced Export Options

- **Document Formats**
  - PDF/A for archival
  - Interactive PDF with forms
  - Excel (XLSX, XLSM)
  - Google Sheets
  - CSV/TSV data
  - JSON/XML data
  - HTML reports
  - Markdown documentation

- **Presentation Formats**
  - PowerPoint presentations
  - Google Slides
  - Interactive web presentations
  - Mobile-optimized formats
  - Investor pitch decks

- **Data Export**
  - API endpoint access
  - GraphQL queries
  - Real-time data feeds
  - Batch export scheduling
  - Custom data pipelines
  - Integration webhooks

- **Specialized Reports**
  - Executive summaries
  - Due diligence packages
  - Investment committee memos
  - Lender packages
  - Property condition reports
  - Market analysis reports
  - Tax planning documents

### Implementation Examples

- **Report Generation**
  ```typescript
  // Generate investment memo with AI analysis
  const report = await ReportGenerator.createMemo({
    propertyId: 'prop123',
    templateId: 'investment-memo',
    options: {
      includeAiInsights: true,
      language: 'en',
      format: 'pdf',
      branding: {
        logo: '/path/to/logo.png',
        colors: { primary: '#1a73e8' }
      }
    }
  });

  // Export financial analysis to Excel
  const workbook = await ExcelExporter.generateAnalysis({
    propertyData,
    includeSheets: ['cashflow', 'metrics', 'scenarios'],
    customFormulas: true,
    autoUpdate: true
  });
  ```

- **AI Model Integration**
  ```typescript
  // Market sentiment analysis using BERT
  const sentiment = await MarketAnalyzer.analyzeSentiment({
    location: propertyData.location,
    timeframe: '12months',
    dataPoints: ['news', 'social', 'listings']
  });

  // Property value prediction using LSTM
  const forecast = await PricePredictor.forecast({
    propertyType: 'multifamily',
    location: propertyData.location,
    features: propertyData.features,
    horizon: '24months'
  });
  ```

### Integration Workflows

- **Document Management Flow**
  ```typescript
  // Save and sync with multiple platforms
  const docManager = new DocumentManager({
    providers: ['gdrive', 'dropbox', 'sharepoint'],
    autoSync: true
  });

  await docManager.saveReport({
    report: investmentMemo,
    metadata: {
      property: propertyData,
      version: '1.0',
      access: ['team', 'clients']
    }
  });
  ```

- **Collaboration Features**
  ```typescript
  // Real-time collaboration setup
  const collaborationSession = await CollaborationManager.initSession({
    documentId: 'memo123',
    users: ['analyst@company.com', 'investor@company.com'],
    permissions: {
      'analyst@company.com': ['edit', 'comment'],
      'investor@company.com': ['view', 'comment']
    }
  });
  ```

### Advanced Configuration

- **Custom Template Configuration**
  ```yaml
  # template-config.yaml
  template:
    name: "Investment Committee Memo"
    sections:
      - executive_summary:
          ai_enhanced: true
          required: true
      - financial_analysis:
          metrics: ["irr", "coc", "dscr"]
          charts: ["cashflow", "sensitivity"]
      - market_analysis:
          ai_models: ["sentiment", "forecast"]
          data_sources: ["attom", "zillow"]
    export_formats:
      - pdf:
          interactive: true
          digital_signatures: true
      - excel:
          protected_formulas: true
          auto_update: true
  ```

- **AI Model Configuration**
  ```yaml
  # ai-config.yaml
  models:
    text_generation:
      engine: "gpt-4"
      temperature: 0.7
      context_window: 8000
    market_analysis:
      model: "lstm"
      layers: 3
      training_window: "5years"
    risk_assessment:
      model: "xgboost"
      features: ["market", "property", "financial"]
      confidence_threshold: 0.85
  ```

### Security and Compliance

- **Data Protection**
  - AES-256 encryption for stored reports
  - End-to-end encryption for shared documents
  - GDPR compliance features
  - Data retention policies
  - Audit trail generation

- **Access Control**
  - Role-based access control (RBAC)
  - Multi-factor authentication
  - IP-based restrictions
  - Session management
  - API key rotation

- **Compliance Features**
  - SOC 2 compliance
  - CCPA compliance
  - Document watermarking
  - Digital signatures
  - Compliance reporting

### Performance Optimizations

- **Report Generation**
  - Parallel processing for multi-section reports
  - Lazy loading of heavy components
  - Caching of frequently used templates
  - Background processing for large datasets
  - Progressive loading for web views

- **Export Operations**
  - Batch processing for multiple exports
  - Compression optimization
  - Cloud storage optimization
  - Memory usage management
  - Queue management for large operations

### Additional Configuration Options

- **Application Configuration**
  ```yaml
  # app-config.yaml
  application:
    cache:
      strategy: "adaptive"
      ttl:
        market_data: 3600  # 1 hour
        property_data: 86400  # 24 hours
        analysis_results: 43200  # 12 hours
    api:
      retry:
        max_attempts: 3
        backoff: "exponential"
      rate_limiting:
        window: 3600
        max_requests: 100
    export:
      default_format: "pdf"
      compression: true
      batch_size: 50
    notifications:
      enabled: true
      channels: ["email", "in-app"]
  ```

- **UI Customization**
  ```yaml
  # ui-config.yaml
  theme:
    colors:
      primary: "#1a73e8"
      secondary: "#34a853"
      accent: "#fbbc04"
    typography:
      font_family: "Roboto, sans-serif"
      scale_factor: 1.2
    components:
      buttons:
        style: "rounded"
        animation: true
      charts:
        color_scheme: "professional"
        interactive: true
  ```

- **Integration Settings**
  ```yaml
  # integration-config.yaml
  integrations:
    crm:
      provider: "salesforce"
      sync_interval: 900  # 15 minutes
      fields_mapping:
        property_id: "SF_Property__c"
        analysis_date: "Analysis_Date__c"
    email:
      provider: "sendgrid"
      templates:
        report_ready: "d-123456789"
        share_analysis: "d-987654321"
    analytics:
      provider: "google-analytics"
      tracking_id: "UA-XXXXXXXX-X"
  ```

### Error Handling and Troubleshooting

- **Common Error Scenarios**
  ```typescript
  try {
    const analysis = await PropertyAnalyzer.analyze(propertyData);
  } catch (error) {
    if (error instanceof ApiRateLimitError) {
      // Handle rate limit
      await RateLimiter.waitForNextWindow();
      return await PropertyAnalyzer.analyze(propertyData);
    } else if (error instanceof DataValidationError) {
      // Handle invalid data
      const cleanedData = await DataCleaner.fix(propertyData);
      return await PropertyAnalyzer.analyze(cleanedData);
    } else if (error instanceof NetworkError) {
      // Handle network issues
      await NetworkRetry.withExponentialBackoff(
        () => PropertyAnalyzer.analyze(propertyData)
      );
    }
  }
  ```

- **Error Recovery Strategies**
  ```typescript
  class ErrorRecovery {
    static async handleAnalysisError(error: AnalysisError) {
      switch (error.type) {
        case 'MISSING_DATA':
          return await this.fetchMissingData(error.details);
        case 'CALCULATION_ERROR':
          return await this.recalculateWithDefaults(error.context);
        case 'MODEL_ERROR':
          return await this.fallbackToBasicAnalysis(error.propertyData);
        default:
          throw new UnrecoverableError(error);
      }
    }
  }
  ```

- **Troubleshooting Guide**
  ```markdown
  ## Common Issues

  1. API Connection Failures
     - Check API key validity
     - Verify network connectivity
     - Confirm rate limit status

  2. Report Generation Errors
     - Validate input data completeness
     - Check template compatibility
     - Verify file permissions

  3. Analysis Calculation Issues
     - Confirm input data ranges
     - Check formula dependencies
     - Verify calculation parameters
  ```

### Custom Report Templates

- **Investment Summary Template**
  ```yaml
  # templates/investment-summary.yaml
  template:
    id: "investment-summary"
    name: "Professional Investment Summary"
    sections:
      header:
        type: "dynamic"
        components:
          - logo: { align: "left", max_height: 60 }
          - title: { align: "center", style: "heading_1" }
          - date: { align: "right", format: "MMMM DD, YYYY" }
      
      executive_summary:
        type: "ai_generated"
        parameters:
          tone: "professional"
          length: "medium"
          key_points: ["highlights", "recommendations"]
      
      financial_metrics:
        type: "grid"
        columns: 2
        metrics:
          - cap_rate: { format: "percentage", threshold: 5 }
          - coc_return: { format: "percentage", threshold: 8 }
          - irr_5year: { format: "percentage", threshold: 15 }
          - debt_coverage: { format: "decimal", threshold: 1.25 }
      
      market_analysis:
        type: "dynamic"
        components:
          - market_trends_chart: { period: "5years", type: "line" }
          - comparable_properties: { limit: 5, radius: "2miles" }
          - demographic_data: { metrics: ["income", "population", "growth"] }
      
      risk_assessment:
        type: "ai_generated"
        parameters:
          factors: ["market", "property", "financial"]
          visualization: "radar_chart"
      
      appendix:
        type: "dynamic"
        components:
          - data_sources: { include: "all" }
          - methodology: { detail_level: "detailed" }
          - disclaimers: { required: true }
  ```

### AI Training and Updates

- **Model Training Pipeline**
  ```yaml
  # training-pipeline.yaml
  pipeline:
    data_preparation:
      sources:
        - historical_transactions:
            timeframe: "10years"
            cleaning: ["outlier_removal", "normalization"]
        - market_indicators:
            frequency: "monthly"
            features: ["price_index", "inventory", "days_on_market"]
        - property_features:
            types: ["physical", "location", "financial"]
    
    model_training:
      price_prediction:
        model: "lstm"
        parameters:
          layers: 4
          units: [64, 32, 16, 1]
          dropout: 0.2
          optimizer: "adam"
        validation:
          split: 0.2
          metrics: ["mae", "mape", "rmse"]
      
      market_analysis:
        model: "xgboost"
        parameters:
          max_depth: 6
          learning_rate: 0.1
          n_estimators: 1000
        features:
          - economic_indicators
          - demographic_trends
          - market_sentiment
      
      risk_assessment:
        model: "random_forest"
        parameters:
          n_estimators: 500
          max_features: "sqrt"
          class_weight: "balanced"
    
    deployment:
      strategy: "blue_green"
      monitoring:
        metrics: ["accuracy", "latency", "drift"]
      rollback:
        threshold:
          accuracy_drop: 0.05
          latency_increase: 100
  ```

- **Model Update Schedule**
  ```yaml
  # model-updates.yaml
  update_schedule:
    price_prediction:
      frequency: "monthly"
      data_window: "rolling_5years"
      retraining_trigger:
        accuracy_threshold: 0.85
        data_drift_threshold: 0.1
    
    market_analysis:
      frequency: "quarterly"
      data_window: "expanding"
      retraining_trigger:
        performance_drop: 0.1
        feature_importance_shift: 0.2
    
    risk_assessment:
      frequency: "semi_annual"
      validation_set: "most_recent_20percent"
      retraining_trigger:
        f1_score_threshold: 0.8
        confusion_matrix_shift: 0.15
  ```

### AI Model Validation and Monitoring

- **Validation Framework**
  ```python
  # validation_framework.py
  class ModelValidator:
    def validate_predictions(self, predictions, actual_values):
      metrics = {
        'mae': mean_absolute_error(actual_values, predictions),
        'rmse': sqrt(mean_squared_error(actual_values, predictions)),
        'mape': mean_absolute_percentage_error(actual_values, predictions),
        'r2': r2_score(actual_values, predictions)
      }
      
      # Custom validation rules
      validation_rules = {
        'mae_threshold': metrics['mae'] < 0.1,
        'rmse_threshold': metrics['rmse'] < 0.15,
        'mape_threshold': metrics['mape'] < 0.12,
        'r2_threshold': metrics['r2'] > 0.85
      }
      
      return metrics, all(validation_rules.values())

    def cross_validate_model(self, model, data, target):
      cv_results = cross_validate(
        model, 
        data, 
        target,
        cv=TimeSeriesSplit(n_splits=5),
        scoring=['neg_mean_absolute_error', 'r2']
      )
      return cv_results
  ```

- **Model Monitoring System**
  ```python
  # model_monitor.py
  class ModelMonitor:
    def __init__(self):
      self.metrics_store = MetricsDatabase()
      self.alert_system = AlertSystem()
    
    def monitor_prediction_drift(self, new_predictions, historical_predictions):
      drift_detector = KolmogorovSmirnovTest()
      drift_score = drift_detector.compute_drift(
        historical_predictions, 
        new_predictions
      )
      
      if drift_score > self.drift_threshold:
        self.alert_system.send_alert(
          'Model Drift Detected',
          f'Drift score: {drift_score}'
        )
        return True
      return False
    
    def monitor_feature_importance(self, current_importance, baseline_importance):
      importance_shift = compute_importance_shift(
        current_importance,
        baseline_importance
      )
      
      if importance_shift > self.importance_threshold:
        self.alert_system.send_alert(
          'Feature Importance Shift',
          f'Shift magnitude: {importance_shift}'
        )
        return True
      return False
  ```

- **Performance Metrics Dashboard**
  ```typescript
  // metrics-dashboard.ts
  interface ModelMetrics {
    accuracy: number;
    latency: number;
    drift_score: number;
    feature_importance: Record<string, number>;
    prediction_distribution: Distribution;
  }

  class MetricsDashboard {
    async updateMetrics(modelId: string, metrics: ModelMetrics) {
      await this.metricsStore.save(modelId, metrics);
      await this.generateVisualizations(metrics);
      
      if (this.shouldTriggerAlert(metrics)) {
        await this.alertSystem.notify({
          type: 'model_performance',
          severity: this.calculateAlertSeverity(metrics),
          details: this.formatMetricsReport(metrics)
        });
      }
    }
  }
  ```

### Custom Metrics Calculations

- **Investment Metrics Calculator**
  ```typescript
  // investment-metrics.ts
  class InvestmentMetricsCalculator {
    calculateCapRate(noi: number, propertyValue: number): number {
      return (noi / propertyValue) * 100;
    }

    calculateCashOnCash(
      annualCashFlow: number, 
      totalInvestment: number
    ): number {
      return (annualCashFlow / totalInvestment) * 100;
    }

    calculateIRR(cashFlows: number[], periods: number): number {
      const guess = 0.1;
      const tolerance = 0.0001;
      let irr = guess;
      
      // Newton-Raphson method for IRR calculation
      for (let i = 0; i < 100; i++) {
        const npv = this.calculateNPV(cashFlows, irr);
        const derivative = this.calculateNPVDerivative(cashFlows, irr);
        
        const newIRR = irr - npv / derivative;
        if (Math.abs(newIRR - irr) < tolerance) {
          return newIRR * 100;
        }
        irr = newIRR;
      }
      throw new Error('IRR calculation did not converge');
    }

    calculateDSCR(
      noi: number, 
      annualDebtService: number
    ): number {
      return noi / annualDebtService;
    }

    calculateBreakEvenOccupancy(
      totalExpenses: number,
      grossPotentialRent: number
    ): number {
      return (totalExpenses / grossPotentialRent) * 100;
    }
  }
  ```

- **Risk Metrics Calculator**
  ```typescript
  // risk-metrics.ts
  class RiskMetricsCalculator {
    calculateRiskAdjustedReturn(
      expectedReturn: number,
      volatility: number
    ): number {
      return expectedReturn / volatility;
    }

    calculateStressTest(
      cashFlows: number[],
      stressFactors: Record<string, number>
    ): StressTestResult {
      const stressedCashFlows = cashFlows.map(cf => {
        let stressedCF = cf;
        for (const [factor, impact] of Object.entries(stressFactors)) {
          stressedCF *= (1 - impact);
        }
        return stressedCF;
      });

      return {
        originalNPV: this.calculateNPV(cashFlows),
        stressedNPV: this.calculateNPV(stressedCashFlows),
        impactPercentage: this.calculateImpact(
          cashFlows,
          stressedCashFlows
        )
      };
    }

    calculateSensitivityAnalysis(
      baselineMetrics: Record<string, number>,
      variationRange: number,
      steps: number
    ): SensitivityAnalysis {
      const results: SensitivityAnalysis = {};
      
      for (const [metric, baseValue] of Object.entries(baselineMetrics)) {
        results[metric] = [];
        const stepSize = (variationRange * 2) / steps;
        
        for (let i = 0; i <= steps; i++) {
          const variation = -variationRange + (i * stepSize);
          const adjustedValue = baseValue * (1 + variation);
          results[metric].push({
            variation: variation * 100,
            value: adjustedValue,
            impact: this.calculateMetricImpact(
              metric,
              baseValue,
              adjustedValue
            )
          });
        }
      }
      
      return results;
    }
  }
  ```

- **Market Analysis Metrics**
  ```typescript
  // market-metrics.ts
  class MarketMetricsCalculator {
    calculateMarketScore(
      factors: MarketFactors,
      weights: Record<string, number>
    ): number {
      let weightedScore = 0;
      let totalWeight = 0;
      
      for (const [factor, weight] of Object.entries(weights)) {
        weightedScore += factors[factor] * weight;
        totalWeight += weight;
      }
      
      return (weightedScore / totalWeight) * 100;
    }

    calculateCompetitiveIndex(
      subjectProperty: PropertyMetrics,
      comparables: PropertyMetrics[]
    ): CompetitiveAnalysis {
      const rankings = {};
      const metrics = [
        'pricePerSqFt',
        'occupancyRate',
        'operatingExpenses',
        'amenityScore'
      ];
      
      for (const metric of metrics) {
        const values = comparables.map(c => c[metric]);
        values.push(subjectProperty[metric]);
        
        const percentile = this.calculatePercentile(
          subjectProperty[metric],
          values
        );
        rankings[metric] = percentile;
      }
      
      return {
        rankings,
        overallScore: Object.values(rankings).reduce(
          (a, b) => a + b, 0
        ) / metrics.length
      };
    }
  }
  ```

## API Integrations

The application integrates with several real estate data providers:

1. **ATTOM Data Solutions**
   - Property data and analytics
   - Market trends
   - Property valuation
   - [Get API Key](https://api.developer.attomdata.com/signup)

2. **Realtor.com API (via RapidAPI)**
   - Property listings
   - Market data
   - Comparable properties
   - [Get API Key](https://rapidapi.com/apidojo/api/realtor)

3. **Walk Score API**
   - Walkability scores
   - Transit scores
   - Neighborhood amenities
   - [Get API Key](https://www.walkscore.com/professional/api.php)

4. **Zillow API**
   - Property valuations
   - Rent estimates
   - Market trends
   - [Get API Key](https://www.zillow.com/howto/api/APIOverview.htm)

## Setup

1. Clone the repository:
   ```bash
   git clone https://github.com/yourusername/real-estate-deal-analyzer.git
cd real-estate-deal-analyzer
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Set up environment variables:
   - Copy `.env.example` to `.env`
   - Add your API keys to the `.env` file
   ```bash
cp .env.example .env
```

4. Start the development server:
   ```bash
npm start
```

## Environment Variables

Required environment variables:

```env
REACT_APP_RAPIDAPI_KEY=your_rapidapi_key_here
REACT_APP_WALKSCORE_KEY=your_walkscore_key_here
REACT_APP_ATTOMDATA_KEY=your_attomdata_key_here
REACT_APP_REALTOR_KEY=your_realtor_key_here
REACT_APP_ZILLOW_KEY=your_zillow_key_here
```

## API Rate Limits

- ATTOM Data: 500 requests/day
- Realtor.com: 500 requests/month
- Walk Score: 5,000 requests/day
- Zillow: 1,000 requests/day

The application implements rate limiting and caching to stay within these limits.

## Caching Strategy

- Market data: 1 hour
- Property data: 24 hours
- Walk Score data: 7 days
- Comparable properties: 24 hours

## Offline Support

The application implements a service worker for offline support:

- Caches API responses
- Stores static assets
- Implements background sync
- Handles offline form submissions

## Performance Monitoring

The application includes comprehensive performance monitoring:

- API call tracking
- Error reporting
- User interaction monitoring
- Performance metrics collection

## Testing

Run the test suite:

```bash
# Unit tests
npm test

# Integration tests
npm run test:integration

# E2E tests
npm run test:e2e
```

## Contributing

1. Fork the repository
2. Create your feature branch
3. Commit your changes
4. Push to the branch
5. Create a Pull Request

## License

This project is licensed under the MIT License - see the LICENSE file for details. 