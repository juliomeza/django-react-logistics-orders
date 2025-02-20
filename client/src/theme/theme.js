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
  spacing: 10, // Aumenta el espaciado base para una apariencia más pulida
});

export default theme;
