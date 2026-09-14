#!/usr/bin/env node
/** Phase 4 release gate for the Milady Exam Review (8th ed.) pool.
 * Reads only committed release artifacts (questions.json, sources/*) --
 * never the gitignored raw PDF or archive/ working folder, so this runs
 * the same way in CI as it does locally. */

const fs = require("node:fs")
const path = require("node:path")
const Ajv = require("ajv")

const bankRoot = path.resolve(__dirname, "..")
const poolRoot = path.join(bankRoot, "milady-review")
const schemaPath = path.join(bankRoot, "schema", "milady-review-question-bank.schema.json")
const releasePath = path.join(poolRoot, "questions.json")
const idMapPath = path.join(bankRoot, "sources", "id-map.json")
const manifestPath = path.join(bankRoot, "sources", "manifest.json")
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

const PDF_SHA256 = "642a81924422a8413a3480820bd68c0967ce10f8f0a9ff61c1a70e8e31cdf469"
const BOOK_TITLE = "Exam Review for Milady Standard Nail Technology, 8th Edition"

/** Per-chapter question counts, independently re-verified against the source
 * PDF's text layer and answer-key pages in Phase 1 (0 mismatches across all
 * 1,148 questions and all 1,148 answer letters). */
const EXPECTED_CHAPTERS = [
  ["foundations", 1, 29], ["foundations", 2, 25], ["foundations", 3, 32], ["foundations", 4, 39],
  ["foundations", 5, 74], ["foundations", 6, 43], ["foundations", 7, 36], ["foundations", 8, 37],
  ["foundations", 9, 39], ["foundations", 10, 33],
  ["nails", 1, 26], ["nails", 2, 56], ["nails", 3, 59], ["nails", 4, 49], ["nails", 5, 52],
  ["nails", 6, 86], ["nails", 7, 79], ["nails", 8, 47], ["nails", 9, 40], ["nails", 10, 42],
  ["nails", 11, 42], ["nails", 12, 43], ["nails", 13, 40],
  ["comprehensive", null, 100],
]

const schema = readJson(schemaPath)
const release = readJson(releasePath)
const idMap = readJson(idMapPath)
const manifest = readJson(manifestPath)

if (schema && release && idMap && manifest) {
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
      errors.push(`schema${error.instancePath || ""}: ${error.message}`)
    }
  }

  const manifestSource = (manifest.sources || []).find((entry) => entry.book === BOOK_TITLE)
  fail(Boolean(manifestSource), "manifest.json: missing source entry for the Exam Review PDF")
  fail(manifestSource?.sha256 === PDF_SHA256, "manifest.json: PDF sha256 does not match the Phase-1-verified hash")
  fail(manifestSource?.extractedItemCounts?.total === 1148, "manifest.json: extractedItemCounts.total must be 1148")

  const questions = release.questions || []
  const seenIds = new Set()
  const countsBySection = { foundations: 0, nails: 0, comprehensive: 0 }
  const countsByChapter = new Map()

  for (const question of questions) {
    const context = question.id || "(missing id)"
    if (seenIds.has(question.id)) fail(false, `${context}: duplicate id`)
    seenIds.add(question.id)

    countsBySection[question.section] = (countsBySection[question.section] || 0) + 1
    const chapterKey = `${question.section}-${question.chapter}`
    countsByChapter.set(chapterKey, (countsByChapter.get(chapterKey) || 0) + 1)

    const expectedIdPrefix =
      question.section === "comprehensive"
        ? "milady-review-comprehensive-"
        : `milady-review-${question.section}-${String(question.chapter).padStart(2, "0")}-`
    const expectedId = `${expectedIdPrefix}${String(question.questionNumber).padStart(3, "0")}`
    fail(question.id === expectedId, `${context}: expected id ${expectedId}`)

    fail(question.choices?.some((choice) => choice.id === question.correctChoice), `${context}: correctChoice not present in choices`)
    fail(
      question.choices?.every((choice, index) => choice.id === ["a", "b", "c", "d"][index]),
      `${context}: choices must be ordered a-d`,
    )
    fail(
      Object.values(question.verification || {}).every((flag) => flag === true),
      `${context}: verification flags must all be true`,
    )

    const mapEntry = idMap[question.id]
    fail(Boolean(mapEntry), `${context}: missing from sources/id-map.json`)
    if (mapEntry) {
      fail(mapEntry.book === BOOK_TITLE, `${context}: id-map book mismatch`)
      fail(mapEntry.itemRef === question.originalArchiveId, `${context}: id-map itemRef does not match originalArchiveId`)
      fail(mapEntry.sourceHashAtAssignment === PDF_SHA256, `${context}: id-map sourceHashAtAssignment does not match the Phase-1-verified hash`)
    }
  }

  fail(questions.length === 1148, `expected 1148 questions, found ${questions.length}`)
  fail(countsBySection.foundations === 387, `expected 387 foundations questions, found ${countsBySection.foundations}`)
  fail(countsBySection.nails === 661, `expected 661 nails questions, found ${countsBySection.nails}`)
  fail(countsBySection.comprehensive === 100, `expected 100 comprehensive questions, found ${countsBySection.comprehensive}`)

  for (const [section, chapter, expectedCount] of EXPECTED_CHAPTERS) {
    const key = `${section}-${chapter === null ? 0 : chapter}`
    const actual = countsByChapter.get(key) || 0
    fail(actual === expectedCount, `${section} ch.${chapter ?? "-"}: expected ${expectedCount} questions, found ${actual}`)
  }

  // idPrefix filtering must not bleed across chapters (e.g. "-1-" must never
  // match inside "-10-", "-11-", ...): every question a chapter's idPrefix
  // selects must actually belong to that chapter.
  for (const [section, chapter] of EXPECTED_CHAPTERS) {
    const idPrefix =
      section === "comprehensive"
        ? "milady-review-comprehensive-"
        : `milady-review-${section}-${String(chapter).padStart(2, "0")}-`
    const matched = questions.filter((question) => question.id.startsWith(idPrefix))
    const bleed = matched.filter((question) => question.section !== section || (chapter !== null && question.chapter !== chapter))
    fail(bleed.length === 0, `idPrefix ${idPrefix}: matched ${bleed.length} question(s) from a different chapter`)
  }
}

if (errors.length) {
  console.error(`milady review validation failed with ${errors.length} error(s):`)
  console.error(errors.map((error) => `- ${error}`).join("\n"))
  process.exit(1)
}

console.log("milady review validation ok: 1148 approved questions, 0 errors")
console.log("sections ok: foundations 387 (10 ch.), nails 661 (13 ch.), comprehensive 100")
