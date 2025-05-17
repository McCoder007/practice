// generateVocabularyJSON.ts
// ------------------------------------------------------------
// This script converts `rawVocabularyData.ts` into per-day JSON
// files under `public/data/vocabulary` plus an `index.json` that
// lists how many days exist. Run via:
//   npm run generate:vocabulary
// ------------------------------------------------------------

import fs from 'fs'
import path from 'path'
import { rawVocabularyData } from '../data/rawVocabularyData'

// Directory for the generated files
const OUTPUT_DIR = path.join(process.cwd(), 'public', 'data', 'vocabulary')

// Ensure output directory exists
if (!fs.existsSync(OUTPUT_DIR)) {
  fs.mkdirSync(OUTPUT_DIR, { recursive: true })
  console.log(`Created directory: ${OUTPUT_DIR}`)
}

// Get total number of days
const totalDays = Object.keys(rawVocabularyData).length

// Create index.json with metadata
const indexFile = path.join(OUTPUT_DIR, 'index.json')
fs.writeFileSync(
  indexFile,
  JSON.stringify({ totalDays, lastUpdated: new Date().toISOString() })
)
console.log(`Generated ${indexFile}`)

// Create individual day files
Object.entries(rawVocabularyData).forEach(([key, words], index) => {
  const dayNumber = index + 1
  const dayFile = path.join(OUTPUT_DIR, `day${dayNumber}.json`)
  fs.writeFileSync(dayFile, JSON.stringify(words))
  console.log(`Generated ${dayFile}`)
})

console.log(`
Vocabulary JSON files have been generated!
- Total days: ${totalDays}
- Index: ${indexFile}
- Files are in: ${OUTPUT_DIR}
`) 