import assert from "node:assert/strict"
import { readFileSync } from "node:fs"
import { dirname, join } from "node:path"
import test from "node:test"
import { fileURLToPath } from "node:url"

import {
  APPROVED_PRACTICE_COUNT,
  HELD_FOR_REVIEW_COUNT,
  OMITTED_PRACTICE_IDS,
  PRACTICE_COUNT,
  PRACTICE_SOURCES,
  QUICK_COUNT,
  SOURCE_CHUNK_SIZE,
  getPracticeSource,
  sourceRangeCards,
} from "../data/exam-quiz/catalog.ts"
import {
  assertPlayablePool,
  canAdvanceNext,
  choicePositionLabel,
  classifyExamReelGesture,
  drawPracticeSession,
  forbiddenIdsInSession,
  isQuestionRevealed,
  scoreSession,
  shuffleQuestionChoices,
  sliceSourceRange,
  summarizeSession,
  visibleChoicesAfterReveal,
} from "./exam-quiz-reel.ts"

const root = join(dirname(fileURLToPath(import.meta.url)), "..")
const released = JSON.parse(readFileSync(join(root, "question-bank/practice/questions.json"), "utf8"))
const staging = JSON.parse(readFileSync(join(root, "question-bank/practice/staging.json"), "utf8"))
const heldBank = JSON.parse(readFileSync(join(root, "question-bank/practice/questions-to-review.json"), "utf8"))
const heldIds = staging.questions.filter((question) => question.status === "quarantined").map((question) => question.id)
const omittedIds = staging.questions.filter((question) => question.status === "omitted").map((question) => question.id)
const approvedPool = released.questions.filter((question) => question.status === "approved")

function makeQuestion(id) {
  return {
    id,
    question: { en: `Question ${id}`, zh: `问题${id}` },
    choices: [
      { id: "a", en: "A", zh: "甲" },
      { id: "b", en: "B", zh: "乙" },
      { id: "c", en: "C", zh: "丙" },
      { id: "d", en: "D", zh: "丁" },
    ],
    correctChoiceId: "a",
    explanation: { en: "Why A", zh: "为什么是甲" },
    lockPoint: { en: "A = 甲. Not B.", zh: "A = 甲。不要和 B 搞混。" },
  }
}

function makeSession(questions, answers) {
  return {
    mode: "quick",
    questions,
    answers,
  }
}

test("gesture classification: below threshold cancels", () => {
  assert.equal(
    classifyExamReelGesture({ deltaX: 0, deltaY: 79, swipeThresholdPx: 80 }),
    "cancel",
  )
  assert.equal(
    classifyExamReelGesture({ deltaX: 0, deltaY: -79, swipeThresholdPx: 80 }),
    "cancel",
  )
})

test("gesture classification: at threshold swipes", () => {
  assert.equal(
    classifyExamReelGesture({ deltaX: 0, deltaY: 80, swipeThresholdPx: 80 }),
    "swipeNext",
  )
  assert.equal(
    classifyExamReelGesture({ deltaX: 0, deltaY: -80, swipeThresholdPx: 80 }),
    "swipePrevious",
  )
})

test("gesture classification: above threshold swipes", () => {
  assert.equal(
    classifyExamReelGesture({ deltaX: 0, deltaY: 200, swipeThresholdPx: 80 }),
    "swipeNext",
  )
  assert.equal(
    classifyExamReelGesture({ deltaX: 0, deltaY: -200, swipeThresholdPx: 80 }),
    "swipePrevious",
  )
})

test("scoreSession: all correct", () => {
  const questions = [makeQuestion("q1"), makeQuestion("q2")]
  const session = makeSession(questions, {
    q1: { questionId: "q1", selectedChoiceId: "a", correct: true, skipped: false },
    q2: { questionId: "q2", selectedChoiceId: "a", correct: true, skipped: false },
  })

  assert.deepEqual(scoreSession(session), { correct: 2, total: 2 })
})

