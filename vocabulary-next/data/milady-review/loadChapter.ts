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

/** No authored teaching copy exists for this pool (straight scored source
 * transcription, not a distractor-authoring pipeline) — explanation and
 * lockPoint are defaulted to empty so ExamQuestion's required fields are
 * satisfied without inventing content. The only runtime reader of those
 * fields (multiple-choice-session's TTS preloader) already skips empty
 * strings. */
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

export async function loadMiladyReviewQuestions(): Promise<ExamQuestion[]> {
  const data = (await import("@/question-bank/milady-review/questions.json")) as unknown as RawBankFile
  return data.questions.filter((question) => question.status === "approved").map(toExamQuestion)
}
