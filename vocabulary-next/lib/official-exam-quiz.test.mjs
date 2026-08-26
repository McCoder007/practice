import assert from "node:assert/strict"
import { readFileSync } from "node:fs"
import { dirname, join } from "node:path"
import test from "node:test"
import { fileURLToPath } from "node:url"

import {
  APPROVED_PRACTICE_COUNT,
  PRACTICE_COUNT,
  QUICK_COUNT,
  SOURCE_CHUNK_SIZE,
  sliceOfficialSourceRange,
  sourceRangeCards,
} from "../data/official-exam-quiz/catalog.ts"
import {
  drawPracticeSession,
  shuffleQuestionChoices,
} from "./exam-quiz-reel.ts"

const root = join(dirname(fileURLToPath(import.meta.url)), "..")
const release = JSON.parse(
  readFileSync(join(root, "question-bank/official-practice/questions.json"), "utf8"),
)
const pool = release.questions.map((question) => ({
  ...question,
  correctChoiceId: question.correctChoice,
}))

test("official practice release contains 100 unique approved questions", () => {
  assert.equal(pool.length, APPROVED_PRACTICE_COUNT)
  assert.equal(new Set(pool.map((question) => question.id)).size, APPROVED_PRACTICE_COUNT)
  assert.equal(pool.every((question) => question.status === "approved"), true)
})

test("official quick and practice draws have the requested size with no duplicates", () => {
  for (const count of [QUICK_COUNT, PRACTICE_COUNT]) {
    const session = drawPracticeSession(pool, count, () => 0.42)
    assert.equal(session.length, count)
    assert.equal(new Set(session.map((question) => question.id)).size, count)
  }
})

test("official fixed banks cover all 100 questions in five ordered groups of 20", () => {
  const ranges = sourceRangeCards(APPROVED_PRACTICE_COUNT)
  assert.equal(ranges.length, 5)
  assert.equal(ranges.every((range) => range.count === SOURCE_CHUNK_SIZE), true)

  const banks = ranges.map((range) => sliceOfficialSourceRange(pool, range.offset))
  assert.equal(banks.every((bank) => bank.length === SOURCE_CHUNK_SIZE), true)
  assert.deepEqual(
    banks.map((bank) => [bank[0].id, bank.at(-1).id]),
    [
      ["official-practice-001", "official-practice-020"],
      ["official-practice-021", "official-practice-040"],
      ["official-practice-041", "official-practice-060"],
      ["official-practice-061", "official-practice-080"],
      ["official-practice-081", "official-practice-100"],
    ],
  )
  assert.equal(new Set(banks.flat().map((question) => question.id)).size, APPROVED_PRACTICE_COUNT)
})

test("choice shuffling preserves each official question's stable correct-choice id", () => {
  const sourceCorrectIds = new Map(pool.map((question) => [question.id, question.correctChoiceId]))
  const shuffled = shuffleQuestionChoices(pool, () => 0)

  for (const question of shuffled) {
    assert.equal(question.correctChoiceId, sourceCorrectIds.get(question.id))
    assert.equal(question.choices.some((choice) => choice.id === question.correctChoiceId), true)
  }
})
