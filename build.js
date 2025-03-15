// Simple build script to replace API keys in config.js
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

// Read the config file
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
const updatedContent = configContent.replace('__GOOGLE_TTS_API_KEY__', apiKey);
console.log('Config file content after replacement:');
console.log(updatedContent);

// Write the updated config back to the file
try {
  fs.writeFileSync(configPath, updatedContent);
  console.log('Successfully updated config.js with API key');
} catch (error) {
  console.error(`Error writing config file: ${error.message}`);
  process.exit(1);
} 