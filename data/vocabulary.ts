import { rawVocabularyData } from './rawVocabularyData'

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

// Define the type for the day data from imported files
type RawWord = {
  readonly word: string
  readonly word_translation: string
  readonly type: string
  readonly sentence: string
  readonly translation: string
}

// Transform raw data (keys day1, day2, ...) into array of DayData
const vocabularyData: DayData[] = Object.entries(rawVocabularyData).map(([key, words], index) => ({
  day: index + 1,
  words: (words as readonly RawWord[]).map((w) => ({
    word: w.word,
    translation: w.word_translation,
    partOfSpeech: w.type,
    example: w.sentence,
    exampleTranslation: w.translation,
  })),
}))

export default vocabularyData 