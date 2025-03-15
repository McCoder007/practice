// Simple build script to replace API keys in config.js and index.html
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

// Update config.js
const configPath = path.join(__dirname, 'config.js');
console.log(`Reading config file from: ${configPath}`);

let configContent;
try {
  configContent = fs.readFileSync(configPath, 'utf8');
  console.log('Successfully read config file');
  console.log('Config file content before replacement:');
  console.log(configContent);
} catch (error) {
  console.error(`Error reading config file: ${error.message}`);
  process.exit(1);
}

// Replace the placeholder with the actual API key
const updatedConfigContent = configContent.replace('__GOOGLE_TTS_API_KEY__', apiKey);
console.log('Config file content after replacement:');
console.log(updatedConfigContent);

// Write the updated config back to the file
try {
  fs.writeFileSync(configPath, updatedConfigContent);
  console.log('Successfully updated config.js with API key');
} catch (error) {
  console.error(`Error writing config file: ${error.message}`);
  process.exit(1);
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

// Replace the placeholder with the actual API key
const updatedIndexContent = indexContent.replace('\'__GOOGLE_TTS_API_KEY__\'', `'${apiKey}'`);

// Write the updated index.html back to the file
try {
  fs.writeFileSync(indexPath, updatedIndexContent);
  console.log('Successfully updated index.html with API key');
} catch (error) {
  console.error(`Error writing index.html file: ${error.message}`);
  process.exit(1);
} 