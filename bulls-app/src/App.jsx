import React, { useState, useEffect } from 'react';
import { HashRouter, Routes, Route, Navigate } from 'react-router-dom';
import { CssBaseline, ThemeProvider, createTheme, Box, Alert, Snackbar, CircularProgress, Button, Typography } from '@mui/material';
import HomePage from './components/HomePage';
import ProductDetail from './components/ProductDetail';
import AdminPage from './components/AdminPage';
import Header, { UserProvider } from './components/Header';
import Footer from './components/Footer';
import ProfilePage from './components/ProfilePage';
import LoginPage from './components/LoginPage';
import ContactPage from './components/ContactPage';
import OrderPage from './components/OrderPage';
import UsersPage from './components/admin/UsersPage';
import OrdersPage from './components/admin/OrdersPage';
import SettingsPage from './components/admin/SettingsPage';
import { subscribeToAuthChanges } from './services/auth';
import { initFirebase, isFirebaseInitialized } from './firebase'; // Import isFirebaseInitialized
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
    success: {
      main: '#4caf50',
    }
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

// HashRouter doesn't need basename since it uses the hash part of the URL
// const basename = '/bulls';

function App() {
  const [dbOk, setDbOk] = useState(isFirebaseInitialized());
  const [firebaseError, setFirebaseError] = useState(null);
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState(null);
  const [initAttempts, setInitAttempts] = useState(0);
  const [loadingMessage, setLoadingMessage] = useState('Initializing application...');

  // Initialize Firebase and listen for auth state changes
  useEffect(() => {
    let unsubscribe = () => {};
    let mounted = true;
    
    const initializeFirebase = async () => {
      if (!mounted) return;
      
      setLoadingMessage('Connecting to database...');
      
      try {
        // Initialize Firebase with a timeout
        const initPromise = initFirebase();
        const timeoutPromise = new Promise((_, reject) => 
          setTimeout(() => reject(new Error('Connection timeout - network may be slow')), 10000)
        );
        
        await Promise.race([initPromise, timeoutPromise]);
        
        if (!mounted) return;
        setLoadingMessage('Checking authentication...');
        
        // Subscribe to auth changes only after Firebase is initialized
        unsubscribe = subscribeToAuthChanges((currentUser) => {
          if (!mounted) return;
          setUser(currentUser);
          setLoading(false);
        });
        
        setDbOk(true);
        setFirebaseError(null);
      } catch (error) {
        console.error('Firebase initialization error:', error);
        if (!mounted) return;
        
        setDbOk(false);
        setFirebaseError(`Database connection error: ${error.message || 'Unknown error'}`);
        setLoading(false);
        setLoadingMessage('Failed to connect to database.');
      }
    };
    
    initializeFirebase();
    
    // Set a timeout to avoid long loading states
    const loadingTimeout = setTimeout(() => {
      if (mounted) {
        setLoading(false);
        if (!dbOk) {
          setLoadingMessage('Connection timed out. Please check your network and refresh.');
        }
      }
    }, 15000); // 15 seconds max loading time
    
    return () => {
      mounted = false;
      unsubscribe();
      clearTimeout(loadingTimeout);
    };
  }, [initAttempts]);

  // Function to retry Firebase initialization
  const handleRetryConnection = () => {
    setLoading(true);
    setLoadingMessage('Retrying connection...');
    setInitAttempts(prev => prev + 1);
  };

  if (loading) {
    return (
      <Box sx={{ 
        display: 'flex', 
        flexDirection: 'column', 
        alignItems: 'center', 
        justifyContent: 'center', 
        height: '100vh',
        p: 3,
      }}>
        <CircularProgress size={60} />
        <Typography variant="h6" sx={{ mt: 2, mb: 1, textAlign: 'center' }}>
          {loadingMessage}
        </Typography>
        {loading && (
          <Button 
            variant="outlined" 
            color="primary" 
            onClick={handleRetryConnection}
            sx={{ mt: 2 }}
          >
            Retry Connection
          </Button>
        )}
      </Box>
    );
  }

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <UserProvider initialUser={user}>
        <HashRouter>
          <Box className="App" sx={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
            <Header dbOk={dbOk} />
            
            {!dbOk && (
              <Box sx={{ py: 2, px: 3, bgcolor: '#ffebee' }}>
                <Alert 
                  severity="error" 
                  action={
                    <Button color="inherit" size="small" onClick={handleRetryConnection}>
                      Retry Connection
                    </Button>
                  }
                >
                  Database connection failed. Please check your internet connection or try again later.
                </Alert>
              </Box>
            )}
            
            {firebaseError && (
              <Snackbar
                open={!!firebaseError}
                autoHideDuration={6000}
                onClose={() => setFirebaseError(null)}
                anchorOrigin={{ vertical: 'top', horizontal: 'center' }}
              >
                <Alert severity="error">
                  {firebaseError}
                </Alert>
              </Snackbar>
            )}
            
            <Box 
              sx={{ 
                flex: 1,
                display: 'flex',
                flexDirection: 'column'
              }}
            >
              <Routes>
                <Route path="/" element={<HomePage setDbOk={setDbOk} />} />
                <Route path="/product/:id" element={<ProductDetail />} />
                <Route path="/order" element={<OrderPage />} />
                <Route path="/admin" element={<AdminPage />} />
                <Route path="/admin/users" element={<UsersPage />} />
                <Route path="/admin/orders" element={<OrdersPage />} />
                <Route path="/admin/settings" element={<SettingsPage />} />
                <Route path="/profile" element={<ProfilePage />} />
                <Route path="/login" element={<LoginPage />} />
                <Route path="/contact" element={<ContactPage />} />
                {/* Redirect any unknown paths to home */}
                <Route path="*" element={<Navigate to="/" replace />} />
              </Routes>
            </Box>
            
            <Footer />
          </Box>
        </HashRouter>
      </UserProvider>
    </ThemeProvider>
  );
}

export default App; 