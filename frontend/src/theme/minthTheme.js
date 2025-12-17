import { createTheme } from '@mui/material/styles';

const minthTheme = createTheme({
  palette: {
    primary: {
      main: '#0056b3', // Azul corporativo Minth
      light: '#4d88cf',
      dark: '#003982',
      contrastText: '#ffffff',
    },
    secondary: {
      main: '#666666', // Gris profesional
      light: '#999999',
      dark: '#333333',
      contrastText: '#ffffff',
    },
    success: {
      main: '#28a745',
      light: '#5cb85c',
      dark: '#1e7e34',
    },
    warning: {
      main: '#ffc107',
      light: '#ffce3a',
      dark: '#d39e00',
    },
    error: {
      main: '#dc3545',
      light: '#e57373',
      dark: '#c62828',
    },
    background: {
      default: '#f8f9fa',
      paper: '#ffffff',
    },
    text: {
      primary: '#333333',
      secondary: '#666666',
    },
  },
  typography: {
    fontFamily: '"Roboto", "Helvetica", "Arial", sans-serif',
    h4: {
      fontWeight: 600,
      color: '#0056b3',
    },
    h5: {
      fontWeight: 600,
      color: '#0056b3',
    },
    h6: {
      fontWeight: 500,
      color: '#333333',
    },
    button: {
      fontWeight: 500,
      textTransform: 'none',
    },
  },
  components: {
    MuiAppBar: {
      styleOverrides: {
        root: {
          backgroundColor: '#0056b3',
          background: 'linear-gradient(135deg, #0056b3 0%, #003982 100%)',
        },
      },
    },
    MuiButton: {
      styleOverrides: {
        root: {
          borderRadius: 8,
          padding: '8px 16px',
        },
        containedPrimary: {
          background: 'linear-gradient(135deg, #0056b3 0%, #003982 100%)',
          '&:hover': {
            background: 'linear-gradient(135deg, #003982 0%, #002b63 100%)',
          },
        },
      },
    },
    MuiCard: {
      styleOverrides: {
        root: {
          borderRadius: 12,
          boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)',
          border: '1px solid #e0e0e0',
        },
      },
    },
    MuiTableHead: {
      styleOverrides: {
        root: {
          backgroundColor: '#f5f5f5',
        },
      },
    },
  },
});

export default minthTheme;