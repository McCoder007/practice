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

export const LEARNER_FACING_QUESTION_COUNT = 448

export type StudyFormatId = "multiple-choice" | "study-cards"
export type NailExamBankId =
  | "official"
  | "bank-a"
  | "bank-b"
  | "bank-c"
  | `milady-foundations-${string}`
  | `milady-nails-${string}`
  | "milady-comprehensive"
export type NailExamPoolId = "official" | "practice" | "milady-review"

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

export type MiladyReviewSectionId = "comprehensive" | "foundations" | "nails"
type MiladyReviewChapterSectionId = "foundations" | "nails"

export const MILADY_REVIEW_TITLE: LocalizedText = { en: "Milady Exam Review", zh: "Milady 考试复习" }
export const MILADY_REVIEW_HREF = "/nail-exam-practice/milady-review"
export const MILADY_REVIEW_DESCRIPTION: LocalizedText = {
  en: "Every chapter review test from the Milady Exam Review guide, 8th edition",
  zh: "《Milady 考试复习指南》第 8 版的全部章节复习测试",
}
export const MILADY_REVIEW_SOURCE_NAME = "Exam Review for Milady Standard Nail Technology, 8th Edition"

type MiladyReviewChapterInfo = { chapter: number; title: LocalizedText; count: number }

/** Chapter titles and counts, matching question-bank/milady-review/questions.json exactly. */
const MILADY_FOUNDATIONS_CHAPTERS: readonly MiladyReviewChapterInfo[] = [
  { chapter: 1, title: { en: "Life Skills", zh: "生活技能" }, count: 29 },
  { chapter: 2, title: { en: "Professional Image", zh: "职业形象" }, count: 25 },
  { chapter: 3, title: { en: "Communicating for Success", zh: "成功沟通" }, count: 32 },
  { chapter: 4, title: { en: "The Healthy Professional", zh: "健康的专业人员" }, count: 39 },
  { chapter: 5, title: { en: "Infection Control", zh: "感染控制" }, count: 74 },
  { chapter: 6, title: { en: "Chemistry & Chemical Safety", zh: "化学与化学品安全" }, count: 43 },
  { chapter: 7, title: { en: "Electricity & Electrical Safety", zh: "电学与用电安全" }, count: 36 },
  { chapter: 8, title: { en: "Career Planning", zh: "职业规划" }, count: 37 },
  { chapter: 9, title: { en: "On the Job", zh: "在职场" }, count: 39 },
  { chapter: 10, title: { en: "The Beauty Business", zh: "美容企业经营" }, count: 33 },
] as const

const MILADY_NAILS_CHAPTERS: readonly MiladyReviewChapterInfo[] = [
  { chapter: 1, title: { en: "History and Career Opportunities", zh: "历史与职业机会" }, count: 26 },
  { chapter: 2, title: { en: "General Anatomy and Physiology", zh: "人体解剖学与生理学概论" }, count: 56 },
  { chapter: 3, title: { en: "Skin Structure, Disorders, and Diseases", zh: "皮肤结构、病症与疾病" }, count: 59 },
  { chapter: 4, title: { en: "Nail Structure, Disorders, and Diseases", zh: "指甲结构、病症与疾病" }, count: 49 },
  { chapter: 5, title: { en: "Nail Product Chemistry", zh: "美甲产品化学" }, count: 52 },
  { chapter: 6, title: { en: "Manicuring", zh: "手部护理" }, count: 86 },
  { chapter: 7, title: { en: "Pedicuring", zh: "足部美甲护理" }, count: 79 },
  { chapter: 8, title: { en: "Electric Filing", zh: "电动磨甲" }, count: 47 },
  { chapter: 9, title: { en: "Nail Tips and Forms", zh: "甲片与甲模" }, count: 40 },
  { chapter: 10, title: { en: "Nail Resin Systems", zh: "美甲树脂系统" }, count: 42 },
  { chapter: 11, title: { en: "Monomer Liquid and Polymer Powder Nail Enhancements", zh: "单体液与聚合物粉美甲增强" }, count: 42 },
  { chapter: 12, title: { en: "Gel Nail Enhancements", zh: "凝胶美甲增强" }, count: 43 },
  { chapter: 13, title: { en: "Nail Art", zh: "美甲彩绘" }, count: 40 },
] as const

function miladyChapterBankId(section: MiladyReviewChapterSectionId, chapter: number): NailExamBankId {
  return `milady-${section}-${String(chapter).padStart(2, "0")}` as NailExamBankId
}

function miladyChapterHref(section: MiladyReviewChapterSectionId, chapter: number): string {
  return `${MILADY_REVIEW_HREF}/${section}/${chapter}`
}

function buildMiladyChapterBank(
  section: MiladyReviewChapterSectionId,
  info: MiladyReviewChapterInfo,
  accent: NailExamBank["accent"],
): NailExamBank {
  const chapterLabel = String(info.chapter).padStart(2, "0")
  return {
    id: miladyChapterBankId(section, info.chapter),
    publicName: {
      en: `Ch. ${info.chapter} — ${info.title.en}`,
      zh: `第 ${info.chapter} 章 — ${info.title.zh}`,
    },
    href: miladyChapterHref(section, info.chapter),
    internalSourceName: `${MILADY_REVIEW_SOURCE_NAME} — ${section} ch.${info.chapter}`,
    pool: "milady-review",
    idPrefix: `milady-review-${section}-${chapterLabel}-`,
    approvedCount: info.count,
    groupCount: groupCountFor(info.count),
    accent,
    formats: { multipleChoice: true, studyCards: true },
    randomOptions: [],
  }
}

