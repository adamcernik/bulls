import React, { useState, useEffect } from 'react';
import { Container, Typography, Paper, Grid, Button, CircularProgress } from '@mui/material';
import { useNavigate } from 'react-router-dom';
import { useAuth } from './Header';
import PeopleIcon from '@mui/icons-material/People';
import ShoppingCartIcon from '@mui/icons-material/ShoppingCart';
import SettingsIcon from '@mui/icons-material/Settings';
import ProductsTable from './ProductsTable';

const AdminPage = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  
  // Use a more robust approach to auth checking
  useEffect(() => {
    // Give the auth state time to initialize
    const timer = setTimeout(() => {
      setLoading(false);
      if (!user) {
        navigate('/login');
      }
    }, 1000);
    
    return () => clearTimeout(timer);
  }, [user, navigate]);

  const handleNavigation = (path) => {
    navigate(path);
  };

  // Show loading state while checking auth
  if (loading) {
    return (
      <Container sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '50vh' }}>
        <CircularProgress />
      </Container>
    );
  }

  // Don't return null - it causes the white screen
  // Instead show a minimal UI while redirecting if needed
  if (!user) {
    return (
      <Container maxWidth="lg" sx={{ py: 4 }}>
        <Typography variant="h5">Redirecting to login...</Typography>
      </Container>
    );
  }

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      <Typography variant="h4" component="h1" gutterBottom>
        Admin Dashboard
      </Typography>
      <Typography variant="body1" color="text.secondary" paragraph>
        Manage products, users, and settings.
      </Typography>

      {/* Quick Access Cards */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid item xs={12} md={4}>
          <Paper 
            elevation={3} 
            sx={{ 
              p: 3, 
              display: 'flex', 
              flexDirection: 'column', 
              alignItems: 'center',
              cursor: 'pointer',
              '&:hover': { boxShadow: 6 },
              height: '100%'
            }}
            onClick={() => handleNavigation('/admin/users')}
          >
            <PeopleIcon sx={{ fontSize: 50, color: 'secondary.main', mb: 2 }} />
            <Typography variant="h5" gutterBottom>
              Users
            </Typography>
            <Typography variant="body2" color="text.secondary" align="center">
              Manage user accounts and track sign-in activity.
            </Typography>
            <Button 
              variant="outlined" 
              color="secondary" 
              sx={{ mt: 2 }}
              onClick={(e) => {
                e.stopPropagation();
                handleNavigation('/admin/users');
              }}
            >
              View Users
            </Button>
          </Paper>
        </Grid>
        
        <Grid item xs={12} md={4}>
          <Paper 
            elevation={3} 
            sx={{ 
              p: 3, 
              display: 'flex', 
              flexDirection: 'column', 
              alignItems: 'center',
              cursor: 'pointer',
              '&:hover': { boxShadow: 6 },
              height: '100%'
            }}
            onClick={() => handleNavigation('/admin/orders')}
          >
            <ShoppingCartIcon sx={{ fontSize: 50, color: 'primary.main', mb: 2 }} />
            <Typography variant="h5" gutterBottom>
              Orders
            </Typography>
            <Typography variant="body2" color="text.secondary" align="center">
              View and manage customer orders and transactions.
            </Typography>
            <Button 
              variant="outlined" 
              color="primary" 
              sx={{ mt: 2 }}
              onClick={(e) => {
                e.stopPropagation();
                handleNavigation('/admin/orders');
              }}
            >
              View Orders
            </Button>
          </Paper>
        </Grid>
        
        <Grid item xs={12} md={4}>
          <Paper 
            elevation={3} 
            sx={{ 
              p: 3, 
              display: 'flex', 
              flexDirection: 'column', 
              alignItems: 'center',
              cursor: 'pointer',
              '&:hover': { boxShadow: 6 },
              height: '100%'
            }}
            onClick={() => handleNavigation('/admin/settings')}
          >
            <SettingsIcon sx={{ fontSize: 50, color: 'success.main', mb: 2 }} />
            <Typography variant="h5" gutterBottom>
              Settings
            </Typography>
            <Typography variant="body2" color="text.secondary" align="center">
              Configure system settings and preferences.
            </Typography>
            <Button 
              variant="outlined" 
              color="success" 
              sx={{ mt: 2 }}
              onClick={(e) => {
                e.stopPropagation();
                handleNavigation('/admin/settings');
              }}
            >
              Manage Settings
            </Button>
          </Paper>
        </Grid>
      </Grid>

      {/* Products Management */}
      <Paper elevation={3} sx={{ p: 3, mb: 4 }}>
        <Typography variant="h5" gutterBottom>
          Products Management
        </Typography>
        <ProductsTable />
      </Paper>
    </Container>
  );
};

export default AdminPage; 