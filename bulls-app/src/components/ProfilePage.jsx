import React, { useState, useEffect, useContext } from 'react';
import { UserContext } from './Header';
import { 
  Container, 
  Typography, 
  Box, 
  TextField, 
  Button, 
  Paper, 
  Avatar, 
  Divider,
  Grid,
  Snackbar,
  Alert
} from '@mui/material';
import AccountCircleIcon from '@mui/icons-material/AccountCircle';

const ProfilePage = () => {
  const { user } = useContext(UserContext);
  const [profile, setProfile] = useState({
    name: '',
    email: '',
    phone: '',
    address: '',
    city: '',
    state: '',
    zip: ''
  });
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    // Load user profile from user object if available
    if (user) {
      setProfile({
        name: user.displayName || '',
        email: user.email || '',
        phone: '',
        address: '',
        city: '',
        state: '',
        zip: ''
      });
    }
  }, [user]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setProfile({
      ...profile,
      [name]: value
    });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    // In a real application, you would save this to a database
    console.log('Profile updated:', profile);
    setSuccess(true);
  };

  const handleCloseSnackbar = () => {
    setSuccess(false);
  };

  if (!user) {
    return (
      <Container maxWidth="md" sx={{ py: 8 }}>
        <Paper sx={{ p: 4, mt: 4 }}>
          <Typography variant="h4" align="center" gutterBottom>
            Please log in to view your profile
          </Typography>
        </Paper>
      </Container>
    );
  }

  return (
    <Container maxWidth="md" sx={{ py: 8 }}>
      <Paper elevation={3} sx={{ p: 4 }}>
        <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', mb: 4 }}>
          <Avatar sx={{ width: 80, height: 80, mb: 2, bgcolor: 'primary.main' }}>
            {user?.photoURL ? (
              <img src={user.photoURL} alt="Profile" style={{ width: '100%', height: '100%' }} />
            ) : (
              <AccountCircleIcon sx={{ fontSize: 60 }} />
            )}
          </Avatar>
          <Typography variant="h4" gutterBottom>
            Your Profile
          </Typography>
          <Typography variant="body1" color="text.secondary">
            Manage your account information
          </Typography>
        </Box>
        
        <Divider sx={{ mb: 4 }} />
        
        <form onSubmit={handleSubmit}>
          <Grid container spacing={3}>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Full Name"
                name="name"
                value={profile.name}
                onChange={handleChange}
                variant="outlined"
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Email"
                name="email"
                value={profile.email}
                onChange={handleChange}
                variant="outlined"
                disabled
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Phone Number"
                name="phone"
                value={profile.phone}
                onChange={handleChange}
                variant="outlined"
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Address"
                name="address"
                value={profile.address}
                onChange={handleChange}
                variant="outlined"
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="City"
                name="city"
                value={profile.city}
                onChange={handleChange}
                variant="outlined"
              />
            </Grid>
            <Grid item xs={12} sm={3}>
              <TextField
                fullWidth
                label="State"
                name="state"
                value={profile.state}
                onChange={handleChange}
                variant="outlined"
              />
            </Grid>
            <Grid item xs={12} sm={3}>
              <TextField
                fullWidth
                label="ZIP Code"
                name="zip"
                value={profile.zip}
                onChange={handleChange}
                variant="outlined"
              />
            </Grid>
            <Grid item xs={12}>
              <Box sx={{ display: 'flex', justifyContent: 'flex-end', mt: 2 }}>
                <Button 
                  type="submit" 
                  variant="contained" 
                  color="primary" 
                  size="large"
                >
                  Save Changes
                </Button>
              </Box>
            </Grid>
          </Grid>
        </form>
      </Paper>

      <Snackbar 
        open={success} 
        autoHideDuration={6000} 
        onClose={handleCloseSnackbar}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      >
        <Alert onClose={handleCloseSnackbar} severity="success" sx={{ width: '100%' }}>
          Profile updated successfully!
        </Alert>
      </Snackbar>
    </Container>
  );
};

export default ProfilePage; 