test("scoreSession: mixed wrong and skipped", () => {
  const questions = [makeQuestion("q1"), makeQuestion("q2")]
  const session = makeSession(questions, {
    q1: { questionId: "q1", selectedChoiceId: "b", correct: false, skipped: false },
    q2: { questionId: "q2", selectedChoiceId: null, correct: false, skipped: true },
  })

  assert.deepEqual(scoreSession(session), { correct: 0, total: 2 })
})

test("scoreSession: empty session", () => {
  const session = makeSession([], {})
  assert.deepEqual(scoreSession(session), { correct: 0, total: 0 })
})

test("summarizeSession: collects missed (wrong + skipped) without chapter buckets", () => {
  const questions = [makeQuestion("q1"), makeQuestion("q2"), makeQuestion("q3")]
  const session = makeSession(questions, {
    q1: { questionId: "q1", selectedChoiceId: "a", correct: true, skipped: false },
    q2: { questionId: "q2", selectedChoiceId: "b", correct: false, skipped: false },
    q3: { questionId: "q3", selectedChoiceId: null, correct: false, skipped: true },
  })

  const summary = summarizeSession(session)

  assert.equal(summary.correct, 1)
  assert.equal(summary.total, 3)
  assert.deepEqual(
    summary.missed.map((answer) => answer.questionId),
    ["q2", "q3"],
  )
})

test("drawPracticeSession: exact size, unique ids", () => {
  const pool = Array.from({ length: 40 }, (_, index) => makeQuestion(`q${index}`))
  const drawn = drawPracticeSession(pool, 10, () => 0.5)
  assert.equal(drawn.length, 10)
  assert.equal(new Set(drawn.map((question) => question.id)).size, 10)
})

test("drawPracticeSession: 30 from large pool", () => {
  const pool = Array.from({ length: 40 }, (_, index) => makeQuestion(`q${index}`))
  const drawn = drawPracticeSession(pool, 30, () => 0.1)
  assert.equal(drawn.length, 30)
  assert.equal(new Set(drawn.map((question) => question.id)).size, 30)
})

test("drawPracticeSession: does not pad when pool is smaller than mode", () => {
  const pool = [makeQuestion("q1"), makeQuestion("q2"), makeQuestion("q1")]
  const drawn = drawPracticeSession(pool, 10, () => 0.2)
  assert.equal(drawn.length, 2)
  assert.deepEqual(
    drawn.map((question) => question.id).sort(),
    ["q1", "q2"],
  )
})

test("shuffleQuestionChoices: shuffles each question without mutating source data", () => {
  const questions = [makeQuestion("q1"), makeQuestion("q2")]
  const sourceOrders = questions.map((question) => question.choices.map((choice) => choice.id))
  const shuffled = shuffleQuestionChoices(questions, () => 0)

  assert.notStrictEqual(shuffled, questions)
  assert.notStrictEqual(shuffled[0].choices, questions[0].choices)
  assert.deepEqual(
    questions.map((question) => question.choices.map((choice) => choice.id)),
    sourceOrders,
  )
  for (const question of shuffled) {
    assert.deepEqual(
      question.choices.map((choice) => choice.id).sort(),
      ["a", "b", "c", "d"],
    )
    assert.equal(question.correctChoiceId, "a")
  }
  assert.deepEqual(shuffled[0].choices.map((choice) => choice.id), ["b", "c", "d", "a"])
})

test("shuffleQuestionChoices: a fresh session can produce a new choice order", () => {
  const questions = [makeQuestion("q1")]
  const first = shuffleQuestionChoices(questions, () => 0)
  const second = shuffleQuestionChoices(questions, () => 0.999)

  assert.notDeepEqual(
    first[0].choices.map((choice) => choice.id),
    second[0].choices.map((choice) => choice.id),
  )
})

