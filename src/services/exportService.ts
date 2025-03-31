import { jsPDF } from 'jspdf';
import 'jspdf-autotable';
import * as XLSX from 'xlsx';
import { PropertyData } from '../types/property';
import { MarketData } from '../types/market';
import { AnalysisData } from '../types/analysis';
import { AIReportService } from './aiReportService';

interface ExportConfig {
  format: string;
  template: string;
  useAI: boolean;
  branding?: {
    logo: string;
    companyName: string;
    primaryColor: string;
  };
}

interface ExportData {
  property: PropertyData;
  market: MarketData;
  analysis: AnalysisData;
}

export class ExportService {
  static async exportToPDF(data: ExportData, config: ExportConfig): Promise<void> {
    const doc = new jsPDF();
    const pageWidth = doc.internal.pageSize.width;

    try {
      // Generate AI content if enabled
      let aiContent = null;
      if (config.useAI) {
        aiContent = await AIReportService.generateFullReport(data, config);
      }

      // Apply branding if provided
      if (config.branding) {
        this.applyBranding(doc, config.branding);
      }

    // Title
    doc.setFontSize(20);
    doc.text('Real Estate Deal Analysis Report', pageWidth / 2, 20, { align: 'center' });

      // Executive Summary
      doc.setFontSize(16);
      doc.text('Executive Summary', 20, 40);
      doc.setFontSize(12);
      if (aiContent) {
        doc.text(aiContent.executiveSummary, 20, 50, {
          maxWidth: pageWidth - 40,
        });
      }

    // Property Details
      this.addPropertyDetails(doc, data.property);

      // Financial Analysis
      this.addFinancialAnalysis(doc, data.analysis, aiContent);

      // Market Analysis
      this.addMarketAnalysis(doc, data.market, aiContent);

      // Risk Assessment
      this.addRiskAssessment(doc, data.analysis.risk, aiContent);

      // Recommendations
      if (aiContent?.recommendations) {
        this.addRecommendations(doc, aiContent.recommendations);
      }

      // Appendix
      this.addAppendix(doc, data, aiContent);

      // Save the PDF
      const fileName = this.generateFileName('pdf', config.template);
      doc.save(fileName);
    } catch (error) {
      console.error('Error generating PDF:', error);
      throw new Error('Failed to generate PDF report');
    }
  }

  static async exportToExcel(data: ExportData, config: ExportConfig): Promise<void> {
    try {
      const workbook = XLSX.utils.book_new();

      // Overview Sheet
      const overviewData = this.generateOverviewSheet(data);
      const overviewSheet = XLSX.utils.json_to_sheet(overviewData);
      XLSX.utils.book_append_sheet(workbook, overviewSheet, 'Overview');

      // Financial Analysis Sheet
      const financialData = this.generateFinancialSheet(data.analysis);
      const financialSheet = XLSX.utils.json_to_sheet(financialData);
      XLSX.utils.book_append_sheet(workbook, financialSheet, 'Financial Analysis');

      // Market Analysis Sheet
      const marketData = this.generateMarketSheet(data.market);
      const marketSheet = XLSX.utils.json_to_sheet(marketData);
      XLSX.utils.book_append_sheet(workbook, marketSheet, 'Market Analysis');

      // Risk Assessment Sheet
      const riskData = this.generateRiskSheet(data.analysis.risk);
      const riskSheet = XLSX.utils.json_to_sheet(riskData);
      XLSX.utils.book_append_sheet(workbook, riskSheet, 'Risk Assessment');

      // Comparables Sheet
      const comparablesData = this.generateComparablesSheet(data.market.comparables);
      const comparablesSheet = XLSX.utils.json_to_sheet(comparablesData);
      XLSX.utils.book_append_sheet(workbook, comparablesSheet, 'Comparables');

      // Save the workbook
      const fileName = this.generateFileName('xlsx', config.template);
      XLSX.writeFile(workbook, fileName);
    } catch (error) {
      console.error('Error generating Excel workbook:', error);
      throw new Error('Failed to generate Excel report');
    }
  }

