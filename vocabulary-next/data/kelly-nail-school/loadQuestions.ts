import type { ExamQuestion } from "@/data/exam-quiz/types"

type RawChoice = { id: string; en: string; zh: string }

type RawQuestion = {
  id: string
  question: { en: string; zh: string }
  choices: RawChoice[]
  correctChoice: string
  status: string
}

type RawBankFile = { questions: RawQuestion[] }

const EMPTY_TEXT = { en: "", zh: "" }

function toExamQuestion(raw: RawQuestion): ExamQuestion {
  return {
    id: raw.id,
    question: raw.question,
    choices: raw.choices,
    correctChoiceId: raw.correctChoice,
    explanation: EMPTY_TEXT,
    lockPoint: EMPTY_TEXT,
  }
}

export async function loadKellyNailSchoolQuestions(): Promise<ExamQuestion[]> {
  const data = (await import("@/question-bank/kelly-nail-school/questions.json")) as unknown as RawBankFile
  return data.questions.filter((question) => question.status === "approved").map(toExamQuestion)
}
