import React, { useState } from 'react';
import { Button } from '@mui/material';
import { FileDownload } from '@mui/icons-material';
import { ExportDialog } from './ExportDialog';
import { PropertyData } from '../../types/property';
import { MarketData } from '../../types/market';
import { AnalysisData } from '../../types/analysis';

interface ExportButtonProps {
  propertyData: PropertyData;
  marketData: MarketData;
  analysisData: AnalysisData;
  variant?: 'text' | 'outlined' | 'contained';
  size?: 'small' | 'medium' | 'large';
  fullWidth?: boolean;
}

export const ExportButton: React.FC<ExportButtonProps> = ({
  propertyData,
  marketData,
  analysisData,
  variant = 'contained',
  size = 'medium',
  fullWidth = false,
}) => {
  const [dialogOpen, setDialogOpen] = useState(false);

  const handleOpen = () => {
    setDialogOpen(true);
  };

  const handleClose = () => {
    setDialogOpen(false);
  };

  return (
    <>
      <Button
        variant={variant}
        size={size}
        fullWidth={fullWidth}
        startIcon={<FileDownload />}
        onClick={handleOpen}
      >
        Export Analysis
      </Button>

      <ExportDialog
        open={dialogOpen}
        onClose={handleClose}
        propertyData={propertyData}
        marketData={marketData}
        analysisData={analysisData}
      />
    </>
  );
}; 