  static async generateInvestmentMemo(data: ExportData, config: ExportConfig): Promise<void> {
    try {
      const aiContent = await AIReportService.generateFullReport(data, config);
      const doc = new jsPDF();

      // Apply professional memo template
      this.applyMemoTemplate(doc, config);

      // Add content sections
      this.addMemoContent(doc, aiContent);

      // Save the memo
      const fileName = this.generateFileName('pdf', 'investment-memo');
      doc.save(fileName);
    } catch (error) {
      console.error('Error generating investment memo:', error);
      throw new Error('Failed to generate investment memo');
    }
  }

  private static applyBranding(doc: jsPDF, branding: any): void {
    // Add logo
    if (branding.logo) {
      doc.addImage(branding.logo, 'PNG', 20, 10, 30, 30);
    }

    // Add company name
    if (branding.companyName) {
      doc.setTextColor(branding.primaryColor || '#000000');
      doc.setFontSize(14);
      doc.text(branding.companyName, 60, 25);
    }
  }

  private static addPropertyDetails(doc: jsPDF, property: PropertyData): void {
    doc.setFontSize(16);
    doc.text('Property Details', 20, 80);
    doc.setFontSize(12);
    
    const details = [
      ['Address', property.address],
      ['Property Type', property.type],
      ['Square Footage', property.squareFootage.toString()],
      ['Year Built', property.yearBuilt.toString()],
      ['Bedrooms', property.bedrooms.toString()],
      ['Bathrooms', property.bathrooms.toString()],
      ['Lot Size', property.lotSize],
      ['Zoning', property.zoning]
    ];

    (doc as any).autoTable({
      startY: 90,
      head: [['Property Feature', 'Value']],
      body: details,
      theme: 'striped',
      headStyles: { fillColor: [66, 139, 202] }
    });
  }

  private static addFinancialAnalysis(doc: jsPDF, analysis: AnalysisData, aiContent: any): void {
    const startY = (doc as any).lastAutoTable.finalY + 20;
    doc.setFontSize(16);
    doc.text('Financial Analysis', 20, startY);
    doc.setFontSize(12);

    const metrics = [
      ['Purchase Price', `$${analysis.purchasePrice.toLocaleString()}`],
      ['Down Payment', `$${analysis.downPayment.toLocaleString()}`],
      ['Monthly Mortgage', `$${analysis.monthlyMortgage.toLocaleString()}`],
      ['Monthly Income', `$${analysis.monthlyIncome.toLocaleString()}`],
      ['Monthly Expenses', `$${analysis.monthlyExpenses.toLocaleString()}`],
      ['Net Operating Income', `$${analysis.noi.toLocaleString()}`],
      ['Cap Rate', `${(analysis.capRate * 100).toFixed(2)}%`],
      ['Cash on Cash Return', `${(analysis.cashOnCash * 100).toFixed(2)}%`],
      ['IRR (5 Year)', `${(analysis.irr * 100).toFixed(2)}%`]
    ];

    (doc as any).autoTable({
      startY: startY + 10,
      head: [['Metric', 'Value']],
      body: metrics,
      theme: 'striped',
      headStyles: { fillColor: [66, 139, 202] }
    });

    if (aiContent?.financialAnalysis) {
      doc.setFontSize(12);
      doc.text('AI Analysis:', 20, (doc as any).lastAutoTable.finalY + 20);
      doc.text(aiContent.financialAnalysis, 20, (doc as any).lastAutoTable.finalY + 30, {
        maxWidth: doc.internal.pageSize.width - 40
      });
    }
  }

  private static addMarketAnalysis(doc: jsPDF, market: MarketData, aiContent: any): void {
    const startY = (doc as any).lastAutoTable.finalY + 20;
    doc.setFontSize(16);
    doc.text('Market Analysis', 20, startY);
      doc.setFontSize(12);

    const metrics = [
      ['Median Home Price', `$${market.medianHomePrice.toLocaleString()}`],
      ['Price per Sq Ft', `$${market.pricePerSqFt.toLocaleString()}`],
      ['Market Rent', `$${market.marketRent.toLocaleString()}`],
      ['Vacancy Rate', `${(market.vacancyRate * 100).toFixed(2)}%`],
      ['Population Growth', `${(market.populationGrowth * 100).toFixed(2)}%`],
      ['Job Growth', `${(market.jobGrowth * 100).toFixed(2)}%`],
      ['Appreciation Rate', `${(market.appreciationRate * 100).toFixed(2)}%`]
      ];

      (doc as any).autoTable({
      startY: startY + 10,
      head: [['Metric', 'Value']],
      body: metrics,
      theme: 'striped',
      headStyles: { fillColor: [66, 139, 202] }
    });

    if (aiContent?.marketAnalysis) {
      doc.text('Market Insights:', 20, (doc as any).lastAutoTable.finalY + 20);
      doc.text(aiContent.marketAnalysis, 20, (doc as any).lastAutoTable.finalY + 30, {
        maxWidth: doc.internal.pageSize.width - 40
      });
    }
  }

