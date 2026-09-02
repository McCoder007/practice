import assert from "node:assert/strict"
import test from "node:test"

import { PRACTICE_SOURCES } from "../data/exam-quiz/catalog.ts"
import {
  LEARNER_FACING_QUESTION_COUNT,
  LEGACY_EXAM_PRACTICE_REDIRECTS,
  MIXED_PRACTICE,
  NAIL_EXAM_BANKS,
  NAIL_EXAM_PRACTICE_HREF,
  NAIL_EXAM_PRACTICE_TITLE,
  STUDY_FORMATS,
  bankGroupCards,
  bankHrefForPracticeSource,
  getNailExamBank,
} from "../data/nail-exam-practice/catalog.ts"

test("public catalog uses approved learner-facing names and routes", () => {
  assert.equal(NAIL_EXAM_PRACTICE_TITLE.en, "Nail Exam Practice")
  assert.equal(NAIL_EXAM_PRACTICE_HREF, "/nail-exam-practice")
  assert.deepEqual(
    NAIL_EXAM_BANKS.map((bank) => [bank.id, bank.publicName.en, bank.href]),
    [
      ["official", "Official Practice", "/nail-exam-practice/official"],
      ["bank-a", "Practice Bank A", "/nail-exam-practice/bank-a"],
      ["bank-b", "Practice Bank B", "/nail-exam-practice/bank-b"],
      ["bank-c", "Practice Bank C", "/nail-exam-practice/bank-c"],
    ],
  )
  assert.deepEqual(
    STUDY_FORMATS.map((format) => format.title.en),
    ["Multiple Choice", "Study Cards"],
  )
  assert.equal(
    STUDY_FORMATS.some((format) => format.title.en === "Study Mode" || format.title.en === "Flash Cards"),
    false,
  )
})

test("public banks map to unchanged internal pools and group counts", () => {
  const official = getNailExamBank("official")
  const bankA = getNailExamBank("bank-a")
  const bankB = getNailExamBank("bank-b")
  const bankC = getNailExamBank("bank-c")

  assert.equal(official.internalSourceName, "Official Practice pool")
  assert.equal(official.idPrefix, "official-practice-")
  assert.equal(official.approvedCount, 100)
  assert.equal(official.groupCount, 5)
  assert.deepEqual(official.randomOptions.map((option) => option.count), [10, 25])

  assert.equal(bankA.internalSourceName, "Nail Test")
  assert.equal(bankA.practiceSourceId, PRACTICE_SOURCES[0].id)
  assert.equal(bankA.approvedCount, 156)
  assert.equal(bankA.groupCount, 8)

  assert.equal(bankB.internalSourceName, "Theory Update")
  assert.equal(bankB.practiceSourceId, PRACTICE_SOURCES[1].id)
  assert.equal(bankB.approvedCount, 28)
  assert.equal(bankB.groupCount, 2)

  assert.equal(bankC.internalSourceName, "Milady Comprehensive")
  assert.equal(bankC.practiceSourceId, PRACTICE_SOURCES[2].id)
  assert.equal(bankC.approvedCount, 164)
  assert.equal(bankC.groupCount, 9)

  assert.equal(
    NAIL_EXAM_BANKS.reduce((sum, bank) => sum + bank.approvedCount, 0),
    LEARNER_FACING_QUESTION_COUNT,
  )
})

test("calculated group boundaries cover each bank exactly once", () => {
  assert.deepEqual(bankGroupCards(getNailExamBank("official")).at(-1), {
    offset: 80,
    start: 81,
    end: 100,
    count: 20,
  })
  assert.deepEqual(bankGroupCards(getNailExamBank("bank-a")).at(-1), {
    offset: 140,
    start: 141,
    end: 156,
    count: 16,
  })
  assert.deepEqual(bankGroupCards(getNailExamBank("bank-b")).at(-1), {
    offset: 20,
    start: 21,
    end: 28,
    count: 8,
  })
  assert.deepEqual(bankGroupCards(getNailExamBank("bank-c")).at(-1), {
    offset: 160,
    start: 161,
    end: 164,
    count: 4,
  })
})

test("legacy exam-practice routes map into the hub instead of textbook sections", () => {
  assert.deepEqual(
    LEGACY_EXAM_PRACTICE_REDIRECTS.map((entry) => [entry.from, entry.to]),
    [
      ["/exam-quiz", "/nail-exam-practice"],
      ["/official-exam-quiz", "/nail-exam-practice/official"],
      ["/nail-technician-qa-reel", "/nail-exam-practice/bank-a"],
    ],
  )
  assert.equal(bankHrefForPracticeSource("nail-test"), "/nail-exam-practice/bank-a")
  assert.equal(bankHrefForPracticeSource("theory-update"), "/nail-exam-practice/bank-b")
  assert.equal(bankHrefForPracticeSource("comprehensive"), "/nail-exam-practice/bank-c")
})

test("mixed practice stays secondary and preserves random sizes", () => {
  assert.equal(MIXED_PRACTICE.href, "/nail-exam-practice/mixed")
  assert.deepEqual(
    MIXED_PRACTICE.randomOptions.map((option) => option.count),
    [10, 30],
  )
  assert.equal(
    NAIL_EXAM_BANKS.some((bank) => bank.publicName.en === MIXED_PRACTICE.title.en),
    false,
  )
})
