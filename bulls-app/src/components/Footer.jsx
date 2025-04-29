import React from 'react';
import { Box, Container, Typography, Link } from '@mui/material';
import { Link as RouterLink } from 'react-router-dom';

const Footer = () => {
  const currentYear = new Date().getFullYear();
  
  return (
    <Box
      component="footer"
      sx={{
        py: 3,
        px: 2,
        mt: 'auto',
        backgroundColor: (theme) => theme.palette.grey[100]
      }}
    >
      <Container maxWidth="lg">
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <Typography variant="body2" color="text.secondary">
            © {currentYear} Bulls Bikes. All rights reserved.
          </Typography>
          
          <Box>
            <Link
              component={RouterLink}
              to="/admin"
              color="text.secondary"
              sx={{ 
                fontSize: '0.75rem', 
                textDecoration: 'none',
                '&:hover': {
                  textDecoration: 'underline'
                }
              }}
            >
              Admin
            </Link>
          </Box>
        </Box>
      </Container>
    </Box>
  );
};

export default Footer; 