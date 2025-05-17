import { rawVocabularyData } from './source'
import { VocabularyEntry } from './types';

export interface Word {
  word: string
  translation: string
  partOfSpeech: string
  example: string
  exampleTranslation: string
}

export interface DayData {
  day: number
  words: Word[]
}

// Transform raw data (keys day1, day2, ...) into array of DayData
const vocabularyData: DayData[] = Object.entries(rawVocabularyData).map(([key, words], index) => {
  // Ensure we're working with an array of entries
  const entries = words as VocabularyEntry[];
  
  return {
    day: index + 1,
    words: entries.map((entry) => ({
      word: entry.word,
      translation: entry.word_translation,
      partOfSpeech: entry.type,
      example: entry.sentence,
      exampleTranslation: entry.translation,
    })),
  };
});

export default vocabularyData 