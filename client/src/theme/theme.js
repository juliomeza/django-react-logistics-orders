import { createTheme } from '@mui/material/styles';

const theme = createTheme({
  palette: {
    primary: {
      main: '#1976d2', // Azul de MUI
    },
    secondary: {
      main: '#dc004e',
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
          // Sin redondeo, y una sombra sutil en la parte inferior
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
  },
});

export default theme;
