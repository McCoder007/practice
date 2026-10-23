export type MockExamChoice = { id: string; en: string; zh: string }

export type MockExamQuestion = {
  id: string
  question: { en: string; zh: string }
  choices: MockExamChoice[]
  correctChoiceId: string
  /** Exam topic, for banks that draw a weighted test (Study by Exam Topic). */
  domainId?: string
}

type RawQuestion = {
  id: string
  section?: string
  domainId?: string
  status: string
  question: { en: string; zh: string }
  choices: MockExamChoice[]
  correctChoice: string
}

type RawBankFile = { questions: RawQuestion[] }

export type MockExamBankId = "milady-comprehensive" | "official-practice" | "kelly-nail-school" | "exam-topics"

export const MOCK_EXAM_BANKS: { id: MockExamBankId; name: { en: string; zh: string } }[] = [
  { id: "milady-comprehensive", name: { en: "Milady Comprehensive Exam", zh: "Milady 综合考试" } },
  { id: "official-practice", name: { en: "Official Practice", zh: "官方练习" } },
  { id: "kelly-nail-school", name: { en: "Kelly Nail School", zh: "Kelly 美甲学校" } },
  { id: "exam-topics", name: { en: "Study by Exam Topic (weighted 100)", zh: "按考试主题学习（按比例 100 题）" } },
]

/** Banks whose exam is a fresh 100-question draw weighted like the NIC exam, not the whole bank. */
export const WEIGHTED_MOCK_EXAM_BANKS: readonly MockExamBankId[] = ["exam-topics"]
export const WEIGHTED_MOCK_EXAM_SIZE = 100

export const DEFAULT_MOCK_EXAM_BANK: MockExamBankId = "milady-comprehensive"

function toMockExamQuestion(raw: RawQuestion): MockExamQuestion {
  return {
    id: raw.id,
    question: raw.question,
    choices: raw.choices,
    correctChoiceId: raw.correctChoice,
    ...(raw.domainId ? { domainId: raw.domainId } : {}),
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
    case "exam-topics": {
      const data = (await import("@/question-bank/nic-domain-practice/questions.json")) as unknown as RawBankFile
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
