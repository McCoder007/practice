import type { LocalizedText } from "@/data/exam-quiz/types"
import type { DayData } from "@/data/vocabulary"

/** One swipe card in a word reel. */
export interface ReelCard {
  /** Stable id, used to remember where the learner stopped. */
  id: string
  word: string
  /** Text (or SSML) sent to text-to-speech instead of `word`. */
  tts?: string
  /** How to say it, e.g. "ep-oh-NICK-ee-um" (stressed part in caps). */
  sayIt?: string
  translation: string
  japanese?: string
  partOfSpeech: string
  example: string
  exampleTranslation: string
  japaneseSentence?: string
  /** Optional extra line, e.g. what a question word asks you to do. */
  note?: LocalizedText
}

/** A named group of cards, e.g. one question set. */
export interface ReelSection {
  id: string
  title: LocalizedText
  cards: ReelCard[]
}

export interface ReelTitle extends LocalizedText {
  ja?: string
}

/** Turns the older day-based reel data into one section per day, without "Day N" labels. */
export function sectionsFromDays(data: DayData[], idPrefix: string, title: LocalizedText): ReelSection[] {
  return data.map((day, dayIndex) => ({
    id: `${idPrefix}-${day.day}`,
    title: data.length === 1 ? title : { en: `${title.en} ${dayIndex + 1}`, zh: `${title.zh} ${dayIndex + 1}` },
    cards: day.words.map((word, wordIndex) => ({
      id: `${idPrefix}-${day.day}-${wordIndex}`,
      word: word.word,
      tts: word.ttsSsml ?? word.ttsWord,
      translation: word.translation,
      japanese: word.japanese || undefined,
      partOfSpeech: word.partOfSpeech,
      example: word.example,
      exampleTranslation: word.exampleTranslation,
      japaneseSentence: word.japaneseSentence || undefined,
    })),
  }))
}
