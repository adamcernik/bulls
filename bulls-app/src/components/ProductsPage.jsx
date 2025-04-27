import React from 'react';
import { Typography, Box } from '@mui/material';
import ProductsDataGrid from './ProductsDataGrid';

const ProductsPage = () => {
  return (
    <Box sx={{ width: '100%' }}>
      <Typography variant="h4" component="h1" gutterBottom>
        Sklad Bulls E-Bikes
      </Typography>
      
      <Box sx={{ width: '100%' }}>
        <ProductsDataGrid />
      </Box>
    </Box>
  );
};

export default ProductsPage; 