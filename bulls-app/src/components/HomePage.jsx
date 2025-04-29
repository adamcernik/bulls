import React, { useState, useEffect } from 'react';
import { 
  Container, 
  Typography, 
  Grid, 
  Box, 
  Chip, 
  Stack,
  CircularProgress,
  Alert,
  Pagination
} from '@mui/material';
import { getProducts } from '../services/firestore';
import ProductCard from './ProductCard';

const ITEMS_PER_PAGE = 12;

const HomePage = ({ setDbOk }) => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [page, setPage] = useState(1);
  
  useEffect(() => {
    const fetchProducts = async () => {
      setLoading(true);
      try {
        const data = await getProducts();
        setProducts(data);
        setDbOk(true);
      } catch (err) {
        console.error('Error fetching products:', err);
        setError(`Failed to load products: ${err.message}`);
        setDbOk(false);
      } finally {
        setLoading(false);
      }
    };
    fetchProducts();
  }, [setDbOk]);
  
  // Get unique categories
  const categories = ['all', ...new Set(products.map(product => product.category).filter(Boolean))];
  
  // Filter products by category
  const filteredProducts = selectedCategory === 'all' 
    ? products 
    : products.filter(product => product.category === selectedCategory);
    
  // Paginate products
  const pageCount = Math.ceil(filteredProducts.length / ITEMS_PER_PAGE);
  const paginatedProducts = filteredProducts.slice(
    (page - 1) * ITEMS_PER_PAGE, 
    page * ITEMS_PER_PAGE
  );
  
  const handleCategoryChange = (category) => {
    setSelectedCategory(category);
    setPage(1); // Reset to first page when changing category
  };
  
  const handlePageChange = (event, newPage) => {
    setPage(newPage);
    // Scroll to top
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };
  
  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '60vh' }}>
        <CircularProgress />
      </Box>
    );
  }
  
  if (error) {
    return (
      <Container sx={{ py: 4 }}>
        <Alert severity="error">{error}</Alert>
      </Container>
    );
  }
  
  return (
    <Container maxWidth="xl" sx={{ py: 4 }}>
      {/* Banner/Hero section */}
      <Box 
        sx={{ 
          bgcolor: 'primary.main', 
          color: 'white', 
          py: 5, 
          px: 3, 
          mb: 4, 
          borderRadius: 2,
          backgroundImage: 'linear-gradient(to right, #1565c0, #0d47a1)'
        }}
      >
        <Typography variant="h3" component="h1" gutterBottom>
          Bulls E-Bikes Collection
        </Typography>
        <Typography variant="h6" component="p">
          Explore our premium selection of bikes and accessories
        </Typography>
      </Box>
      
      {/* Category filter */}
      <Box sx={{ mb: 4 }}>
        <Typography variant="h5" component="h2" gutterBottom>
          Categories
        </Typography>
        <Stack direction="row" spacing={1} sx={{ flexWrap: 'wrap', gap: 1 }}>
          {categories.map(category => (
            <Chip 
              key={category} 
              label={category === 'all' ? 'All Products' : category}
              onClick={() => handleCategoryChange(category)}
              color={selectedCategory === category ? 'primary' : 'default'}
              variant={selectedCategory === category ? 'filled' : 'outlined'}
              sx={{ textTransform: 'capitalize' }}
            />
          ))}
        </Stack>
      </Box>
      
      {/* Results count */}
      <Box sx={{ mb: 2 }}>
        <Typography variant="body1" color="text.secondary">
          Showing {paginatedProducts.length} of {filteredProducts.length} products
        </Typography>
      </Box>
      
      {/* Products grid */}
      <Grid container spacing={3}>
        {paginatedProducts.map(product => (
          <Grid item xs={12} sm={6} md={4} lg={3} key={product.id}>
            <ProductCard product={product} />
          </Grid>
        ))}
        
        {paginatedProducts.length === 0 && (
          <Grid item xs={12}>
            <Alert severity="info">
              No products found in this category.
            </Alert>
          </Grid>
        )}
      </Grid>
      
      {/* Pagination */}
      {pageCount > 1 && (
        <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}>
          <Pagination 
            count={pageCount} 
            page={page} 
            onChange={handlePageChange} 
            color="primary" 
            size="large"
          />
        </Box>
      )}
    </Container>
  );
};

export default HomePage; 