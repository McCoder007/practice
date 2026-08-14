const fs = require("node:fs")
const path = require("node:path")

function readJson(file) {
  return JSON.parse(fs.readFileSync(file, "utf8"))
}

function expandBatchEntries(batch) {
  const expanded = {}
  for (const [id, compact] of Object.entries(batch.entries || {})) {
    const why = compact.why || []
    const lock = compact.lock || []
    const authorityRefs = (compact.refs || []).map((ref) => {
      if (!Array.isArray(ref)) return ref
      const [section, printedPage, pdfPage] = ref
      return { source: batch.authoritySource || "", section, printedPage, pdfPage }
    })
    expanded[id] = {
      id,
      explanation: { en: why[0] || "", zh: why[1] || "" },
      lockPoint: { en: lock[0] || "", zh: lock[1] || "" },
      teachingRelation: compact.relation || "",
      authorityRefs,
      author: batch.author || "",
      authoredAt: batch.authoredAt || "",
      ...(compact.definedExamTerms ? { definedExamTerms: compact.definedExamTerms } : {}),
    }
  }
  return expanded
}

function readAuthoredEntries(root) {
  const authored = { ...(readJson(path.join(root, "practice/teaching-copy.json")).entries || {}) }
  const batchesDir = path.join(root, "practice/batches")
  for (const filename of fs.readdirSync(batchesDir).filter((name) => name.endsWith(".json")).sort()) {
    const batchEntries = expandBatchEntries(readJson(path.join(batchesDir, filename)))
    for (const [id, entry] of Object.entries(batchEntries)) {
      if (authored[id]) throw new Error(`duplicate authored ID across teaching-copy stores: ${id}`)
      authored[id] = entry
    }
  }
  return authored
}

module.exports = { expandBatchEntries, readAuthoredEntries }
