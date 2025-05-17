/**
 * Add New Day Utility Script
 * 
 * This script simplifies adding a new day to the vocabulary system.
 * It creates a new source file for the vocabulary day.
 */

const fs = require('fs');
const path = require('path');

/**
 * Adds a new day to the vocabulary system
 * @param {number} dayNumber - The day number to add 
 * @param {string} dayTheme - The theme/description for this day
 * @param {Array} words - Array of word objects with properties: word, chinese, partOfSpeech, simpleSentence, chineseSentence
 */
function addNewDay(dayNumber, dayTheme, words) {
  // Validate inputs
  if (!dayNumber || !dayTheme || !words || !Array.isArray(words) || words.length === 0) {
    console.error('Invalid input. Please provide day number, theme, and word array.');
    return;
  }

  // Ensure source directory exists
  const sourceDir = path.join(__dirname, 'source');
  if (!fs.existsSync(sourceDir)) {
    fs.mkdirSync(sourceDir);
  }

  // Check if file already exists
  const targetPath = path.join(sourceDir, `day${dayNumber}.ts`);
  if (fs.existsSync(targetPath)) {
    console.error(`Day ${dayNumber} already exists. Please use a different day number.`);
    return;
  }

  // Format the day data
  let dayContent = `// Vocabulary Data: Day ${dayNumber}\n`;
  dayContent += `// ${dayTheme}\n\n`;
  dayContent += `import { VocabularyEntry } from '../types';\n\n`;
  dayContent += `export const day${dayNumber}: VocabularyEntry[] = [\n`;
  
  // Add each word
  words.forEach((word, index) => {
    dayContent += `    {\n`;
    dayContent += `        word: "${word.word}",\n`;
    dayContent += `        word_translation: "${word.chinese}",\n`;
    dayContent += `        sentence: "${word.simpleSentence}",\n`;
    dayContent += `        translation: "${word.chineseSentence}",\n`;
    dayContent += `        type: "${word.partOfSpeech}"\n`;
    dayContent += `    }${index < words.length - 1 ? ',' : ''}\n`;
  });
  
  dayContent += `];`;

  // Write the new day file
  fs.writeFileSync(targetPath, dayContent);
  console.log(`Created source file for Day ${dayNumber}`);
  
  // Update the index file
  updateSourceIndex();
  
  // Remind to run the split script
  console.log('\nNext steps:');
  console.log('Run the split script to generate the output files:');
  console.log('node splitVocabulary.js');
}

/**
 * Updates the source index file to include all days
 */
function updateSourceIndex() {
  const sourceDir = path.join(__dirname, 'source');
  
  // Get all day files
  const dayFiles = fs.readdirSync(sourceDir)
    .filter(file => file.match(/^day\d+\.ts$/))
    .sort((a, b) => {
      // Extract day numbers and sort numerically
      const aNum = parseInt(a.match(/^day(\d+)\.ts$/)[1]);
      const bNum = parseInt(b.match(/^day(\d+)\.ts$/)[1]);
      return aNum - bNum;
    });

  if (dayFiles.length === 0) {
    console.log('No day files found, skipping index update');
    return;
  }

  // Extract day numbers from filenames
  const dayNumbers = dayFiles.map(file => parseInt(file.match(/^day(\d+)\.ts$/)[1]));
  
  const indexPath = path.join(sourceDir, 'index.ts');
  let indexContent = '// Index file for all vocabulary source files\n\n';
  
  // Import statements
  for (const day of dayNumbers) {
    indexContent += `import { day${day} } from './day${day}';\n`;
  }
  
  // Export combined object
  indexContent += '\n// Export as a single object for backward compatibility\n';
  indexContent += 'export const rawVocabularyData = {\n';
  for (const day of dayNumbers) {
    indexContent += `  day${day},\n`;
  }
  indexContent += '};\n\n';
  
  // Export individual days
  indexContent += '// Export each day individually\n';
  for (const day of dayNumbers) {
    indexContent += `export { day${day} };\n`;
  }
  
  fs.writeFileSync(indexPath, indexContent);
  console.log('Updated source index.ts');
}

// Handle command line arguments
if (process.argv.length > 2) {
  const command = process.argv[2];
  
  if (command === 'updateIndex') {
    updateSourceIndex();
    console.log('Index file updated. Run splitVocabulary.js to generate output files.');
  } else {
    console.log('Unknown command. Available commands: updateIndex');
  }
}

// Example usage (commented out)
/*
addNewDay(13, 'Transportation and Travel', [
  {
    word: 'subway',
    chinese: '地铁',
    partOfSpeech: 'noun',
    simpleSentence: 'I take the subway to work every day.',
    chineseSentence: '我每天坐地铁去上班。'
  },
  {
    word: 'airport',
    chinese: '机场',
    partOfSpeech: 'noun',
    simpleSentence: 'We arrived at the airport two hours early.',
    chineseSentence: '我们提前两小时到达了机场。'
  }
]);
*/

module.exports = { addNewDay, updateSourceIndex }; 