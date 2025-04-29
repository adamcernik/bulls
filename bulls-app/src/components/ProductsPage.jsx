import React from 'react';
import { Typography, Box } from '@mui/material';
import ProductsTable from './ProductsTable';

const ProductsPage = ({ setDbOk, adminTab, setAdminTab }) => {
  return (
    <Box sx={{ width: '100%' }}>
      <Typography variant="h4" component="h1" gutterBottom>
        Sklad Bulls E-Bikes
      </Typography>
      <ProductsTable
        setDbOk={setDbOk}
        adminTab={adminTab}
        setAdminTab={setAdminTab}
      />
    </Box>
  );
};

export default ProductsPage; 