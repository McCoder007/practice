#!/usr/bin/env node
/** Local / CI-with-sources audit. Quarantines are allowed when documented. */

const fs = require("node:fs")
const path = require("node:path")
const crypto = require("node:crypto")
const { contentHash } = require("./canonical.cjs")

const root = path.resolve(__dirname, "..")
const errors = []
const fail = (message) => errors.push(message)

function readJson(relative) {
  const file = path.join(root, relative)
  if (!fs.existsSync(file)) {
    fail(`${relative}: missing`)
    return null
  }
  try {
    return JSON.parse(fs.readFileSync(file, "utf8"))
  } catch (error) {
    fail(`${relative}: invalid JSON (${error.message})`)
    return null
  }
}

function sha256File(file) {
  return crypto.createHash("sha256").update(fs.readFileSync(file)).digest("hex")
}

const staging = readJson("practice/staging.json")
const ledgerDoc = readJson("reports/review-ledger.json")
const idMap = readJson("sources/id-map.json")
const manifest = readJson("sources/manifest.json")
if (!staging || !ledgerDoc || !idMap || !manifest) {
  console.error(errors.join("\n"))
  process.exit(1)
}

const questions = staging.questions || []
const ledger = new Map((ledgerDoc.records || []).map((row) => [row.id, row]))

if (!Array.isArray(questions) || questions.length === 0) fail("staging.json has no questions")

const ids = new Set()
for (const question of questions) {
  if (!question?.id) {
    fail("staging record missing id")
    continue
  }
  if (ids.has(question.id)) fail(`duplicate staging id ${question.id}`)
  ids.add(question.id)
  if (!idMap[question.id]) fail(`${question.id}: missing from id-map.json`)
  if (!["staging", "quarantined", "approved", "omitted"].includes(question.status)) {
    fail(`${question.id}: invalid status ${question.status}`)
  }
  const row = ledger.get(question.id)
  if (!row) fail(`${question.id}: missing ledger row`)
  if (question.status === "quarantined") {
    if (!row) fail(`${question.id}: quarantined item missing ledger row`)
    else {
      if (row.disputeStatus !== "quarantined") fail(`${question.id}: ledger disputeStatus must be quarantined`)
      if (row.answerReviewStatus !== "disputed") fail(`${question.id}: ledger answerReviewStatus must be disputed`)
    }
    if (!question.reviewReason?.en?.trim() || !question.reviewReason?.zh?.trim()) {
      fail(`${question.id}: quarantined item missing bilingual reviewReason`)
    }
  }
  if (question.status === "approved") {
    if (!question.explanation?.en || !question.explanation?.zh) fail(`${question.id}: approved item missing explanation`)
    if (!question.lockPoint?.en || !question.lockPoint?.zh) fail(`${question.id}: approved item missing lockPoint`)
  }
  if (question.sourceWarning && question.status !== "quarantined") {
    if (row?.disputeStatus !== "resolved") fail(`${question.id}: unresolved source warning must be quarantined`)
  }
  if (row && question.status !== "omitted") {
    const hash = contentHash(question)
    if (row.contentHash !== hash) fail(`${question.id}: ledger contentHash mismatch`)
  }
}

for (const source of manifest.sources || []) {
  const file = path.join(root, "Temp", source.filename)
  if (!fs.existsSync(file)) continue
  const digest = sha256File(file)
  if (source.sha256 && source.sha256 !== digest) fail(`manifest hash mismatch for ${source.filename}`)
}

if (errors.length) {
  console.error(errors.join("\n"))
  process.exit(1)
}
console.log(`source-audit ok: ${questions.length} staging records, ${ledger.size} ledger rows`)
