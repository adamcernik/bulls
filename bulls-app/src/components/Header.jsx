import React, { useState, useEffect, createContext, useContext } from 'react';
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
  Tooltip,
  Container,
  Avatar,
  IconButton,
  Divider,
  ListItemIcon,
  Chip
} from '@mui/material';
import { Link as RouterLink, useLocation } from 'react-router-dom';
import { signInWithGoogle, signOut, auth, subscribeToAuthChanges } from '../services/auth';
import AccountCircleIcon from '@mui/icons-material/AccountCircle';
import LogoutIcon from '@mui/icons-material/Logout';
import PersonIcon from '@mui/icons-material/Person';
import PeopleIcon from '@mui/icons-material/People';
import ShoppingCartIcon from '@mui/icons-material/ShoppingCart';
import ShoppingBasketIcon from '@mui/icons-material/ShoppingBasket';
import SettingsIcon from '@mui/icons-material/Settings';
import AdminPanelSettingsIcon from '@mui/icons-material/AdminPanelSettings';
import Cart from './Cart';

// Create a version string with current date and time
const versionDate = new Date().toLocaleString('en-GB', {
  day: '2-digit',
  month: '2-digit',
  year: 'numeric',
  hour: '2-digit',
  minute: '2-digit'
});
const VERSION = `v1.2.0 (${versionDate})`;

export const UserContext = createContext(null);

// Custom hook to use the auth context
export const useAuth = () => {
  const user = useContext(UserContext);
  return { user };
};

