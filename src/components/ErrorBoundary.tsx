import React, { Component, ErrorInfo } from 'react';
import {
  Box,
  Button,
  Typography,
  Paper,
  Alert,
  AlertTitle,
  CircularProgress
} from '@mui/material';
import { Refresh, BugReport } from '@mui/icons-material';
import { captureException } from '../utils/errorReporting';

interface Props {
  children: React.ReactNode;
  fallback?: React.ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
  errorInfo: ErrorInfo | null;
  isRecovering: boolean;
}

export class ErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false,
    error: null,
    errorInfo: null,
    isRecovering: false
  };

  public static getDerivedStateFromError(error: Error): State {
    return {
      hasError: true,
      error,
      errorInfo: null,
      isRecovering: false
    };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    this.setState({ errorInfo });
    
    // Report error to monitoring service
    captureException(error, {
      extra: {
        componentStack: errorInfo.componentStack,
        ...this.getErrorContext()
      }
    });
  }

  private getErrorContext() {
    return {
      url: window.location.href,
      timestamp: new Date().toISOString(),
      userAgent: navigator.userAgent,
      // Add any other relevant context
    };
  }

  private handleReload = async () => {
    this.setState({ isRecovering: true });
    try {
      // Clear any cached state that might be causing the error
      localStorage.removeItem('appState');
      sessionStorage.clear();
      
      // Wait a bit to show loading state
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Reload the app
      window.location.reload();
    } catch (error) {
      this.setState({ isRecovering: false });
      console.error('Failed to recover:', error);
    }
  };

  private handleReport = () => {
    const { error, errorInfo } = this.state;
    const errorContext = this.getErrorContext();
    
    // Open issue reporter in new tab
    window.open(
      `https://github.com/your-repo/issues/new?template=bug_report.md&title=${encodeURIComponent(
        `Error: ${error?.message || 'Unknown error'}`
      )}&body=${encodeURIComponent(
        `Error Stack:\n\`\`\`\n${error?.stack}\n\`\`\`\n\nComponent Stack:\n\`\`\`\n${
          errorInfo?.componentStack
        }\n\`\`\`\n\nContext:\n\`\`\`json\n${JSON.stringify(
          errorContext,
          null,
          2
        )}\n\`\`\`\n`
      )}`,
      '_blank'
    );
  };

  public render() {
    if (this.state.hasError) {
      if (this.state.isRecovering) {
        return (
          <Box
            sx={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              minHeight: '100vh',
              p: 3,
            }}
          >
            <CircularProgress sx={{ mb: 2 }} />
            <Typography>Attempting to recover...</Typography>
          </Box>
        );
      }

      return (
        <Box
          sx={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            minHeight: '100vh',
            p: 3,
          }}
        >
          <Paper
            elevation={3}
            sx={{
              p: 3,
              maxWidth: 500,
              width: '100%',
            }}
          >
            <Alert severity="error" sx={{ mb: 2 }}>
              <AlertTitle>Something went wrong</AlertTitle>
              We apologize for the inconvenience. Please try reloading the extension.
            </Alert>

            <Box sx={{ mb: 2 }}>
              <Typography variant="body2" color="text.secondary" gutterBottom>
                Error details:
              </Typography>
              <Typography
                variant="body2"
                component="pre"
                sx={{
                  whiteSpace: 'pre-wrap',
                  backgroundColor: 'grey.100',
                  p: 1,
                  borderRadius: 1,
                  maxHeight: 200,
                  overflow: 'auto'
                }}
              >
                {this.state.error?.toString()}
              </Typography>
            </Box>

            <Box sx={{ display: 'flex', gap: 2, justifyContent: 'center' }}>
              <Button
                variant="contained"
                startIcon={<Refresh />}
                onClick={this.handleReload}
                disabled={this.state.isRecovering}
              >
                Reload Extension
              </Button>
              <Button
                variant="outlined"
                startIcon={<BugReport />}
                onClick={this.handleReport}
                disabled={this.state.isRecovering}
              >
                Report Issue
              </Button>
            </Box>
          </Paper>
        </Box>
      );
    }

    return this.props.children;
  }
} 