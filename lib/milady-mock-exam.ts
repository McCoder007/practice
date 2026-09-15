import type { MockExamQuestion } from "@/data/milady-mock-exam/loadQuestions"
import { fisherYatesShuffle } from "@/lib/nail-technician-qa-reel"

export const MOCK_EXAM_DURATION_SECONDS = 90 * 60

export type MockExamComment = { reason: string; text: string }

export type MockExamAnswerState = {
  selectedChoiceId: string | null
  flagged: boolean
  comment: MockExamComment | null
}

export type MockExamAnswers = Record<string, MockExamAnswerState>

export function buildMockExamSession(
  questions: readonly MockExamQuestion[],
  random: () => number = Math.random,
): MockExamQuestion[] {
  const shuffledQuestions = fisherYatesShuffle(questions, random)
  return shuffledQuestions.map((question) => ({
    ...question,
    choices: fisherYatesShuffle(question.choices, random),
  }))
}

export function createEmptyAnswers(questions: readonly MockExamQuestion[]): MockExamAnswers {
  const answers: MockExamAnswers = {}
  for (const question of questions) {
    answers[question.id] = { selectedChoiceId: null, flagged: false, comment: null }
  }
  return answers
}

export function scoreMockExamSession(
  questions: readonly MockExamQuestion[],
  answers: MockExamAnswers,
): { correct: number; total: number } {
  let correct = 0
  for (const question of questions) {
    if (answers[question.id]?.selectedChoiceId === question.correctChoiceId) {
      correct += 1
    }
  }
  return { correct, total: questions.length }
}

export function formatCountdown(totalSeconds: number): string {
  const clamped = Math.max(0, totalSeconds)
  const hours = Math.floor(clamped / 3600)
  const minutes = Math.floor((clamped % 3600) / 60)
  const seconds = clamped % 60
  const hh = String(hours).padStart(2, "0")
  const mm = String(minutes).padStart(2, "0")
  const ss = String(seconds).padStart(2, "0")
  return `${hh}:${mm}:${ss}`
}
