import type { ExamQuestion, LocalizedText } from "@/data/exam-quiz/types"

type RawChoice = { id: string; en: string; zh: string }

type RawQuestion = {
  id: string
  setId: string
  domainId: string
  question: LocalizedText
  choices: RawChoice[]
  correctChoice: string
  explanation: LocalizedText
  lockPoint: LocalizedText
  status: string
}

type RawBankFile = { questions: RawQuestion[] }

export type ExamTopicQuestion = ExamQuestion & { setId: string; domainId: string }

function toExamQuestion(raw: RawQuestion): ExamTopicQuestion {
  return {
    id: raw.id,
    setId: raw.setId,
    domainId: raw.domainId,
    question: raw.question,
    choices: raw.choices,
    correctChoiceId: raw.correctChoice,
    explanation: raw.explanation,
    lockPoint: raw.lockPoint,
  }
}

/** Shipped Study by Exam Topic questions, in topic → set → question order. */
export async function loadExamTopicQuestions(): Promise<ExamTopicQuestion[]> {
  const data = (await import("@/question-bank/nic-domain-practice/questions.json")) as unknown as RawBankFile
  return data.questions.filter((question) => question.status === "approved").map(toExamQuestion)
}
