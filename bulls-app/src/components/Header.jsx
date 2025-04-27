import React, { useState, useEffect } from 'react';
import { 
  AppBar, 
  Box, 
  Toolbar, 
  Typography, 
  Button, 
  Menu, 
  MenuItem, 
  useMediaQuery,
  useTheme,
  Avatar,
  Chip
} from '@mui/material';
import { signInWithGoogle, signOut, auth } from '../firebase';

const Header = () => {
  const [anchorEl, setAnchorEl] = useState(null);
  const [user, setUser] = useState(null);
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));

  // Check auth state when component mounts
  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged(user => {
      setUser(user);
    });
    return () => unsubscribe();
  }, []);

  const handleMenu = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  const handleAuth = () => {
    if (user) {
      signOut();
    } else {
      signInWithGoogle();
    }
    handleClose();
  };

  // Get user display details
  const userDisplayName = user ? (user.displayName || user.email || 'User') : '';
  const userPhotoURL = user?.photoURL || '';

  return (
    <AppBar position="static">
      <Toolbar>
        <Typography
          variant="h6"
          component="div"
          sx={{ flexGrow: 1, fontWeight: 'bold' }}
        >
          Bulls Bikes
        </Typography>

        {isMobile ? (
          <>
            {user && (
              <Avatar 
                src={userPhotoURL} 
                alt={userDisplayName}
                sx={{ 
                  width: 30, 
                  height: 30, 
                  mr: 1,
                  border: '2px solid white' 
                }}
              />
            )}
            <Button
              color="inherit"
              onClick={handleMenu}
              aria-label="menu"
            >
              Menu
            </Button>
            <Menu
              id="menu-appbar"
              anchorEl={anchorEl}
              anchorOrigin={{
                vertical: 'top',
                horizontal: 'right',
              }}
              keepMounted
              transformOrigin={{
                vertical: 'top',
                horizontal: 'right',
              }}
              open={Boolean(anchorEl)}
              onClose={handleClose}
            >
              <MenuItem onClick={handleClose}>Sklad</MenuItem>
              <MenuItem onClick={handleAuth}>
                {user ? 'Logout' : 'Login'}
              </MenuItem>
            </Menu>
          </>
        ) : (
          <Box sx={{ display: 'flex', alignItems: 'center' }}>
            <Button color="inherit">Sklad</Button>
            {user ? (
              <>
                <Chip
                  avatar={<Avatar src={userPhotoURL} alt={userDisplayName} />}
                  label={userDisplayName}
                  variant="outlined"
                  sx={{ 
                    ml: 2, 
                    color: 'white', 
                    borderColor: 'rgba(255,255,255,0.5)',
                    '& .MuiChip-avatar': {
                      width: 28,
                      height: 28,
                      border: '1px solid white'
                    }
                  }}
                  onClick={handleMenu}
                />
                <Menu
                  anchorEl={anchorEl}
                  open={Boolean(anchorEl)}
                  onClose={handleClose}
                  anchorOrigin={{
                    vertical: 'bottom',
                    horizontal: 'right',
                  }}
                  transformOrigin={{
                    vertical: 'top',
                    horizontal: 'right',
                  }}
                >
                  <MenuItem onClick={handleAuth}>Logout</MenuItem>
                </Menu>
              </>
            ) : (
              <Button color="inherit" onClick={handleAuth}>
                Login
              </Button>
            )}
          </Box>
        )}
      </Toolbar>
    </AppBar>
  );
};

export default Header; 