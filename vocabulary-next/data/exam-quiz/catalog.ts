import type { LocalizedText, PracticeSourceId } from "./types"

export const PRACTICE_TITLE: LocalizedText = {
  en: "Exam Practice",
  zh: "考试练习",
}

export const QUESTIONS_TO_REVIEW_TITLE: LocalizedText = {
  en: "Questions to Review",
  zh: "待审核题目",
}

export const QUICK_COUNT = 10
export const PRACTICE_COUNT = 30
export const SOURCE_CHUNK_SIZE = 20
export const APPROVED_PRACTICE_COUNT = 348
export const HELD_FOR_REVIEW_COUNT = 125
export const OMITTED_PRACTICE_IDS = [
  "practice-nail-test-q048",
  "practice-nail-test-n034",
] as const

export type PracticeSourceMeta = {
  id: PracticeSourceId
  title: LocalizedText
  /** ID prefix used to filter the approved pool (JSON order preserved). */
  idPrefix: string
  /** Approved question count for this source (must match questions.json). */
  approvedCount: number
  /** Public PDF of the original Word source, served from /public. */
  originalHref: string
  /** Soft accent for section cards (Tailwind class fragments). */
  accent: "violet" | "rose" | "cyan"
}

/** Fixed display order matching questions.json bank order. */
export const PRACTICE_SOURCES: readonly PracticeSourceMeta[] = [
  {
    id: "nail-test",
    title: { en: "Nail Test", zh: "美甲测试" },
    idPrefix: "practice-nail-test-",
    approvedCount: 156,
    originalHref: "/exam-quiz/originals/nail-test.pdf",
    accent: "violet",
  },
  {
    id: "theory-update",
    title: { en: "Theory Update", zh: "理论更新" },
    idPrefix: "practice-theory-update-",
    approvedCount: 28,
    originalHref: "/exam-quiz/originals/theory-update.pdf",
    accent: "rose",
  },
  {
    id: "comprehensive",
    title: { en: "Milady Comprehensive", zh: "Milady 综合" },
    idPrefix: "practice-comprehensive-",
    approvedCount: 164,
    originalHref: "/exam-quiz/originals/milady-comprehensive.pdf",
    accent: "cyan",
  },
] as const

export function getPracticeSource(sourceId: PracticeSourceId): PracticeSourceMeta {
  const source = PRACTICE_SOURCES.find((entry) => entry.id === sourceId)
  if (!source) throw new Error(`unknown practice source: ${sourceId}`)
  return source
}

export type SourceRangeCard = {
  offset: number
  start: number
  end: number
  count: number
}

/** 1-based range labels for consecutive chunks of `chunkSize` (last may be shorter). */
export function sourceRangeCards(
  totalCount: number,
  chunkSize: number = SOURCE_CHUNK_SIZE,
): SourceRangeCard[] {
  if (totalCount <= 0 || chunkSize <= 0) return []
  const cards: SourceRangeCard[] = []
  for (let offset = 0; offset < totalCount; offset += chunkSize) {
    const count = Math.min(chunkSize, totalCount - offset)
    cards.push({
      offset,
      start: offset + 1,
      end: offset + count,
      count,
    })
  }
  return cards
}
