import React, { useEffect } from 'react';
import { Container, Typography, Box, Button, Paper } from '@mui/material';
import { useNavigate } from 'react-router-dom';
import { signInWithGoogle } from '../services/auth';
import { useAuth } from './Header';

const LoginPage = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  
  useEffect(() => {
    // If user is already logged in, redirect to home
    if (user) {
      navigate('/');
    }
  }, [user, navigate]);

  const handleLogin = async () => {
    try {
      const result = await signInWithGoogle();
      if (result) {
        navigate('/');
      }
    } catch (error) {
      console.error('Error signing in:', error);
    }
  };

  return (
    <Container maxWidth="sm" sx={{ py: 8 }}>
      <Paper elevation={3} sx={{ p: 4, textAlign: 'center' }}>
        <Typography variant="h4" gutterBottom>
          Sign In
        </Typography>
        <Typography variant="body1" paragraph sx={{ mb: 4 }}>
          Please sign in to access your account and all features
        </Typography>
        
        <Box sx={{ mt: 3 }}>
          <Button 
            variant="contained" 
            color="primary" 
            size="large" 
            onClick={handleLogin} 
            fullWidth
          >
            Sign in with Google
          </Button>
        </Box>
      </Paper>
    </Container>
  );
};

export default LoginPage; 