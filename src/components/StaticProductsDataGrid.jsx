import React, { useState, useEffect } from 'react';
import { DataGrid } from '@mui/x-data-grid';
import { Box, Alert, CircularProgress, Typography } from '@mui/material';

const columns = [
  { field: 'id', headerName: 'ID', width: 90 },
  { field: 'model', headerName: 'Model', width: 200 },
  { field: 'category', headerName: 'Category', width: 150 },
  { 
    field: 'price', 
    headerName: 'Price', 
    type: 'number', 
    width: 110,
    valueFormatter: (params) => params.value ? `${params.value} Kč` : '-'
  },
  { field: 'battery', headerName: 'Battery', width: 150 },
  { field: 'motor', headerName: 'Motor', width: 150 },
  { field: 'range', headerName: 'Range', width: 120 },
  { 
    field: 'weight', 
    headerName: 'Weight', 
    type: 'number', 
    width: 110,
    valueFormatter: (params) => params.value ? `${params.value} kg` : '-'
  },
  { field: 'description', headerName: 'Description', width: 300 },
  { 
    field: 'createdAt', 
    headerName: 'Created', 
    width: 180,
    valueFormatter: (params) => params.value ? new Date(params.value).toLocaleString() : '-'
  }
];

const StaticProductsDataGrid = () => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchProducts = async () => {
      setLoading(true);
      setError(null);

      try {
        // Load the JSON file from the public directory
        const response = await fetch('/products.json');
        if (!response.ok) {
          throw new Error(`Failed to fetch products.json: ${response.status} ${response.statusText}`);
        }
        const jsonData = await response.json();
        console.log(`Loaded ${jsonData.length} products from static JSON file`);
        setProducts(jsonData);
      } catch (error) {
        console.error('Error loading products from JSON:', error);
        setError(`Failed to load products: ${error instanceof Error ? error.message : String(error)}`);
        
        // Try importing from the data file as a fallback
        try {
          const productsModule = await import('../data/products');
          console.log(`Loaded ${productsModule.products.length} products from JS module`);
          setProducts(productsModule.products);
          setError(null);
        } catch (moduleError) {
          console.error('Error importing products module:', moduleError);
          setError(`Failed to load products: ${error instanceof Error ? error.message : String(error)}`);
        }
      } finally {
        setLoading(false);
      }
    };

    fetchProducts();
  }, []);

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', p: 3 }}>
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box sx={{ height: 650, width: '100%' }}>
      <Typography variant="h6" gutterBottom>
        Products from Static JSON File
      </Typography>
      
      {error && (
        <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>
      )}
      
      {products.length === 0 ? (
        <Alert severity="info" sx={{ mb: 2 }}>
          No products found in the static JSON file.
        </Alert>
      ) : (
        <Alert severity="info" sx={{ mb: 2 }}>
          Displaying {products.length} products from static JSON.
        </Alert>
      )}
      
      <DataGrid
        rows={products}
        columns={columns}
        initialState={{
          pagination: {
            paginationModel: { page: 0, pageSize: 10 },
          },
        }}
        pageSizeOptions={[5, 10, 25, 50, 100]}
        disableRowSelectionOnClick
      />
    </Box>
  );
};

export default StaticProductsDataGrid; 