import React from 'react';
import { CssBaseline, ThemeProvider, createTheme, Box } from '@mui/material';
import ProductsPage from './components/ProductsPage';
import Header from './components/Header';
import './App.css';

// Create a theme instance
const theme = createTheme({
  palette: {
    primary: {
      main: '#1565c0',
    },
    secondary: {
      main: '#f50057',
    },
  },
  components: {
    MuiAvatar: {
      styleOverrides: {
        root: {
          border: '2px solid white',
        },
      },
    },
    MuiChip: {
      styleOverrides: {
        root: {
          fontWeight: 500,
        },
        outlined: {
          backgroundColor: 'rgba(255, 255, 255, 0.1)',
        },
      },
    },
  },
});

function App() {
  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <Box className="App">
        <Header />
        <Box 
          sx={{ 
            px: { 
              xs: 1, // 8px padding on mobile
              sm: 4, // 32px padding on tablet and up
            },
            mt: 3,
            mb: 5
          }}
        >
          <ProductsPage />
        </Box>
      </Box>
    </ThemeProvider>
  );
}

export default App; 