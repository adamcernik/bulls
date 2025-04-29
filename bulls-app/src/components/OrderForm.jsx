import React, { useState, useEffect } from 'react';
import { 
  Box, 
  Typography, 
  TextField, 
  Button, 
  Grid, 
  Paper, 
  MenuItem, 
  FormControl, 
  InputLabel, 
  Select,
  CircularProgress,
  Snackbar,
  Alert,
  Divider,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  IconButton,
  Card,
  CardContent
} from '@mui/material';
import DeleteIcon from '@mui/icons-material/Delete';
import ShoppingCartIcon from '@mui/icons-material/ShoppingCart';
import { getProducts } from '../services/firestore';
import { placeOrder } from '../services/orders';
import { getCart, updateCartItemQuantity, removeFromCart, clearCart } from '../services/cart';

const OrderForm = ({ user }) => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(null);
  const [error, setError] = useState(null);
  const [cart, setCart] = useState({ items: [], total: 0 });
  const [orderData, setOrderData] = useState({
    fullName: '',
    email: '',
    phone: '',
    address: '',
    city: '',
    zipCode: '',
    country: '',
    notes: ''
  });

  // Load products and cart on component mount
  useEffect(() => {
    const loadProducts = async () => {
      setLoading(true);
      try {
        const productsData = await getProducts();
        setProducts(productsData || []);
        // Load cart data
        const cartData = getCart();
        setCart(cartData);
      } catch (err) {
        setError('Failed to load products. Please try again later.');
        console.error('Error loading products:', err);
      } finally {
        setLoading(false);
      }
    };

    loadProducts();

    // Set up event listener for cart updates
    const handleCartUpdate = () => {
      const cartData = getCart();
      setCart(cartData);
    };
    
    window.addEventListener('cart-updated', handleCartUpdate);
    
    return () => {
      window.removeEventListener('cart-updated', handleCartUpdate);
    };
  }, []);

  // Pre-fill user data if available
  useEffect(() => {
    if (user) {
      setOrderData(prev => ({
        ...prev,
        fullName: user.displayName || '',
        email: user.email || ''
      }));
    }
  }, [user]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setOrderData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleQuantityChange = (productId, newQuantity) => {
    if (newQuantity < 1) return;
    
    updateCartItemQuantity(productId, newQuantity);
    
    // Update local state
    const updatedCart = getCart();
    setCart(updatedCart);
    
    // Dispatch event to notify other components
    window.dispatchEvent(new Event('cart-updated'));
  };

  const handleRemoveItem = (productId) => {
    removeFromCart(productId);
    
    // Update local state
    const updatedCart = getCart();
    setCart(updatedCart);
    
    // Dispatch event to notify other components
    window.dispatchEvent(new Event('cart-updated'));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (cart.items.length === 0) {
      setError('Your cart is empty. Please add some products before placing an order.');
      return;
    }

    setLoading(true);
    setError(null);
    
    try {
      // Create order details
      const orderDetails = {
        ...orderData,
        items: cart.items,
        totalPrice: cart.total,
        status: 'pending',
        createdBy: user?.email || 'guest'
      };
      
      await placeOrder(orderDetails);
      
      setSuccess('Order placed successfully! We will contact you shortly.');
      
      // Clear cart after successful order
      clearCart();
      setCart({ items: [], total: 0 });
      
      // Dispatch event to notify other components
      window.dispatchEvent(new Event('cart-updated'));
      
      // Reset form except user data
      setOrderData({
        fullName: user?.displayName || '',
        email: user?.email || '',
        phone: '',
        address: '',
        city: '',
        zipCode: '',
        country: '',
        notes: ''
      });
      
    } catch (err) {
      setError(`Failed to place order: ${err.message}`);
      console.error('Error placing order:', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Paper elevation={3} sx={{ p: 3, maxWidth: 800, mx: 'auto', mt: 3 }}>
      <Typography variant="h5" component="h1" gutterBottom>
        Place an Order
      </Typography>
      
      <Divider sx={{ mb: 3 }} />
      
      {error && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
      )}
      
      <form onSubmit={handleSubmit}>
        <Grid container spacing={3}>
          {/* Cart Review */}
          <Grid item xs={12}>
            <Typography variant="h6" gutterBottom>
              <ShoppingCartIcon sx={{ mr: 1, verticalAlign: 'middle' }} />
              Cart Items
            </Typography>
            
            {cart.items.length === 0 ? (
              <Alert severity="info" sx={{ mb: 2 }}>
                Your cart is empty. Please add some products before placing an order.
              </Alert>
            ) : (
              <TableContainer component={Paper} variant="outlined" sx={{ mb: 3 }}>
                <Table size="small">
                  <TableHead>
                    <TableRow>
                      <TableCell>Product</TableCell>
                      <TableCell align="right">Price</TableCell>
                      <TableCell align="center">Quantity</TableCell>
                      <TableCell align="right">Total</TableCell>
                      <TableCell align="center">Actions</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {cart.items.map((item) => (
                      <TableRow key={item.id}>
                        <TableCell>{item.model}</TableCell>
                        <TableCell align="right">${item.price?.toFixed(2)}</TableCell>
                        <TableCell align="center">
                          <Grid container alignItems="center" justifyContent="center" spacing={1}>
                            <Grid item>
                              <Button 
                                size="small" 
                                variant="outlined" 
                                onClick={() => handleQuantityChange(item.id, item.quantity - 1)}
                                disabled={item.quantity <= 1}
                              >
                                -
                              </Button>
                            </Grid>
                            <Grid item>
                              <Typography>{item.quantity}</Typography>
                            </Grid>
                            <Grid item>
                              <Button 
                                size="small" 
                                variant="outlined" 
                                onClick={() => handleQuantityChange(item.id, item.quantity + 1)}
                              >
                                +
                              </Button>
                            </Grid>
                          </Grid>
                        </TableCell>
                        <TableCell align="right">${(item.price * item.quantity).toFixed(2)}</TableCell>
                        <TableCell align="center">
                          <IconButton 
                            size="small" 
                            color="error"
                            onClick={() => handleRemoveItem(item.id)}
                          >
                            <DeleteIcon fontSize="small" />
                          </IconButton>
                        </TableCell>
                      </TableRow>
                    ))}
                    <TableRow>
                      <TableCell colSpan={3} align="right" sx={{ fontWeight: 'bold' }}>
                        Total:
                      </TableCell>
                      <TableCell align="right" sx={{ fontWeight: 'bold' }}>
                        ${cart.total.toFixed(2)}
                      </TableCell>
                      <TableCell />
                    </TableRow>
                  </TableBody>
                </Table>
              </TableContainer>
            )}
          </Grid>
          
          {/* Contact Information */}
          <Grid item xs={12} sx={{ mt: 2 }}>
            <Typography variant="h6" gutterBottom>
              Your Information
            </Typography>
          </Grid>
          
          <Grid item xs={12} md={6}>
            <TextField
              fullWidth
              label="Full Name"
              name="fullName"
              value={orderData.fullName}
              onChange={handleInputChange}
              required
            />
          </Grid>
          
          <Grid item xs={12} md={6}>
            <TextField
              fullWidth
              label="Email"
              name="email"
              type="email"
              value={orderData.email}
              onChange={handleInputChange}
              required
            />
          </Grid>
          
          <Grid item xs={12} md={6}>
            <TextField
              fullWidth
              label="Phone"
              name="phone"
              value={orderData.phone}
              onChange={handleInputChange}
              required
            />
          </Grid>
          
          {/* Shipping Information */}
          <Grid item xs={12} sx={{ mt: 2 }}>
            <Typography variant="h6" gutterBottom>
              Shipping Information
            </Typography>
          </Grid>
          
          <Grid item xs={12}>
            <TextField
              fullWidth
              label="Address"
              name="address"
              value={orderData.address}
              onChange={handleInputChange}
              required
            />
          </Grid>
          
          <Grid item xs={12} md={6}>
            <TextField
              fullWidth
              label="City"
              name="city"
              value={orderData.city}
              onChange={handleInputChange}
              required
            />
          </Grid>
          
          <Grid item xs={12} md={3}>
            <TextField
              fullWidth
              label="Zip Code"
              name="zipCode"
              value={orderData.zipCode}
              onChange={handleInputChange}
              required
            />
          </Grid>
          
          <Grid item xs={12} md={3}>
            <TextField
              fullWidth
              label="Country"
              name="country"
              value={orderData.country}
              onChange={handleInputChange}
              required
            />
          </Grid>
          
          <Grid item xs={12}>
            <TextField
              fullWidth
              label="Order Notes"
              name="notes"
              value={orderData.notes}
              onChange={handleInputChange}
              multiline
              rows={3}
            />
          </Grid>
          
          <Grid item xs={12} sx={{ mt: 2 }}>
            <Button
              type="submit"
              variant="contained"
              color="primary"
              size="large"
              fullWidth
              disabled={loading || cart.items.length === 0}
              sx={{ py: 1.5 }}
            >
              {loading ? <CircularProgress size={24} /> : 'Place Order'}
            </Button>
          </Grid>
        </Grid>
      </form>
      
      <Snackbar 
        open={!!success} 
        autoHideDuration={6000} 
        onClose={() => setSuccess(null)}
        anchorOrigin={{ vertical: 'top', horizontal: 'center' }}
      >
        <Alert onClose={() => setSuccess(null)} severity="success">
          {success}
        </Alert>
      </Snackbar>
    </Paper>
  );
};

export default OrderForm; 