const Header = ({ dbOk }) => {
  const [anchorEl, setAnchorEl] = useState(null);
  const [profileMenuAnchorEl, setProfileMenuAnchorEl] = useState(null);
  const [user, setUser] = useState(null);
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const location = useLocation();
  
  // Check if we're on the admin page
  const isAdminPage = location.pathname.startsWith('/admin');

  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged(setUser);
    return () => unsubscribe();
  }, []);

  const handleMenu = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  const handleProfileMenuOpen = (event) => {
    setProfileMenuAnchorEl(event.currentTarget);
  };

  const handleProfileMenuClose = () => {
    setProfileMenuAnchorEl(null);
  };

  const handleAuth = async () => {
    if (user) {
      try {
        const success = await signOut();
        if (success) {
          console.log("Successfully signed out");
        }
      } catch (error) {
        console.error("Error signing out:", error);
      }
    } else {
      try {
        const result = await signInWithGoogle();
        if (result) {
          console.log("Successfully signed in", result.displayName);
        }
      } catch (error) {
        console.error("Error signing in:", error);
      }
    }
    handleClose();
    handleProfileMenuClose();
  };

  // Define navigation items based on whether we're on admin page or not
  const standardNavItems = [
    { name: 'Products', path: '/' },
    { name: 'Order', path: '/order', icon: <ShoppingBasketIcon fontSize="small" sx={{ mr: 1 }} /> },
    { name: 'Contact', path: '/contact' },
  ];

  const adminNavItems = [
    { name: 'Products', path: '/admin', icon: <ShoppingCartIcon fontSize="small" sx={{ mr: 1 }} /> },
    { name: 'Users', path: '/admin/users', icon: <PeopleIcon fontSize="small" sx={{ mr: 1 }} /> },
    { name: 'Orders', path: '/admin/orders', icon: <ShoppingCartIcon fontSize="small" sx={{ mr: 1 }} /> },
    { name: 'Settings', path: '/admin/settings', icon: <SettingsIcon fontSize="small" sx={{ mr: 1 }} /> },
  ];

  const navItems = isAdminPage ? adminNavItems : standardNavItems;

  return (
    <AppBar position="static" color={isAdminPage ? "secondary" : "primary"}>
      <Container maxWidth="xl">
        <Toolbar disableGutters>
          <Typography
            variant="h6"
            component={RouterLink}
            to="/"
            sx={{ 
              fontWeight: 'bold', 
              mr: 1, 
              textDecoration: 'none',
              color: 'inherit'
            }}
          >
            Bulls Bikes
          </Typography>
          
          {isAdminPage && (
            <Chip 
              icon={<AdminPanelSettingsIcon />} 
              label="ADMIN" 
              color="default" 
              size="small"
              sx={{ 
                ml: 1, 
                fontWeight: 'bold',
                bgcolor: 'rgba(255,255,255,0.15)',
              }} 
            />
          )}
          
          <Tooltip title={`Last updated: ${versionDate}`}>
            <Typography 
              variant="caption" 
              sx={{ 
                opacity: 0.7, 
                bgcolor: 'rgba(255,255,255,0.15)', 
                px: 1, 
                borderRadius: 1,
                display: { xs: 'none', sm: 'block' },
                ml: 1
              }}
            >
              {VERSION}
            </Typography>
          </Tooltip>
          
          <Box sx={{ ml: 2, display: 'flex', alignItems: 'center' }}>
            <Box sx={{ width: 12, height: 12, borderRadius: '50%', bgcolor: dbOk ? 'green' : 'grey.400', mr: 1 }} />
            <Typography variant="caption" sx={{ color: dbOk ? 'green' : 'grey.600' }}>{dbOk ? 'DB OK' : 'DB...'}</Typography>
          </Box>
          
          <Box sx={{ flexGrow: 1 }} />
          
          {!isAdminPage && <Cart />}
          
          {isMobile ? (
            <>
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
                {navItems.map((item) => (
                  <MenuItem 
                    key={item.name}
                    component={RouterLink} 
                    to={item.path} 
                    onClick={handleClose}
                  >
                    {item.icon && item.icon}
                    {item.name}
                  </MenuItem>
                ))}
                
                {!isAdminPage && user && (
                  <MenuItem 
                    component={RouterLink} 
                    to="/admin" 
                    onClick={handleClose}
                  >
                    <ListItemIcon>
                      <AdminPanelSettingsIcon fontSize="small" />
                    </ListItemIcon>
                    Admin Panel
                  </MenuItem>
                )}
                
                {isAdminPage && (
                  <MenuItem 
                    component={RouterLink} 
                    to="/" 
                    onClick={handleClose}
                  >
                    Exit Admin
                  </MenuItem>
                )}
                
                {!user ? (
                  <MenuItem onClick={handleAuth}>Sign In</MenuItem>
                ) : (
                  <>
                    <Divider />
                    <MenuItem 
                      component={RouterLink} 
                      to="/profile" 
                      onClick={handleClose}
                    >
                      <ListItemIcon>
                        <PersonIcon fontSize="small" />
                      </ListItemIcon>
                      Profile
                    </MenuItem>
                    <MenuItem onClick={handleAuth}>
                      <ListItemIcon>
                        <LogoutIcon fontSize="small" />
                      </ListItemIcon>
                      Logout
                    </MenuItem>
                  </>
                )}
              </Menu>
            </>
          ) : (
            <Box sx={{ display: 'flex', alignItems: 'center' }}>
              {navItems.map((item) => (
                <Button 
                  key={item.name}
                  color="inherit" 
                  component={RouterLink} 
                  to={item.path}
                  startIcon={item.icon}
                >
                  {item.name}
                </Button>
              ))}
              
              {!isAdminPage && user && (
                <Button 
                  color="inherit" 
                  component={RouterLink} 
                  to="/admin"
                  startIcon={<AdminPanelSettingsIcon />}
                  sx={{ ml: 1 }}
                >
                  Admin
                </Button>
              )}
              
              {isAdminPage && (
                <Button 
                  color="inherit" 
                  component={RouterLink} 
                  to="/"
                  sx={{ ml: 1 }}
                >
                  Exit Admin
                </Button>
              )}
              
              {user ? (
                <>
                  <Box sx={{ ml: 2, display: 'flex', alignItems: 'center' }}>
                    <Typography 
                      variant="body2" 
                      sx={{ 
                        mr: 1, 
                        color: 'white',
                        display: { xs: 'none', md: 'block' } 
                      }}
                    >
                      {user.displayName || user.email}
                    </Typography>
                    <IconButton 
                      onClick={handleProfileMenuOpen}
                      size="small"
                      sx={{ ml: 1 }}
                      aria-controls="profile-menu"
                      aria-haspopup="true"
                    >
                      {user.photoURL ? (
                        <Avatar 
                          src={user.photoURL} 
                          alt={user.displayName || 'User'} 
                          sx={{ width: 32, height: 32 }} 
                        />
                      ) : (
                        <Avatar sx={{ width: 32, height: 32, bgcolor: 'secondary.main' }}>
                          {user.displayName ? user.displayName.charAt(0).toUpperCase() : <AccountCircleIcon />}
                        </Avatar>
                      )}
                    </IconButton>
                  </Box>
                  
                  <Menu
                    id="profile-menu"
                    anchorEl={profileMenuAnchorEl}
                    open={Boolean(profileMenuAnchorEl)}
                    onClose={handleProfileMenuClose}
                    anchorOrigin={{
                      vertical: 'bottom',
                      horizontal: 'right',
                    }}
                    transformOrigin={{
                      vertical: 'top',
                      horizontal: 'right',
                    }}
                    PaperProps={{
                      elevation: 0,
                      sx: {
                        overflow: 'visible',
                        filter: 'drop-shadow(0px 2px 8px rgba(0,0,0,0.32))',
                        mt: 1.5,
                        '& .MuiAvatar-root': {
                          width: 32,
                          height: 32,
                          ml: -0.5,
                          mr: 1,
                        },
                        '&:before': {
                          content: '""',
                          display: 'block',
                          position: 'absolute',
                          top: 0,
                          right: 14,
                          width: 10,
                          height: 10,
                          bgcolor: 'background.paper',
                          transform: 'translateY(-50%) rotate(45deg)',
                          zIndex: 0,
                        },
                      },
                    }}
                  >
                    <MenuItem 
                      component={RouterLink}
                      to="/profile"
                      onClick={handleProfileMenuClose}
                    >
                      <ListItemIcon>
                        <PersonIcon fontSize="small" />
                      </ListItemIcon>
                      Profile
                    </MenuItem>
                    <MenuItem onClick={handleAuth}>
                      <ListItemIcon>
                        <LogoutIcon fontSize="small" />
                      </ListItemIcon>
                      Logout
                    </MenuItem>
                  </Menu>
                </>
              ) : (
                <Button color="inherit" onClick={handleAuth}>
                  Sign In
                </Button>
              )}
            </Box>
          )}
        </Toolbar>
      </Container>
    </AppBar>
  );
};

export const UserProvider = ({ children, initialUser = null }) => {
  const [user, setUser] = useState(initialUser);

  useEffect(() => {
    // Listen for auth changes using our new service
    const unsubscribe = subscribeToAuthChanges((currentUser) => {
      setUser(currentUser);
    });

    // Cleanup subscription
    return () => unsubscribe();
  }, []);

  // Update user if initialUser changes (from parent component)
  useEffect(() => {
    if (initialUser !== null) {
      setUser(initialUser);
    }
  }, [initialUser]);

  return (
    <UserContext.Provider value={user}>
      {children}
    </UserContext.Provider>
  );
};

export default Header; 