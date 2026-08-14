export type LocalizedText = { en: string; zh: string }

export type ExamChoice = { id: string; en: string; zh: string }

export type ExamQuestion = {
  id: string
  question: LocalizedText
  choices: ExamChoice[]
  correctChoiceId: string
  explanation: LocalizedText
  lockPoint: LocalizedText
  sourceWarning?: LocalizedText
}

export type PracticeSourceId = "nail-test" | "theory-update" | "comprehensive"

export type SourceRangeMode = {
  kind: "source-range"
  sourceId: PracticeSourceId
  offset: number
}

export type QuizMode = "quick" | "practice" | SourceRangeMode

export function isSourceRangeMode(mode: QuizMode): mode is SourceRangeMode {
  return typeof mode === "object" && mode.kind === "source-range"
}

export function isRandomQuizMode(mode: QuizMode): mode is "quick" | "practice" {
  return mode === "quick" || mode === "practice"
}

export type ExamAnswerRecord = {
  questionId: string
  selectedChoiceId: string | null
  correct: boolean
  skipped: boolean
}

export type ExamSession = {
  mode: QuizMode
  questions: ExamQuestion[]
  answers: Record<string, ExamAnswerRecord>
}

export type ExamResultsSummary = {
  correct: number
  total: number
  missed: ExamAnswerRecord[]
}

export type HeldQuestion = {
  id: string
  question: LocalizedText
  choices: ExamChoice[]
  sourceAnswer: LocalizedText
  sources: { book: string; itemRef: string }[]
  reviewReason: LocalizedText
  authorityRefs: {
    source: string
    section: string
    printedPage?: string
    pdfPage?: number
  }[]
}

export type HeldQuestionBank = {
  title: LocalizedText
  notice: LocalizedText
  labels: {
    reviewReason: LocalizedText
    sourceAnswer: LocalizedText
  }
  count: number
  questions: HeldQuestion[]
}