test("choicePositionLabel: labels follow session order and stay stable after reveal", () => {
  const question = shuffleQuestionChoices([makeQuestion("q1")], () => 0)[0]
  const shownChoices = visibleChoicesAfterReveal(question.choices, question.correctChoiceId, "c")

  assert.deepEqual(
    question.choices.map((choice) => choicePositionLabel(question.choices, choice.id)),
    ["A", "B", "C", "D"],
  )
  assert.deepEqual(
    shownChoices.map((choice) => choicePositionLabel(question.choices, choice.id)),
    ["B", "D"],
  )
})

test("source-range question order remains intact when its choices are shuffled", () => {
  const questions = [makeQuestion("practice-nail-test-q001"), makeQuestion("practice-nail-test-q002")]
  const sourceRange = sliceSourceRange(questions, "nail-test", 0, 2)
  const shuffled = shuffleQuestionChoices(sourceRange, () => 0)

  assert.deepEqual(shuffled.map((question) => question.id), questions.map((question) => question.id))
  assert.deepEqual(shuffled[0].choices.map((choice) => choice.id), ["b", "c", "d", "a"])
})

test("reveal gates: unanswered cannot advance; answered or skipped can", () => {
  assert.equal(isQuestionRevealed(undefined), false)
  assert.equal(canAdvanceNext(undefined), false)
  assert.equal(
    canAdvanceNext({ questionId: "q1", selectedChoiceId: "a", correct: true, skipped: false }),
    true,
  )
  assert.equal(
    canAdvanceNext({ questionId: "q1", selectedChoiceId: null, correct: false, skipped: true }),
    true,
  )
})

test("visibleChoicesAfterReveal: keeps selected and correct only", () => {
  const choices = makeQuestion("q1").choices
  assert.deepEqual(
    visibleChoicesAfterReveal(choices, "a", "b").map((choice) => choice.id),
    ["a", "b"],
  )
  assert.deepEqual(
    visibleChoicesAfterReveal(choices, "a", null).map((choice) => choice.id),
    ["a"],
  )
})

test("released practice pool contains exactly 348 approved cards", () => {
  assert.equal(released.releaseState, "active")
  assert.equal(approvedPool.length, APPROVED_PRACTICE_COUNT)
  assert.equal(new Set(approvedPool.map((question) => question.id)).size, APPROVED_PRACTICE_COUNT)
})

test("all 125 held IDs and both omitted IDs stay out of the quiz pool", () => {
  const releasedIds = new Set(approvedPool.map((question) => question.id))
  assert.equal(heldIds.length, HELD_FOR_REVIEW_COUNT)
  assert.deepEqual(omittedIds.sort(), [...OMITTED_PRACTICE_IDS].sort())
  for (const id of heldIds) assert.equal(releasedIds.has(id), false)
  for (const id of omittedIds) assert.equal(releasedIds.has(id), false)
  assertPlayablePool(approvedPool, [...heldIds, ...omittedIds])
})

test("every held question has English and Chinese review reasons", () => {
  assert.equal(heldBank.questions.length, HELD_FOR_REVIEW_COUNT)
  for (const question of heldBank.questions) {
    assert.ok(question.reviewReason.en.trim())
    assert.ok(question.reviewReason.zh.trim())
    assert.equal(heldIds.includes(question.id), true)
  }
})

test("10- and 30-question sessions never include held or omitted IDs", () => {
  for (const size of [QUICK_COUNT, PRACTICE_COUNT]) {
    const drawn = drawPracticeSession(approvedPool, size, () => 0.42)
    assert.equal(drawn.length, size)
    assert.equal(new Set(drawn.map((question) => question.id)).size, size)
    const session = { mode: size === 10 ? "quick" : "practice", questions: drawn, answers: {} }
    assert.deepEqual(forbiddenIdsInSession(session, [...heldIds, ...omittedIds]), [])
  }
})

