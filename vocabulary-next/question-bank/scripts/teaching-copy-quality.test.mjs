import assert from "node:assert/strict"
import test from "node:test"
import quality from "./teaching-copy-quality.cjs"

const supported = {
  explanation: { en: "Blood carries oxygen and nutrients to skin cells.", zh: "血液把氧气和营养物质带给皮肤细胞。" },
  lockPoint: { en: "blood carries oxygen plus nutrients.", zh: "血液运送氧气和营养物质。" },
  teachingRelation: "action",
  authorityRefs: [{ source: "Book", section: "Skin", printedPage: "10" }],
  author: "author-run-a",
  authoredAt: "2026-08-13",
}

test("accepts concise supported teaching copy", () => {
  assert.deepEqual(quality.auditEntry("q1", supported).flags, [])
})

test("rejects legacy answer-restatement templates", () => {
  const entry = structuredClone(supported)
  entry.explanation.en = "The exam answer is oxygen. Keep this wording for the test."
  entry.explanation.zh = "这道题的考试答案是 oxygen。请记住这个说法。"
  assert.ok(quality.auditEntry("q1", entry).flags.includes("banned-english-phrase"))
  assert.ok(quality.auditEntry("q1", entry).flags.includes("banned-chinese-phrase"))
})

test("rejects mechanical first-distractor lock pattern and excessive length", () => {
  const entry = structuredClone(supported)
  entry.lockPoint.en = `${"answer ".repeat(21)}= meaning. Not choice A.`
  const flags = quality.auditEntry("q1", entry).flags
  assert.ok(flags.includes("lock-over-20-words"))
  assert.ok(flags.includes("mechanical-not-x-lock"))
})

test("flags a near-restatement of the question and answer", () => {
  const entry = structuredClone(supported)
  entry.explanation.en = "Matrix growth tissue lies under the nail root."
  const question = {
    question: { en: "Which growth tissue lies under the nail root?" },
    choices: [{ id: "a", en: "matrix" }],
    correctChoice: "a",
  }
  assert.ok(quality.auditEntry("q1", entry, question).flags.includes("possible-restatement"))
})

test("flags avoidable ESL vocabulary for human review", () => {
  const entry = structuredClone(supported)
  entry.explanation.en = "Disinfection works on a nonporous surface but does not kill bacterial spores."
  const flags = quality.auditEntry("q1", entry).flags
  assert.ok(flags.some((flag) => flag.startsWith("esl-vocabulary-watch:")))
})

test("accepts a necessary exam term only when the explanation defines it", () => {
  const entry = structuredClone(supported)
  entry.explanation.en = "Bacterial spores are a very hard-to-kill form of bacteria. Salon disinfectants do not kill them."
  entry.lockPoint.en = "disinfectant kills most germs, not bacterial spores."
  entry.definedExamTerms = ["bacterial spores"]
  const question = {
    question: { en: "Disinfectants can kill everything except:" },
    choices: [{ id: "a", en: "Bacterial spores" }],
    correctChoice: "a",
  }
  assert.deepEqual(quality.auditEntry("q1", entry, question).flags, [])
})

test("rejects a difficult-term exception that is not the answer or is not defined", () => {
  const entry = structuredClone(supported)
  entry.explanation.en = "Disinfection does not kill bacterial spores."
  entry.definedExamTerms = ["bacterial spores"]
  const question = {
    question: { en: "Which process is used on a hard surface?" },
    choices: [{ id: "a", en: "Disinfection" }],
    correctChoice: "a",
  }
  const flags = quality.auditEntry("q1", entry, question).flags
  assert.ok(flags.includes("invalid-defined-exam-term"))
  assert.ok(flags.some((flag) => flag.startsWith("esl-vocabulary-watch:")))
})
