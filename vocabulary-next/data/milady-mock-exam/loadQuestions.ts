export type MockExamChoice = { id: string; en: string; zh: string }

export type MockExamQuestion = {
  id: string
  question: { en: string; zh: string }
  choices: MockExamChoice[]
  correctChoiceId: string
}

type RawQuestion = {
  id: string
  section: string
  status: string
  question: { en: string; zh: string }
  choices: MockExamChoice[]
  correctChoice: string
}

type RawBankFile = { questions: RawQuestion[] }

function toMockExamQuestion(raw: RawQuestion): MockExamQuestion {
  return {
    id: raw.id,
    question: raw.question,
    choices: raw.choices,
    correctChoiceId: raw.correctChoice,
  }
}

export async function loadMockExamQuestions(): Promise<MockExamQuestion[]> {
  const data = (await import("@/question-bank/milady-review/questions.json")) as unknown as RawBankFile
  return data.questions
    .filter((question) => question.section === "comprehensive" && question.status === "approved")
    .map(toMockExamQuestion)
}
