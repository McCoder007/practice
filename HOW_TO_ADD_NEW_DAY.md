# How to Add a New Vocabulary Day

## Quick Steps

### 1. Create the Day File
Create a new file: `/data/source/dayX.ts` (replace X with the day number)

Use this template:
```typescript
// Vocabulary Data: Day X
// Various Words and Expressions

import { VocabularyEntry } from '../types';

export const dayX: VocabularyEntry[] = [
    {
        word: "example",
        word_translation: "例子",
        sentence: "This is an example sentence.",
        translation: "这是一个例句。",
        type: "noun"
    },
    // Add more words here...
];
```

### 2. Update the Index
Edit `/data/source/index.ts`:

1. Add import: `import { dayX } from './dayX';`
2. Add to `rawVocabularyData` object: `dayX,`
3. Add to exports: `export { dayX };`

### 3. That's It!
The website will automatically pick up the new day. Navigate to your vocabulary page and use the arrow buttons to find the new day.

## Important Notes

- ✅ Use `/data/source/` directory (this is what the website reads)
- ❌ Don't use `/data/days/` directory (older system, not connected to UI)
- The `type` field should be: "noun", "verb", "adjective", "adverb", "preposition", etc.
- Hot reload will automatically update the website when you save the files 