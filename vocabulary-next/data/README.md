# Vocabulary System

This directory contains the vocabulary data and processing scripts for the vocabulary-next application.

## Directory Structure

- `/source` - Source files containing the vocabulary data (one file per day)
- `/days` - Generated files for each day (created by the split script)
- `types.ts` - TypeScript type definitions for the vocabulary data
- `vocabularyData.ts` - Main entry point for accessing vocabulary data

## How It Works

1. The source of truth is the individual day files in the `/source` directory.
2. The `splitVocabulary.js` script generates individual day files in the `/days` directory.
3. Applications import data from either `vocabularyData.ts` or directly from the `/days` directory.

## Adding a New Day

### Method 1: Using the addNewDay.js Utility (Recommended)

```javascript
const { addNewDay } = require('./addNewDay');

addNewDay(13, 'Transportation and Travel', [
  {
    word: 'subway',
    chinese: '地铁',
    partOfSpeech: 'noun',
    simpleSentence: 'I take the subway to work every day.',
    chineseSentence: '我每天坐地铁去上班。'
  },
  // Add more words...
]);
```

### Method 2: Creating a Source File Manually

1. Create a new file in the `/source` directory named `day[NUMBER].ts`.
2. Use the following template:

```typescript
// Vocabulary Data: Day [NUMBER]
// [THEME DESCRIPTION]

import { VocabularyEntry } from '../types';

export const day[NUMBER]: VocabularyEntry[] = [
    {
        word: "[WORD]",
        word_translation: "[CHINESE]",
        sentence: "[ENGLISH SENTENCE]",
        translation: "[CHINESE SENTENCE]",
        type: "[PART OF SPEECH]"
    },
    // Add more entries...
];
```

3. Update the source index file:

```bash
node addNewDay.js updateIndex
```

### After Adding a New Day

Run the split script to update all generated files:

```bash
node splitVocabulary.js
```

## Using the Vocabulary Data

### Import All Vocabulary

```typescript
import { vocabularyData } from '../data/vocabularyData';

// Access a specific day
const day1Words = vocabularyData.day1;
```

### Import a Specific Day

```typescript
import { day1Vocabulary } from '../data/days';
```

### Import Directly from Source

```typescript 
import { day1 } from '../data/source/day1';
``` 