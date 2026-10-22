export type MockExamChoice = { id: string; en: string; zh: string }

export type MockExamQuestion = {
  id: string
  question: { en: string; zh: string }
  choices: MockExamChoice[]
  correctChoiceId: string
}

type RawQuestion = {
  id: string
  section?: string
  status: string
  question: { en: string; zh: string }
  choices: MockExamChoice[]
  correctChoice: string
}

type RawBankFile = { questions: RawQuestion[] }

export type MockExamBankId = "milady-comprehensive" | "official-practice" | "kelly-nail-school"

export const MOCK_EXAM_BANKS: { id: MockExamBankId; name: { en: string; zh: string } }[] = [
  { id: "milady-comprehensive", name: { en: "Milady Comprehensive Exam", zh: "Milady 综合考试" } },
  { id: "official-practice", name: { en: "Official Practice", zh: "官方练习" } },
  { id: "kelly-nail-school", name: { en: "Kelly Nail School", zh: "Kelly 美甲学校" } },
]

export const DEFAULT_MOCK_EXAM_BANK: MockExamBankId = "milady-comprehensive"

function toMockExamQuestion(raw: RawQuestion): MockExamQuestion {
  return {
    id: raw.id,
    question: raw.question,
    choices: raw.choices,
    correctChoiceId: raw.correctChoice,
  }
}

async function loadRawQuestions(bankId: MockExamBankId): Promise<RawQuestion[]> {
  switch (bankId) {
    case "milady-comprehensive": {
      const data = (await import("@/question-bank/milady-review/questions.json")) as unknown as RawBankFile
      return data.questions.filter((question) => question.section === "comprehensive")
    }
    case "official-practice": {
      const data = (await import("@/question-bank/official-practice/questions.json")) as unknown as RawBankFile
      return data.questions
    }
    case "kelly-nail-school": {
      const data = (await import("@/question-bank/kelly-nail-school/questions.json")) as unknown as RawBankFile
      return data.questions
    }
  }
}

export async function loadMockExamQuestions(
  bankId: MockExamBankId = DEFAULT_MOCK_EXAM_BANK,
): Promise<MockExamQuestion[]> {
  const questions = await loadRawQuestions(bankId)
  return questions.filter((question) => question.status === "approved").map(toMockExamQuestion)
}
