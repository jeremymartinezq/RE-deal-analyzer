import React, { useState } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Grid,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  TextField,
  Box,
  Typography,
  Chip,
  Switch,
  FormControlLabel,
  CircularProgress,
  Alert,
} from '@mui/material';
import {
  Description,
  TableChart,
  PictureAsPdf,
  Share,
  BrandingWatermark,
  Psychology,
} from '@mui/icons-material';
import { ExportService } from '../../services/exportService';
import { PropertyData } from '../../types/property';
import { MarketData } from '../../types/market';
import { AnalysisData } from '../../types/analysis';

interface ExportDialogProps {
  open: boolean;
  onClose: () => void;
  propertyData: PropertyData;
  marketData: MarketData;
  analysisData: AnalysisData;
}

export const ExportDialog: React.FC<ExportDialogProps> = ({
  open,
  onClose,
  propertyData,
  marketData,
  analysisData,
}) => {
  const [exportFormat, setExportFormat] = useState('pdf');
  const [template, setTemplate] = useState('professional');
  const [useAI, setUseAI] = useState(true);
  const [customBranding, setCustomBranding] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [brandingData, setBrandingData] = useState({
    logo: '',
    companyName: '',
    primaryColor: '#6c5ce7',
  });

  const handleExport = async () => {
    setLoading(true);
    setError(null);
    try {
      const exportConfig = {
        format: exportFormat,
        template,
        useAI,
        branding: customBranding ? brandingData : undefined,
      };

      const data = {
        property: propertyData,
        market: marketData,
        analysis: analysisData,
      };

      // Call the appropriate export method based on format
      switch (exportFormat) {
        case 'pdf':
          await ExportService.exportToPDF(data, exportConfig);
          break;
        case 'excel':
          await ExportService.exportToExcel(data, exportConfig);
          break;
        case 'investment-memo':
          await ExportService.generateInvestmentMemo(data, exportConfig);
          break;
      }

      onClose();
    } catch (error) {
      console.error('Export error:', error);
      setError(error instanceof Error ? error.message : 'Failed to generate export');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth>
      <DialogTitle>
        Export Analysis Report
        {loading && <CircularProgress size={24} sx={{ ml: 2 }} />}
      </DialogTitle>
      
      <DialogContent>
        {error && (
          <Alert severity="error" sx={{ mb: 2 }}>
            {error}
          </Alert>
        )}
        
        <Grid container spacing={3}>
          {/* Format Selection */}
          <Grid item xs={12}>
            <FormControl fullWidth>
              <InputLabel>Export Format</InputLabel>
              <Select
                value={exportFormat}
                onChange={(e) => setExportFormat(e.target.value)}
                startAdornment={<Description sx={{ mr: 1 }} />}
              >
                <MenuItem value="pdf">
                  <PictureAsPdf sx={{ mr: 1 }} /> PDF Report
                </MenuItem>
                <MenuItem value="excel">
                  <TableChart sx={{ mr: 1 }} /> Excel Workbook
                </MenuItem>
                <MenuItem value="investment-memo">
                  <Description sx={{ mr: 1 }} /> Investment Memo
                </MenuItem>
              </Select>
            </FormControl>
          </Grid>

          {/* Template Selection */}
          <Grid item xs={12}>
            <FormControl fullWidth>
              <InputLabel>Report Template</InputLabel>
              <Select
                value={template}
                onChange={(e) => setTemplate(e.target.value)}
              >
                <MenuItem value="professional">Professional</MenuItem>
                <MenuItem value="executive">Executive Summary</MenuItem>
                <MenuItem value="detailed">Detailed Analysis</MenuItem>
                <MenuItem value="lender">Lender Package</MenuItem>
              </Select>
            </FormControl>
          </Grid>

          {/* AI Enhancement Toggle */}
          <Grid item xs={12}>
            <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
              <Psychology sx={{ mr: 1 }} />
              <Typography variant="subtitle1">AI Enhancement</Typography>
            </Box>
            <FormControlLabel
              control={
                <Switch
                  checked={useAI}
                  onChange={(e) => setUseAI(e.target.checked)}
                />
              }
              label="Use AI to enhance report content"
            />
            {useAI && (
              <Box sx={{ mt: 1 }}>
                <Typography variant="body2" color="textSecondary">
                  AI will generate professional narratives, insights, and recommendations
                </Typography>
                <Box sx={{ mt: 1, display: 'flex', gap: 1 }}>
                  <Chip label="Market Analysis" size="small" />
                  <Chip label="Risk Assessment" size="small" />
                  <Chip label="Investment Recommendations" size="small" />
                </Box>
              </Box>
            )}
          </Grid>

          {/* Branding Options */}
          <Grid item xs={12}>
            <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
              <BrandingWatermark sx={{ mr: 1 }} />
              <Typography variant="subtitle1">Custom Branding</Typography>
            </Box>
            <FormControlLabel
              control={
                <Switch
                  checked={customBranding}
                  onChange={(e) => setCustomBranding(e.target.checked)}
                />
              }
              label="Add custom branding"
            />
            {customBranding && (
              <Grid container spacing={2} sx={{ mt: 1 }}>
                <Grid item xs={12}>
                  <TextField
                    fullWidth
                    label="Company Name"
                    value={brandingData.companyName}
                    onChange={(e) =>
                      setBrandingData({ ...brandingData, companyName: e.target.value })
                    }
                  />
                </Grid>
                <Grid item xs={12}>
                  <TextField
                    fullWidth
                    label="Logo URL"
                    value={brandingData.logo}
                    onChange={(e) =>
                      setBrandingData({ ...brandingData, logo: e.target.value })
                    }
                  />
                </Grid>
                <Grid item xs={12}>
                  <TextField
                    fullWidth
                    label="Primary Color"
                    type="color"
                    value={brandingData.primaryColor}
                    onChange={(e) =>
                      setBrandingData({ ...brandingData, primaryColor: e.target.value })
                    }
                    InputProps={{
                      sx: { height: 56 }
                    }}
                  />
                </Grid>
              </Grid>
            )}
          </Grid>

          {/* Sharing Options */}
          <Grid item xs={12}>
            <Box sx={{ display: 'flex', alignItems: 'center' }}>
              <Share sx={{ mr: 1 }} />
              <Typography variant="subtitle1">Sharing Options</Typography>
            </Box>
            <Box sx={{ mt: 1, display: 'flex', gap: 1 }}>
              <Button variant="outlined" size="small">
                Email
              </Button>
              <Button variant="outlined" size="small">
                Share Link
              </Button>
              <Button variant="outlined" size="small">
                Download
              </Button>
            </Box>
          </Grid>
        </Grid>
      </DialogContent>

      <DialogActions>
        <Button onClick={onClose} disabled={loading}>Cancel</Button>
        <Button
          onClick={handleExport}
          variant="contained"
          disabled={loading}
          startIcon={loading ? <CircularProgress size={20} /> : null}
        >
          {loading ? 'Generating...' : 'Export'}
        </Button>
      </DialogActions>
    </Dialog>
  );
}; 