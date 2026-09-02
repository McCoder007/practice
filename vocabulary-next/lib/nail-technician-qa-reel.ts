import {
  getPracticeSource,
  sourceRangeCards,
  type SourceRangeCard,
} from "../data/exam-quiz/catalog.ts"
import { sliceBankGroup } from "../data/nail-exam-practice/catalog.ts"
import type { ExamQuestion } from "../data/exam-quiz/types.ts"
import { sliceSourceRange } from "./exam-quiz-reel.ts"

export type QaCard = {
  id: string
  question: { en: string; zh: string }
  /** Stable keyed choice ID from the canonical multiple-choice question. */
  answerId: string
  answer: { en: string; zh: string }
}

export type QaBankMode = {
  offset: number
}

export type GestureOutcome =
  | "swipeNext"
  | "swipePrevious"
  | "tapReveal"
  | "cancel"

export type GestureInput = {
  deltaX: number
  deltaY: number
  startedInAnswerRegion: boolean
  swipeThresholdPx: number
}

export const TAP_TOLERANCE_PX = 24

export function classifyQaReelGesture({
  deltaX,
  deltaY,
  startedInAnswerRegion,
  swipeThresholdPx,
}: GestureInput): GestureOutcome {
  if (deltaY >= swipeThresholdPx) return "swipeNext"
  if (deltaY <= -swipeThresholdPx) return "swipePrevious"

  if (
    startedInAnswerRegion &&
    Math.abs(deltaX) <= TAP_TOLERANCE_PX &&
    Math.abs(deltaY) <= TAP_TOLERANCE_PX
  ) {
    return "tapReveal"
  }

  return "cancel"
}

export function fisherYatesShuffle<T>(
  source: readonly T[],
  random: () => number = Math.random,
): T[] {
  const shuffled = [...source]

  for (let index = shuffled.length - 1; index > 0; index -= 1) {
    const swapIndex = Math.floor(random() * (index + 1))
    ;[shuffled[index], shuffled[swapIndex]] = [
      shuffled[swapIndex],
      shuffled[index],
    ]
  }

  return shuffled
}

export function examQuestionToQaCard(question: ExamQuestion): QaCard {
  if (!question.id?.trim()) {
    throw new Error("missing question id")
  }

  const keyedId = question.correctChoiceId
  if (!keyedId?.trim()) {
    throw new Error(`missing keyed correct-choice id for question ${question.id}`)
  }

  const choiceIds = question.choices.map((choice) => choice.id)
  if (new Set(choiceIds).size !== choiceIds.length) {
    throw new Error(`duplicate choice ids for question ${question.id}`)
  }

  const matches = question.choices.filter((choice) => choice.id === keyedId)
  if (matches.length !== 1) {
    throw new Error(`keyed correct choice does not resolve uniquely for question ${question.id}`)
  }

  const correctChoice = matches[0]
  if (!correctChoice.en.trim() || !correctChoice.zh.trim()) {
    throw new Error(`empty translated answer for question ${question.id}`)
  }

  return {
    id: question.id,
    question: question.question,
    answerId: correctChoice.id,
    answer: { en: correctChoice.en, zh: correctChoice.zh },
  }
}

export function sliceNailTestQaRange(
  pool: readonly ExamQuestion[],
  offset: number,
): QaCard[] {
  return sliceSourceRange(pool, "nail-test", offset).map(examQuestionToQaCard)
}

export function sliceStudyCardsRange(
  pool: readonly ExamQuestion[],
  idPrefix: string,
  offset: number,
): QaCard[] {
  return sliceBankGroup(pool, { idPrefix }, offset).map(examQuestionToQaCard)
}

export function nailTestQaRangeCards(): SourceRangeCard[] {
  const { approvedCount } = getPracticeSource("nail-test")
  return sourceRangeCards(approvedCount)
}

export function qaBankLabel(offset: number): { en: string; zh: string } {
  const source = getPracticeSource("nail-test")
  const range = nailTestQaRangeCards().find((card) => card.offset === offset)
  if (!range) {
    return { en: source.title.en, zh: source.title.zh }
  }
  return {
    en: `${source.title.en} Q${range.start}–${range.end}`,
    zh: `${source.title.zh} 第 ${range.start}–${range.end} 题`,
  }
}

export function canQaAdvanceNext(isRevealed: boolean): boolean {
  return isRevealed
}
