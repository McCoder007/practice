# Template: Add a New Day to Vocabulary

Use this prompt whenever you want to add another day of words to the `vocabulary-next` project.

## Method 1: Using the Utility Script (Recommended)

For a more efficient and error-free process, use the utility script:

```javascript
// In vocabulary-next/data directory
const { addNewDay } = require('./addNewDay');

addNewDay({{DAY_NUMBER}}, '{{DAY_THEME}}', [
  {
    word: '{{WORD_1}}',
    chinese: '{{CHINESE_TRANSLATION_1}}',
    partOfSpeech: '{{PART_OF_SPEECH_1}}',
    simpleSentence: '{{ENGLISH_EXAMPLE_1}}',
    chineseSentence: '{{CHINESE_EXAMPLE_1}}'
  },
  {
    word: '{{WORD_2}}',
    chinese: '{{CHINESE_TRANSLATION_2}}',
    partOfSpeech: '{{PART_OF_SPEECH_2}}',
    simpleSentence: '{{ENGLISH_EXAMPLE_2}}',
    chineseSentence: '{{CHINESE_EXAMPLE_2}}'
  },
  // Add all your words here
]);
```

## Method 2: Manual Addition

```text
I want to add Day {{DAY_NUMBER}} to the vocabulary.

The new words are below (one entry per word):

Word: {{WORD_1}}
Chinese: {{CHINESE_TRANSLATION_1}}
Part of Speech: {{PART_OF_SPEECH_1}}
Simple Sentence: {{ENGLISH_EXAMPLE_1}}
Chinese Sentence: {{CHINESE_EXAMPLE_1}}

Word: {{WORD_2}}
Chinese: {{CHINESE_TRANSLATION_2}}
Part of Speech: {{PART_OF_SPEECH_2}}
Simple Sentence: {{ENGLISH_EXAMPLE_2}}
Chinese Sentence: {{CHINESE_EXAMPLE_2}}

... continue listing all words ...

Please create a new file `vocabulary-next/data/source/day{{DAY_NUMBER}}.ts` with the following structure:

1. Include a comment with the day theme: `// [Description of the day's theme]`
2. Each entry should include **word**, **word_translation**, **sentence**, **translation**, and **type**.
3. Follow the existing format of other day files.
```

## After Adding a New Day

After creating the new day file, run these commands:

```bash
cd vocabulary-next/data
node addNewDay.js updateIndex  # Updates the source index file
node splitVocabulary.js        # Creates the individual day files
```

This will:
- Update the index file in the source directory
- Create a new `day{{DAY_NUMBER}}.ts` file in the `days` directory
- Update the main `index.ts` file to include the new day

## File Structure

The vocabulary data is organized as follows:

- `source/` - Source files for each day's vocabulary data
  - `day1.ts`, `day2.ts`, etc. - Source files for each day
  - `index.ts` - Exports all days from source
- `days/` - Generated files for consumption
  - `day1.ts`, `day2.ts`, etc. - Individual files for each day
  - `index.ts` - Export point for all days

To use the vocabulary data in your application, you can:

```typescript
// Import all days
import { vocabularyData } from '../data/vocabularyData';

// Access a specific day
const day1Words = vocabularyData.day1;

// Or import just one day
import { day1Vocabulary } from '../data/days';

// Or import directly from source
import { day1 } from '../data/source/day1';
``` 