/**
 * Migration Script: Split rawVocabularyData.ts into individual source files
 * 
 * This is a one-time script to migrate from the single large file approach
 * to individual source files for each day.
 */

const fs = require('fs');
const path = require('path');

// Create source directory if it doesn't exist
const sourceDir = path.join(__dirname, 'source');
if (!fs.existsSync(sourceDir)) {
  fs.mkdirSync(sourceDir);
}

// Import content of raw vocabulary data file
const rawFilePath = path.join(__dirname, 'rawVocabularyData.ts');
const fileContent = fs.readFileSync(rawFilePath, 'utf8');

// Function to extract day's comment/description
function extractDayDescription(day) {
  const pattern = new RegExp(`// Day ${day}: ([^\\n]+)`);
  const match = fileContent.match(pattern);
  return match ? match[1].trim() : `Day ${day} Vocabulary`;
}

// Function to extract each day's data
function extractDayData(day) {
  // Try matching both patterns - one for days in the middle and one for the last day
  const dayPattern = new RegExp(`day${day}: \\[([\\s\\S]*?)\\s*\\],\\s*\\n\\s*// Day|day${day}: \\[([\\s\\S]*?)\\s*\\]\\s*\\n\\}`);
  const matches = fileContent.match(dayPattern);
  
  if (!matches) return null;
  
  // The day data is in the first or second capturing group depending on whether it's followed by another day or the end
  return matches[1] || matches[2];
}

// Function to create individual source file for a day
function createDaySourceFile(day) {
  const dayDescription = extractDayDescription(day);
  const dayData = extractDayData(day);
  
  if (!dayData) {
    console.error(`Could not extract data for day ${day}`);
    return false;
  }
  
  const filePath = path.join(sourceDir, `day${day}.ts`);
  const fileContent = `// Vocabulary Data: Day ${day}
// ${dayDescription}

import { VocabularyEntry } from '../types';

export const day${day}: VocabularyEntry[] = [${dayData}
];`;

  fs.writeFileSync(filePath, fileContent);
  console.log(`Created source file for day ${day}`);
  return true;
}

// Count how many days we have in the data
function countDaysInData() {
  const dayMatches = fileContent.match(/day\d+:/g);
  if (!dayMatches) return 0;
  
  // Extract the day numbers and find the maximum
  const dayNumbers = dayMatches.map(match => parseInt(match.replace('day', '').replace(':', '')));
  return Math.max(...dayNumbers);
}

// Main processing
const totalDays = countDaysInData();
console.log(`Found ${totalDays} days of vocabulary data`);

// Create source files for all days
let successCount = 0;
for (let day = 1; day <= totalDays; day++) {
  if (createDaySourceFile(day)) {
    successCount++;
  }
}

console.log(`Successfully created ${successCount} of ${totalDays} day source files`);

// Create index file to export all days
const indexPath = path.join(sourceDir, 'index.ts');
let indexContent = '// Index file for all vocabulary source files\n\n';

// Import statements
for (let day = 1; day <= totalDays; day++) {
  indexContent += `import { day${day} } from './day${day}';\n`;
}

// Export combined object
indexContent += '\n// Export as a single object for backward compatibility\n';
indexContent += 'export const rawVocabularyData = {\n';
for (let day = 1; day <= totalDays; day++) {
  indexContent += `  day${day},\n`;
}
indexContent += '};\n\n';

// Export individual days
indexContent += '// Export each day individually\n';
for (let day = 1; day <= totalDays; day++) {
  indexContent += `export { day${day} };\n`;
}

fs.writeFileSync(indexPath, indexContent);
console.log('Created index.ts in source directory');

console.log('\nMigration completed!\n');
console.log('Next steps:');
console.log('1. Update splitVocabulary.js to work with the new source structure');
console.log('2. Update addNewDay.js to add new days to the source files');
console.log('3. Remove or archive the original rawVocabularyData.ts file'); 