// Script to import products from JSON to Firebase
const fs = require('fs');
const path = require('path');
const { initializeApp } = require('firebase/app');
const { getFirestore, collection, addDoc, getDocs, query, where, writeBatch, doc } = require('firebase/firestore');
const { getAuth, signInAnonymously } = require('firebase/auth');

// Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyD-yyeIPQh8kSHl3gUroAaPhLneuQ5i9fE",
  authDomain: "bulls-6db5a.firebaseapp.com",
  projectId: "bulls-6db5a",
  storageBucket: "bulls-6db5a.firebasestorage.app",
  messagingSenderId: "388356240353",
  appId: "1:388356240353:web:6b21cf05f4fcfd85a7d8a0",
  measurementId: "G-T4TKKZK9Y0"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);
const auth = getAuth(app);

// Function to read products from JSON file
const readProductsFromJSON = () => {
  try {
    const filePath = path.join(__dirname, '../../public/products.json');
    console.log(`Reading products from: ${filePath}`);
    const jsonData = fs.readFileSync(filePath, 'utf8');
    return JSON.parse(jsonData);
  } catch (error) {
    console.error('Error reading products JSON:', error);
    throw error;
  }
};

// Function to sign in anonymously
const signInAnonymouslyToFirebase = async () => {
  try {
    console.log('Signing in anonymously to Firebase...');
    const userCredential = await signInAnonymously(auth);
    console.log(`Signed in with user ID: ${userCredential.user.uid}`);
    return userCredential.user;
  } catch (error) {
    console.error('Error signing in anonymously:', error);
    throw error;
  }
};

// Function to check if a product already exists in Firestore
const productExists = async (model, code) => {
  try {
    // First check by model
    let q = query(collection(db, 'products'), where('model', '==', model));
    let snapshot = await getDocs(q);
    
    if (!snapshot.empty) {
      return true;
    }
    
    // Then check by code if provided
    if (code) {
      q = query(collection(db, 'products'), where('code', '==', code));
      snapshot = await getDocs(q);
      return !snapshot.empty;
    }
    
    return false;
  } catch (error) {
    console.error('Error checking if product exists:', error);
    return false;
  }
};

// Function to import products to Firestore using batched writes
const importProductsToFirebase = async (products) => {
  try {
    console.log(`Preparing to import ${products.length} products to Firebase`);
    
    // First, sign in anonymously
    const user = await signInAnonymouslyToFirebase();
    
    // Prepare batches (Firestore has a limit of 500 operations per batch)
    const batchSize = 400;
    let operationsCount = 0;
    let successCount = 0;
    let skipCount = 0;
    let errorCount = 0;
    
    // Process products in batches
    for (let i = 0; i < products.length; i += batchSize) {
      const batch = writeBatch(db);
      const currentBatch = products.slice(i, i + batchSize);
      
      // Process each product in the current batch
      for (const product of currentBatch) {
        try {
          // Check if product already exists
          const exists = await productExists(product.model, product.code);
          
          if (exists) {
            console.log(`Skipping existing product: ${product.model}`);
            skipCount++;
            continue;
          }
          
          // Add metadata
          const productWithMetadata = {
            ...product,
            createdAt: new Date().toISOString(),
            createdBy: user.uid
          };
          
          // Remove the id field as Firestore will generate one
          if (productWithMetadata.id && productWithMetadata.id.startsWith('product-')) {
            delete productWithMetadata.id;
          }
          
          // Add the product to Firestore directly (not using batch for simplicity)
          const docRef = await addDoc(collection(db, 'products'), productWithMetadata);
          console.log(`Added product: ${product.model} with ID: ${docRef.id}`);
          successCount++;
          
        } catch (error) {
          console.error(`Error adding product ${product.model}:`, error);
          errorCount++;
        }
      }
    }
    
    console.log('Import completed');
    console.log(`Total products: ${products.length}`);
    console.log(`Successfully imported: ${successCount}`);
    console.log(`Skipped (already exists): ${skipCount}`);
    console.log(`Failed: ${errorCount}`);
    
    return {
      total: products.length,
      success: successCount,
      skipped: skipCount,
      failed: errorCount
    };
    
  } catch (error) {
    console.error('Error importing products to Firebase:', error);
    throw error;
  }
};

// Main function
const main = async () => {
  try {
    // Read products from JSON
    const products = readProductsFromJSON();
    console.log(`Read ${products.length} products from JSON`);
    
    // Import to Firebase
    const result = await importProductsToFirebase(products);
    
    console.log('Import complete!');
    process.exit(0);
  } catch (error) {
    console.error('Error in main function:', error);
    process.exit(1);
  }
};

// Run the script
main(); 