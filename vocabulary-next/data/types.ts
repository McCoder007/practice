// Types for vocabulary data

export interface VocabularyEntry {
  word: string;
  word_translation: string;
  word_translation_japanese: string;
  sentence: string;
  translation: string;
  translation_japanese: string;
  type: string;
}

export type Sentence = {
  id: number;
  textIncorrect: string;
  textCorrect: string;
  capitalWordIndexes: number[];
};

export type WordState = 'default' | 'selected' | 'correct' | 'incorrect' | 'missed';