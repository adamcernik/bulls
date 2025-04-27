# Extracting Products from Excel to JSON

This guide explains how to extract all products from your Excel file and convert them to a JSON format that can be used in the application.

## Option 1: Running the Extraction Script

1. Make sure your Excel file is located at `bulls-app/public/sklad_bulls.xls`
2. Open a terminal or command prompt
3. Navigate to the bulls-app directory:
   ```
   cd bulls-app
   ```
4. Run the extraction script:
   ```
   node extract-products.js
   ```
5. The script will:
   - Read the Excel file
   - Extract all product data
   - Save it as `public/products.json`
   - Also create a JavaScript module at `src/data/products.js`

## Option 2: Using the Web Application

1. Start the application normally:
   ```
   cd bulls-app
   npm start
   ```
2. Go to the Products page
3. Click on the "Static JSON Products" tab
4. If you've already run the extraction script, you'll see the products loaded from the JSON file

## Understanding the Generated Files

### products.json

This is a plain JSON file containing all products from the Excel file. It's stored in the `public` directory, so it can be accessed directly via HTTP requests. Example:

```json
[
  {
    "id": "product-1",
    "model": "Example Mountain Bike",
    "category": "Mountain",
    "price": 2499,
    "battery": "500Wh",
    "motor": "Bosch",
    "range": "80km",
    "weight": 22,
    "description": "An example mountain e-bike",
    "imageUrl": "",
    "createdAt": "2025-04-27T16:30:00.000Z"
  },
  ...more products
]
```

### products.js

This is a JavaScript module file that exports the same data, which can be imported directly in your React components:

```javascript
import { products } from '../data/products';

// Now you can use the products array in your component
```

## Troubleshooting

If you're having issues with the extraction:

1. Check that your Excel file is in the correct location
2. Make sure the column names in your Excel file match at least one of the expected names (see excel-to-json.js for the list of expected names)
3. Check the console output for any error messages 