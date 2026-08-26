import type { ExamQuestion } from "@/data/exam-quiz/types"

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

type RawBankFile = { questions: RawQuestion[] }

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
  const data = (await import("@/question-bank/official-practice/questions.json")) as unknown as RawBankFile
  return data.questions.filter((question) => question.status === "approved").map(toExamQuestion)
}
