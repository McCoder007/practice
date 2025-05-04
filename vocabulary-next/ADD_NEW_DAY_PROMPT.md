# Template: Add a New Day to Vocabulary

Use this prompt whenever you want to add another day of words to the `vocabulary-next` project.

```text
I want to add Day {{DAY_NUMBER}} to the /vocabulary.

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

Please insert a new `day{{DAY_NUMBER}}` array into `vocabulary-next/data/rawVocabularyData.ts` immediately after `day{{DAY_NUMBER_MINUS_ONE}}`. Ensure:

1. The previous day's closing bracket (`]`) has a trailing comma.
2. Each entry includes **word**, **word_translation**, **sentence**, **translation**, and **type**.
3. Do not modify any existing days or formatting.
``` 