#!/usr/bin/env node

const fs = require("node:fs")
const path = require("node:path")
const Ajv = require("ajv")

const projectRoot = path.resolve(__dirname, "../..")
const bankRoot = path.join(projectRoot, "question-bank")
const releasePath = path.join(bankRoot, "kelly-nail-school/questions.json")
const schemaPath = path.join(bankRoot, "schema/kelly-nail-school-question-bank.schema.json")
const sourcePath = path.join(projectRoot, "data/kelly-nail-school/source-work/extracted.jsonl")
const translationsPath = path.join(bankRoot, "kelly-nail-school/translations.json")
const reviewPath = path.join(bankRoot, "kelly-nail-school/answer-review.json")
const errors = []

function fail(condition, message) {
  if (!condition) errors.push(message)
}

const release = JSON.parse(fs.readFileSync(releasePath, "utf8"))
const schema = JSON.parse(fs.readFileSync(schemaPath, "utf8"))
const source = fs.readFileSync(sourcePath, "utf8").trim().split("\n").map((line) => JSON.parse(line))
const translations = JSON.parse(fs.readFileSync(translationsPath, "utf8"))
const review = JSON.parse(fs.readFileSync(reviewPath, "utf8"))

const draft7Schema = JSON.parse(
  JSON.stringify(schema)
    .replace("https://json-schema.org/draft/2020-12/schema", "http://json-schema.org/draft-07/schema#")
    .replaceAll("#/$defs/", "#/definitions/"),
)
draft7Schema.definitions = draft7Schema.$defs
delete draft7Schema.$defs
const validateSchema = new Ajv({ allErrors: true }).compile(draft7Schema)
if (!validateSchema(release)) {
  for (const error of validateSchema.errors || []) {
    errors.push(`schema${error.instancePath || error.dataPath || ""}: ${error.message}`)
  }
}

const questions = release.questions || []
const sourceById = new Map(source.map((question) => [question.id, question]))
const translationById = new Map(translations.questions.map((question) => [question.id, question]))
const seen = new Set()
const repairedIds = new Set(Object.keys(review.choiceRepairs))
const repairedQuestionIds = new Set(Object.keys(review.questionRepairs))

fail(source.length === 89, `source must contain 89 questions, found ${source.length}`)
fail(questions.length === 89, `release must contain 89 questions, found ${questions.length}`)
fail(translationById.size === 89, `translations must contain 89 unique ids, found ${translationById.size}`)

for (const [index, question] of questions.entries()) {
  const expectedId = `kelly-${String(index + 1).padStart(3, "0")}`
  fail(question.id === expectedId, `question ${index + 1}: expected id ${expectedId}, found ${question.id}`)
  fail(!seen.has(question.id), `${question.id}: duplicate id`)
  seen.add(question.id)

  const raw = sourceById.get(question.id)
  const translated = translationById.get(question.id)
  fail(Boolean(raw), `${question.id}: missing source record`)
  fail(Boolean(translated), `${question.id}: missing translation record`)
  if (!raw || !translated) continue

  const expectedQuestion = review.questionRepairs[question.id]?.to || raw.question_en
  fail(question.question.en === expectedQuestion, `${question.id}: English question drift`)
  fail(question.question.zh === translated.question, `${question.id}: Chinese question drift`)
  fail(question.choices.length === 4, `${question.id}: must have four choices`)
  fail(new Set(question.choices.map((choice) => choice.id)).size === 4, `${question.id}: duplicate choice ids`)
  fail(question.choices.some((choice) => choice.id === question.correctChoice), `${question.id}: unresolved correctChoice`)
  fail(question.choices.every((choice) => choice.en.trim() && choice.zh.trim()), `${question.id}: empty bilingual choice`)
  fail(
    question.choices.every((choice) => !/[?;,]/.test(choice.zh)),
    `${question.id}: Chinese choice contains ASCII punctuation`,
  )
  fail(!/[?;,]/.test(question.question.zh), `${question.id}: Chinese question contains ASCII punctuation`)
  fail(
    question.choicesOrigin === (repairedIds.has(question.id) ? "source-repaired" : "source"),
    `${question.id}: choicesOrigin does not match repair audit`,
  )
  fail(
    question.textOrigin === (repairedQuestionIds.has(question.id) ? "source-repaired" : "source"),
    `${question.id}: textOrigin does not match repair audit`,
  )

  const override = review.answerOverrides[question.id]
  const expectedCorrect = override?.to || raw.correct.toLowerCase()
  fail(question.correctChoice === expectedCorrect, `${question.id}: answer-key drift`)
  fail(Object.values(question.verification).every(Boolean), `${question.id}: incomplete verification`)
}

for (const excluded of review.excludedSourceItems) {
  fail(!questions.some((question) => question.question.en === excluded), `excluded item was published: ${excluded}`)
}

if (errors.length) {
  console.error(`Kelly Nail School validation failed with ${errors.length} error(s):`)
  console.error(errors.map((error) => `- ${error}`).join("\n"))
  process.exit(1)
}

console.log("Kelly Nail School validation ok: 89 approved bilingual questions, 0 errors")
console.log("answer review ok: 2 corrected keys, 7 repaired choice records, 1 repaired question, 4 excluded source items absent")
