import React, { useState, useEffect } from 'react';
import { 
  Container, 
  Typography, 
  Box, 
  Paper, 
  Table, 
  TableBody, 
  TableCell, 
  TableContainer, 
  TableHead, 
  TableRow,
  TablePagination,
  Avatar,
  Chip,
  CircularProgress,
  Alert,
  Button
} from '@mui/material';
import { collection, getDocs, doc, setDoc, onSnapshot } from 'firebase/firestore';
import { db } from '../../firebase';
import { formatDistanceToNow } from 'date-fns';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../Header';

const UsersPage = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const navigate = useNavigate();
  const { user: currentUser } = useAuth();

  useEffect(() => {
    // Check authentication first
    if (!currentUser) {
      const timer = setTimeout(() => {
        navigate('/login');
      }, 1000);
      return () => clearTimeout(timer);
    }

    const fetchUsers = async () => {
      try {
        setLoading(true);
        setError(null);
        
        // Use onSnapshot for real-time updates instead of getDocs
        const unsubscribe = onSnapshot(
          collection(db, 'users'),
          (snapshot) => {
            if (snapshot.empty) {
              // We have no users in the database yet
              setUsers([]);
            } else {
              // Get authenticated users from Firestore
              const fetchedUsers = snapshot.docs.map(doc => {
                const data = doc.data();
                return {
                  id: doc.id,
                  ...data,
                  lastLogin: data.lastLogin?.toDate ? data.lastLogin.toDate() : null
                };
              });
              
              setUsers(fetchedUsers);
            }
            setLoading(false);
          },
          (err) => {
            console.error('Error fetching users:', err);
            setError('Failed to load users: ' + err.message);
            setLoading(false);
          }
        );
        
        // Return cleanup function
        return () => unsubscribe();
      } catch (error) {
        console.error('Error setting up users listener:', error);
        setError('Failed to set up user tracking: ' + error.message);
        setLoading(false);
        return () => {}; // Return empty function as fallback
      }
    };

    // Add this login to Firestore
    const recordLogin = async () => {
      if (currentUser) {
        try {
          const userRef = doc(db, 'users', currentUser.uid);
          
          await setDoc(userRef, {
            id: currentUser.uid,
            name: currentUser.displayName,
            email: currentUser.email,
            photoURL: currentUser.photoURL,
            lastLogin: new Date(),
            loginCount: 1, // This would be incremented in a real app
            role: currentUser.email === 'admin@example.com' ? 'admin' : 'user'
          }, { merge: true });
          
        } catch (error) {
          console.error('Error updating user login info:', error);
          setError('Could not record your login: ' + error.message);
        }
      }
    };
    
    // First record the login, then fetch users
    recordLogin().then(fetchUsers);
  }, [currentUser, navigate]);

  const handleChangePage = (event, newPage) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  const handleRetry = () => {
    setError(null);
    setLoading(true);
    // The useEffect will re-run the fetchUsers logic
  };

  // Show loading or error states
  if (loading) {
    return (
      <Container sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '50vh' }}>
        <CircularProgress />
      </Container>
    );
  }

  if (!currentUser) {
    return (
      <Container maxWidth="lg" sx={{ py: 4 }}>
        <Typography variant="h5">Redirecting to login...</Typography>
      </Container>
    );
  }

  if (error) {
    return (
      <Container maxWidth="lg" sx={{ py: 4 }}>
        <Alert 
          severity="error"
          action={
            <Button color="inherit" size="small" onClick={handleRetry}>
              Retry
            </Button>
          }
        >
          {error}
        </Alert>
      </Container>
    );
  }

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      <Typography variant="h4" component="h1" gutterBottom>
        User Management
      </Typography>
      <Typography variant="body1" color="text.secondary" paragraph>
        View users who have signed in with Google Authentication.
      </Typography>

      <Paper elevation={3} sx={{ mt: 4 }}>
        <TableContainer>
          <Table sx={{ minWidth: 650 }} aria-label="users table">
            <TableHead>
              <TableRow>
                <TableCell>User</TableCell>
                <TableCell>Email</TableCell>
                <TableCell>Role</TableCell>
                <TableCell>Last Login</TableCell>
                <TableCell>Login Count</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {users.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={5} align="center">
                    <Typography variant="body1" sx={{ py: 5 }}>
                      No users have signed in yet.
                    </Typography>
                  </TableCell>
                </TableRow>
              ) : (
                users
                  .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
                  .map((user) => (
                    <TableRow key={user.id}>
                      <TableCell>
                        <Box sx={{ display: 'flex', alignItems: 'center' }}>
                          <Avatar 
                            src={user.photoURL} 
                            alt={user.name || user.email}
                            sx={{ mr: 2 }}
                          >
                            {(user.name || user.email || '').charAt(0).toUpperCase()}
                          </Avatar>
                          <Typography variant="body1">
                            {user.name || 'Unnamed User'}
                          </Typography>
                        </Box>
                      </TableCell>
                      <TableCell>{user.email}</TableCell>
                      <TableCell>
                        {user.role === 'admin' ? (
                          <Chip 
                            label="Admin" 
                            color="secondary" 
                            size="small" 
                          />
                        ) : (
                          <Chip 
                            label="User" 
                            color="primary" 
                            variant="outlined"
                            size="small" 
                          />
                        )}
                      </TableCell>
                      <TableCell>
                        {user.lastLogin ? formatDistanceToNow(user.lastLogin, { addSuffix: true }) : 'Never'}
                      </TableCell>
                      <TableCell>{user.loginCount || 0}</TableCell>
                    </TableRow>
                  ))
              )}
            </TableBody>
          </Table>
        </TableContainer>
        <TablePagination
          rowsPerPageOptions={[5, 10, 25]}
          component="div"
          count={users.length}
          rowsPerPage={rowsPerPage}
          page={page}
          onPageChange={handleChangePage}
          onRowsPerPageChange={handleChangeRowsPerPage}
        />
      </Paper>
    </Container>
  );
};

export default UsersPage; 