// Script to extract products from Excel and save as JSON
const XLSX = require('xlsx');
const fs = require('fs');
const path = require('path');

// Main function to read Excel and convert to JSON
const convertExcelToJSON = () => {
  try {
    // Path to the Excel file
    const excelFilePath = path.join(__dirname, '../../public/sklad_bulls.xls');
    console.log('Reading Excel file from:', excelFilePath);

    // Read the Excel file
    const workbook = XLSX.readFile(excelFilePath);
    
    // Get the first sheet
    const sheetName = workbook.SheetNames[0];
    const worksheet = workbook.Sheets[sheetName];
    
    // Convert to JSON
    const jsonData = XLSX.utils.sheet_to_json(worksheet);
    console.log(`Extracted ${jsonData.length} rows from Excel file`);
    
    if (jsonData.length === 0) {
      console.error('No data found in Excel file');
      return;
    }
    
    // Log sample of the first row to help debug column names
    console.log('Sample row keys:', Object.keys(jsonData[0]));
    console.log('Sample first row:', JSON.stringify(jsonData[0], null, 2));
    
    // Transform data to our product format
    const products = jsonData
      .filter(row => {
        // Skip header rows or empty rows
        if (row.__EMPTY === 'Kód' || !row.__EMPTY_1) {
          return false;
        }
        // Skip if the row doesn't have a model name (the name is in __EMPTY_1)
        if (!row.__EMPTY_1 || row.__EMPTY_1.trim() === '') {
          return false;
        }
        return true;
      })
      .map((row, index) => {
        // Extract product data from specific columns
        const model = row.__EMPTY_1 || ''; // Model name is in __EMPTY_1
        const price = parseFloat(row.__EMPTY_4) || 0; // Price is in __EMPTY_4
        const discountPrice = parseFloat(row.__EMPTY_5) || 0; // Discount price is in __EMPTY_5
        const category = "E-Bike"; // Default category since it's not specified in the Excel
        const notes = row.__EMPTY_3 || ''; // Notes in __EMPTY_3
        const code = row.__EMPTY || ''; // Product code in __EMPTY
        const quantity = row.__EMPTY_2 || 0; // Quantity in __EMPTY_2
        
        console.log(`Processing product: ${model}`);
        
        return {
          id: `product-${index + 1}`,
          model: model,
          category: category,
          price: price,
          discountPrice: discountPrice,
          code: String(code),
          quantity: parseInt(quantity) || 0,
          notes: notes,
          battery: extractBatteryInfo(model),
          motor: extractMotorInfo(model),
          range: "", // Not available in the Excel
          weight: 0, // Not available in the Excel
          description: `${model} - ${notes}`.trim(),
          imageUrl: "",
          createdAt: new Date().toISOString()
        };
      });
    
    console.log(`Processed ${products.length} valid products`);
    
    // Save to a JSON file
    const outputPath = path.join(__dirname, '../../public/products.json');
    fs.writeFileSync(outputPath, JSON.stringify(products, null, 2));
    console.log(`JSON data saved to ${outputPath}`);
    
    // Also create a data.js file that can be imported in the app
    const dataJsPath = path.join(__dirname, '../../src/data/products.js');
    fs.mkdirSync(path.dirname(dataJsPath), { recursive: true });
    
    const jsContent = `// Auto-generated from Excel file
export const products = ${JSON.stringify(products, null, 2)};
`;
    fs.writeFileSync(dataJsPath, jsContent);
    console.log(`JavaScript data saved to ${dataJsPath}`);
    
  } catch (error) {
    console.error('Error converting Excel to JSON:', error);
  }
};

// Helper function to extract battery information from the model name
function extractBatteryInfo(modelName) {
  const batteryRegex = /(\d+)\s*Wh/i;
  const match = modelName.match(batteryRegex);
  
  if (match && match[1]) {
    return `${match[1]} Wh`;
  }
  
  return "Unknown";
}

// Helper function to extract motor information from the model name
function extractMotorInfo(modelName) {
  if (modelName.includes("Bosch")) return "Bosch";
  if (modelName.includes("Shimano")) return "Shimano";
  if (modelName.includes("Brose")) return "Brose";
  if (modelName.includes("BMZ")) return "BMZ";
  
  // Default motor type based on model series
  if (modelName.includes("SONIC")) return "Bosch Performance Line CX";
  if (modelName.includes("Copperhead")) return "Bosch Performance Line";
  if (modelName.includes("E-Stream")) return "Bosch Performance Line";
  if (modelName.includes("Aminga")) return "Bosch Active Line Plus";
  
  return "Unknown";
}

// Run the conversion
convertExcelToJSON(); 