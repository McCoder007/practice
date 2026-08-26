import type { LocalizedText, PracticeSourceId } from "@/data/exam-quiz/types"

export const PRACTICE_TITLE: LocalizedText = {
  en: "Official Exam Practice",
  zh: "官方考试练习",
}

export const QUICK_COUNT = 10
export const PRACTICE_COUNT = 25
export const SOURCE_CHUNK_SIZE = 20
export const APPROVED_PRACTICE_COUNT = 100

export type PracticeSourceMeta = {
  id: PracticeSourceId
  title: LocalizedText
  idPrefix: string
  approvedCount: number
  accent: "violet" | "rose" | "cyan"
}

/** A single source entry produces five fixed banks of 20 questions. */
export const PRACTICE_SOURCES: readonly PracticeSourceMeta[] = [
  {
    // QuizMode's source identifier is UI-internal; this module owns its catalog.
    id: "nail-test",
    title: { en: "Official question banks", zh: "官方题库" },
    idPrefix: "official-practice-",
    approvedCount: APPROVED_PRACTICE_COUNT,
    accent: "violet",
  },
] as const

export type SourceRangeCard = {
  offset: number
  start: number
  end: number
  count: number
}

export function sourceRangeCards(
  totalCount: number,
  chunkSize: number = SOURCE_CHUNK_SIZE,
): SourceRangeCard[] {
  if (totalCount <= 0 || chunkSize <= 0) return []
  const cards: SourceRangeCard[] = []
  for (let offset = 0; offset < totalCount; offset += chunkSize) {
    const count = Math.min(chunkSize, totalCount - offset)
    cards.push({ offset, start: offset + 1, end: offset + count, count })
  }
  return cards
}

export function sliceOfficialSourceRange<T extends { id: string }>(
  pool: readonly T[],
  offset: number,
): T[] {
  const source = PRACTICE_SOURCES[0]
  const sourceQuestions = pool.filter((question) => question.id.startsWith(source.idPrefix))
  if (offset < 0) return []
  return sourceQuestions.slice(offset, offset + SOURCE_CHUNK_SIZE)
}
