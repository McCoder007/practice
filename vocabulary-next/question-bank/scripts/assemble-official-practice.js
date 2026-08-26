#!/usr/bin/env node
/** Assemble the Phase 4 Official Exam Practice release without mutating Phase 1-3 artifacts. */

const fs = require("node:fs")
const path = require("node:path")

const root = path.resolve(__dirname, "..", "official-practice")
const stagingPath = path.join(root, "staging.json")
const translatedPath = path.join(root, "translated.json")
const teachingCopyPath = path.join(root, "teaching-copy.json")
const outputPath = path.join(root, "questions.json")

function readJson(file) {
  return JSON.parse(fs.readFileSync(file, "utf8"))
}

function assert(condition, message) {
  if (!condition) throw new Error(message)
}

function sameJson(left, right) {
  return JSON.stringify(left) === JSON.stringify(right)
}

const staging = readJson(stagingPath)
const translated = readJson(translatedPath)
const teachingCopy = readJson(teachingCopyPath)

assert(staging.questions?.length === 100, "Phase 1 staging must contain exactly 100 questions")
assert(translated.questions?.length === 100, "Phase 2 translation must contain exactly 100 questions")
assert(Object.keys(teachingCopy.entries || {}).length === 100, "Phase 3 teaching copy must contain exactly 100 entries")

const questions = staging.questions.map((sourceQuestion, index) => {
  const translatedQuestion = translated.questions[index]
  const teaching = teachingCopy.entries[sourceQuestion.id]
  const expectedId = `official-practice-${String(index + 1).padStart(3, "0")}`

  assert(sourceQuestion.id === expectedId, `${sourceQuestion.id}: Phase 1 ids are not in canonical source order`)
  assert(translatedQuestion?.id === sourceQuestion.id, `${sourceQuestion.id}: Phase 2 id/order drift`)
  assert(translatedQuestion.correctChoice === sourceQuestion.correctChoice, `${sourceQuestion.id}: correctChoice drift in Phase 2`)
  assert(translatedQuestion.question.en === sourceQuestion.question.en, `${sourceQuestion.id}: question.en drift in Phase 2`)
  assert(sameJson(translatedQuestion.sources, sourceQuestion.sources), `${sourceQuestion.id}: sources drift in Phase 2`)
  assert(
    translatedQuestion.choices.length === sourceQuestion.choices.length
      && translatedQuestion.choices.every((choice, choiceIndex) =>
        choice.id === sourceQuestion.choices[choiceIndex].id
        && choice.en === sourceQuestion.choices[choiceIndex].en),
    `${sourceQuestion.id}: English choice drift or reorder in Phase 2`,
  )
  assert(teaching?.id === sourceQuestion.id, `${sourceQuestion.id}: missing or mismatched Phase 3 teaching copy`)

  return {
    id: sourceQuestion.id,
    section: "practice",
    chapter: 0,
    chapterTitle: { en: "Official Exam Practice", zh: "官方考试练习" },
    collection: "official-practice-pool",
    type: "multiple-choice",
    question: translatedQuestion.question,
    choices: translatedQuestion.choices,
    correctChoice: sourceQuestion.correctChoice,
    sources: sourceQuestion.sources,
    choicesOrigin: "source",
    status: "approved",
    explanation: teaching.explanation,
    lockPoint: teaching.lockPoint,
    teachingRelation: teaching.teachingRelation,
    authorityRefs: teaching.authorityRefs,
    teachingAuthor: teaching.author,
    authoredAt: teaching.authoredAt,
  }
})

const release = {
  schemaVersion: "2.0.0",
  language: { source: "en", translation: "zh-Hans" },
  sourceTitle: "Official Exam Practice from Trivie Learn results",
  generatedAt: new Date().toISOString(),
  statistics: {
    total: 100,
    approved: 100,
    bankCount: 5,
    bankSize: 20,
  },
  questions,
}

fs.writeFileSync(outputPath, `${JSON.stringify(release, null, 2)}\n`)
console.log(`assembled official practice release: ${questions.length} approved questions`)

