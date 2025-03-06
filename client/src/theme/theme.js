import { createTheme } from '@mui/material/styles';

const theme = createTheme({
  palette: {
    primary: {
      main: '#1976d2',
    },
    secondary: {
      main: '#dc004e',
    },
    status: {
      initial: {
        backgroundColor: '#e8e0ff',
        color: '#5a3dbf',
        border: '#d4c6ff',
      },
      inProgress: {
        backgroundColor: '#e0f0ff',
        color: '#1976d2',
        border: '#c6e2ff',
      },
      completed: {
        backgroundColor: '#e6f5e6',
        color: '#2e7d32',
        border: '#c8e6c9',
      },
      default: {
        backgroundColor: '#f5f5f5',
        color: '#616161',
        border: '#e0e0e0',
      },
    },
  },
  typography: {
    fontFamily: 'Roboto, Arial, sans-serif',
  },
  spacing: 10,
  components: {
    MuiAppBar: {
      defaultProps: {
        color: 'default',
        elevation: 1,
      },
      styleOverrides: {
        root: {
          backgroundColor: '#fff',
          color: '#000',
          boxShadow: '0 2px 4px rgba(0, 0, 0, 0.1)',
        },
      },
    },
    MuiPaper: {
      styleOverrides: {
        root: {
          boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
        },
      },
    },
    MuiStepConnector: {
      styleOverrides: {
        line: {
          borderTopWidth: '3px',
        },
      },
    },
    MuiStepIcon: {
      styleOverrides: {
        root: {
          width: 36,
          height: 36,
          fontSize: '16px',
        },
      },
    },
    MuiStepper: {
      styleOverrides: {
        root: {
          position: 'fixed',
          top: 64,
          left: 0,
          right: 0,
          backgroundColor: 'white',
          zIndex: 1100,
          boxShadow: '0 2px 4px rgba(0, 0, 0, 0.1)',
          padding: '8px 0',
        },
      },
    },
    // Nueva personalización para Typography
    MuiTypography: {
      styleOverrides: {
        root: {
          '&.order-number': {
            color: '#1976d2', // theme.palette.primary.main
            fontWeight: 600,
            padding: '3px 8px',
            borderRadius: '4px',
            backgroundColor: '#e0f0ff', // theme.palette.status.inProgress.backgroundColor
            display: 'inline-block',
          },
        },
      },
    },
  },
});

export default theme;