const MILADY_FOUNDATIONS_BANKS: readonly NailExamBank[] = MILADY_FOUNDATIONS_CHAPTERS.map((info) =>
  buildMiladyChapterBank("foundations", info, "violet"),
)
const MILADY_NAILS_BANKS: readonly NailExamBank[] = MILADY_NAILS_CHAPTERS.map((info) =>
  buildMiladyChapterBank("nails", info, "rose"),
)

const MILADY_COMPREHENSIVE_BANK: NailExamBank = {
  id: "milady-comprehensive",
  publicName: { en: "Comprehensive Exam", zh: "综合考试" },
  href: `${MILADY_REVIEW_HREF}/comprehensive`,
  internalSourceName: `${MILADY_REVIEW_SOURCE_NAME} — Comprehensive Exam`,
  pool: "milady-review",
  idPrefix: "milady-review-comprehensive-",
  approvedCount: 100,
  groupCount: groupCountFor(100),
  accent: "cyan",
  formats: { multipleChoice: true, studyCards: true },
  randomOptions: [],
}

/** All Milady Exam Review chapter/comprehensive banks. Not shown on the top-level
 * hub directly — routed through the section-picker and chapter-list pages instead. */
export const MILADY_REVIEW_BANKS: readonly NailExamBank[] = [
  MILADY_COMPREHENSIVE_BANK,
  ...MILADY_FOUNDATIONS_BANKS,
  ...MILADY_NAILS_BANKS,
]

export type MiladyReviewSectionCard = {
  id: MiladyReviewSectionId
  title: LocalizedText
  href: string
  summary: LocalizedText
}

function sumCounts(chapters: readonly MiladyReviewChapterInfo[]): number {
  return chapters.reduce((total, info) => total + info.count, 0)
}

export const MILADY_REVIEW_SECTIONS: readonly MiladyReviewSectionCard[] = [
  {
    id: "comprehensive",
    title: MILADY_COMPREHENSIVE_BANK.publicName,
    href: MILADY_COMPREHENSIVE_BANK.href,
    summary: { en: "100 questions", zh: "100 道题目" },
  },
  {
    id: "foundations",
    title: { en: "Foundations", zh: "基础篇" },
    href: `${MILADY_REVIEW_HREF}/foundations`,
    summary: {
      en: `${MILADY_FOUNDATIONS_CHAPTERS.length} chapters · ${sumCounts(MILADY_FOUNDATIONS_CHAPTERS)} questions`,
      zh: `${MILADY_FOUNDATIONS_CHAPTERS.length} 章 · ${sumCounts(MILADY_FOUNDATIONS_CHAPTERS)} 道题目`,
    },
  },
  {
    id: "nails",
    title: { en: "Nails", zh: "美甲篇" },
    href: `${MILADY_REVIEW_HREF}/nails`,
    summary: {
      en: `${MILADY_NAILS_CHAPTERS.length} chapters · ${sumCounts(MILADY_NAILS_CHAPTERS)} questions`,
      zh: `${MILADY_NAILS_CHAPTERS.length} 章 · ${sumCounts(MILADY_NAILS_CHAPTERS)} 道题目`,
    },
  },
] as const

export type MiladyReviewChapterCard = {
  chapter: number
  title: LocalizedText
  href: string
  questionCount: number
  groupCount: number
}

export function miladyReviewChapterCards(
  section: MiladyReviewChapterSectionId,
): readonly MiladyReviewChapterCard[] {
  const chapters = section === "foundations" ? MILADY_FOUNDATIONS_CHAPTERS : MILADY_NAILS_CHAPTERS
  return chapters.map((info) => ({
    chapter: info.chapter,
    title: info.title,
    href: miladyChapterHref(section, info.chapter),
    questionCount: info.count,
    groupCount: groupCountFor(info.count),
  }))
}

export function miladyReviewSectionTitle(section: MiladyReviewChapterSectionId): LocalizedText {
  return section === "foundations"
    ? { en: "Foundations", zh: "基础篇" }
    : { en: "Nails", zh: "美甲篇" }
}

export function getMiladyReviewChapterBankId(
  section: MiladyReviewChapterSectionId,
  chapter: number,
): NailExamBankId {
  return miladyChapterBankId(section, chapter)
}

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

/** Old learner routes that must not show textbook sections or source-named banks. */
export const LEGACY_EXAM_PRACTICE_REDIRECTS = [
  { from: "/exam-quiz", to: NAIL_EXAM_PRACTICE_HREF },
  { from: "/official-exam-quiz", to: "/nail-exam-practice/official" },
  { from: "/nail-technician-qa-reel", to: "/nail-exam-practice/bank-a" },
] as const

export function getNailExamBank(bankId: NailExamBankId): NailExamBank {
  const bank =
    NAIL_EXAM_BANKS.find((entry) => entry.id === bankId) ??
    MILADY_REVIEW_BANKS.find((entry) => entry.id === bankId)
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