test("held questions do not affect scoring or missed-question review", () => {
  const drawn = drawPracticeSession(approvedPool, QUICK_COUNT, () => 0.3)
  const answers = Object.fromEntries(
    drawn.map((question, index) => [
      question.id,
      {
        questionId: question.id,
        selectedChoiceId: index % 2 === 0 ? question.correctChoice : "z",
        correct: index % 2 === 0,
        skipped: false,
      },
    ]),
  )
  const session = { mode: "quick", questions: drawn, answers }
  const summary = summarizeSession(session)
  assert.equal(summary.total, QUICK_COUNT)
  assert.equal(summary.correct + summary.missed.length, QUICK_COUNT)
  assert.equal(summary.missed.some((answer) => heldIds.includes(answer.questionId)), false)
  assert.deepEqual(forbiddenIdsInSession(session, heldIds), [])
})

test("assertPlayablePool rejects a held ID", () => {
  assert.throws(
    () => assertPlayablePool([{ id: heldIds[0] }], heldIds),
    /held or omitted/,
  )
})

test("sourceRangeCards: exact 20-question banks plus remainders", () => {
  assert.deepEqual(sourceRangeCards(156), [
    { offset: 0, start: 1, end: 20, count: 20 },
    { offset: 20, start: 21, end: 40, count: 20 },
    { offset: 40, start: 41, end: 60, count: 20 },
    { offset: 60, start: 61, end: 80, count: 20 },
    { offset: 80, start: 81, end: 100, count: 20 },
    { offset: 100, start: 101, end: 120, count: 20 },
    { offset: 120, start: 121, end: 140, count: 20 },
    { offset: 140, start: 141, end: 156, count: 16 },
  ])
  assert.deepEqual(sourceRangeCards(28), [
    { offset: 0, start: 1, end: 20, count: 20 },
    { offset: 20, start: 21, end: 28, count: 8 },
  ])
  assert.deepEqual(sourceRangeCards(164), [
    { offset: 0, start: 1, end: 20, count: 20 },
    { offset: 20, start: 21, end: 40, count: 20 },
    { offset: 40, start: 41, end: 60, count: 20 },
    { offset: 60, start: 61, end: 80, count: 20 },
    { offset: 80, start: 81, end: 100, count: 20 },
    { offset: 100, start: 101, end: 120, count: 20 },
    { offset: 120, start: 121, end: 140, count: 20 },
    { offset: 140, start: 141, end: 160, count: 20 },
    { offset: 160, start: 161, end: 164, count: 4 },
  ])
})

test("sliceSourceRange: stable order across calls; first/last sizes; no overlap; covers source", () => {
  const forbidden = new Set([...heldIds, ...omittedIds])
  const expectedRemainders = {
    "nail-test": 16,
    "theory-update": 8,
    comprehensive: 4,
  }

  for (const source of PRACTICE_SOURCES) {
    const { idPrefix } = getPracticeSource(source.id)
    const sourcePool = approvedPool.filter((question) => question.id.startsWith(idPrefix))
    assert.equal(sourcePool.length, source.approvedCount)
    const cards = sourceRangeCards(sourcePool.length, SOURCE_CHUNK_SIZE)
    assert.ok(cards.length > 0)

    const first = sliceSourceRange(approvedPool, source.id, 0)
    const firstAgain = sliceSourceRange(approvedPool, source.id, 0)
    assert.deepEqual(
      first.map((question) => question.id),
      firstAgain.map((question) => question.id),
    )
    assert.equal(first.length, SOURCE_CHUNK_SIZE)

    const lastCard = cards.at(-1)
    const last = sliceSourceRange(approvedPool, source.id, lastCard.offset)
    assert.equal(last.length, expectedRemainders[source.id])
    assert.equal(last.length, lastCard.count)

    const allIds = []
    const seen = new Set()
    for (const card of cards) {
      const slice = sliceSourceRange(approvedPool, source.id, card.offset)
      assert.equal(slice.length, card.count)
      for (const question of slice) {
        assert.equal(seen.has(question.id), false)
        assert.equal(forbidden.has(question.id), false)
        seen.add(question.id)
        allIds.push(question.id)
      }
    }

    assert.deepEqual(
      allIds,
      sourcePool.map((question) => question.id),
    )
  }
})
