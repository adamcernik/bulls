import React, { useEffect, useState, useContext } from 'react';
import {
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Box,
  Typography,
  FormControl,
  Select,
  MenuItem,
  Button,
  Alert,
  CircularProgress,
  Snackbar,
  Stack,
  Chip,
  TableSortLabel,
  TextField,
  Checkbox,
  IconButton,
  Menu,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  DialogContentText,
  Grid,
  InputLabel,
} from '@mui/material';
import SaveIcon from '@mui/icons-material/Save';
import DeleteIcon from '@mui/icons-material/Delete';
import MoreVertIcon from '@mui/icons-material/MoreVert';
import AddIcon from '@mui/icons-material/Add';
import { getProducts, updateProduct, checkUserAccess, getAllowedUsers, setUserAccess, addAllowedUser, deleteProduct, addProduct } from '../services/firestore';
import { UserContext } from './Header';
import { useNavigate } from 'react-router-dom';

const CATEGORY_COLORS = {
  ebike: 'primary',
  battery: 'secondary',
  bike: 'success',
};

const ADMIN_EMAIL = 'adam.cernik@gmail.com';

function formatCZK(value) {
  if (value == null || value === '') return '-';
  return value.toLocaleString('cs-CZ') + ' CZK';
}

const columns = [
  { id: 'model', label: 'Model', type: 'text' },
  { id: 'category', label: 'Category', type: 'select' },
  { id: 'price', label: 'Price', type: 'number' },
  { id: 'discountPrice', label: 'Discount', type: 'number' },
  { id: 'actionPrice', label: 'Action', type: 'number' },
  { id: 'battery', label: 'Battery', type: 'text' },
  { id: 'motor', label: 'Motor', type: 'text' },
];

const emptyProduct = {
  model: '',
  category: '',
  price: '',
  discountPrice: '',
  actionPrice: '',
  battery: '',
  motor: '',
};

