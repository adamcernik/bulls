import React, { useEffect, useState } from 'react';
import { DataGrid } from '@mui/x-data-grid';
import { Box, Alert, CircularProgress, useTheme, useMediaQuery } from '@mui/material';
import { getProducts } from '../services/firestore';

const ProductsDataGrid = () => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));

  // Define columns with responsive widths
  const columns = [
    { field: 'model', headerName: 'Model', flex: 1, minWidth: 200 },
    { 
      field: 'category', 
      headerName: 'Category', 
      width: 120,
      headerClassName: isMobile ? 'hidden-column' : '',
      cellClassName: isMobile ? 'hidden-column' : ''
    },
    { 
      field: 'price', 
      headerName: 'Price', 
      type: 'number', 
      width: 100,
      valueFormatter: (params) => params.value ? `${params.value} Kč` : '-'
    },
    { 
      field: 'battery', 
      headerName: 'Battery', 
      width: 120, 
      headerClassName: isMobile ? 'hidden-column' : '',
      cellClassName: isMobile ? 'hidden-column' : ''
    },
    { 
      field: 'motor', 
      headerName: 'Motor', 
      width: 150, 
      headerClassName: isMobile ? 'hidden-column' : '',
      cellClassName: isMobile ? 'hidden-column' : ''
    },
    { field: 'quantity', headerName: 'Qty', width: 80, type: 'number' },
    { 
      field: 'code', 
      headerName: 'Code', 
      width: 120, 
      headerClassName: isMobile ? 'hidden-column' : '',
      cellClassName: isMobile ? 'hidden-column' : ''
    },
    { 
      field: 'createdAt', 
      headerName: 'Created', 
      width: 180,
      headerClassName: isMobile ? 'hidden-column' : '',
      cellClassName: isMobile ? 'hidden-column' : '',
      valueFormatter: (params) => 
        params.value ? new Date(params.value).toLocaleDateString() : '-'
    }
  ];

  useEffect(() => {
    const fetchProducts = async () => {
      setLoading(true);
      setError(null);

      try {
        console.log('Fetching products from Firestore...');
        const productsData = await getProducts();
        
        if (productsData.length > 0) {
          console.log(`Retrieved ${productsData.length} products from Firestore`);
          setProducts(productsData);
        } else {
          console.log('No products found');
          setProducts([]);
          setError('No products found in the database');
        }
      } catch (error) {
        console.error('Error fetching products:', error);
        setError(`Failed to load products: ${error instanceof Error ? error.message : String(error)}`);
        setProducts([]);
      } finally {
        setLoading(false);
      }
    };

    fetchProducts();
  }, []);

  if (loading) {
    return (
      <Box sx={{ 
        display: 'flex', 
        justifyContent: 'center', 
        alignItems: 'center', 
        height: '400px',
        width: '100%'
      }}>
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box sx={{ height: 650, width: '100%' }}>
      {error && (
        <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>
      )}
      
      {products.length === 0 && !error && (
        <Alert severity="info" sx={{ mb: 2 }}>
          No products found in the database.
        </Alert>
      )}
      
      <DataGrid
        rows={products}
        columns={columns}
        initialState={{
          pagination: {
            paginationModel: { page: 0, pageSize: 25 },
          },
          sorting: {
            sortModel: [{ field: 'model', sort: 'asc' }],
          },
        }}
        pageSizeOptions={[10, 25, 50, 100]}
        disableRowSelectionOnClick
        sx={{
          '& .MuiDataGrid-cell:hover': {
            color: 'primary.main',
          },
          '& .hidden-column': {
            display: 'none',
          },
          borderRadius: 2,
          border: 1,
          borderColor: 'divider',
          '& .MuiDataGrid-cell': {
            borderBottom: 1,
            borderColor: 'divider',
          },
        }}
      />
    </Box>
  );
};

export default ProductsDataGrid; 