  private static addRiskAssessment(doc: jsPDF, risk: any, aiContent: any): void {
    const startY = (doc as any).lastAutoTable.finalY + 20;
      doc.setFontSize(16);
    doc.text('Risk Assessment', 20, startY);
      doc.setFontSize(12);

    const riskFactors = [
      ['Market Risk', risk.marketRisk.score.toString(), risk.marketRisk.description],
      ['Financial Risk', risk.financialRisk.score.toString(), risk.financialRisk.description],
      ['Property Risk', risk.propertyRisk.score.toString(), risk.propertyRisk.description],
      ['Regulatory Risk', risk.regulatoryRisk.score.toString(), risk.regulatoryRisk.description]
    ];

    (doc as any).autoTable({
      startY: startY + 10,
      head: [['Risk Factor', 'Score', 'Description']],
      body: riskFactors,
      theme: 'striped',
      headStyles: { fillColor: [66, 139, 202] }
    });

    if (aiContent?.riskAnalysis) {
      doc.text('Risk Insights:', 20, (doc as any).lastAutoTable.finalY + 20);
      doc.text(aiContent.riskAnalysis, 20, (doc as any).lastAutoTable.finalY + 30, {
        maxWidth: doc.internal.pageSize.width - 40
      });
    }
  }

  private static addRecommendations(doc: jsPDF, recommendations: string): void {
    const startY = (doc as any).lastAutoTable.finalY + 20;
    doc.setFontSize(16);
    doc.text('AI Recommendations', 20, startY);
    doc.setFontSize(12);
    doc.text(recommendations, 20, startY + 10, {
      maxWidth: doc.internal.pageSize.width - 40
    });
  }

  private static addAppendix(doc: jsPDF, data: ExportData, aiContent: any): void {
    doc.addPage();
    doc.setFontSize(16);
    doc.text('Appendix', 20, 20);
    doc.setFontSize(12);

    // Add comparable properties
    if (data.market.comparables && data.market.comparables.length > 0) {
      doc.text('Comparable Properties', 20, 40);
      const comparables = data.market.comparables.map(comp => [
        comp.address,
        `$${comp.price.toLocaleString()}`,
        comp.squareFootage.toString(),
        `$${(comp.price / comp.squareFootage).toFixed(2)}`
      ]);

      (doc as any).autoTable({
        startY: 50,
        head: [['Address', 'Price', 'Sq Ft', 'Price/Sq Ft']],
        body: comparables,
        theme: 'striped',
        headStyles: { fillColor: [66, 139, 202] }
      });
    }

    // Add additional AI insights if available
    if (aiContent?.additionalInsights) {
      doc.text('Additional AI Insights', 20, (doc as any).lastAutoTable.finalY + 20);
      doc.text(aiContent.additionalInsights, 20, (doc as any).lastAutoTable.finalY + 30, {
        maxWidth: doc.internal.pageSize.width - 40
      });
    }
  }

  private static generateOverviewSheet(data: ExportData): any[] {
    return [
      {
        'Property Address': data.property.address,
        'Purchase Price': data.analysis.purchasePrice,
        'Monthly Income': data.analysis.monthlyIncome,
        'Monthly Expenses': data.analysis.monthlyExpenses,
        'NOI': data.analysis.noi,
        'Cap Rate': data.analysis.capRate,
        'Cash on Cash Return': data.analysis.cashOnCash
      }
    ];
  }