const ProductsTable = ({ setDbOk = () => {}, adminTab = false, setAdminTab = () => {} }) => {
  const user = useContext(UserContext);
  const [products, setProducts] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [saveLoading, setSaveLoading] = useState(false);
  const [deleteLoading, setDeleteLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  const [editRows, setEditRows] = useState({});
  const [sortBy, setSortBy] = useState('model');
  const [sortDirection, setSortDirection] = useState('asc');
  const [editingCell, setEditingCell] = useState({ id: null, field: null });
  const [hasAccess, setHasAccess] = useState(null);
  const [checkingAccess, setCheckingAccess] = useState(true);
  const [allowedUsers, setAllowedUsers] = useState([]);
  const [newUserEmail, setNewUserEmail] = useState('');
  const [adminLoading, setAdminLoading] = useState(false);
  const [adminError, setAdminError] = useState(null);
  
  // New state for bulk actions and kebab menu
  const [selected, setSelected] = useState([]);
  const [menuAnchorEl, setMenuAnchorEl] = useState(null);
  const [activeRow, setActiveRow] = useState(null);
  const [confirmDelete, setConfirmDelete] = useState({ open: false, id: null, isBulk: false });
  
  const navigate = useNavigate();
  
  const [createDialogOpen, setCreateDialogOpen] = useState(false);
  const [newProduct, setNewProduct] = useState(() => ({...emptyProduct}));
  const [createLoading, setCreateLoading] = useState(false);
  
  // Check access on mount or user change
  useEffect(() => {
    if (!user) {
      setHasAccess(null);
      setCheckingAccess(false);
      return;
    }
    setCheckingAccess(true);
    checkUserAccess(user.email).then(setHasAccess).finally(() => setCheckingAccess(false));
  }, [user]);

  // Admin: load allowed users
  useEffect(() => {
    if (user && user.email === ADMIN_EMAIL && adminTab) {
      setAdminLoading(true);
      getAllowedUsers().then(setAllowedUsers).catch(e => setAdminError(e.message)).finally(() => setAdminLoading(false));
    }
  }, [user, adminTab]);

  // Admin: toggle access
  const handleToggleAccess = async (email, current) => {
    setAdminLoading(true);
    await setUserAccess(email, !current);
    setAllowedUsers(await getAllowedUsers());
    setAdminLoading(false);
  };
  
  // Admin: add user
  const handleAddUser = async () => {
    if (!newUserEmail) return;
    setAdminLoading(true);
    await addAllowedUser(newUserEmail, false);
    setAllowedUsers(await getAllowedUsers());
    setNewUserEmail('');
    setAdminLoading(false);
  };

  // Load products from Firestore
  useEffect(() => {
    const fetchProducts = async () => {
      setIsLoading(true);
      try {
        const data = await getProducts();
        setProducts(data);
        setEditRows({});
        setDbOk(true);
      } catch (err) {
        setError(`Failed to load products: ${err.message}`);
        setDbOk(false);
        console.error('Error fetching products:', err);
      } finally {
        setIsLoading(false);
      }
    };
    fetchProducts();
  }, [setDbOk]);

  // Inline edit logic
  const handleCellChange = (id, field, value) => {
    setEditRows(prev => ({
      ...prev,
      [id]: {
        ...prev[id],
        [field]: value
      }
    }));
  };

  const hasChanges = Object.keys(editRows).length > 0;

  // Save all changes
  const handleSaveAll = async () => {
    setSaveLoading(true);
    setError(null);
    try {
      const changedProducts = Object.entries(editRows);
      if (changedProducts.length === 0) {
        setSaveLoading(false);
        return;
      }
      await Promise.all(
        changedProducts.map(([id, changes]) => updateProduct(id, changes))
      );
      setProducts(prev => prev.map(p =>
        editRows[p.id] ? { ...p, ...editRows[p.id] } : p
      ));
      setEditRows({});
      setSuccess(`Updated ${changedProducts.length} products`);
    } catch (err) {
      setError(`Failed to update products: ${err.message}`);
      console.error('Error updating products:', err);
    } finally {
      setSaveLoading(false);
      setTimeout(() => setSuccess(null), 3000);
    }
  };

  // Sorting logic
  const handleSort = (columnId) => {
    if (sortBy === columnId) {
      setSortDirection(prev => (prev === 'asc' ? 'desc' : 'asc'));
    } else {
      setSortBy(columnId);
      setSortDirection('asc');
    }
  };

  const sortedProducts = [...(products || [])].sort((a, b) => {
    if (!a || !b) return 0;
    
    let aValue = a?.[sortBy] ?? '';
    let bValue = b?.[sortBy] ?? '';
    
    if (['price', 'discountPrice', 'actionPrice'].includes(sortBy)) {
      aValue = Number(aValue) || 0;
      bValue = Number(bValue) || 0;
    } else {
      aValue = String(aValue || '');
      bValue = String(bValue || '');
    }
    
    if (aValue < bValue) return sortDirection === 'asc' ? -1 : 1;
    if (aValue > bValue) return sortDirection === 'asc' ? 1 : -1;
    return 0;
  });

  // Handle cell click to enter edit mode
  const handleCellClick = (id, field) => {
    setEditingCell({ id, field });
  };

  // Handle blur or Enter to exit edit mode
  const handleCellBlur = () => {
    setEditingCell({ id: null, field: null });
  };
  
  const handleCellKeyDown = (e) => {
    if (e.key === 'Enter') {
      setEditingCell({ id: null, field: null });
    }
  };

  // New functions for bulk actions
  const handleSelectAllClick = (event) => {
    if (event.target.checked) {
      const newSelected = sortedProducts.map((n) => n.id);
      setSelected(newSelected);
      return;
    }
    setSelected([]);
  };

  const handleRowCheckboxClick = (event, id) => {
    const selectedIndex = selected.indexOf(id);
    let newSelected = [];

    if (selectedIndex === -1) {
      newSelected = newSelected.concat(selected, id);
    } else if (selectedIndex === 0) {
      newSelected = newSelected.concat(selected.slice(1));
    } else if (selectedIndex === selected.length - 1) {
      newSelected = newSelected.concat(selected.slice(0, -1));
    } else if (selectedIndex > 0) {
      newSelected = newSelected.concat(
        selected.slice(0, selectedIndex),
        selected.slice(selectedIndex + 1),
      );
    }
    setSelected(newSelected);
  };

  // Kebab menu handlers
  const handleMenuOpen = (event, id) => {
    setMenuAnchorEl(event.currentTarget);
    setActiveRow(id);
  };

  const handleMenuClose = () => {
    setMenuAnchorEl(null);
    setActiveRow(null);
  };

  // Delete functions
  const handleDeleteConfirmOpen = (id = null, isBulk = false) => {
    setConfirmDelete({ open: true, id, isBulk });
    handleMenuClose();
  };

  const handleDeleteConfirmClose = () => {
    setConfirmDelete({ open: false, id: null, isBulk: false });
  };

  const handleDeleteProduct = async () => {
    setDeleteLoading(true);
    try {
      if (confirmDelete.isBulk) {
        // Bulk delete
        await Promise.all(selected.map(id => deleteProduct(id)));
        setProducts(prevProducts => prevProducts.filter(p => !selected.includes(p.id)));
        setSuccess(`Deleted ${selected.length} products`);
        setSelected([]);
      } else {
        // Single delete
        await deleteProduct(confirmDelete.id);
        setProducts(prevProducts => prevProducts.filter(p => p.id !== confirmDelete.id));
        setSuccess('Product deleted');
      }
    } catch (err) {
      setError(`Failed to delete: ${err.message}`);
      console.error('Error deleting product(s):', err);
    } finally {
      setDeleteLoading(false);
      handleDeleteConfirmClose();
      setTimeout(() => setSuccess(null), 3000);
    }
  };

  const isSelected = (id) => selected.indexOf(id) !== -1;

  // Navigate to product detail
  const handleViewProduct = (id) => {
    navigate(`/product/${id}`);
  };

  // Add new product
  const handleCreateProduct = async () => {
    if (!newProduct || !newProduct.model) {
      setError("Product model is required");
      return;
    }
    
    setCreateLoading(true);
    setError(null);
    
    try {
      // Create a clean copy of the product with valid values
      const productToAdd = {
        model: newProduct.model || '',
        category: newProduct.category || '',
        price: newProduct.price ? Number(newProduct.price) : 0,
        discountPrice: newProduct.discountPrice ? Number(newProduct.discountPrice) : 0,
        actionPrice: newProduct.actionPrice ? Number(newProduct.actionPrice) : 0,
        battery: newProduct.battery || '',
        motor: newProduct.motor || ''
      };
      
      const addedProduct = await addProduct(productToAdd);
      
      if (addedProduct) {
        setProducts(prevProducts => [...(prevProducts || []), addedProduct]);
        setSuccess("Product created successfully");
        setCreateDialogOpen(false);
        setNewProduct({...emptyProduct});
      } else {
        throw new Error("Failed to create product - no data returned");
      }
    } catch (err) {
      setError(`Failed to create product: ${err.message}`);
      console.error('Error creating product:', err);
    } finally {
      setCreateLoading(false);
      setTimeout(() => setSuccess(null), 3000);
    }
  };

  const handleCreateDialogOpen = () => {
    setNewProduct({...emptyProduct});
    setCreateDialogOpen(true);
  };

  const handleCreateDialogClose = () => {
    setCreateDialogOpen(false);
  };
  
  const handleNewProductChange = (field, value) => {
    setNewProduct(prev => ({
      ...prev,
      [field]: value
    }));
  };

  if (checkingAccess) return <Box sx={{ p: 4, textAlign: 'center' }}><CircularProgress /></Box>;
  if (!user) return <Alert severity="info">Please sign in to view this page.</Alert>;
  if (!hasAccess && user.email !== ADMIN_EMAIL) return <Alert severity="error">You do not have access to this data.</Alert>;

  if (adminTab && user && user.email === ADMIN_EMAIL) {
    return (
      <Box>
        <Button variant="outlined" onClick={() => setAdminTab(false)} sx={{ mb: 2 }}>Back to Table</Button>
        <Typography variant="h6" sx={{ mb: 2 }}>User Access Management</Typography>
        {adminLoading ? <CircularProgress /> : (
          <>
            <Box sx={{ mb: 2 }}>
              <TextField
                label="Add user by email"
                value={newUserEmail}
                onChange={e => setNewUserEmail(e.target.value)}
                size="small"
                sx={{ mr: 1 }}
              />
              <Button onClick={handleAddUser} variant="contained">Add</Button>
            </Box>
            {adminError && <Alert severity="error" sx={{ mb: 2 }}>{adminError}</Alert>}
            <TableContainer component={Paper} sx={{ maxWidth: 600 }}>
              <Table size="small">
                <TableHead>
                  <TableRow>
                    <TableCell>Email</TableCell>
                    <TableCell align="center">Has Access</TableCell>
                    <TableCell align="center">Action</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {allowedUsers.map(u => (
                    <TableRow key={u.email}>
                      <TableCell>{u.email}</TableCell>
                      <TableCell align="center">
                        <Chip 
                          color={u.hasAccess ? "success" : "default"} 
                          size="small"
                          label={u.hasAccess ? "YES" : "NO"} 
                        />
                      </TableCell>
                      <TableCell align="center">
                        <Button 
                          size="small" 
                          color={u.hasAccess ? "warning" : "success"}
                          variant="outlined"
                          onClick={() => handleToggleAccess(u.email, u.hasAccess)}
                        >
                          {u.hasAccess ? 'Revoke' : 'Grant'}
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                  {allowedUsers.length === 0 && (
                    <TableRow>
                      <TableCell colSpan={3} align="center">No users added yet</TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </TableContainer>
          </>
        )}
      </Box>
    );
  }

  return (
    <Box>
      <Stack
        direction="row"
        spacing={2}
        justifyContent="space-between"
        alignItems="center"
        sx={{ mb: 2 }}
      >
        <Typography variant="h6">
          Products List ({products.length})
        </Typography>
        <Box>
          <Button
            variant="contained"
            color="success"
            startIcon={<AddIcon />}
            onClick={handleCreateDialogOpen}
            sx={{ mr: 2 }}
          >
            Create Product
          </Button>
          {selected.length > 0 && (
            <Button
              variant="outlined"
              color="error"
              startIcon={<DeleteIcon />}
              onClick={() => handleDeleteConfirmOpen(null, true)}
              sx={{ mr: 2 }}
            >
              Delete Selected ({selected.length})
            </Button>
          )}
          <Button
            variant="contained"
            color="primary"
            startIcon={<SaveIcon />}
            onClick={handleSaveAll}
            disabled={!hasChanges || saveLoading}
          >
            {saveLoading ? 'Saving...' : 'Save All Changes'}
          </Button>
        </Box>
      </Stack>
      {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
      {hasChanges && !error && (
        <Alert severity="warning" sx={{ mb: 2 }}>
          You have unsaved changes
        </Alert>
      )}
      <Snackbar
        open={!!success}
        autoHideDuration={3000}
        onClose={() => setSuccess(null)}
        message={success}
      />
      <TableContainer component={Paper} sx={{ maxHeight: 600 }}>
        <Table stickyHeader aria-label="products table" size="small">
          <TableHead>
            <TableRow>
              <TableCell padding="checkbox">
                <Checkbox
                  indeterminate={selected.length > 0 && selected.length < sortedProducts.length}
                  checked={sortedProducts.length > 0 && selected.length === sortedProducts.length}
                  onChange={handleSelectAllClick}
                  inputProps={{ 'aria-label': 'select all products' }}
                />
              </TableCell>
              {columns.map(col => (
                <TableCell key={col.id} sortDirection={sortBy === col.id ? sortDirection : false}>
                  <TableSortLabel
                    active={sortBy === col.id}
                    direction={sortBy === col.id ? sortDirection : 'asc'}
                    onClick={() => handleSort(col.id)}
                  >
                    {col.label}
                  </TableSortLabel>
                </TableCell>
              ))}
              <TableCell align="right">Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {sortedProducts.map((product) => {
              const rowEdit = editRows[product.id] || {};
              const isItemSelected = isSelected(product.id);
              
              return (
                <TableRow 
                  key={product.id} 
                  hover
                  selected={isItemSelected}
                >
                  <TableCell padding="checkbox">
                    <Checkbox
                      checked={isItemSelected}
                      onChange={(event) => handleRowCheckboxClick(event, product.id)}
                      inputProps={{ 'aria-labelledby': `product-${product.id}` }}
                      onClick={(e) => e.stopPropagation()}
                    />
                  </TableCell>
                  {columns.map(col => {
                    const value = rowEdit[col.id] !== undefined ? rowEdit[col.id] : product[col.id] || '';
                    const isEditing = editingCell.id === product.id && editingCell.field === col.id;
                    const isChanged = rowEdit[col.id] !== undefined && rowEdit[col.id] !== product[col.id];
                    // Editable cell style
                    const editableCellStyle = {
                      cursor: 'pointer',
                      backgroundColor: isEditing
                        ? '#fffbe6'
                        : undefined,
                      transition: 'background 0.2s',
                      fontWeight: isChanged ? 'bold' : 'normal',
                      '&:hover': {
                        backgroundColor: '#fffbe6',
                      },
                      minWidth: 0,
                      maxWidth: 180,
                      p: 0.5,
                    };
                    if (col.id === 'category') {
                      return (
                        <TableCell key={col.id} sx={editableCellStyle}>
                          {isEditing ? (
                            <FormControl size="small" fullWidth>
                              <Select
                                value={value}
                                onChange={e => handleCellChange(product.id, col.id, e.target.value)}
                                onBlur={handleCellBlur}
                                autoFocus
                                onKeyDown={handleCellKeyDown}
                                displayEmpty
                                sx={{ fontWeight: isChanged ? 'bold' : 'normal', minWidth: 80 }}
                              >
                                <MenuItem value="">
                                  <em>Select...</em>
                                </MenuItem>
                                <MenuItem value="ebike">ebike</MenuItem>
                                <MenuItem value="battery">battery</MenuItem>
                                <MenuItem value="bike">bike</MenuItem>
                              </Select>
                            </FormControl>
                          ) : (
                            <Box sx={{ minWidth: 80, maxWidth: 180, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                              <Chip
                                label={value || '—'}
                                color={CATEGORY_COLORS[value] || 'default'}
                                variant={value ? 'filled' : 'outlined'}
                                onClick={() => handleCellClick(product.id, col.id)}
                                sx={{ cursor: 'pointer', bgcolor: value ? undefined : '#eee', color: value ? undefined : '#888', fontWeight: isChanged ? 'bold' : 'normal', '&:hover': { bgcolor: '#fffbe6' } }}
                              />
                            </Box>
                          )}
                        </TableCell>
                      );
                    }
                    if (col.type === 'number') {
                      return (
                        <TableCell key={col.id} sx={editableCellStyle} onClick={() => !isEditing && handleCellClick(product.id, col.id)}>
                          {isEditing ? (
                            <TextField
                              type="number"
                              size="small"
                              value={value}
                              onChange={e => handleCellChange(product.id, col.id, e.target.value)}
                              onBlur={handleCellBlur}
                              onKeyDown={handleCellKeyDown}
                              autoFocus
                              sx={{ width: 90, fontWeight: isChanged ? 'bold' : 'normal', fontSize: '0.95em' }}
                              inputProps={{ min: 0, style: { padding: 4 } }}
                            />
                          ) : (
                            <Box sx={{ minWidth: 70, maxWidth: 120, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                              {value !== '' ? formatCZK(Number(value)) : <span style={{ color: '#bbb' }}>—</span>}
                            </Box>
                          )}
                        </TableCell>
                      );
                    }
                    // Default: text field
                    return (
                      <TableCell key={col.id} sx={editableCellStyle} onClick={() => !isEditing && handleCellClick(product.id, col.id)}>
                        {isEditing ? (
                          <TextField
                            size="small"
                            value={value}
                            onChange={e => handleCellChange(product.id, col.id, e.target.value)}
                            onBlur={handleCellBlur}
                            onKeyDown={handleCellKeyDown}
                            autoFocus
                            sx={{ fontWeight: isChanged ? 'bold' : 'normal', fontSize: '0.95em', minWidth: 60, maxWidth: 180, p: 0 }}
                            inputProps={{ style: { padding: 4 } }}
                          />
                        ) : (
                          <Box sx={{ minWidth: 60, maxWidth: 180, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                            {col.id === 'model' ? (
                              <Box 
                                component="span" 
                                sx={{ 
                                  cursor: 'pointer', 
                                  color: 'primary.main',
                                  '&:hover': { textDecoration: 'underline' },
                                  fontWeight: isChanged ? 'bold' : 'normal'
                                }}
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleViewProduct(product.id);
                                }}
                              >
                                {value || <span style={{ color: '#bbb' }}>—</span>}
                              </Box>
                            ) : (
                              value || <span style={{ color: '#bbb' }}>—</span>
                            )}
                          </Box>
                        )}
                      </TableCell>
                    );
                  })}
                  <TableCell align="right">
                    <IconButton 
                      size="small"
                      onClick={(e) => handleMenuOpen(e, product.id)}
                      aria-label="more actions"
                    >
                      <MoreVertIcon fontSize="small" />
                    </IconButton>
                  </TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      </TableContainer>

      {/* Kebab menu */}
      <Menu
        anchorEl={menuAnchorEl}
        open={Boolean(menuAnchorEl)}
        onClose={handleMenuClose}
        PaperProps={{
          elevation: 0,
          sx: {
            overflow: 'visible',
            filter: 'drop-shadow(0px 2px 8px rgba(0,0,0,0.15))',
            mt: 0.5,
          },
        }}
      >
        <MenuItem 
          onClick={() => handleDeleteConfirmOpen(activeRow, false)}
          sx={{ color: 'error.main' }}
        >
          <DeleteIcon fontSize="small" sx={{ mr: 1 }} />
          Delete
        </MenuItem>
      </Menu>

      {/* Confirmation Dialog */}
      <Dialog
        open={confirmDelete.open}
        onClose={handleDeleteConfirmClose}
        aria-labelledby="delete-dialog-title"
        aria-describedby="delete-dialog-description"
      >
        <DialogTitle id="delete-dialog-title">
          {confirmDelete.isBulk 
            ? `Delete ${selected.length} Products?` 
            : "Delete Product?"}
        </DialogTitle>
        <DialogContent>
          <DialogContentText id="delete-dialog-description">
            {confirmDelete.isBulk
              ? `Are you sure you want to delete ${selected.length} selected products? This action cannot be undone.`
              : "Are you sure you want to delete this product? This action cannot be undone."}
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleDeleteConfirmClose} autoFocus>Cancel</Button>
          <Button 
            onClick={handleDeleteProduct} 
            color="error" 
            variant="contained"
            disabled={deleteLoading}
          >
            {deleteLoading ? 'Deleting...' : 'Delete'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Create Product Dialog */}
      <Dialog
        open={createDialogOpen}
        onClose={handleCreateDialogClose}
        aria-labelledby="create-product-dialog-title"
        maxWidth="md"
        fullWidth
      >
        <DialogTitle id="create-product-dialog-title">
          Create New Product
        </DialogTitle>
        <DialogContent>
          {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
          <Grid container spacing={2} sx={{ mt: 1 }}>
            <Grid item xs={12} sm={6} md={4}>
              <TextField
                label="Model *"
                fullWidth
                value={newProduct.model}
                onChange={(e) => handleNewProductChange('model', e.target.value)}
                margin="normal"
                required
                variant="outlined"
              />
            </Grid>
            <Grid item xs={12} sm={6} md={4}>
              <FormControl fullWidth margin="normal">
                <InputLabel id="new-category-label">Category</InputLabel>
                <Select
                  labelId="new-category-label"
                  value={newProduct.category}
                  onChange={(e) => handleNewProductChange('category', e.target.value)}
                  label="Category"
                >
                  <MenuItem value=""><em>None</em></MenuItem>
                  <MenuItem value="ebike">ebike</MenuItem>
                  <MenuItem value="battery">battery</MenuItem>
                  <MenuItem value="bike">bike</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} sm={6} md={4}>
              <TextField
                label="Price (CZK)"
                fullWidth
                type="number"
                value={newProduct.price}
                onChange={(e) => handleNewProductChange('price', Number(e.target.value))}
                margin="normal"
                variant="outlined"
                helperText={newProduct.price ? formatCZK(Number(newProduct.price)) : ''}
              />
            </Grid>
            <Grid item xs={12} sm={6} md={4}>
              <TextField
                label="Discount (%)"
                fullWidth
                type="number"
                value={newProduct.discount}
                onChange={(e) => handleNewProductChange('discount', Number(e.target.value))}
                margin="normal"
                variant="outlined"
              />
            </Grid>
            <Grid item xs={12} sm={6} md={4}>
              <TextField
                label="Action Price (CZK)"
                fullWidth
                type="number"
                value={newProduct.action}
                onChange={(e) => handleNewProductChange('action', Number(e.target.value))}
                margin="normal"
                variant="outlined"
                helperText={newProduct.action ? formatCZK(Number(newProduct.action)) : ''}
              />
            </Grid>
            <Grid item xs={12} sm={6} md={4}>
              <TextField
                label="Battery"
                fullWidth
                value={newProduct.battery}
                onChange={(e) => handleNewProductChange('battery', e.target.value)}
                margin="normal"
                variant="outlined"
              />
            </Grid>
            <Grid item xs={12} sm={6} md={4}>
              <TextField
                label="Motor"
                fullWidth
                value={newProduct.motor}
                onChange={(e) => handleNewProductChange('motor', e.target.value)}
                margin="normal"
                variant="outlined"
              />
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCreateDialogClose}>Cancel</Button>
          <Button 
            onClick={handleCreateProduct} 
            variant="contained" 
            color="primary"
            disabled={!newProduct.model || createLoading}
          >
            {createLoading ? 'Creating...' : 'Create'}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default ProductsTable; 