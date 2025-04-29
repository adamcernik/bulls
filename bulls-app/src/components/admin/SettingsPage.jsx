import React, { useState, useEffect } from 'react';
import { 
  Container, 
  Typography, 
  Paper, 
  Box,
  Grid,
  TextField,
  Button,
  Divider,
  FormControl,
  FormControlLabel,
  Switch,
  Tabs,
  Tab,
  Alert,
  Snackbar,
  CircularProgress
} from '@mui/material';
import SaveIcon from '@mui/icons-material/Save';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../Header';

const SettingsPage = () => {
  const [activeTab, setActiveTab] = useState(0);
  const [generalSettings, setGeneralSettings] = useState({
    siteName: 'Bulls Bikes',
    contactEmail: 'info@bullsbikes.com',
    currency: 'USD',
    enableRegistration: true,
    enableCheckout: true,
    maintenanceMode: false
  });
  const [success, setSuccess] = useState(false);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  const { user } = useAuth();

  // Check authentication
  useEffect(() => {
    const timer = setTimeout(() => {
      setLoading(false);
      if (!user) {
        navigate('/login');
      }
    }, 1000);
    
    return () => clearTimeout(timer);
  }, [user, navigate]);

  const handleTabChange = (event, newValue) => {
    setActiveTab(newValue);
  };

  const handleGeneralSettingsChange = (e) => {
    const { name, value, checked } = e.target;
    setGeneralSettings(prev => ({
      ...prev,
      [name]: e.target.type === 'checkbox' ? checked : value
    }));
  };

  const handleSaveSettings = () => {
    // In a real app, you would save these settings to your database
    console.log('Saving settings:', generalSettings);
    setSuccess(true);
  };

  const handleCloseSnackbar = () => {
    setSuccess(false);
  };

  // Show loading state while checking auth
  if (loading) {
    return (
      <Container sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '50vh' }}>
        <CircularProgress />
      </Container>
    );
  }

  // Don't return null - it causes the white screen
  if (!user) {
    return (
      <Container maxWidth="lg" sx={{ py: 4 }}>
        <Typography variant="h5">Redirecting to login...</Typography>
      </Container>
    );
  }

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      <Typography variant="h4" component="h1" gutterBottom>
        System Settings
      </Typography>
      <Typography variant="body1" color="text.secondary" paragraph>
        Configure your application settings.
      </Typography>
      
      <Paper elevation={3} sx={{ mt: 4 }}>
        <Tabs 
          value={activeTab} 
          onChange={handleTabChange}
          sx={{ borderBottom: 1, borderColor: 'divider' }}
        >
          <Tab label="General" />
          <Tab label="Appearance" />
          <Tab label="Email" />
          <Tab label="Advanced" />
        </Tabs>
        
        <Box sx={{ p: 3 }}>
          {activeTab === 0 && (
            <Box>
              <Typography variant="h5" gutterBottom>
                General Settings
              </Typography>
              <Divider sx={{ mb: 3 }} />
              
              <Grid container spacing={3}>
                <Grid item xs={12} md={6}>
                  <TextField
                    fullWidth
                    label="Site Name"
                    name="siteName"
                    value={generalSettings.siteName}
                    onChange={handleGeneralSettingsChange}
                    margin="normal"
                  />
                  
                  <TextField
                    fullWidth
                    label="Contact Email"
                    name="contactEmail"
                    type="email"
                    value={generalSettings.contactEmail}
                    onChange={handleGeneralSettingsChange}
                    margin="normal"
                  />
                  
                  <TextField
                    fullWidth
                    label="Currency"
                    name="currency"
                    value={generalSettings.currency}
                    onChange={handleGeneralSettingsChange}
                    margin="normal"
                  />
                </Grid>
                
                <Grid item xs={12} md={6}>
                  <Paper variant="outlined" sx={{ p: 2, mt: 2 }}>
                    <Typography variant="h6" gutterBottom>
                      System Options
                    </Typography>
                    
                    <FormControl component="fieldset" fullWidth margin="normal">
                      <FormControlLabel
                        control={
                          <Switch 
                            checked={generalSettings.enableRegistration} 
                            onChange={handleGeneralSettingsChange}
                            name="enableRegistration"
                            color="primary"
                          />
                        }
                        label="Enable User Registration"
                      />
                    </FormControl>
                    
                    <FormControl component="fieldset" fullWidth margin="normal">
                      <FormControlLabel
                        control={
                          <Switch 
                            checked={generalSettings.enableCheckout} 
                            onChange={handleGeneralSettingsChange}
                            name="enableCheckout"
                            color="primary"
                          />
                        }
                        label="Enable Checkout"
                      />
                    </FormControl>
                    
                    <FormControl component="fieldset" fullWidth margin="normal">
                      <FormControlLabel
                        control={
                          <Switch 
                            checked={generalSettings.maintenanceMode} 
                            onChange={handleGeneralSettingsChange}
                            name="maintenanceMode"
                            color="error"
                          />
                        }
                        label="Maintenance Mode"
                      />
                    </FormControl>
                  </Paper>
                </Grid>
                
                <Grid item xs={12}>
                  <Box sx={{ display: 'flex', justifyContent: 'flex-end', mt: 3 }}>
                    <Button 
                      variant="contained" 
                      color="primary" 
                      startIcon={<SaveIcon />}
                      onClick={handleSaveSettings}
                    >
                      Save Settings
                    </Button>
                  </Box>
                </Grid>
              </Grid>
            </Box>
          )}
          
          {activeTab === 1 && (
            <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', py: 10 }}>
              <Typography variant="h6" color="text.secondary">
                Appearance Settings (Coming Soon)
              </Typography>
            </Box>
          )}
          
          {activeTab === 2 && (
            <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', py: 10 }}>
              <Typography variant="h6" color="text.secondary">
                Email Settings (Coming Soon)
              </Typography>
            </Box>
          )}
          
          {activeTab === 3 && (
            <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', py: 10 }}>
              <Typography variant="h6" color="text.secondary">
                Advanced Settings (Coming Soon)
              </Typography>
            </Box>
          )}
        </Box>
      </Paper>
      
      <Snackbar 
        open={!!success} 
        autoHideDuration={6000} 
        onClose={handleCloseSnackbar}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      >
        <Alert onClose={handleCloseSnackbar} severity="success" sx={{ width: '100%' }}>
          Settings saved successfully!
        </Alert>
      </Snackbar>
    </Container>
  );
};

export default SettingsPage; 