#!/usr/bin/env node

const fs = require("node:fs")
const path = require("node:path")
const { auditEntry } = require("./teaching-copy-quality.cjs")
const { readAuthoredEntries } = require("./teaching-copy-storage.cjs")

const root = path.resolve(__dirname, "..")
const read = (relative) => JSON.parse(fs.readFileSync(path.join(root, relative), "utf8"))
const authored = readAuthoredEntries(root)
const decisions = read("reports/review-decisions.json").records || {}
const staging = read("practice/staging.json").questions || []
const release = read("practice/questions.json").questions || []
const byId = new Map(staging.map((question) => [question.id, question]))
const ledger = read("reports/review-ledger.json").records || []
const statusField = {
  answer: "answerReviewStatus",
  teaching: "teachingCopyStatus",
  english: "englishReviewStatus",
  chinese: "chineseReviewStatus",
}

const entryAudits = Object.entries(authored).map(([id, entry]) => auditEntry(id, entry, byId.get(id)))
const relationCounts = {}
const openingCounts = {}
const explanationCounts = {}
for (const entry of Object.values(authored)) {
  relationCounts[entry.teachingRelation || "missing"] = (relationCounts[entry.teachingRelation || "missing"] || 0) + 1
  const opening = (entry.explanation?.en || "").split(/\s+/).slice(0, 4).join(" ").toLowerCase()
  openingCounts[opening] = (openingCounts[opening] || 0) + 1
  const exact = (entry.explanation?.en || "").trim().toLowerCase()
  explanationCounts[exact] = (explanationCounts[exact] || 0) + 1
}

const repeatedOpenings = Object.entries(openingCounts).filter(([, count]) => count >= 3).map(([opening, count]) => ({ opening, count }))
const duplicateExplanations = Object.entries(explanationCounts).filter(([, count]) => count > 1).map(([explanation, count]) => ({ explanation, count }))
const separationFailures = []
for (const row of ledger) {
  for (const role of ["answer", "teaching", "english", "chinese"]) {
    if (row[statusField[role]] === "pass" && (!row[`${role}Reviewer`] || row[`${role}Reviewer`] === row.author)) {
      separationFailures.push({ id: row.id, role })
    }
  }
}

const report = {
  schemaVersion: "1.0.0",
  generatedAt: new Date().toISOString(),
  counts: {
    authored: Object.keys(authored).length,
    reviewed: Object.values(decisions).filter((row) => ["answer", "teaching", "english", "chinese"].every((role) => row[statusField[role]] === "pass")).length,
    approved: release.length,
    quarantined: staging.filter((question) => question.status === "quarantined").length,
    omitted: staging.filter((question) => question.status === "omitted").length,
    flaggedAuthored: entryAudits.filter((entry) => entry.flags.length).length,
  },
  relationCounts,
  flags: entryAudits.filter((entry) => entry.flags.length),
  repeatedOpenings,
  duplicateExplanations,
  authorReviewerSeparationFailures: separationFailures,
}

fs.writeFileSync(path.join(root, "reports/teaching-copy-audit.json"), `${JSON.stringify(report, null, 2)}\n`)
console.log(JSON.stringify(report.counts, null, 2))
if (entryAudits.some((entry) => entry.flags.includes("banned-english-phrase") || entry.flags.includes("banned-chinese-phrase"))) {
  process.exitCode = 1
}
