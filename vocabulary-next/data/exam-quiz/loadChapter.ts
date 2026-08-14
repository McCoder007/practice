import type { ExamQuestion, HeldQuestionBank } from "./types"

type RawChoice = { id: string; en: string; zh: string }

type RawQuestion = {
  id: string
  question: { en: string; zh: string }
  choices: RawChoice[]
  correctChoice: string
  explanation: { en: string; zh: string }
  lockPoint: { en: string; zh: string }
  sourceWarning?: { en: string; zh: string }
  status: string
}

type RawBankFile = {
  questions: RawQuestion[]
}

function toExamQuestion(raw: RawQuestion): ExamQuestion {
  return {
    id: raw.id,
    question: raw.question,
    choices: raw.choices,
    correctChoiceId: raw.correctChoice,
    explanation: raw.explanation,
    lockPoint: raw.lockPoint,
    sourceWarning: raw.sourceWarning,
  }
}

export async function loadPracticeQuestions(): Promise<ExamQuestion[]> {
  const data = (await import("@/question-bank/practice/questions.json")) as unknown as RawBankFile
  return data.questions.filter((question) => question.status === "approved").map(toExamQuestion)
}

export async function loadQuestionsToReview(): Promise<HeldQuestionBank> {
  const data = (await import("@/question-bank/practice/questions-to-review.json")) as unknown as HeldQuestionBank
  return {
    title: data.title,
    notice: data.notice,
    labels: data.labels,
    count: data.count,
    questions: data.questions,
  }
}
