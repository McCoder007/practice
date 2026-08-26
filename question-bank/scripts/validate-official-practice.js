#!/usr/bin/env node
/** Phase 4 release gate for the independent Official Exam Practice pool. */

const fs = require("node:fs")
const path = require("node:path")
const Ajv = require("ajv")

const bankRoot = path.resolve(__dirname, "..")
const officialRoot = path.join(bankRoot, "official-practice")
const schemaPath = path.join(bankRoot, "schema", "official-practice-question-bank.schema.json")
const releasePath = path.join(officialRoot, "questions.json")
const stagingPath = path.join(officialRoot, "staging.json")
const translatedPath = path.join(officialRoot, "translated.json")
const teachingCopyPath = path.join(officialRoot, "teaching-copy.json")
const errors = []

function readJson(file) {
  try {
    return JSON.parse(fs.readFileSync(file, "utf8"))
  } catch (error) {
    errors.push(`${path.relative(bankRoot, file)}: ${error.message}`)
    return null
  }
}

function fail(condition, message) {
  if (!condition) errors.push(message)
}

function sameJson(left, right) {
  return JSON.stringify(left) === JSON.stringify(right)
}

const schema = readJson(schemaPath)
const release = readJson(releasePath)
const staging = readJson(stagingPath)
const translated = readJson(translatedPath)
const teachingCopy = readJson(teachingCopyPath)

