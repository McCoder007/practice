import { getPracticeSource, SOURCE_CHUNK_SIZE } from "../data/exam-quiz/catalog.ts"
import type {
  ExamAnswerRecord,
  ExamQuestion,
  ExamResultsSummary,
  ExamSession,
  PracticeSourceId,
} from "../data/exam-quiz/types.ts"
import { fisherYatesShuffle } from "./nail-technician-qa-reel.ts"

export { fisherYatesShuffle }

export type ExamReelGestureOutcome = "swipeNext" | "swipePrevious" | "cancel"

export type ExamReelGestureInput = {
  deltaX: number
  deltaY: number
  swipeThresholdPx: number
}

export function classifyExamReelGesture({
  deltaX,
  deltaY,
  swipeThresholdPx,
}: ExamReelGestureInput): ExamReelGestureOutcome {
  if (deltaY >= swipeThresholdPx) return "swipeNext"
  if (deltaY <= -swipeThresholdPx) return "swipePrevious"
  void deltaX
  return "cancel"
}

export function drawPracticeSession<T extends { id: string }>(
  pool: readonly T[],
  size: number,
  random: () => number = Math.random,
): T[] {
  const unique: T[] = []
  const seen = new Set<string>()
  for (const item of pool) {
    if (seen.has(item.id)) continue
    seen.add(item.id)
    unique.push(item)
  }
  const shuffled = fisherYatesShuffle(unique, random)
  return shuffled.slice(0, Math.min(size, shuffled.length))
}

export function shuffleQuestionChoices(
  questions: readonly ExamQuestion[],
  random: () => number = Math.random,
): ExamQuestion[] {
  return questions.map((question) => ({
    ...question,
    choices: fisherYatesShuffle(question.choices, random),
  }))
}

export function choicePositionLabel(
  choices: readonly { id: string }[],
  choiceId: string,
): string {
  const position = choices.findIndex((choice) => choice.id === choiceId)
  return position < 0 ? "" : String.fromCharCode("A".charCodeAt(0) + position)
}

/** Filter by source ID prefix and take a contiguous slice in bank (JSON) order — not shuffled. */
export function sliceSourceRange<T extends { id: string }>(
  pool: readonly T[],
  sourceId: PracticeSourceId,
  offset: number,
  chunkSize: number = SOURCE_CHUNK_SIZE,
): T[] {
  const { idPrefix } = getPracticeSource(sourceId)
  const sourceQuestions = pool.filter((question) => question.id.startsWith(idPrefix))
  if (offset < 0 || chunkSize <= 0) return []
  return sourceQuestions.slice(offset, offset + chunkSize)
}

export function isQuestionRevealed(answer: ExamAnswerRecord | undefined): boolean {
  return Boolean(answer)
}

export function canAdvanceNext(answer: ExamAnswerRecord | undefined): boolean {
  return isQuestionRevealed(answer)
}

export function visibleChoicesAfterReveal<T extends { id: string }>(
  choices: readonly T[],
  correctChoiceId: string,
  selectedChoiceId: string | null,
): T[] {
  return choices.filter((choice) => choice.id === correctChoiceId || choice.id === selectedChoiceId)
}

export function scoreSession(session: ExamSession): { correct: number; total: number } {
  const total = session.questions.length
  const correct = session.questions.reduce((sum, question) => {
    const answer = session.answers[question.id]
    return sum + (answer?.correct ? 1 : 0)
  }, 0)

  return { correct, total }
}

export function summarizeSession(session: ExamSession): ExamResultsSummary {
  const { correct, total } = scoreSession(session)

  const missed: ExamAnswerRecord[] = session.questions
    .map((question) => session.answers[question.id])
    .filter((answer): answer is ExamAnswerRecord => Boolean(answer) && !answer.correct)

  return {
    correct,
    total,
    missed,
  }
}

export function forbiddenIdsInSession(
  session: Pick<ExamSession, "questions" | "answers">,
  forbiddenIds: ReadonlySet<string> | readonly string[],
): string[] {
  const forbidden = forbiddenIds instanceof Set ? forbiddenIds : new Set(forbiddenIds)
  const found = new Set<string>()
  for (const question of session.questions) {
    if (forbidden.has(question.id)) found.add(question.id)
  }
  for (const questionId of Object.keys(session.answers)) {
    if (forbidden.has(questionId)) found.add(questionId)
  }
  return [...found]
}

export function assertPlayablePool(
  pool: readonly { id: string }[],
  forbiddenIds: ReadonlySet<string> | readonly string[],
): void {
  const forbidden = forbiddenIds instanceof Set ? forbiddenIds : new Set(forbiddenIds)
  const overlap = pool.filter((item) => forbidden.has(item.id)).map((item) => item.id)
  if (overlap.length) {
    throw new Error(`playable pool contains held or omitted IDs: ${overlap.join(", ")}`)
  }
}
