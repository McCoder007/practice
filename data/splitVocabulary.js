const fs = require('fs');
const path = require('path');

// Make sure we have a days directory
const daysDir = path.join(__dirname, 'days');
if (!fs.existsSync(daysDir)) {
  fs.mkdirSync(daysDir);
}

// Function to create a file for each day
function createDayFile(day) {
  const sourcePath = path.join(__dirname, 'source', `day${day}.ts`);
  
  // Skip if the source file doesn't exist
  if (!fs.existsSync(sourcePath)) {
    console.log(`Source file for day${day} not found, skipping.`);
    return false;
  }
  
  // Read the source file
  const sourceContent = fs.readFileSync(sourcePath, 'utf8');
  
  // Extract the day description from the source file
  const descriptionMatch = sourceContent.match(/\/\/ (.+)/);
  const description = descriptionMatch ? descriptionMatch[1] : `Day ${day} Vocabulary`;
  
  // Extract the data array (the content between square brackets)
  const dataMatch = sourceContent.match(/\[(\s*{[\s\S]*})\s*\]/);
  if (!dataMatch || !dataMatch[1]) {
    console.error(`Could not extract data from source file for day ${day}`);
    return false;
  }
  
  const data = dataMatch[1];
  const fileName = `day${day}.ts`;
  const filePath = path.join(daysDir, fileName);
  
  const fileContent = `// ${description}
  
export const day${day}Vocabulary = [${data}
];`;

  fs.writeFileSync(filePath, fileContent);
  console.log(`Created ${fileName}`);
  return true;
}

// Function to update the index file with all known days
function updateIndexFile() {
  // Get all day files that have been created
  const dayFiles = fs.readdirSync(daysDir)
    .filter(file => file.match(/^day\d+\.ts$/))
    .sort((a, b) => {
      // Extract day numbers and sort numerically
      const aNum = parseInt(a.match(/^day(\d+)\.ts$/)[1]);
      const bNum = parseInt(b.match(/^day(\d+)\.ts$/)[1]);
      return aNum - bNum;
    });

  if (dayFiles.length === 0) {
    console.log('No day files found, skipping index creation');
    return;
  }

  // Extract day numbers from filenames
  const dayNumbers = dayFiles.map(file => parseInt(file.match(/^day(\d+)\.ts$/)[1]));
  
  const indexPath = path.join(daysDir, 'index.ts');
  
  let indexContent = '// Index file for all vocabulary days\n\n';
  
  // Import statements
  for (const day of dayNumbers) {
    indexContent += `import { day${day}Vocabulary } from './day${day}';\n`;
  }
  
  // Export combined object
  indexContent += '\nexport const vocabularyByDay = {\n';
  for (const day of dayNumbers) {
    indexContent += `  day${day}: day${day}Vocabulary,\n`;
  }
  indexContent += '};\n';

  // Export individual days
  indexContent += '\n// Also export individual days\n';
  for (const day of dayNumbers) {
    indexContent += `export { day${day}Vocabulary };\n`;
  }

  fs.writeFileSync(indexPath, indexContent);
  console.log('Updated index.ts');
}

// Count how many days we have in the source directory
function countDaysInSource() {
  const sourceDir = path.join(__dirname, 'source');
  if (!fs.existsSync(sourceDir)) {
    return 0;
  }
  
  const dayFiles = fs.readdirSync(sourceDir)
    .filter(file => file.match(/^day\d+\.ts$/));
    
  if (dayFiles.length === 0) return 0;
  
  // Extract the day numbers and find the maximum
  const dayNumbers = dayFiles.map(file => parseInt(file.match(/^day(\d+)\.ts$/)[1]));
  return Math.max(...dayNumbers);
}

// Main execution
const totalDays = countDaysInSource();
console.log(`Found ${totalDays} days of vocabulary data in source files`);

// Process all days
let successCount = 0;
for (let day = 1; day <= totalDays; day++) {
  if (createDayFile(day)) {
    successCount++;
  }
}

console.log(`Successfully processed ${successCount} of ${totalDays} days`);

// Update the index file after processing all days
updateIndexFile();

console.log('Finished splitting vocabulary data!');

// Optional: Add comment about how to run this script in the future
console.log('\nTo process new days in the future, simply run this script again.');
console.log('It will detect new days in the source directory and create the appropriate files.'); 