if (schema && release && staging && translated && teachingCopy) {
  // This checkout carries Ajv 6 (Draft 7). Convert only the schema vocabulary
  // names so the checked-in Draft 2020 contract is compiled and applied in full.
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
      errors.push(`schema${error.dataPath || ""}: ${error.message}`)
    }
  }

  fail(schema.$defs?.question?.properties?.id?.pattern === "^official-practice-[0-9]{3}$", "schema: official id pattern is missing")
  fail(schema.$defs?.question?.properties?.collection?.const === "official-practice-pool", "schema: collection const is incorrect")
  fail(release.schemaVersion === "2.0.0", "release: schemaVersion must be 2.0.0")
  fail(sameJson(release.language, { source: "en", translation: "zh-Hans" }), "release: language contract is incorrect")
  fail(typeof release.sourceTitle === "string" && release.sourceTitle.length > 0, "release: sourceTitle is missing")
  fail(!Number.isNaN(Date.parse(release.generatedAt)), "release: generatedAt is not an ISO date-time")
  fail(release.statistics?.total === 100, "release: statistics.total must be 100")
  fail(release.statistics?.approved === 100, "release: statistics.approved must be 100")
  fail(release.statistics?.bankCount === 5 && release.statistics?.bankSize === 20, "release: expected five banks of 20")
  fail(Array.isArray(release.questions) && release.questions.length === 100, "release: expected exactly 100 questions")
  fail(staging.questions?.length === 100, "staging: expected exactly 100 questions")
  fail(translated.questions?.length === 100, "translated: expected exactly 100 questions")
  fail(Object.keys(teachingCopy.entries || {}).length === 100, "teaching copy: expected exactly 100 entries")

  const seen = new Set()
  for (let index = 0; index < (release.questions || []).length; index += 1) {
    const question = release.questions[index]
    const sourceQuestion = staging.questions[index]
    const translatedQuestion = translated.questions[index]
    const teaching = teachingCopy.entries[question.id]
    const expectedId = `official-practice-${String(index + 1).padStart(3, "0")}`
    const context = question.id || `question ${index + 1}`

    fail(question.id === expectedId, `${context}: expected id/order ${expectedId}`)
    fail(!seen.has(question.id), `${context}: duplicate id`)
    seen.add(question.id)
    fail(question.section === "practice" && question.chapter === 0, `${context}: invalid section/chapter`)
    fail(question.collection === "official-practice-pool", `${context}: invalid collection`)
    fail(question.type === "multiple-choice", `${context}: invalid type`)
    fail(question.choicesOrigin === "source", `${context}: choicesOrigin must be source`)
    fail(question.status === "approved", `${context}: status must be approved`)
    fail(question.question?.en && question.question?.zh, `${context}: missing bilingual question`)
    fail(Array.isArray(question.choices) && question.choices.length === 4, `${context}: expected four choices`)
    fail(
      question.choices?.every((choice, choiceIndex) =>
        choice.id === ["a", "b", "c", "d"][choiceIndex] && choice.en && choice.zh),
      `${context}: choices must be ordered a-d with bilingual text`,
    )
    fail(question.choices?.some((choice) => choice.id === question.correctChoice), `${context}: correctChoice is not present`)
    fail(Array.isArray(question.sources) && question.sources.length > 0, `${context}: sources are missing`)
    fail(question.sources?.every((source) => source.book && source.itemRef), `${context}: incomplete source provenance`)
    fail(question.explanation?.en && question.explanation?.zh, `${context}: missing bilingual explanation`)
    fail(question.lockPoint?.en && question.lockPoint?.zh, `${context}: missing bilingual lockPoint`)
    fail(question.teachingRelation, `${context}: missing teachingRelation`)
    fail(Array.isArray(question.authorityRefs) && question.authorityRefs.length > 0, `${context}: missing authorityRefs`)

    fail(sourceQuestion?.id === question.id, `${context}: Phase 1 id/order mismatch`)
    fail(question.correctChoice === sourceQuestion?.correctChoice, `${context}: correctChoice drift from Phase 1`)
    fail(question.question?.en === sourceQuestion?.question?.en, `${context}: English stem drift from Phase 1`)
    fail(
      sameJson(question.choices?.map(({ id, en }) => ({ id, en })), sourceQuestion?.choices),
      `${context}: English choices drift or reorder from Phase 1`,
    )
    fail(sameJson(question.sources, sourceQuestion?.sources), `${context}: source provenance drift from Phase 1`)
    fail(sameJson(question.question, translatedQuestion?.question), `${context}: question drift from Phase 2`)
    fail(sameJson(question.choices, translatedQuestion?.choices), `${context}: choices drift from Phase 2`)
    fail(sameJson(question.explanation, teaching?.explanation), `${context}: explanation drift from Phase 3`)
    fail(sameJson(question.lockPoint, teaching?.lockPoint), `${context}: lockPoint drift from Phase 3`)
  }

  const expectedBanks = [
    ["official-practice-001", "official-practice-020", "NIC Nail Technology Practice Exam - Trivie Learn"],
    ["official-practice-021", "official-practice-040", "NIC Nail Technology Practice Exam - Trivie Learn"],
    ["official-practice-041", "official-practice-060", "Nail Technology Procedures - Trivie Learn"],
    ["official-practice-061", "official-practice-080", "Nail Technology Procedures - Trivie Learn"],
    ["official-practice-081", "official-practice-100", "Nail Technology Procedures - Trivie Learn"],
  ]
  expectedBanks.forEach(([firstId, lastId, expectedBook], bankIndex) => {
    const bank = release.questions.slice(bankIndex * 20, bankIndex * 20 + 20)
    fail(bank.length === 20, `bank ${bankIndex + 1}: expected 20 questions`)
    fail(bank[0]?.id === firstId && bank[19]?.id === lastId, `bank ${bankIndex + 1}: incorrect id boundaries`)
    fail(bank.every((question) => question.sources[0]?.book === expectedBook), `bank ${bankIndex + 1}: crosses a source quiz boundary`)
  })
}

if (errors.length) {
  console.error(`official practice validation failed with ${errors.length} error(s):`)
  console.error(errors.map((error) => `- ${error}`).join("\n"))
  process.exit(1)
}

console.log("official practice validation ok: 100 approved questions, 0 errors")
console.log("banks ok: 001-020, 021-040, 041-060, 061-080, 081-100")
