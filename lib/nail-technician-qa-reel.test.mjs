import assert from "node:assert/strict"
import test from "node:test"

import {
  TAP_TOLERANCE_PX,
  classifyQaReelGesture,
  examQuestionToQaCard,
  fisherYatesShuffle,
  nailTestQaRangeCards,
  sliceNailTestQaRange,
} from "./nail-technician-qa-reel.ts"

const sampleExamQuestion = {
  id: "practice-nail-test-q001",
  question: {
    en: "At what angle should an electric file be held to cut or shorten acrylic?",
    zh: "用电动磨甲机切割或缩短丙烯酸甲时，应保持什么角度？",
  },
  choices: [
    { id: "a", en: "90 degrees", zh: "90度" },
    { id: "b", en: "30 degrees", zh: "30度" },
  ],
  correctChoiceId: "a",
  explanation: { en: "Cut at 90 degrees.", zh: "切割时保持90度。" },
  lockPoint: { en: "90 degrees for cutting.", zh: "切割用90度。" },
}

test("examQuestionToQaCard maps stem and correct choice", () => {
  const card = examQuestionToQaCard(sampleExamQuestion)

  assert.equal(card.id, "practice-nail-test-q001")
  assert.equal(card.question.en, sampleExamQuestion.question.en)
  assert.equal(card.answer.en, "90 degrees")
  assert.equal(card.answer.zh, "90度")
})

test("nailTestQaRangeCards produces eight banks ending with 16 questions", () => {
  const cards = nailTestQaRangeCards()

  assert.equal(cards.length, 8)
  assert.deepEqual(cards[0], { offset: 0, start: 1, end: 20, count: 20 })
  assert.deepEqual(cards[6], { offset: 120, start: 121, end: 140, count: 20 })
  assert.deepEqual(cards[7], { offset: 140, start: 141, end: 156, count: 16 })
})

test("sliceNailTestQaRange returns ordered cards for a bank", () => {
  const pool = Array.from({ length: 25 }, (_, index) => ({
    ...sampleExamQuestion,
    id: `practice-nail-test-q${String(index + 1).padStart(3, "0")}`,
  }))

  const firstBank = sliceNailTestQaRange(pool, 0)
  const secondBank = sliceNailTestQaRange(pool, 20)

  assert.equal(firstBank.length, 20)
  assert.equal(secondBank.length, 5)
  assert.equal(firstBank[0].id, "practice-nail-test-q001")
  assert.equal(secondBank[0].id, "practice-nail-test-q021")
})

test("Fisher-Yates returns every item once without mutating its source", () => {
  const source = Array.from({ length: 227 }, (_, id) => ({ id }))
  const originalIds = source.map(({ id }) => id)
  const randomValues = [0.12, 0.94, 0.33, 0.71]
  let randomIndex = 0

  const shuffled = fisherYatesShuffle(
    source,
    () => randomValues[randomIndex++ % randomValues.length],
  )

  assert.notStrictEqual(shuffled, source)
  assert.deepEqual(source.map(({ id }) => id), originalIds)
  assert.deepEqual(
    shuffled.map(({ id }) => id).sort((a, b) => a - b),
    originalIds,
  )
})

test("gesture classification gives completed swipes priority", () => {
  assert.equal(
    classifyQaReelGesture({
      deltaX: 0,
      deltaY: 80,
      startedInAnswerRegion: true,
      swipeThresholdPx: 80,
    }),
    "swipeNext",
  )
  assert.equal(
    classifyQaReelGesture({
      deltaX: 0,
      deltaY: -80,
      startedInAnswerRegion: true,
      swipeThresholdPx: 80,
    }),
    "swipePrevious",
  )
})

test("only answer-region movement within the tap tolerance reveals", () => {
  const base = {
    startedInAnswerRegion: true,
    swipeThresholdPx: 80,
  }

  assert.equal(
    classifyQaReelGesture({
      ...base,
      deltaX: TAP_TOLERANCE_PX,
      deltaY: TAP_TOLERANCE_PX,
    }),
    "tapReveal",
  )
  assert.equal(
    classifyQaReelGesture({
      ...base,
      deltaX: TAP_TOLERANCE_PX + 0.01,
      deltaY: 0,
    }),
    "cancel",
  )
  assert.equal(
    classifyQaReelGesture({
      ...base,
      deltaX: 0,
      deltaY: TAP_TOLERANCE_PX + 0.01,
    }),
    "cancel",
  )
  assert.equal(
    classifyQaReelGesture({
      ...base,
      deltaX: 0,
      deltaY: 0,
      startedInAnswerRegion: false,
    }),
    "cancel",
  )
})