  private static generateFinancialSheet(analysis: AnalysisData): any[] {
    return [
      {
        'Purchase Price': analysis.purchasePrice,
        'Down Payment': analysis.downPayment,
        'Loan Amount': analysis.loanAmount,
        'Interest Rate': analysis.interestRate,
        'Loan Term': analysis.loanTerm,
        'Monthly Mortgage': analysis.monthlyMortgage,
        'Monthly Income': analysis.monthlyIncome,
        'Monthly Expenses': analysis.monthlyExpenses,
        'Net Operating Income': analysis.noi,
        'Cap Rate': analysis.capRate,
        'Cash on Cash Return': analysis.cashOnCash,
        'IRR (5 Year)': analysis.irr
      }
    ];
  }

  private static generateMarketSheet(market: MarketData): any[] {
    return [
      {
        'Median Home Price': market.medianHomePrice,
        'Price per Sq Ft': market.pricePerSqFt,
        'Market Rent': market.marketRent,
        'Vacancy Rate': market.vacancyRate,
        'Population Growth': market.populationGrowth,
        'Job Growth': market.jobGrowth,
        'Appreciation Rate': market.appreciationRate
      }
    ];
  }

  private static generateRiskSheet(risk: any): any[] {
    return [
      {
        'Market Risk Score': risk.marketRisk.score,
        'Market Risk Description': risk.marketRisk.description,
        'Financial Risk Score': risk.financialRisk.score,
        'Financial Risk Description': risk.financialRisk.description,
        'Property Risk Score': risk.propertyRisk.score,
        'Property Risk Description': risk.propertyRisk.description,
        'Regulatory Risk Score': risk.regulatoryRisk.score,
        'Regulatory Risk Description': risk.regulatoryRisk.description
      }
    ];
  }

  private static generateComparablesSheet(comparables: any[]): any[] {
    return comparables.map(comp => ({
      'Address': comp.address,
      'Price': comp.price,
      'Square Footage': comp.squareFootage,
      'Price per Sq Ft': comp.price / comp.squareFootage,
      'Year Built': comp.yearBuilt,
      'Bedrooms': comp.bedrooms,
      'Bathrooms': comp.bathrooms,
      'Days on Market': comp.daysOnMarket,
      'Distance': comp.distance
    }));
  }

  private static applyMemoTemplate(doc: jsPDF, config: ExportConfig): void {
    doc.setFontSize(20);
    doc.text('Investment Memorandum', doc.internal.pageSize.width / 2, 20, { align: 'center' });
    
    if (config.branding) {
      this.applyBranding(doc, config.branding);
    }

    doc.setFontSize(12);
    const date = new Date().toLocaleDateString();
    doc.text(`Generated on: ${date}`, 20, 40);
  }

  private static addMemoContent(doc: jsPDF, content: any): void {
    let currentY = 60;

    // Executive Summary
    doc.setFontSize(16);
    doc.text('Executive Summary', 20, currentY);
    doc.setFontSize(12);
    doc.text(content.executiveSummary, 20, currentY + 10, {
      maxWidth: doc.internal.pageSize.width - 40
    });

    // Investment Highlights
    currentY = this.addSection(doc, 'Investment Highlights', content.investmentHighlights, currentY + 50);

    // Financial Summary
    currentY = this.addSection(doc, 'Financial Summary', content.financialSummary, currentY + 20);

    // Market Overview
    currentY = this.addSection(doc, 'Market Overview', content.marketOverview, currentY + 20);

    // Risk Factors
    currentY = this.addSection(doc, 'Risk Factors', content.riskFactors, currentY + 20);

    // Investment Strategy
    this.addSection(doc, 'Investment Strategy', content.investmentStrategy, currentY + 20);
  }

  private static addSection(doc: jsPDF, title: string, content: string, startY: number): number {
    doc.setFontSize(16);
    doc.text(title, 20, startY);
    doc.setFontSize(12);
    doc.text(content, 20, startY + 10, {
      maxWidth: doc.internal.pageSize.width - 40
    });
    return startY + doc.getTextDimensions(content, {
      maxWidth: doc.internal.pageSize.width - 40
    }).h + 10;
  }

  private static generateFileName(extension: string, template: string): string {
    const date = new Date().toISOString().split('T')[0];
    return `real-estate-analysis-${template}-${date}.${extension}`;
  }
}
