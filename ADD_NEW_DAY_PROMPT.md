# Template: Add a New Day to Vocabulary

Use this prompt whenever you want to add another day of words to the `vocabulary-next` project.

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

Please:

1. Create a new file `vocabulary-next/data/days/day{{DAY_NUMBER}}.ts` with the new vocabulary entries
2. Update `vocabulary-next/data/rawVocabularyData.ts` to:
   - Import the new day file
   - Add it to the exported object

Follow the same structure as the existing day files, ensuring each entry includes **word**, **word_translation**, **sentence**, **translation**, and **type**.
``` 