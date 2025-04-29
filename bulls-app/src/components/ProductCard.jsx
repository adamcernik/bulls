import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Card,
  CardContent,
  CardActionArea,
  CardActions,
  Typography,
  Box,
  Chip,
  Divider,
  Button,
  IconButton,
  Snackbar
} from '@mui/material';
import AddShoppingCartIcon from '@mui/icons-material/AddShoppingCart';
import VisibilityIcon from '@mui/icons-material/Visibility';
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

const ProductCard = ({ product }) => {
  const navigate = useNavigate();
  const [successMessage, setSuccessMessage] = useState(null);
  
  const handleViewDetails = () => {
    navigate(`/product/${product.id}`);
  };
  
  const handleAddToCart = (e) => {
    e.stopPropagation(); // Prevent card click
    if (product) {
      const success = addToCart(product, 1);
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
  
  return (
    <>
      <Card 
        sx={{ 
          height: '100%', 
          display: 'flex', 
          flexDirection: 'column',
          transition: 'transform 0.2s, box-shadow 0.2s',
          '&:hover': {
            transform: 'translateY(-4px)',
            boxShadow: 4
          }
        }}
      >
        <CardActionArea 
          onClick={handleViewDetails}
          sx={{ flexGrow: 1, display: 'flex', flexDirection: 'column', alignItems: 'stretch' }}
        >
          {/* Product image */}
          <Box 
            sx={{
              height: 180,
              width: '100%',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              overflow: 'hidden',
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
          
          <CardContent sx={{ flexGrow: 1, display: 'flex', flexDirection: 'column' }}>
            <Box sx={{ mb: 1 }}>
              <Chip 
                label={product.category || 'No Category'} 
                color={CATEGORY_COLORS[product.category] || 'default'}
                size="small"
                sx={{ mb: 1 }}
              />
              <Typography variant="h6" component="h2" gutterBottom noWrap title={product.model}>
                {product.model}
              </Typography>
            </Box>
            
            <Box sx={{ mt: 'auto' }}>
              {product.battery && (
                <Typography variant="body2" color="text.secondary">
                  Battery: {product.battery}
                </Typography>
              )}
              {product.motor && (
                <Typography variant="body2" color="text.secondary">
                  Motor: {product.motor}
                </Typography>
              )}
              
              <Divider sx={{ my: 1 }} />
              
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline' }}>
                <Typography variant="h6" color="primary" fontWeight="bold">
                  {formatCZK(product.price)}
                </Typography>
                
                {product.action > 0 && (
                  <Typography variant="body2" color="error.main" fontWeight="bold">
                    {formatCZK(product.action)}
                  </Typography>
                )}
              </Box>
              
              {product.discount > 0 && (
                <Typography variant="body2" color="text.secondary" align="right">
                  Discount: {product.discount}%
                </Typography>
              )}
            </Box>
          </CardContent>
        </CardActionArea>

        {/* Card Actions */}
        <CardActions sx={{ p: 2, pt: 0 }}>
          <Button 
            size="small" 
            startIcon={<VisibilityIcon />}
            onClick={handleViewDetails}
            sx={{ mr: 1 }}
          >
            Details
          </Button>
          <Button
            size="small"
            color="primary"
            startIcon={<AddShoppingCartIcon />}
            onClick={handleAddToCart}
            variant="contained"
            sx={{ ml: 'auto' }}
          >
            Add to Cart
          </Button>
        </CardActions>
      </Card>

      <Snackbar
        open={!!successMessage}
        autoHideDuration={3000}
        onClose={handleCloseSnackbar}
        message={successMessage}
      />
    </>
  );
};

export default ProductCard; 