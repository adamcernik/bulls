import React, { useContext } from 'react';
import { Container, Typography, Box, Paper, Alert } from '@mui/material';
import OrderForm from './OrderForm';
import { UserContext } from './Header'; // Assuming UserContext is exported from Header

const OrderPage = () => {
  const { user } = useContext(UserContext);

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      <Box sx={{ mb: 4 }}>
        <Typography variant="h4" component="h1" gutterBottom>
          Order Form
        </Typography>
        <Typography variant="body1" color="text.secondary">
          Fill out the form below to place your order. We'll contact you to confirm the details.
        </Typography>
      </Box>

      {!user && (
        <Paper sx={{ p: 3, mb: 3, bgcolor: '#fff4e5' }}>
          <Alert severity="info">
            You are ordering as a guest. Consider signing in to save your information for future orders.
          </Alert>
        </Paper>
      )}

      <OrderForm user={user} />
    </Container>
  );
};

export default OrderPage; 