import type { LocalizedText } from "@/data/exam-quiz/types"
import type { ReelSection } from "@/data/word-reel/types"

import { EXAM_TOPIC_INDEX } from "./index.generated"
import type { LookAlikeGroup } from "./word-reel-types"
import { EXAM_TOPIC_WORD_REELS } from "./word-reels.generated"

/** One reel section per question set, titled with the set name. */
export function topicReelSections(topicId: string): ReelSection[] {
  const reel = EXAM_TOPIC_WORD_REELS[topicId]
  const domain = EXAM_TOPIC_INDEX.domains.find((d) => d.id === topicId)
  if (!reel || !domain) return []
  return domain.sets
    .map((set) => ({
      id: set.setId,
      title: set.title as LocalizedText,
      cards: reel.words
        .filter((word) => word.setId === set.setId)
        .map((word) => ({
          id: word.id,
          word: word.word,
          sayIt: word.sayIt,
          translation: word.translation,
          partOfSpeech: word.partOfSpeech,
          example: word.example,
          exampleTranslation: word.exampleTranslation,
        })),
    }))
    .filter((section) => section.cards.length > 0)
}

export function topicWordCount(topicId: string): number {
  return EXAM_TOPIC_WORD_REELS[topicId]?.words.length ?? 0
}

export type TopicLookAlikeGroup = LookAlikeGroup & { topicId: string }

/** Look-alike groups for every topic that has them, in exam order. */
export const LOOK_ALIKE_TOPICS: { topicId: string; order: number; title: LocalizedText; groups: TopicLookAlikeGroup[] }[] =
  EXAM_TOPIC_INDEX.domains
    .map((domain) => ({
      topicId: domain.id,
      order: domain.order,
      title: domain.title as LocalizedText,
      groups: (EXAM_TOPIC_WORD_REELS[domain.id]?.lookAlikes ?? []).map((group) => ({ ...group, topicId: domain.id })),
    }))
    .filter((topic) => topic.groups.length > 0)

export const LOOK_ALIKE_GROUP_COUNT = LOOK_ALIKE_TOPICS.reduce((sum, topic) => sum + topic.groups.length, 0)
