#!/usr/bin/env node

const fs = require("node:fs")
const path = require("node:path")

const projectRoot = path.resolve(__dirname, "../..")
const sourcePath = path.join(projectRoot, "data/kelly-nail-school/source-work/extracted.jsonl")
const translationsPath = path.join(projectRoot, "question-bank/kelly-nail-school/translations.json")
const reviewPath = path.join(projectRoot, "question-bank/kelly-nail-school/answer-review.json")
const outputPath = path.join(projectRoot, "question-bank/kelly-nail-school/questions.json")

const source = fs.readFileSync(sourcePath, "utf8").trim().split("\n").map((line) => JSON.parse(line))
const translations = JSON.parse(fs.readFileSync(translationsPath, "utf8"))
const review = JSON.parse(fs.readFileSync(reviewPath, "utf8"))
const translationById = new Map(translations.questions.map((question) => [question.id, question]))

const repairedChoices = {
  "kelly-024": ["Sterilization", "Antisepsis", "Disinfection", "Cleaning/Sanitation"],
  "kelly-059": ["Used again immediately", "Rinsed with water", "Properly cleaned and sterilized before reuse", "Wiped with a towel only"],
  "kelly-051": ["Nail adhesive", "Conditioning oil", "Warm water", "Exfoliating product"],
  "kelly-060": ["Shared among clients", "Cleaned and disinfected after each client", "Stored without cleaning", "Wiped with a towel only"],
  "kelly-069": ["Pause briefly or use shorter intervals while still completing the manufacturer's total cure time", "Increase curing time continuously", "Press the nail firmly into the lamp", "Make no changes"],
  "kelly-084": ["Sanitation", "Sterilization", "Disinfection", "Polymerization"],
  "kelly-085": ["Cleaning and maintaining hygiene", "Sterilization", "Polymerization", "Disinfection"],
}

const repairedQuestions = Object.fromEntries(
  Object.entries(review.questionRepairs).map(([id, repair]) => [id, repair.to]),
)

const questions = source.map((raw, index) => {
  const translated = translationById.get(raw.id)
  if (!translated) throw new Error(`${raw.id}: missing translation`)
  const englishChoices = repairedChoices[raw.id] || raw.choices_en
  if (translated.choices.length !== 4 || englishChoices.length !== 4) {
    throw new Error(`${raw.id}: expected four choices`)
  }
  const sourceCorrect = raw.correct.toLowerCase()
  const override = review.answerOverrides[raw.id]
  if (override && override.from !== sourceCorrect) {
    throw new Error(`${raw.id}: answer override no longer matches source key`)
  }
  return {
    id: raw.id,
    questionNumber: index + 1,
    type: "multiple-choice",
    question: { en: repairedQuestions[raw.id] || raw.question_en, zh: translated.question },
    choices: englishChoices.map((en, choiceIndex) => ({
      id: ["a", "b", "c", "d"][choiceIndex],
      en,
      zh: translated.choices[choiceIndex],
    })),
    correctChoice: override?.to || sourceCorrect,
    textOrigin: repairedQuestions[raw.id] ? "source-repaired" : "source",
    choicesOrigin: repairedChoices[raw.id] ? "source-repaired" : "source",
    status: "approved",
    source: {
      photos: raw.source_photos,
      answerSource: override ? "independent-review-override" : raw.answer_source,
      auditNote: [raw.audit_note, override?.reason].filter(Boolean).join(" "),
    },
    verification: {
      questionChecked: true,
      choicesChecked: true,
      answerKeyChecked: true,
      translationChecked: true,
    },
  }
})

if (translationById.size !== questions.length) {
  throw new Error(`translation inventory mismatch: ${translationById.size} translations for ${questions.length} questions`)
}

const release = {
  schemaVersion: "1.0.0",
  language: { source: "en", translation: "zh-Hans" },
  sourceTitle: "Kelly Nail School — NAILS (EN) 2026",
  generatedAt: "2026-09-19T00:00:00.000Z",
  releaseState: "active",
  statistics: { total: questions.length },
  questions,
}

fs.writeFileSync(outputPath, `${JSON.stringify(release, null, 2)}\n`)
console.log(`assembled ${questions.length} Kelly Nail School questions`)
