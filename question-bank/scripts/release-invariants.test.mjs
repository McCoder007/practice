import assert from "node:assert/strict"
import { readFileSync } from "node:fs"
import { dirname, join } from "node:path"
import test from "node:test"
import { fileURLToPath } from "node:url"

import {
  collectHeldReasonErrors,
  collectHeldReleaseErrors,
  collectOmittedReleaseErrors,
  collectAuthoredDistractorErrors,
  learnerTextContainsQuarantined,
} from "./release-invariants.cjs"

const root = join(dirname(fileURLToPath(import.meta.url)), "..")

test("release validation rejects any held ID that enters released JSON", () => {
  const errors = collectHeldReleaseErrors(["practice-nail-test-q001", "practice-nail-test-q004"], ["practice-nail-test-q004"])
  assert.deepEqual(errors, ["practice-nail-test-q004: held question must not enter released JSON"])
  assert.deepEqual(collectHeldReleaseErrors(["practice-nail-test-q001"], ["practice-nail-test-q004"]), [])
})

test("release validation rejects omitted IDs in released JSON", () => {
  const errors = collectOmittedReleaseErrors(["practice-nail-test-q048"], ["practice-nail-test-q048", "practice-nail-test-n034"])
  assert.equal(errors.length, 1)
})

test("held questions require bilingual review reasons", () => {
  const errors = collectHeldReasonErrors([
    { id: "a", reviewReason: { en: "English reason.", zh: "" } },
    { id: "b", reviewReason: { en: "English reason.", zh: "中文原因。" } },
  ])
  assert.deepEqual(errors, ["a: missing Chinese review reason"])
})

test("learner-facing UI and held data do not use the word quarantined", () => {
  const appRoot = join(root, "..")
  const files = [
    join(appRoot, "app/exam-quiz/page.tsx"),
    join(appRoot, "app/exam-quiz/questions-to-review/page.tsx"),
    join(appRoot, "data/exam-quiz/catalog.ts"),
    join(appRoot, "data/exam-quiz/loadChapter.ts"),
    join(root, "practice/questions-to-review.json"),
  ]
  for (const file of files) {
    const text = readFileSync(file, "utf8")
    assert.equal(/quarantined/i.test(text), false, file)
  }
  assert.equal(learnerTextContainsQuarantined({ title: "Questions to Review", notice: "held for review" }), false)
  assert.equal(learnerTextContainsQuarantined({ title: "quarantined list" }), true)
})

test("authored distractor audit rejects broader or near-duplicate answers", () => {
  const errors = collectAuthoredDistractorErrors([
    {
      id: "q-hot-oil",
      choicesOrigin: "authored-distractors",
      correctChoice: "d",
      choices: [
        { id: "a", en: "To prevent fungus" },
        { id: "b", en: "To soften the area around the cuticle" },
        { id: "c", en: "To remove gel" },
        { id: "d", en: "To soften the cuticles" },
      ],
    },
    {
      id: "q-gel",
      choicesOrigin: "authored-distractors",
      correctChoice: "c",
      choices: [
        { id: "a", en: "Gel polish" },
        { id: "b", en: "Builder gel" },
        { id: "c", en: "Gel" },
        { id: "d", en: "Nail adhesive" },
      ],
    },
  ])
  assert.equal(errors.length, 3)
  assert.ok(errors.some((error) => error.includes("q-hot-oil")))
  assert.ok(errors.some((error) => error.includes("q-gel")))
})

test("authored distractor audit accepts related but clearly different choices", () => {
  const errors = collectAuthoredDistractorErrors([{
    id: "q-hot-oil-fixed",
    choicesOrigin: "authored-distractors",
    correctChoice: "d",
    choices: [
      { id: "a", en: "To prevent fungal infections" },
      { id: "b", en: "To remove cured gel polish" },
      { id: "c", en: "To make UV gel cure faster" },
      { id: "d", en: "To soften the cuticles" },
    ],
  }])
  assert.deepEqual(errors, [])
})
