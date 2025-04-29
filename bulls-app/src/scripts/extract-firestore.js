// Script to extract products from Firestore to a local JSON file
require('dotenv').config();
const admin = require('firebase-admin');
const fs = require('fs');
const path = require('path');

console.log('Starting Firestore to JSON extraction...');

// Check if the credentials file exists
const serviceAccountPath = path.join(__dirname, '../../serviceAccount.json');
if (!fs.existsSync(serviceAccountPath)) {
  console.error('Error: serviceAccount.json file not found');
  console.log('Please create a serviceAccount.json file with your Firebase Admin SDK credentials');
  console.log(`Expected path: ${serviceAccountPath}`);
  process.exit(1);
}

// Initialize Firebase Admin SDK
try {
  console.log('Loading Firebase Admin credentials...');
  const serviceAccount = require('../../serviceAccount.json');
  
  admin.initializeApp({
    credential: admin.credential.cert(serviceAccount)
  });
  console.log('Firebase Admin SDK initialized successfully');
} catch (error) {
  console.error('Error initializing Firebase Admin SDK:', error);
  process.exit(1);
}

const db = admin.firestore();

async function extractProducts() {
  try {
    console.log('Fetching products from Firestore...');
    const productsSnapshot = await db.collection('products').get();
    
    if (productsSnapshot.empty) {
      console.log('No products found in the database.');
      process.exit(0);
    }
    
    const products = [];
    productsSnapshot.forEach(doc => {
      products.push({
        id: doc.id,
        ...doc.data()
      });
    });
    
    console.log(`Retrieved ${products.length} products from Firestore`);
    
    // Create all required directories
    const outputDir = path.join(__dirname, '../../public/data');
    if (!fs.existsSync(outputDir)) {
      console.log(`Creating directory: ${outputDir}`);
      fs.mkdirSync(outputDir, { recursive: true });
    }
    
    // Save to JSON file
    const outputPath = path.join(outputDir, 'firestore-products.json');
    fs.writeFileSync(outputPath, JSON.stringify(products, null, 2));
    
    console.log(`Successfully extracted ${products.length} products to ${outputPath}`);
    
    // Also create a data.js file for direct import
    const dataJsDir = path.join(__dirname, '../../src/data');
    if (!fs.existsSync(dataJsDir)) {
      console.log(`Creating directory: ${dataJsDir}`);
      fs.mkdirSync(dataJsDir, { recursive: true });
    }
    
    const dataJsPath = path.join(dataJsDir, 'firestore-products.js');
    const jsContent = `// Auto-generated from Firestore on ${new Date().toISOString()}
export const firestoreProducts = ${JSON.stringify(products, null, 2)};
`;
    fs.writeFileSync(dataJsPath, jsContent);
    console.log(`JavaScript data saved to ${dataJsPath}`);
    
    return products;
  } catch (error) {
    console.error('Error extracting products:', error);
    process.exit(1);
  }
}

// Run the extraction
extractProducts()
  .then(() => {
    console.log('Extraction completed successfully');
    process.exit(0);
  })
  .catch(error => {
    console.error('Extraction failed:', error);
    process.exit(1);
  }); 