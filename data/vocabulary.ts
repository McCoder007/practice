import { rawVocabularyData } from './source'
import { VocabularyEntry } from './types';

export interface Word {
  word: string
  translation: string
  japanese: string
  partOfSpeech: string
  example: string
  exampleTranslation: string
  japaneseSentence: string
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
      japanese: entry.word_translation_japanese,
      partOfSpeech: entry.type,
      example: entry.sentence,
      exampleTranslation: entry.translation,
      japaneseSentence: entry.translation_japanese,
    })),
  };
});

export default vocabularyData 