// Script to extract products from Excel and save as JSON
const XLSX = require('xlsx');
const fs = require('fs');
const path = require('path');

console.log('Starting Excel to JSON conversion...');

/**
 * Convert Excel file to JSON and save to file
 * @param {string} excelFilePath - Path to Excel file
 * @returns {Array} - Array of products
 */
function convertExcelToJSON(excelFilePath) {
  try {
    // Check if Excel file exists
    if (!fs.existsSync(excelFilePath)) {
      console.error(`Error: Excel file not found at ${excelFilePath}`);
      process.exit(1);
    }

    console.log(`Reading Excel file: ${excelFilePath}`);
    const workbook = XLSX.readFile(excelFilePath);
    const sheetName = workbook.SheetNames[0];
    const sheet = workbook.Sheets[sheetName];
    
    // Convert to JSON
    const rawData = XLSX.utils.sheet_to_json(sheet, { header: 1 });
    console.log(`Raw Excel data: ${rawData.length} rows`);
    
    // Filter out empty rows
    const rows = rawData.filter(row => row.length > 0);
    console.log(`After filtering empty rows: ${rows.length} rows`);
    
    // Get header and data
    const header = rows[0];
    const data = rows.slice(1);
    
    // Transform data
    const products = data
      .filter(row => row[0]) // Filter out rows without a model
      .map((row, index) => {
        const battery = row[4] ? row[4].toString() : '';
        const motor = row[5] ? row[5].toString() : '';
        
        // Extract values from the row
        return {
          id: `p${index + 1}`,
          model: row[0] ? row[0].toString() : '',
          category: row[1] ? row[1].toString() : '',
          price: row[2] ? parseFloat(row[2]) : 0,
          discount: row[3] ? parseFloat(row[3]) : 0,
          battery,
          motor,
          action: row[6] ? parseFloat(row[6]) : 0,
        };
      });
    
    console.log(`Transformed into ${products.length} product objects`);
    
    // Ensure output directories exist
    const dataDir = path.join(__dirname, '../../public/data');
    if (!fs.existsSync(dataDir)) {
      console.log(`Creating directory: ${dataDir}`);
      fs.mkdirSync(dataDir, { recursive: true });
    }
    
    // Save to JSON file
    const jsonFilePath = path.join(dataDir, 'products.json');
    fs.writeFileSync(jsonFilePath, JSON.stringify(products, null, 2));
    console.log(`JSON data saved to ${jsonFilePath}`);
    
    // Create data.js for import
    const jsDir = path.join(__dirname, '../../src/data');
    if (!fs.existsSync(jsDir)) {
      console.log(`Creating directory: ${jsDir}`);
      fs.mkdirSync(jsDir, { recursive: true });
    }
    
    const jsFilePath = path.join(jsDir, 'data.js');
    const jsContent = `// Auto-generated from Excel on ${new Date().toISOString()}
export const products = ${JSON.stringify(products, null, 2)};
`;
    fs.writeFileSync(jsFilePath, jsContent);
    console.log(`JavaScript data saved to ${jsFilePath}`);
    
    return products;
  } catch (error) {
    console.error('Error processing Excel file:', error);
    process.exit(1);
  }
}

// Path to the Excel file
const excelFilePath = path.join(__dirname, '../../public/sklad_bulls.xls');

try {
  const products = convertExcelToJSON(excelFilePath);
  console.log(`Successfully extracted ${products.length} products from Excel file`);
  process.exit(0);
} catch (error) {
  console.error('Excel to JSON conversion failed:', error);
  process.exit(1);
}

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