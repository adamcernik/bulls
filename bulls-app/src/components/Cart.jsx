import React, { useState, useEffect } from 'react';
import { 
  Box, 
  Typography, 
  Button, 
  IconButton, 
  Drawer, 
  List, 
  ListItem, 
  ListItemText, 
  Divider, 
  TextField,
  Alert,
  Paper
} from '@mui/material';
import DeleteIcon from '@mui/icons-material/Delete';
import AddIcon from '@mui/icons-material/Add';
import RemoveIcon from '@mui/icons-material/Remove';
import ShoppingCartIcon from '@mui/icons-material/ShoppingCart';
import { 
  getCart, 
  updateCartItemQuantity, 
  removeFromCart, 
  clearCart, 
  getCartItemCount 
} from '../services/cart';
import { useNavigate } from 'react-router-dom';

const Cart = () => {
  const [cart, setCart] = useState({ items: [], total: 0 });
  const [open, setOpen] = useState(false);
  const [itemCount, setItemCount] = useState(0);
  const navigate = useNavigate();

  // Load cart data on mount
  useEffect(() => {
    const loadCart = () => {
      try {
        const cartData = getCart();
        // Ensure cart has the expected structure
        if (!cartData || !cartData.items) {
          setCart({ items: [], total: 0 });
        } else {
          // Ensure all items have valid prices
          const validatedCart = {
            ...cartData,
            items: cartData.items.map(item => ({
              ...item,
              price: typeof item.price === 'number' ? item.price : 0
            })),
            total: typeof cartData.total === 'number' ? cartData.total : 0
          };
          setCart(validatedCart);
        }
        setItemCount(getCartItemCount());
      } catch (error) {
        console.error('Error loading cart:', error);
        setCart({ items: [], total: 0 });
        setItemCount(0);
      }
    };

    loadCart();

    // Set up event listener for cart updates
    window.addEventListener('cart-updated', loadCart);
    
    return () => {
      window.removeEventListener('cart-updated', loadCart);
    };
  }, []);

  const toggleDrawer = (isOpen) => {
    setOpen(isOpen);
  };

  const handleQuantityChange = (productId, newQuantity) => {
    if (newQuantity < 1) return;
    
    updateCartItemQuantity(productId, newQuantity);
    
    // Update local state
    const updatedCart = getCart();
    setCart(updatedCart);
    setItemCount(getCartItemCount());
    
    // Dispatch event to notify other components
    window.dispatchEvent(new Event('cart-updated'));
  };

  const handleRemoveItem = (productId) => {
    removeFromCart(productId);
    
    // Update local state
    const updatedCart = getCart();
    setCart(updatedCart);
    setItemCount(getCartItemCount());
    
    // Dispatch event to notify other components
    window.dispatchEvent(new Event('cart-updated'));
  };

  const handleClearCart = () => {
    clearCart();
    
    // Update local state
    setCart({ items: [], total: 0 });
    setItemCount(0);
    
    // Dispatch event to notify other components
    window.dispatchEvent(new Event('cart-updated'));
  };

  const handleCheckout = () => {
    toggleDrawer(false);
    navigate('/order');
  };

  // Helper to safely format price
  const formatPrice = (price) => {
    return (typeof price === 'number' ? price : 0).toFixed(2);
  };

  return (
    <>
      <IconButton 
        color="inherit" 
        onClick={() => toggleDrawer(true)}
        sx={{ position: 'relative' }}
      >
        <ShoppingCartIcon />
        {itemCount > 0 && (
          <Box
            sx={{
              position: 'absolute',
              top: 0,
              right: 0,
              bgcolor: 'error.main',
              color: 'white',
              borderRadius: '50%',
              width: 20,
              height: 20,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: '0.75rem',
              fontWeight: 'bold'
            }}
          >
            {itemCount}
          </Box>
        )}
      </IconButton>

      <Drawer
        anchor="right"
        open={open}
        onClose={() => toggleDrawer(false)}
      >
        <Box
          sx={{ width: 350, p: 2 }}
          role="presentation"
        >
          <Typography variant="h6" component="div" gutterBottom>
            Shopping Cart
          </Typography>
          
          <Divider sx={{ mb: 2 }} />
          
          {cart.items.length === 0 ? (
            <Alert severity="info" sx={{ mb: 2 }}>
              Your cart is empty
            </Alert>
          ) : (
            <>
              <List>
                {cart.items.map((item) => (
                  <React.Fragment key={item.id}>
                    <ListItem sx={{ py: 2 }}>
                      <Box sx={{ width: '100%' }}>
                        <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                          <ListItemText 
                            primary={item.model || 'Unknown Product'} 
                            secondary={`$${formatPrice(item.price)}`} 
                          />
                          <IconButton 
                            edge="end" 
                            aria-label="delete"
                            onClick={() => handleRemoveItem(item.id)}
                          >
                            <DeleteIcon />
                          </IconButton>
                        </Box>
                        <Box sx={{ display: 'flex', alignItems: 'center', mt: 1 }}>
                          <IconButton 
                            size="small"
                            onClick={() => handleQuantityChange(item.id, item.quantity - 1)}
                            disabled={item.quantity <= 1}
                          >
                            <RemoveIcon fontSize="small" />
                          </IconButton>
                          <TextField
                            size="small"
                            value={item.quantity || 1}
                            onChange={(e) => {
                              const value = parseInt(e.target.value);
                              if (!isNaN(value)) {
                                handleQuantityChange(item.id, value);
                              }
                            }}
                            inputProps={{ 
                              min: 1, 
                              style: { textAlign: 'center' } 
                            }}
                            sx={{ width: 50, mx: 1 }}
                          />
                          <IconButton 
                            size="small"
                            onClick={() => handleQuantityChange(item.id, item.quantity + 1)}
                          >
                            <AddIcon fontSize="small" />
                          </IconButton>
                          <Typography sx={{ flexGrow: 1, textAlign: 'right' }}>
                            ${formatPrice((item.price || 0) * (item.quantity || 1))}
                          </Typography>
                        </Box>
                      </Box>
                    </ListItem>
                    <Divider />
                  </React.Fragment>
                ))}
              </List>
              
              <Paper 
                elevation={0} 
                sx={{ 
                  p: 2, 
                  bgcolor: 'background.default', 
                  mt: 2,
                  borderRadius: 1
                }}
              >
                <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                  <Typography variant="body1">Subtotal:</Typography>
                  <Typography variant="body1">${formatPrice(cart.total)}</Typography>
                </Box>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
                  <Typography variant="body1">Total:</Typography>
                  <Typography variant="body1" fontWeight="bold">${formatPrice(cart.total)}</Typography>
                </Box>
                
                <Button 
                  variant="contained" 
                  color="primary" 
                  fullWidth
                  onClick={handleCheckout}
                  sx={{ mb: 1 }}
                >
                  Checkout
                </Button>
                
                <Button 
                  variant="outlined" 
                  color="error" 
                  fullWidth
                  onClick={handleClearCart}
                >
                  Clear Cart
                </Button>
              </Paper>
            </>
          )}
        </Box>
      </Drawer>
    </>
  );
};

export default Cart; 