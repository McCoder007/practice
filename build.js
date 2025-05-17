// Simple build script to replace API key in index.html
const fs = require('fs');
const path = require('path');

// Get API key from environment variable
const apiKey = process.env.GOOGLE_TTS_API_KEY;

console.log('Starting build script...');

if (!apiKey) {
  console.error('Error: GOOGLE_TTS_API_KEY environment variable is not set');
  process.exit(1);
} else {
  console.log('API key found in environment variable');
}

// Update index.html
const indexPath = path.join(__dirname, 'index.html');
console.log(`Reading index.html file from: ${indexPath}`);

let indexContent;
try {
  indexContent = fs.readFileSync(indexPath, 'utf8');
  console.log('Successfully read index.html file');
} catch (error) {
  console.error(`Error reading index.html file: ${error.message}`);
  process.exit(1);
}

// Replace the hard-coded API key with the one from environment variable
const updatedIndexContent = indexContent.replace(
  /googleTTS\.setApiKey\(['"]([^'"]+)['"]\)/,
  `googleTTS.setApiKey('${apiKey}')`
);

// Write the updated index.html back to the file
try {
  fs.writeFileSync(indexPath, updatedIndexContent);
  console.log('Successfully updated index.html with API key');
} catch (error) {
  console.error(`Error writing index.html file: ${error.message}`);
  process.exit(1);
} 