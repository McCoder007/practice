import { SOURCE_CHUNK_SIZE, sourceRangeCards } from "../exam-quiz/catalog.ts"
import type { LocalizedText, PracticeSourceId } from "../exam-quiz/types.ts"

export const NAIL_EXAM_PRACTICE_TITLE: LocalizedText = {
  en: "Nail Exam Practice",
  zh: "美甲考试练习",
}

export const NAIL_EXAM_PRACTICE_HREF = "/nail-exam-practice"

export const NAIL_EXAM_PRACTICE_DESCRIPTION: LocalizedText = {
  en: "Choose a question bank, then Multiple Choice or Study Cards",
  zh: "选择题库，再用选择题或学习卡练习",
}

export const STUDY_CARDS_HELPER: LocalizedText = {
  en: "Read the question, then reveal the answer.",
  zh: "先看题目，再揭晓答案。",
}

export const LEARNER_FACING_QUESTION_COUNT = 448

export type StudyFormatId = "multiple-choice" | "study-cards"
export type NailExamBankId = "official" | "bank-a" | "bank-b" | "bank-c"
export type NailExamPoolId = "official" | "practice"

export type NailExamRandomOption = {
  id: "quick" | "practice"
  count: number
  title: LocalizedText
}

export type NailExamBank = {
  id: NailExamBankId
  publicName: LocalizedText
  href: string
  /** Maintainer-facing source title. Not a primary learner label. */
  internalSourceName: string
  pool: NailExamPoolId
  idPrefix: string
  practiceSourceId?: PracticeSourceId
  approvedCount: number
  groupCount: number
  accent: "violet" | "rose" | "cyan" | "amber"
  formats: {
    multipleChoice: true
    studyCards: true
  }
  randomOptions: readonly NailExamRandomOption[]
  originalHref?: string
  originalViewerHref?: string
}

function groupCountFor(approvedCount: number): number {
  return sourceRangeCards(approvedCount, SOURCE_CHUNK_SIZE).length
}

export const NAIL_EXAM_BANKS: readonly NailExamBank[] = [
  {
    id: "official",
    publicName: { en: "Official Practice", zh: "官方练习" },
    href: "/nail-exam-practice/official",
    internalSourceName: "Official Practice pool",
    pool: "official",
    idPrefix: "official-practice-",
    approvedCount: 100,
    groupCount: groupCountFor(100),
    accent: "violet",
    formats: { multipleChoice: true, studyCards: true },
    randomOptions: [
      { id: "quick", count: 10, title: { en: "Quick practice", zh: "快速练习" } },
      { id: "practice", count: 25, title: { en: "Practice set", zh: "练习套题" } },
    ],
  },
  {
    id: "bank-a",
    publicName: { en: "Practice Bank A", zh: "练习题库 A" },
    href: "/nail-exam-practice/bank-a",
    internalSourceName: "Nail Test",
    pool: "practice",
    idPrefix: "practice-nail-test-",
    practiceSourceId: "nail-test",
    approvedCount: 156,
    groupCount: groupCountFor(156),
    accent: "rose",
    formats: { multipleChoice: true, studyCards: true },
    randomOptions: [],
    originalHref: "/exam-quiz/originals/nail-test.pdf",
    originalViewerHref: "/exam-quiz/original/nail-test",
  },
  {
    id: "bank-b",
    publicName: { en: "Practice Bank B", zh: "练习题库 B" },
    href: "/nail-exam-practice/bank-b",
    internalSourceName: "Theory Update",
    pool: "practice",
    idPrefix: "practice-theory-update-",
    practiceSourceId: "theory-update",
    approvedCount: 28,
    groupCount: groupCountFor(28),
    accent: "cyan",
    formats: { multipleChoice: true, studyCards: true },
    randomOptions: [],
    originalHref: "/exam-quiz/originals/theory-update.pdf",
    originalViewerHref: "/exam-quiz/original/theory-update",
  },
  {
    id: "bank-c",
    publicName: { en: "Practice Bank C", zh: "练习题库 C" },
    href: "/nail-exam-practice/bank-c",
    internalSourceName: "Milady Comprehensive",
    pool: "practice",
    idPrefix: "practice-comprehensive-",
    practiceSourceId: "comprehensive",
    approvedCount: 164,
    groupCount: groupCountFor(164),
    accent: "amber",
    formats: { multipleChoice: true, studyCards: true },
    randomOptions: [],
    originalHref: "/exam-quiz/originals/milady-comprehensive.pdf",
    originalViewerHref: "/exam-quiz/original/comprehensive",
  },
] as const

