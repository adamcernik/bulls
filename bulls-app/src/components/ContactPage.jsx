import React, { useState } from 'react';
import { 
  Container, 
  Typography, 
  Box, 
  TextField, 
  Button, 
  Paper, 
  Grid,
  Divider,
  Snackbar,
  Alert,
  Card,
  CardContent,
  IconButton
} from '@mui/material';
import EmailIcon from '@mui/icons-material/Email';
import PhoneIcon from '@mui/icons-material/Phone';
import LocationOnIcon from '@mui/icons-material/LocationOn';
import FacebookIcon from '@mui/icons-material/Facebook';
import InstagramIcon from '@mui/icons-material/Instagram';
import TwitterIcon from '@mui/icons-material/Twitter';

const ContactPage = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    subject: '',
    message: ''
  });
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value
    });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    
    // Validate form
    if (!formData.name || !formData.email || !formData.message) {
      setError(true);
      return;
    }

    // In a real application, you would send this to your server/API
    console.log('Form submitted:', formData);
    
    // Reset form and show success message
    setFormData({
      name: '',
      email: '',
      subject: '',
      message: ''
    });
    setSuccess(true);
  };

  const handleCloseSnackbar = () => {
    setSuccess(false);
    setError(false);
  };

  return (
    <Container maxWidth="lg" sx={{ py: 8 }}>
      <Typography variant="h3" component="h1" align="center" gutterBottom>
        Contact Us
      </Typography>
      <Typography variant="body1" align="center" color="text.secondary" paragraph sx={{ mb: 6 }}>
        We're here to help! Send us a message and we'll get back to you as soon as possible.
      </Typography>
      
      <Grid container spacing={4}>
        {/* Contact Information */}
        <Grid item xs={12} md={5}>
          <Card sx={{ height: '100%', bgcolor: 'primary.main', color: 'white' }}>
            <CardContent sx={{ p: 4 }}>
              <Typography variant="h5" gutterBottom sx={{ mb: 4 }}>
                Contact Information
              </Typography>
              
              <Box sx={{ mb: 3, display: 'flex', alignItems: 'center' }}>
                <LocationOnIcon sx={{ mr: 2 }} />
                <Typography variant="body1">
                  123 E-Bike Street, Prague, Czech Republic
                </Typography>
              </Box>
              
              <Box sx={{ mb: 3, display: 'flex', alignItems: 'center' }}>
                <PhoneIcon sx={{ mr: 2 }} />
                <Typography variant="body1">
                  +420 123 456 789
                </Typography>
              </Box>
              
              <Box sx={{ mb: 5, display: 'flex', alignItems: 'center' }}>
                <EmailIcon sx={{ mr: 2 }} />
                <Typography variant="body1">
                  info@bulls-ebikes.com
                </Typography>
              </Box>
              
              <Divider sx={{ bgcolor: 'rgba(255,255,255,0.2)', my: 3 }} />
              
              <Typography variant="h6" gutterBottom>
                Follow Us
              </Typography>
              
              <Box sx={{ mt: 2 }}>
                <IconButton color="inherit" aria-label="Facebook">
                  <FacebookIcon />
                </IconButton>
                <IconButton color="inherit" aria-label="Instagram">
                  <InstagramIcon />
                </IconButton>
                <IconButton color="inherit" aria-label="Twitter">
                  <TwitterIcon />
                </IconButton>
              </Box>
            </CardContent>
          </Card>
        </Grid>
        
        {/* Contact Form */}
        <Grid item xs={12} md={7}>
          <Paper elevation={3} sx={{ p: 4 }}>
            <Typography variant="h5" gutterBottom>
              Send Us a Message
            </Typography>
            
            <form onSubmit={handleSubmit}>
              <Grid container spacing={3}>
                <Grid item xs={12} sm={6}>
                  <TextField
                    required
                    fullWidth
                    label="Your Name"
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    variant="outlined"
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <TextField
                    required
                    fullWidth
                    label="Email Address"
                    name="email"
                    type="email"
                    value={formData.email}
                    onChange={handleChange}
                    variant="outlined"
                  />
                </Grid>
                <Grid item xs={12}>
                  <TextField
                    fullWidth
                    label="Subject"
                    name="subject"
                    value={formData.subject}
                    onChange={handleChange}
                    variant="outlined"
                  />
                </Grid>
                <Grid item xs={12}>
                  <TextField
                    required
                    fullWidth
                    label="Your Message"
                    name="message"
                    value={formData.message}
                    onChange={handleChange}
                    variant="outlined"
                    multiline
                    rows={6}
                  />
                </Grid>
                <Grid item xs={12}>
                  <Box sx={{ display: 'flex', justifyContent: 'flex-end' }}>
                    <Button 
                      type="submit" 
                      variant="contained" 
                      color="primary" 
                      size="large"
                    >
                      Send Message
                    </Button>
                  </Box>
                </Grid>
              </Grid>
            </form>
          </Paper>
        </Grid>
      </Grid>
      
      {/* Map or image could be added here */}
      <Paper sx={{ mt: 6, p: 2, height: '300px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <Typography variant="body1" color="text.secondary">
          Google Maps or location image would be displayed here
        </Typography>
      </Paper>

      <Snackbar 
        open={success} 
        autoHideDuration={6000} 
        onClose={handleCloseSnackbar}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      >
        <Alert onClose={handleCloseSnackbar} severity="success" sx={{ width: '100%' }}>
          Thank you for your message! We'll get back to you soon.
        </Alert>
      </Snackbar>

      <Snackbar 
        open={error} 
        autoHideDuration={6000} 
        onClose={handleCloseSnackbar}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      >
        <Alert onClose={handleCloseSnackbar} severity="error" sx={{ width: '100%' }}>
          Please fill in all required fields.
        </Alert>
      </Snackbar>
    </Container>
  );
};

export default ContactPage; 