import React, { useState, useEffect } from 'react';
import { Button, Typography, Box, Paper, CircularProgress } from '@mui/material';
import { collection, addDoc, getDoc, doc, getDocs, query, limit, getFirestore, FirestoreError } from 'firebase/firestore';
import { onAuthStateChanged } from 'firebase/auth';
import { db, auth } from '../firebase';

const FirebaseTest: React.FC = () => {
  const [isConnected, setIsConnected] = useState<boolean | null>(null);
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
  const [userId, setUserId] = useState<string | null>(null);
  const [testResult, setTestResult] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [sdkVersion, setSdkVersion] = useState<string | null>(null);
  const [debugInfo, setDebugInfo] = useState<string>('');

  // Add debug logging function
  const addDebugLog = (message: string) => {
    console.log(`[FirebaseTest] ${message}`);
    setDebugInfo(prev => `${prev}\n${new Date().toLocaleTimeString()}: ${message}`);
  };

  // Check Firebase connection
  useEffect(() => {
    const checkConnection = async () => {
      addDebugLog('Checking Firestore connection...');
      
      try {
        // Get Firestore SDK version
        addDebugLog('Getting Firestore SDK info');
        // @ts-ignore - getFirestore is a function
        const version = getFirestore.SDK_VERSION || 'Unknown';
        setSdkVersion(version);
        addDebugLog(`Firestore SDK version: ${version}`);
        
        // Try to execute a simple query
        const testCollectionRef = collection(db, '_connection_test');
        addDebugLog('Executing simple query on _connection_test collection');
        const q = query(testCollectionRef, limit(1));
        await getDocs(q);
        
        setIsConnected(true);
        addDebugLog('Connection successful!');
      } catch (err) {
        setIsConnected(false);
        const errMsg = err instanceof Error ? err.message : String(err);
        setError(`Connection error: ${errMsg}`);
        addDebugLog(`Connection failed: ${errMsg}`);
        
        // Additional debugging for Firestore errors
        if (err instanceof FirestoreError) {
          addDebugLog(`Firestore error code: ${err.code}`);
          addDebugLog(`Firestore error details: ${JSON.stringify(err)}`);
        }
      }
    };

    checkConnection();
  }, []);

  // Check authentication state
  useEffect(() => {
    addDebugLog('Setting up authentication listener');
    
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (user) {
        setIsAuthenticated(true);
        setUserId(user.uid);
        addDebugLog(`User authenticated! UID: ${user.uid}`);
        addDebugLog(`Auth provider: ${user.providerId || 'anonymous'}`);
        addDebugLog(`Is anonymous: ${user.isAnonymous ? 'Yes' : 'No'}`);
      } else {
        setIsAuthenticated(false);
        setUserId(null);
        addDebugLog('User is NOT authenticated');
        
        // Try to sign in anonymously again
        addDebugLog('Attempting to sign in anonymously...');
        import('firebase/auth').then(({ signInAnonymously }) => {
          signInAnonymously(auth)
            .then((result) => {
              addDebugLog(`Anonymous sign-in successful: ${result.user.uid}`);
            })
            .catch((err) => {
              const errMsg = err instanceof Error ? `${err.message} (${(err as any).code || 'unknown'})` : String(err);
              addDebugLog(`Anonymous sign-in failed: ${errMsg}`);
              setError(`Auth error: ${errMsg}`);
            });
        });
      }
    }, (err) => {
      const errMsg = err instanceof Error ? err.message : String(err);
      addDebugLog(`Auth state change error: ${errMsg}`);
      setError(`Auth error: ${errMsg}`);
      
      // Try to get more details about the error
      if (err && typeof err === 'object') {
        const code = (err as any).code;
        if (code) addDebugLog(`Error code: ${code}`);
        
        const serverResponse = (err as any).serverResponse;
        if (serverResponse) addDebugLog(`Server response: ${JSON.stringify(serverResponse)}`);
      }
    });

    return () => unsubscribe();
  }, []);

  // Test write to Firestore
  const testFirestoreWrite = async () => {
    setIsLoading(true);
    setTestResult(null);
    setError(null);
    
    try {
      addDebugLog('Testing Firestore write...');
      addDebugLog(`Current auth state: ${isAuthenticated ? 'Authenticated' : 'Not authenticated'}`);
      addDebugLog(`Current user: ${auth.currentUser?.uid || 'None'}`);
      
      if (!auth.currentUser) {
        throw new Error('Not authenticated. User must be authenticated to write to Firestore.');
      }
      
      const testCollectionRef = collection(db, '_test_data');
      const data = { 
        test: true, 
        timestamp: new Date().toISOString(),
        userId: auth.currentUser.uid
      };
      
      addDebugLog(`Writing test data: ${JSON.stringify(data)}`);
      const docRef = await addDoc(testCollectionRef, data);
      
      setTestResult(`Document written with ID: ${docRef.id}`);
      addDebugLog(`Document written with ID: ${docRef.id}`);
      
      return docRef;
    } catch (err) {
      const errMsg = err instanceof Error ? err.message : String(err);
      setError(`Write error: ${errMsg}`);
      addDebugLog(`Write error: ${errMsg}`);
      
      // Additional debugging for Firestore errors
      if (err instanceof FirestoreError) {
        addDebugLog(`Firestore error code: ${err.code}`);
        addDebugLog(`Firestore error details: ${JSON.stringify(err)}`);
      }
      
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  // Test read from Firestore
  const testFirestoreRead = async () => {
    setIsLoading(true);
    setTestResult(null);
    setError(null);
    
    try {
      addDebugLog('Testing Firestore read...');
      
      // First write a document
      const docRef = await testFirestoreWrite();
      
      // Then read it back
      addDebugLog(`Reading document with ID: ${docRef.id}`);
      const docSnap = await getDoc(doc(db, '_test_data', docRef.id));
      
      if (docSnap.exists()) {
        const data = docSnap.data();
        setTestResult(`Read successful: ${JSON.stringify(data)}`);
        addDebugLog(`Read successful: ${JSON.stringify(data)}`);
      } else {
        setError('Document does not exist');
        addDebugLog('Document does not exist');
      }
    } catch (err) {
      const errMsg = err instanceof Error ? err.message : String(err);
      setError(`Read error: ${errMsg}`);
      addDebugLog(`Read error: ${errMsg}`);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Paper sx={{ p: 2, mb: 3 }}>
      <Typography variant="h6" gutterBottom>
        Firebase Connection Test
      </Typography>
      
      <Box sx={{ mb: 2 }}>
        <Typography variant="body1">
          Connection Status: {
            isConnected === null ? 'Checking...' :
            isConnected ? 'Connected' : 'Not Connected'
          }
          {isConnected === null && <CircularProgress size={16} sx={{ ml: 1 }} />}
        </Typography>
        
        <Typography variant="body1">
          Authentication Status: {isAuthenticated ? `Authenticated (${userId})` : 'Not Authenticated'}
        </Typography>
        
        <Typography variant="body1">
          Firestore SDK Version: {sdkVersion || 'Unknown'}
        </Typography>
      </Box>
      
      <Box sx={{ display: 'flex', gap: 2, mb: 2 }}>
        <Button 
          variant="contained" 
          onClick={testFirestoreWrite} 
          disabled={isLoading || !isAuthenticated}
        >
          Test Write
        </Button>
        
        <Button 
          variant="outlined" 
          onClick={testFirestoreRead}
          disabled={isLoading || !isAuthenticated}
        >
          Test Read
        </Button>
      </Box>
      
      {isLoading && (
        <Box display="flex" alignItems="center" sx={{ mt: 2 }}>
          <CircularProgress size={24} sx={{ mr: 1 }} />
          <Typography>Testing...</Typography>
        </Box>
      )}
      
      {testResult && (
        <Typography color="success.main" sx={{ mt: 1 }}>
          {testResult}
        </Typography>
      )}
      
      {error && (
        <Typography color="error" sx={{ mt: 1 }}>
          {error}
        </Typography>
      )}
      
      <Box sx={{ mt: 2, p: 1, bgcolor: '#f5f5f5', borderRadius: 1, maxHeight: '200px', overflow: 'auto' }}>
        <Typography variant="caption" component="pre" sx={{ whiteSpace: 'pre-wrap', fontFamily: 'monospace' }}>
          {debugInfo || 'No debug info available'}
        </Typography>
      </Box>
    </Paper>
  );
};

export default FirebaseTest; 