import React, { useEffect, useState } from 'react';
import { DataGrid } from '@mui/x-data-grid';
import { 
  Box, 
  Alert, 
  CircularProgress, 
  useTheme, 
  useMediaQuery, 
  Snackbar,
  Button,
  Stack,
  IconButton,
  Tooltip,
  Typography
} from '@mui/material';
import SaveIcon from '@mui/icons-material/Save';
import RefreshIcon from '@mui/icons-material/Refresh';
import { getProducts, updateProduct } from '../services/firestore';

const ProductsDataGrid = () => {
  const [products, setProducts] = useState([]);
  const [originalProducts, setOriginalProducts] = useState([]);
  const [changedRows, setChangedRows] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [saveFailed, setSaveFailed] = useState(false);
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  
  // Function to load products from Firestore
  const fetchProducts = async () => {
    setLoading(true);
    setError(null);

    try {
      console.log('Fetching products from Firestore...');
      const productsData = await getProducts();
      
      if (productsData.length > 0) {
        console.log(`Retrieved ${productsData.length} products from Firestore`);
        setProducts(productsData);
        setOriginalProducts(JSON.parse(JSON.stringify(productsData))); // Deep copy
        setChangedRows([]);
      } else {
        console.log('No products found');
        setProducts([]);
        setOriginalProducts([]);
        setChangedRows([]);
        setError('No products found in the database');
      }
    } catch (error) {
      console.error('Error fetching products:', error);
      setError(`Failed to load products: ${error instanceof Error ? error.message : String(error)}`);
      setProducts([]);
      setOriginalProducts([]);
      setChangedRows([]);
    } finally {
      setLoading(false);
    }
  };

  // Load products on initial render
  useEffect(() => {
    fetchProducts();
  }, []);

  // Define columns with responsive widths
  const columns = [
    { 
      field: 'model', 
      headerName: 'Model', 
      width: 180, 
    },
    { 
      field: 'category', 
      headerName: 'Category', 
      width: 120,
      editable: true,
      type: 'singleSelect',
      valueOptions: ['ebike', 'battery'],
      cellClassName: (params) => {
        return changedRows.includes(params.id) ? 'cell-modified' : '';
      }
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

  // Handle cell edit
  const handleCellEditCommit = async (params) => {
    console.log('Cell edit committed:', params);
    
      if (params.field === 'category') {
      console.log(`Change detected: ${params.id} category to ${params.value}`);
        
      // Update UI immediately
      setProducts(prevProducts => 
        prevProducts.map(product => 
            product.id === params.id 
              ? { ...product, category: params.value } 
              : product
          )
        );
        
      // Track changed rows
      if (!changedRows.includes(params.id)) {
        setChangedRows(prev => [...prev, params.id]);
      }
    }
  };

  // Handle save all changes
  const handleSaveChanges = async () => {
    if (changedRows.length === 0) {
      console.log('No changes to save');
      return;
    }
    
    setSaving(true);
    setError(null);
    
    try {
      console.log('Saving all changed rows:', changedRows);
      
      const savePromises = changedRows.map(id => {
        const product = products.find(p => p.id === id);
        console.log(`Saving product ${id} with category: ${product.category}`);
        return updateProduct(id, { category: product.category });
      });
      
      await Promise.all(savePromises);
      
      console.log('All changes saved successfully');
      setSaveSuccess(true);
      setChangedRows([]);
      setOriginalProducts(JSON.parse(JSON.stringify(products)));
    } catch (error) {
      console.error('Error saving changes:', error);
      setError(`Failed to save changes: ${error instanceof Error ? error.message : String(error)}`);
      setSaveFailed(true);
      
      // Revert UI to original state
      setProducts(JSON.parse(JSON.stringify(originalProducts)));
    } finally {
      setSaving(false);
    }
  };

  // Refresh data
  const handleRefresh = () => {
    fetchProducts();
  };

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
    <Box sx={{ display: 'flex', flexDirection: 'column', height: 700, width: '100%' }}>
      <Stack 
        direction="row" 
        spacing={2} 
        sx={{ mb: 2 }}
        justifyContent="space-between"
        alignItems="center"
      >
        <Box>
      {error && (
            <Alert severity="error" sx={{ mb: 1 }}>{error}</Alert>
      )}
      
      {products.length === 0 && !error && (
            <Alert severity="info">No products found in the database.</Alert>
          )}
          
          {changedRows.length > 0 && (
            <Alert severity="warning" sx={{ mb: 1 }}>
              You have unsaved changes ({changedRows.length} items modified)
        </Alert>
      )}
        </Box>
        
        <Stack direction="row" spacing={1}>
          <Tooltip title="Refresh data">
            <IconButton 
              onClick={handleRefresh} 
              color="primary"
              disabled={loading || saving}
            >
              <RefreshIcon />
            </IconButton>
          </Tooltip>
          
          <Button
            variant="contained"
            color="primary"
            startIcon={<SaveIcon />}
            onClick={handleSaveChanges}
            disabled={changedRows.length === 0 || saving}
          >
            {saving ? 'Saving...' : `Save Changes (${changedRows.length})`}
          </Button>
        </Stack>
      </Stack>
      
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
        onCellEditCommit={handleCellEditCommit}
        editMode="cell"
        loading={loading || saving}
        sx={{
          '& .MuiDataGrid-cell:hover': {
            color: 'primary.main',
          },
          '& .hidden-column': {
            display: 'none',
          },
          '& .cell-modified': {
            backgroundColor: 'rgba(255, 220, 0, 0.2)',
            fontWeight: 'bold',
          },
          borderRadius: 2,
          border: 1,
          borderColor: 'divider',
          '& .MuiDataGrid-cell': {
            borderBottom: 1,
            borderColor: 'divider',
            fontSize: '0.8rem',
          },
          '& .MuiDataGrid-columnHeaders': {
            fontSize: '0.85rem',
          },
          '& .MuiDataGrid-footerContainer': {
            fontSize: '0.8rem',
          }
        }}
      />
      
      {/* Success notification */}
      <Snackbar
        key="success-snackbar"
        open={saveSuccess}
        autoHideDuration={3000}
        onClose={() => setSaveSuccess(false)}
        message="Changes saved successfully"
      />
      
      {/* Failure notification */}
      <Snackbar
        key="error-snackbar"
        open={saveFailed}
        autoHideDuration={3000}
        onClose={() => setSaveFailed(false)}
        message="Failed to save changes"
      />
    </Box>
  );
};

export default ProductsDataGrid; 