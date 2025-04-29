import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { 
  Box, 
  Typography, 
  Paper, 
  Button, 
  Grid, 
  Skeleton,
  Alert,
  Chip,
  Divider,
  TextField,
  Snackbar
} from '@mui/material';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import ShoppingCartIcon from '@mui/icons-material/ShoppingCart';
import AddShoppingCartIcon from '@mui/icons-material/AddShoppingCart';
import { getProductById } from '../services/firestore';
import { addToCart } from '../services/cart';

// Category color mapping
const CATEGORY_COLORS = {
  'ebike': 'primary',
  'battery': 'secondary',
  'bike': 'success'
};

// Format price in CZK
function formatCZK(value) {
  if (value === '' || value === undefined || value === null) return '—';
  return new Intl.NumberFormat('cs-CZ', {
    style: 'currency',
    currency: 'CZK',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0
  }).format(value);
}

const ProductDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [quantity, setQuantity] = useState(1);
  const [successMessage, setSuccessMessage] = useState(null);

  useEffect(() => {
    const fetchProduct = async () => {
      try {
        setLoading(true);
        const data = await getProductById(id);
        if (!data) {
          setError('Product not found');
          return;
        }
        setProduct(data);
      } catch (err) {
        console.error('Error fetching product:', err);
        setError(`Failed to load product: ${err.message}`);
      } finally {
        setLoading(false);
      }
    };

    fetchProduct();
  }, [id]);

  const handleBackToList = () => {
    navigate('/');
  };

  const handleQuantityChange = (e) => {
    const value = parseInt(e.target.value);
    if (!isNaN(value) && value > 0) {
      setQuantity(value);
    }
  };

  const handleAddToCart = () => {
    if (product && quantity > 0) {
      const success = addToCart(product, quantity);
      if (success) {
        setSuccessMessage(`${product.model} added to cart!`);
        // Trigger cart update event
        window.dispatchEvent(new Event('cart-updated'));
      }
    }
  };

  const handleCloseSnackbar = () => {
    setSuccessMessage(null);
  };

  if (loading) {
    return (
      <Box sx={{ p: 3 }}>
        <Button 
          startIcon={<ArrowBackIcon />} 
          onClick={handleBackToList}
          sx={{ mb: 3 }}
        >
          Back to Products
        </Button>
        <Paper sx={{ p: 3 }}>
          <Skeleton variant="text" height={60} width="60%" />
          <Skeleton variant="rectangular" height={300} sx={{ my: 2 }} />
          <Grid container spacing={2}>
            {[1, 2, 3, 4].map(i => (
              <Grid item xs={12} sm={6} key={i}>
                <Skeleton variant="rectangular" height={80} />
              </Grid>
            ))}
          </Grid>
        </Paper>
      </Box>
    );
  }

  if (error) {
    return (
      <Box sx={{ p: 3 }}>
        <Button 
          startIcon={<ArrowBackIcon />} 
          onClick={handleBackToList}
          sx={{ mb: 3 }}
        >
          Back to Products
        </Button>
        <Alert severity="error">{error}</Alert>
      </Box>
    );
  }

  if (!product) return null;

  return (
    <Box sx={{ p: 3, maxWidth: 1200, mx: 'auto' }}>
      <Button 
        startIcon={<ArrowBackIcon />} 
        onClick={handleBackToList}
        sx={{ mb: 3 }}
      >
        Back to Products
      </Button>
      
      <Paper sx={{ p: { xs: 2, md: 4 } }}>
        <Grid container spacing={4}>
          <Grid item xs={12} md={6}>
            {/* Product image */}
            <Box 
              sx={{
                height: 400,
                width: '100%',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                borderRadius: 1,
                mb: 2,
                bgcolor: '#f5f5f5'
              }}
            >
              <img
                src={`${process.env.PUBLIC_URL}/images/product.png`}
                alt={product.model || 'Product'}
                style={{
                  maxWidth: '100%',
                  maxHeight: '100%',
                  objectFit: 'contain'
                }}
              />
            </Box>
            
            {/* Thumbnail gallery */}
            <Box sx={{ display: 'flex', justifyContent: 'center', gap: 2, mt: 2 }}>
              {[1, 2, 3].map(i => (
                <Box 
                  key={i}
                  sx={{
                    width: 70,
                    height: 70,
                    backgroundColor: '#f5f5f5',
                    borderRadius: 1,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    overflow: 'hidden',
                    cursor: 'pointer',
                    border: i === 1 ? '2px solid #1565c0' : '2px solid transparent'
                  }}
                >
                  <img
                    src={`${process.env.PUBLIC_URL}/images/product.png`}
                    alt={`Thumbnail ${i}`}
                    style={{
                      maxWidth: '100%',
                      maxHeight: '100%',
                      objectFit: 'cover'
                    }}
                  />
                </Box>
              ))}
            </Box>
          </Grid>
          
          <Grid item xs={12} md={6}>
            <Box>
              {/* Product header */}
              <Box sx={{ mb: 3 }}>
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                  <Chip 
                    label={product.category || 'No Category'} 
                    color={CATEGORY_COLORS[product.category] || 'default'}
                    size="small"
                    sx={{ mr: 1 }}
                  />
                </Box>
                <Typography variant="h4" component="h1" gutterBottom>
                  {product.model}
                </Typography>
                <Typography variant="h5" color="primary" fontWeight="bold">
                  {formatCZK(product.price)}
                </Typography>
              </Box>
              
              <Divider sx={{ my: 2 }} />
              
              {/* Add to Cart Section */}
              <Box sx={{ my: 3, display: 'flex', alignItems: 'center' }}>
                <TextField
                  label="Quantity"
                  type="number"
                  value={quantity}
                  onChange={handleQuantityChange}
                  InputProps={{ inputProps: { min: 1 } }}
                  sx={{ width: 100, mr: 2 }}
                />
                <Button 
                  variant="contained" 
                  color="primary"
                  startIcon={<AddShoppingCartIcon />}
                  onClick={handleAddToCart}
                  size="large"
                >
                  Add to Cart
                </Button>
                <Button 
                  variant="outlined"
                  startIcon={<ShoppingCartIcon />}
                  sx={{ ml: 1 }}
                  onClick={() => {
                    handleAddToCart();
                    navigate('/order');
                  }}
                >
                  Buy Now
                </Button>
              </Box>
              
              <Divider sx={{ my: 2 }} />
              
              {/* Product details */}
              <Grid container spacing={2}>
                <Grid item xs={12}>
                  <Typography variant="subtitle1" fontWeight="bold" gutterBottom>
                    Specifications
                  </Typography>
                </Grid>
                
                <Grid item xs={6}>
                  <Typography variant="body2" color="text.secondary">
                    Category
                  </Typography>
                  <Typography variant="body1" gutterBottom>
                    {product.category || '—'}
                  </Typography>
                </Grid>
                
                <Grid item xs={6}>
                  <Typography variant="body2" color="text.secondary">
                    Battery
                  </Typography>
                  <Typography variant="body1" gutterBottom>
                    {product.battery || '—'}
                  </Typography>
                </Grid>
                
                <Grid item xs={6}>
                  <Typography variant="body2" color="text.secondary">
                    Motor
                  </Typography>
                  <Typography variant="body1" gutterBottom>
                    {product.motor || '—'}
                  </Typography>
                </Grid>
                
                <Grid item xs={6}>
                  <Typography variant="body2" color="text.secondary">
                    Standard Price
                  </Typography>
                  <Typography variant="body1" gutterBottom>
                    {formatCZK(product.price)}
                  </Typography>
                </Grid>
                
                {product.discount > 0 && (
                  <Grid item xs={6}>
                    <Typography variant="body2" color="text.secondary">
                      Discount
                    </Typography>
                    <Typography variant="body1" gutterBottom>
                      {product.discount}%
                    </Typography>
                  </Grid>
                )}
                
                {product.action > 0 && (
                  <Grid item xs={6}>
                    <Typography variant="body2" color="text.secondary">
                      Action Price
                    </Typography>
                    <Typography variant="body1" color="error" gutterBottom fontWeight="bold">
                      {formatCZK(product.action)}
                    </Typography>
                  </Grid>
                )}
              </Grid>
            </Box>
          </Grid>
        </Grid>
      </Paper>
      
      <Snackbar
        open={!!successMessage}
        autoHideDuration={3000}
        onClose={handleCloseSnackbar}
        message={successMessage}
      />
    </Box>
  );
};

export default ProductDetail; 