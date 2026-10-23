import type { LocalizedText } from "@/data/exam-quiz/types"

export interface TopicWordCard {
  id: string
  setId: string
  word: string
  sayIt?: string
  translation: string
  partOfSpeech: string
  example: string
  exampleTranslation: string
}

export interface LookAlikeItem {
  word: string
  translation: string
  meaning: LocalizedText
}

export interface LookAlikeGroup {
  id: string
  setId: string
  items: LookAlikeItem[]
  tip: LocalizedText
}

export interface TopicWordReelData {
  words: TopicWordCard[]
  lookAlikes: LookAlikeGroup[]
}
