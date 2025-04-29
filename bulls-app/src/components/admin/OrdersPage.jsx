import React, { useState, useEffect, useContext } from 'react';
import { 
  Container, 
  Typography, 
  Box, 
  Paper, 
  Alert, 
  CircularProgress,
  Tabs,
  Tab
} from '@mui/material';
import { Navigate } from 'react-router-dom';
import { UserContext } from '../Header';
import OrdersTable from './OrdersTable';
import { checkUserAccess } from '../../services/firestore';

// Admin email for direct access
const ADMIN_EMAIL = 'admin@bulls.com';

const OrdersPage = () => {
  const { user } = useContext(UserContext);
  const [hasAccess, setHasAccess] = useState(false);
  const [checkingAccess, setCheckingAccess] = useState(true);
  const [activeTab, setActiveTab] = useState(0);

  useEffect(() => {
    const checkAccess = async () => {
      if (!user) {
        setCheckingAccess(false);
        return;
      }

      try {
        // Admin email always has access
        if (user.email === ADMIN_EMAIL) {
          setHasAccess(true);
          setCheckingAccess(false);
          return;
        }

        // Check Firestore for access rights
        const access = await checkUserAccess(user.email);
        setHasAccess(access);
      } catch (error) {
        console.error('Error checking access:', error);
        setHasAccess(false);
      } finally {
        setCheckingAccess(false);
      }
    };

    checkAccess();
  }, [user]);

  const handleTabChange = (event, newValue) => {
    setActiveTab(newValue);
  };

  if (checkingAccess) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', p: 4 }}>
        <CircularProgress />
      </Box>
    );
  }

  if (!user) {
    return <Navigate to="/login" />;
  }

  if (!hasAccess && user.email !== ADMIN_EMAIL) {
    return (
      <Container maxWidth="lg" sx={{ py: 4 }}>
        <Alert severity="error">
          You do not have access to the admin panel.
        </Alert>
      </Container>
    );
  }

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      <Paper sx={{ p: 3 }}>
        <Typography variant="h5" component="h1" gutterBottom>
          Orders Management
        </Typography>
        
        <Box sx={{ borderBottom: 1, borderColor: 'divider', mb: 3 }}>
          <Tabs value={activeTab} onChange={handleTabChange}>
            <Tab label="All Orders" />
            <Tab label="Pending" />
            <Tab label="Processing" />
            <Tab label="Completed" />
          </Tabs>
        </Box>
        
        <Box>
          {activeTab === 0 && <OrdersTable />}
          {activeTab === 1 && <OrdersTable filterStatus="pending" />}
          {activeTab === 2 && <OrdersTable filterStatus="processing" />}
          {activeTab === 3 && <OrdersTable filterStatus="delivered" />}
        </Box>
      </Paper>
    </Container>
  );
};

export default OrdersPage; 