export const MIXED_PRACTICE = {
  title: { en: "Mixed Practice", zh: "混合练习" } satisfies LocalizedText,
  href: "/nail-exam-practice/mixed",
  pool: "practice" as const,
  description: {
    en: "Random questions from Practice Banks A, B, and C",
    zh: "从练习题库 A、B、C 随机抽题",
  } satisfies LocalizedText,
  randomOptions: [
    { id: "quick" as const, count: 10, title: { en: "Quick practice", zh: "快速练习" } },
    { id: "practice" as const, count: 30, title: { en: "Practice set", zh: "练习套题" } },
  ],
}

export const STUDY_FORMATS: readonly {
  id: StudyFormatId
  title: LocalizedText
}[] = [
  { id: "multiple-choice", title: { en: "Multiple Choice", zh: "选择题" } },
  { id: "study-cards", title: { en: "Study Cards", zh: "学习卡" } },
]

export const STUDY_FORMAT_PREFERENCE_KEY = "nail-exam-practice-study-format"

/** Old learner routes that must not show textbook sections or source-named banks. */
export const LEGACY_EXAM_PRACTICE_REDIRECTS = [
  { from: "/exam-quiz", to: NAIL_EXAM_PRACTICE_HREF },
  { from: "/official-exam-quiz", to: "/nail-exam-practice/official" },
  { from: "/nail-technician-qa-reel", to: "/nail-exam-practice/bank-a" },
] as const

export function getNailExamBank(bankId: NailExamBankId): NailExamBank {
  const bank = NAIL_EXAM_BANKS.find((entry) => entry.id === bankId)
  if (!bank) throw new Error(`unknown nail exam bank: ${bankId}`)
  return bank
}

export function bankHrefForPracticeSource(sourceId: PracticeSourceId): string {
  const bank = NAIL_EXAM_BANKS.find((entry) => entry.practiceSourceId === sourceId)
  return bank?.href ?? NAIL_EXAM_PRACTICE_HREF
}

export function bankGroupCards(bank: Pick<NailExamBank, "approvedCount">) {
  return sourceRangeCards(bank.approvedCount, SOURCE_CHUNK_SIZE)
}

export function orderedQuestionsForBank<T extends { id: string }>(
  pool: readonly T[],
  bank: Pick<NailExamBank, "idPrefix" | "approvedCount">,
): T[] {
  return pool.filter((question) => question.id.startsWith(bank.idPrefix))
}

export function sliceBankGroup<T extends { id: string }>(
  pool: readonly T[],
  bank: Pick<NailExamBank, "idPrefix">,
  offset: number,
  chunkSize: number = SOURCE_CHUNK_SIZE,
): T[] {
  if (offset < 0 || chunkSize <= 0) return []
  return pool
    .filter((question) => question.id.startsWith(bank.idPrefix))
    .slice(offset, offset + chunkSize)
}

export function bankSummaryLine(bank: NailExamBank): LocalizedText {
  return {
    en: `${bank.approvedCount} questions · ${bank.groupCount} groups`,
    zh: `${bank.approvedCount} 道题目 · ${bank.groupCount} 组`,
  }
}

export function groupLabel(start: number, end: number): LocalizedText {
  return {
    en: `Questions ${start}–${end}`,
    zh: `第 ${start}–${end} 题`,
  }
}

export function sessionGroupLabel(bank: NailExamBank, start: number, end: number): LocalizedText {
  return {
    en: `${bank.publicName.en} Q${start}–${end}`,
    zh: `${bank.publicName.zh} 第 ${start}–${end} 题`,
  }
}
