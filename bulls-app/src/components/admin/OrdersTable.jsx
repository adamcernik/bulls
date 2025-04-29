import React, { useState, useEffect } from 'react';
import {
  Box,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Typography,
  Chip,
  IconButton,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  TextField,
  Grid,
  CircularProgress,
  Alert,
  Tooltip
} from '@mui/material';
import {
  Edit as EditIcon,
  Visibility as ViewIcon,
  Delete as DeleteIcon
} from '@mui/icons-material';
import { getOrders, updateOrderStatus, updateOrder } from '../../services/orders';

const OrdersTable = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [viewDialogOpen, setViewDialogOpen] = useState(false);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [editedStatus, setEditedStatus] = useState('');
  const [statusUpdateLoading, setStatusUpdateLoading] = useState(false);

  // Load orders on component mount
  useEffect(() => {
    loadOrders();
  }, []);

  const loadOrders = async () => {
    setLoading(true);
    setError(null);
    try {
      const ordersData = await getOrders();
      setOrders(ordersData || []);
    } catch (err) {
      setError('Failed to load orders: ' + err.message);
      console.error('Error loading orders:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleViewOrder = (order) => {
    setSelectedOrder(order);
    setViewDialogOpen(true);
  };

  const handleEditOrder = (order) => {
    setSelectedOrder(order);
    setEditedStatus(order.status || 'pending');
    setEditDialogOpen(true);
  };

  const handleStatusChange = (e) => {
    setEditedStatus(e.target.value);
  };

  const handleUpdateStatus = async () => {
    if (!selectedOrder || !editedStatus) return;
    
    setStatusUpdateLoading(true);
    try {
      await updateOrderStatus(selectedOrder.id, editedStatus);
      
      // Update local state
      setOrders(prevOrders => 
        prevOrders.map(order => 
          order.id === selectedOrder.id 
            ? { ...order, status: editedStatus } 
            : order
        )
      );
      
      setEditDialogOpen(false);
    } catch (err) {
      setError('Failed to update order status: ' + err.message);
      console.error('Error updating order status:', err);
    } finally {
      setStatusUpdateLoading(false);
    }
  };

  const getStatusColor = (status) => {
    switch (status?.toLowerCase()) {
      case 'pending':
        return 'warning';
      case 'processing':
        return 'info';
      case 'shipped':
        return 'primary';
      case 'delivered':
        return 'success';
      case 'cancelled':
        return 'error';
      default:
        return 'default';
    }
  };

  const formatDate = (date) => {
    if (!date) return 'N/A';
    return new Date(date).toLocaleString();
  };

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', p: 4 }}>
        <CircularProgress />
      </Box>
    );
  }

  if (error) {
    return (
      <Alert severity="error" sx={{ mb: 2 }}>
        {error}
      </Alert>
    );
  }

  return (
    <Box sx={{ width: '100%' }}>
      <Box sx={{ mb: 2, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Typography variant="h6" component="div">
          Orders ({orders.length})
        </Typography>
        <Button variant="outlined" onClick={loadOrders}>
          Refresh
        </Button>
      </Box>

      {orders.length === 0 ? (
        <Paper sx={{ p: 4, textAlign: 'center' }}>
          <Typography variant="body1">No orders found</Typography>
        </Paper>
      ) : (
        <TableContainer component={Paper}>
          <Table sx={{ minWidth: 650 }} size="small">
            <TableHead>
              <TableRow>
                <TableCell>Order ID</TableCell>
                <TableCell>Customer</TableCell>
                <TableCell>Product</TableCell>
                <TableCell align="right">Total</TableCell>
                <TableCell>Status</TableCell>
                <TableCell>Date</TableCell>
                <TableCell align="center">Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {orders.map((order) => (
                <TableRow 
                  key={order.id}
                  sx={{ '&:last-child td, &:last-child th': { border: 0 } }}
                >
                  <TableCell component="th" scope="row">
                    {order.id.substring(0, 8)}...
                  </TableCell>
                  <TableCell>{order.fullName}</TableCell>
                  <TableCell>{order.productName}</TableCell>
                  <TableCell align="right">${order.totalPrice?.toFixed(2)}</TableCell>
                  <TableCell>
                    <Chip 
                      label={order.status || 'pending'} 
                      color={getStatusColor(order.status)}
                      size="small"
                    />
                  </TableCell>
                  <TableCell>{formatDate(order.createdAt)}</TableCell>
                  <TableCell align="center">
                    <Tooltip title="View Details">
                      <IconButton 
                        size="small" 
                        onClick={() => handleViewOrder(order)}
                      >
                        <ViewIcon fontSize="small" />
                      </IconButton>
                    </Tooltip>
                    <Tooltip title="Edit Status">
                      <IconButton 
                        size="small" 
                        onClick={() => handleEditOrder(order)}
                      >
                        <EditIcon fontSize="small" />
                      </IconButton>
                    </Tooltip>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      )}

      {/* View Order Dialog */}
      <Dialog 
        open={viewDialogOpen} 
        onClose={() => setViewDialogOpen(false)}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle>
          Order Details
          <Chip 
            label={selectedOrder?.status || 'pending'} 
            color={getStatusColor(selectedOrder?.status)}
            size="small"
            sx={{ ml: 2 }}
          />
        </DialogTitle>
        <DialogContent>
          {selectedOrder && (
            <Grid container spacing={2} sx={{ mt: 1 }}>
              <Grid item xs={12} md={6}>
                <Typography variant="subtitle1" gutterBottom>
                  Customer Information
                </Typography>
                <Paper variant="outlined" sx={{ p: 2 }}>
                  <Typography variant="body2"><strong>Name:</strong> {selectedOrder.fullName}</Typography>
                  <Typography variant="body2"><strong>Email:</strong> {selectedOrder.email}</Typography>
                  <Typography variant="body2"><strong>Phone:</strong> {selectedOrder.phone}</Typography>
                </Paper>
              </Grid>
              
              <Grid item xs={12} md={6}>
                <Typography variant="subtitle1" gutterBottom>
                  Shipping Address
                </Typography>
                <Paper variant="outlined" sx={{ p: 2 }}>
                  <Typography variant="body2">{selectedOrder.address}</Typography>
                  <Typography variant="body2">{selectedOrder.city}, {selectedOrder.zipCode}</Typography>
                  <Typography variant="body2">{selectedOrder.country}</Typography>
                </Paper>
              </Grid>
              
              <Grid item xs={12}>
                <Typography variant="subtitle1" gutterBottom>
                  Order Information
                </Typography>
                <Paper variant="outlined" sx={{ p: 2 }}>
                  <Grid container spacing={2}>
                    <Grid item xs={12} md={6}>
                      <Typography variant="body2"><strong>Order ID:</strong> {selectedOrder.id}</Typography>
                      <Typography variant="body2"><strong>Date:</strong> {formatDate(selectedOrder.createdAt)}</Typography>
                      <Typography variant="body2"><strong>Status:</strong> {selectedOrder.status}</Typography>
                    </Grid>
                    <Grid item xs={12} md={6}>
                      <Typography variant="body2"><strong>Product:</strong> {selectedOrder.productName}</Typography>
                      <Typography variant="body2"><strong>Quantity:</strong> {selectedOrder.quantity}</Typography>
                      <Typography variant="body2"><strong>Price:</strong> ${selectedOrder.productPrice?.toFixed(2)}</Typography>
                      <Typography variant="body2"><strong>Total:</strong> ${selectedOrder.totalPrice?.toFixed(2)}</Typography>
                    </Grid>
                  </Grid>
                </Paper>
              </Grid>
              
              {selectedOrder.notes && (
                <Grid item xs={12}>
                  <Typography variant="subtitle1" gutterBottom>
                    Notes
                  </Typography>
                  <Paper variant="outlined" sx={{ p: 2 }}>
                    <Typography variant="body2">{selectedOrder.notes}</Typography>
                  </Paper>
                </Grid>
              )}
            </Grid>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setViewDialogOpen(false)}>Close</Button>
          <Button 
            variant="contained" 
            color="primary" 
            onClick={() => {
              setViewDialogOpen(false);
              handleEditOrder(selectedOrder);
            }}
          >
            Update Status
          </Button>
        </DialogActions>
      </Dialog>

      {/* Edit Status Dialog */}
      <Dialog 
        open={editDialogOpen} 
        onClose={() => setEditDialogOpen(false)}
      >
        <DialogTitle>Update Order Status</DialogTitle>
        <DialogContent>
          <FormControl fullWidth sx={{ mt: 2 }}>
            <InputLabel id="status-select-label">Status</InputLabel>
            <Select
              labelId="status-select-label"
              value={editedStatus}
              label="Status"
              onChange={handleStatusChange}
            >
              <MenuItem value="pending">Pending</MenuItem>
              <MenuItem value="processing">Processing</MenuItem>
              <MenuItem value="shipped">Shipped</MenuItem>
              <MenuItem value="delivered">Delivered</MenuItem>
              <MenuItem value="cancelled">Cancelled</MenuItem>
            </Select>
          </FormControl>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setEditDialogOpen(false)}>Cancel</Button>
          <Button 
            variant="contained" 
            color="primary" 
            onClick={handleUpdateStatus}
            disabled={statusUpdateLoading}
          >
            {statusUpdateLoading ? <CircularProgress size={24} /> : 'Update'}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default OrdersTable; 