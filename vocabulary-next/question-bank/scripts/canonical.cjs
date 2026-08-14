/**
 * Canonical JSON + content hash. Must match question-bank/scripts/practice_lib.py.
 */
const crypto = require("node:crypto")

function nfcObj(value) {
  if (typeof value === "string") return value.normalize("NFC")
  if (Array.isArray(value)) return value.map(nfcObj)
  if (value && typeof value === "object") {
    const out = {}
    for (const key of Object.keys(value).sort()) out[key] = nfcObj(value[key])
    return out
  }
  return value
}

function canonicalDumps(value) {
  return JSON.stringify(nfcObj(value))
}

function contentHash(record) {
  const payload = {
    choices: (record.choices || []).map((choice) => ({
      en: choice.en,
      id: choice.id,
      zh: choice.zh,
    })),
    choicesOrigin: record.choicesOrigin || "",
    correctChoice: record.correctChoice,
    explanation: record.explanation || { en: "", zh: "" },
    id: record.id,
    lockPoint: record.lockPoint || { en: "", zh: "" },
    question: record.question,
    sources: record.sources || [],
    sourceWarning: record.sourceWarning || "",
    status: record.status,
  }
  return crypto.createHash("sha256").update(canonicalDumps(payload), "utf8").digest("hex")
}

module.exports = { canonicalDumps, contentHash, nfcObj }
