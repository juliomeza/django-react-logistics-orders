import { createTheme } from '@mui/material/styles';

const theme = createTheme({
  palette: {
    primary: {
      main: '#1976d2', // Azul de MUI
    },
    secondary: {
      main: '#dc004e', // Rojo oscuro
    },
  },
  typography: {
    fontFamily: 'Roboto, Arial, sans-serif',
  },
  spacing: 10, // Espaciado base
  components: {
    MuiPaper: {
      styleOverrides: {
        root: {
          // Sombra sutil
          boxShadow: '0 2px 4px rgba(0,0,0,0.08)',
        },
      },
    },
    // Personalización de la barra de progreso del Stepper
    MuiStepConnector: {
      styleOverrides: {
        line: {
          borderTopWidth: '3px', // Barra de progreso más gruesa
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