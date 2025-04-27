import * as XLSX from 'xlsx';
import { db, auth } from '../firebase';
import { collection, addDoc } from 'firebase/firestore';
import { Product } from '../models/Product';

interface ExcelRow {
  [key: string]: string | number;
}

// Utility to try to get data with various possible column names
const getFieldValue = (row: ExcelRow, possibleKeys: string[]): string => {
  for (const key of possibleKeys) {
    if (row[key] !== undefined && row[key] !== null && row[key] !== '') {
      return String(row[key]);
    }
  }
  return '';
};

// eslint-disable-next-line @typescript-eslint/no-unused-vars
const createProductFromRow = (row: ExcelRow): Omit<Product, 'id'> => {
  return {
    model: getFieldValue(row, ['Model', 'model', 'Název', 'název', 'Name', 'name']),
    category: getFieldValue(row, ['Category', 'category', 'Kategorie', 'kategorie', 'Type', 'type']),
    price: parseFloat(getFieldValue(row, ['Price', 'price', 'Cena', 'cena']) || '0'),
    battery: getFieldValue(row, ['Battery', 'battery', 'Baterie', 'baterie', 'Akumulátor']),
    motor: getFieldValue(row, ['Motor', 'motor']),
    range: getFieldValue(row, ['Range', 'range', 'Dojezd', 'dojezd']),
    weight: parseFloat(getFieldValue(row, ['Weight', 'weight', 'Váha', 'váha', 'Hmotnost']) || '0'),
    description: getFieldValue(row, ['Description', 'description', 'Popis', 'popis']),
    imageUrl: getFieldValue(row, ['ImageUrl', 'imageUrl', 'Obrázek', 'obrázek', 'Image', 'image'])
  };
};

// This function handles parsing an Excel file and adding products to Firestore
export const importExcelData = async (file: File): Promise<number> => {
  return new Promise((resolve, reject) => {
    // Ensure user is authenticated
    if (!auth.currentUser) {
      reject(new Error('Not authenticated. Please wait for authentication to complete.'));
      return;
    }

    const userId = auth.currentUser.uid;

    const reader = new FileReader();
    
    reader.onload = async (e) => {
      try {
        const data = e.target?.result;
        const workbook = XLSX.read(data, { type: 'binary' });
        
        // Get the first sheet
        const sheetName = workbook.SheetNames[0];
        const worksheet = workbook.Sheets[sheetName];
        
        // Convert to JSON
        const jsonData = XLSX.utils.sheet_to_json<ExcelRow>(worksheet);
        console.log('Parsed Excel data, rows:', jsonData.length);
        
        if (jsonData.length === 0) {
          throw new Error('No data found in Excel file');
        }
        
        // Log sample of the first row to help debug column names
        console.log('Sample row keys:', Object.keys(jsonData[0]));
        console.log('Sample row:', jsonData[0]);
        
        const productsCollection = collection(db, 'products');
        
        let successCount = 0;
        
        // Process each row in the Excel file
        for (const row of jsonData) {
          try {
            // Create product object from row data
            const product = {
              model: getFieldValue(row, ['Model', 'model', 'Název', 'název', 'Name', 'name']),
              category: getFieldValue(row, ['Category', 'category', 'Kategorie', 'kategorie', 'Type', 'type']),
              price: parseFloat(getFieldValue(row, ['Price', 'price', 'Cena', 'cena']) || '0'),
              battery: getFieldValue(row, ['Battery', 'battery', 'Baterie', 'baterie', 'Akumulátor']),
              motor: getFieldValue(row, ['Motor', 'motor']),
              range: getFieldValue(row, ['Range', 'range', 'Dojezd', 'dojezd']),
              weight: parseFloat(getFieldValue(row, ['Weight', 'weight', 'Váha', 'váha', 'Hmotnost']) || '0'),
              description: getFieldValue(row, ['Description', 'description', 'Popis', 'popis']),
              imageUrl: getFieldValue(row, ['ImageUrl', 'imageUrl', 'Obrázek', 'obrázek', 'Image', 'image']),
              createdBy: userId,
              createdAt: new Date().toISOString()
            };
            
            // Skip any row that doesn't have a model name
            if (!product.model) {
              console.log('Skipping row with no model name:', row);
              continue;
            }
            
            // Add the product to Firestore
            await addDoc(productsCollection, product);
            successCount++;
            
            // Log progress every 10 products
            if (successCount % 10 === 0) {
              console.log(`Added ${successCount} products so far...`);
            }
            
            // Add a small delay between operations to avoid rate limiting
            await new Promise(resolve => setTimeout(resolve, 100));
          } catch (error) {
            console.error('Error adding product:', error, 'Row:', row);
          }
        }
        
        console.log(`Successfully added ${successCount} products from Excel file`);
        resolve(successCount);
      } catch (error) {
        console.error('Excel processing error:', error);
        reject(error);
      }
    };
    
    reader.onerror = (error) => {
      console.error('FileReader error:', error);
      reject(error);
    };
    
    reader.readAsBinaryString(file);
  });
};

// Function to load the pre-existing Excel file from the public directory
export const loadLocalExcelFile = async (): Promise<number> => {
  try {
    // Ensure user is authenticated
    if (!auth.currentUser) {
      throw new Error('Not authenticated. Please wait for authentication to complete.');
    }

    console.log('Attempting to load Excel file from public directory');
    
    // Fetch the Excel file from the public directory
    const response = await fetch('/sklad_bulls.xls');
    
    if (!response.ok) {
      throw new Error(`Failed to fetch file: ${response.status} ${response.statusText}`);
    }
    
    console.log('Excel file fetched successfully, size:', response.headers.get('content-length'));
    const blob = await response.blob();
    console.log('Blob created, size:', blob.size);
    const file = new File([blob], 'sklad_bulls.xls');
    
    return await importExcelData(file);
  } catch (error) {
    console.error('Error loading local Excel file:', error);
    throw error;
  }
}; 