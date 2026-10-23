#!/usr/bin/env node
// Structure and style checks for the NIC Domain Practice sets.
// Runs anywhere (no textbook needed). Textbook quote checks live in
// verify-nic-domain-evidence.py, which runs locally only.

const fs = require("node:fs")
const path = require("node:path")

const bankRoot = path.resolve(__dirname, "..")
const setsDir = path.join(bankRoot, "nic-domain-practice/sets")
const otherBanks = [
  "practice/questions.json",
  "official-practice/questions.json",
  "kelly-nail-school/questions.json",
  "milady-review/questions.json",
]

const LIMITS = { stemWords: 18, choiceWords: 8, explanationWords: 35, lockPointWords: 20, setMin: 5, setMax: 20 }
const CHOICE_IDS = ["a", "b", "c", "d"]
const HOOK_TYPES = new Set([
  "word-parts", "word-link", "chinese-character", "body-cue", "picture", "comparison",
  "reason-chain", "real-life", "name-trap", "real-acronym", "contrast",
])
// Learners are ESL level 2: hooks must not teach Latin/Greek/French word origins.
// ("French manicure/tips" is a nail term, not a word origin.)
const FOREIGN_ORIGIN = /\b(latin|greek|italian|old word|from an old)\b|\bfrench\b(?!\s+(manicure|tips?|nails?|polish|smile|line|white))|拉丁|希腊|法语|法文|意大利/i
const STOP = new Set("a an the is are be of to in on and or for by it its as at not no from that this with like so than".split(" "))
const errors = []
const warnings = []

const words = (text) => text.trim().split(/\s+/).filter(Boolean).length
const norm = (text) => text.toLowerCase().replace(/[^a-z0-9 ]+/g, " ").replace(/\s+/g, " ").trim()
const hasZh = (text) => typeof text === "string" && /[一-鿿]/.test(text)

function checkText(label, value, maxWords) {
  if (!value || typeof value.en !== "string" || !value.en.trim()) errors.push(`${label}: missing English`)
  else if (maxWords && words(value.en) > maxWords) errors.push(`${label}: ${words(value.en)} words (max ${maxWords})`)
  if (!value || !hasZh(value.zh)) errors.push(`${label}: missing Chinese`)
}

const otherStems = []
for (const rel of otherBanks) {
  const file = path.join(bankRoot, rel)
  if (!fs.existsSync(file)) continue
  const data = JSON.parse(fs.readFileSync(file, "utf8"))
  for (const q of data.questions || []) {
    const stem = q.question?.en || q.displayQuestionEn
    if (stem) otherStems.push({ id: q.id, tokens: new Set(norm(stem).split(" ")) })
  }
}

function jaccard(a, b) {
  let shared = 0
  for (const t of a) if (b.has(t)) shared++
  return shared / (a.size + b.size - shared)
}

const seenIds = new Set()
const seenStems = new Map()
// Optional: `--set 1B --set 1C` checks only those sets. Other NIC sets are
// still compared for near-duplicate stems, but their errors are not reported.
const onlySets = process.argv.flatMap((arg, i, all) => (arg === "--set" ? [all[i + 1]] : []))
const allSetFiles = fs.existsSync(setsDir) ? fs.readdirSync(setsDir).filter((f) => f.endsWith(".json")).sort() : []
const setFiles = onlySets.length ? allSetFiles.filter((f) => onlySets.some((id) => f.startsWith(`${id}-`))) : allSetFiles
if (setFiles.length === 0) errors.push("no set files found")
for (const file of allSetFiles.filter((f) => !setFiles.includes(f))) {
  try {
    const other = JSON.parse(fs.readFileSync(path.join(setsDir, file), "utf8"))
    for (const q of other.questions || []) {
      if (q.question?.en) otherStems.push({ id: q.id, tokens: new Set(norm(q.question.en).split(" ")) })
    }
  } catch {
    warnings.push(`${file}: could not be read (another set may be mid-edit)`)
  }
}

let total = 0
const domainSignatures = new Map()
for (const file of setFiles) {
  const set = JSON.parse(fs.readFileSync(path.join(setsDir, file), "utf8"))
  const where = `${file}`
  const d = set.domain || {}
  const signature = JSON.stringify([d.order, d.title?.en, d.title?.zh, d.examWeightPercent])
  if (domainSignatures.has(d.id) && domainSignatures.get(d.id) !== signature) {
    errors.push(`${where}: domain "${d.id}" order/title/weight differs from other sets in that domain`)
  }
  domainSignatures.set(d.id, signature)
  if (!file.startsWith(`${set.setId}-`)) errors.push(`${where}: file name must start with setId ${set.setId}`)
  checkText(`${where} title`, set.title)
  checkText(`${where} domain.title`, set.domain?.title)
  const questions = set.questions || []
  // Main sets have 20 questions. Short "More Key Facts" catch-up sets may have 5-19.
  if (questions.length < LIMITS.setMin || questions.length > LIMITS.setMax) {
    errors.push(`${where}: has ${questions.length} questions (expected ${LIMITS.setMin}-${LIMITS.setMax})`)
  }
  total += questions.length

  const letterCounts = { a: 0, b: 0, c: 0, d: 0 }
  questions.forEach((q, index) => {
    const at = `${where} ${q.id || `#${index + 1}`}`
    const expectedId = `nic-${set.setId.toLowerCase()}-${String(index + 1).padStart(2, "0")}`
    if (q.id !== expectedId) errors.push(`${at}: id should be ${expectedId}`)
    if (seenIds.has(q.id)) errors.push(`${at}: duplicate id`)
    seenIds.add(q.id)

    checkText(`${at} question`, q.question, LIMITS.stemWords)
    checkText(`${at} explanation`, q.explanation, LIMITS.explanationWords)
    checkText(`${at} lockPoint`, q.lockPoint, LIMITS.lockPointWords)

    if (!HOOK_TYPES.has(q.hookType)) errors.push(`${at}: hookType must be one of ${[...HOOK_TYPES].join(", ")}`)
    // English lines are read aloud by an English voice, so they must not contain Chinese characters.
    for (const [field, text] of [["question.en", q.question?.en], ["explanation.en", q.explanation?.en], ["lockPoint.en", q.lockPoint?.en], ...(q.choices || []).map((c) => [`choice ${c.id}.en`, c.en])]) {
      if (/[\u4e00-\u9fff]/.test(text || "")) errors.push(`${at}: ${field} contains Chinese characters (English text-to-speech)`)
    }
    for (const [field, text] of [["lockPoint.en", q.lockPoint?.en], ["lockPoint.zh", q.lockPoint?.zh], ["explanation.en", q.explanation?.en], ["explanation.zh", q.explanation?.zh]]) {
      if (FOREIGN_ORIGIN.test(text || "")) errors.push(`${at}: ${field} uses a foreign-language word origin (ESL level 2 rule)`)
    }
    // A memory hook should add words beyond the question, answer, and Why line.
    const seen = new Set(norm(`${q.question?.en} ${(q.choices || []).map((c) => c.en).join(" ")} ${q.explanation?.en}`).split(" "))
    const hookWords = norm(q.lockPoint?.en || "").split(" ").filter((w) => w && !STOP.has(w))
    const fresh = hookWords.filter((w) => !seen.has(w))
    if (hookWords.length && fresh.length < 2) warnings.push(`${at}: Lock this may only repeat the answer ("${q.lockPoint.en}")`)

    const ids = (q.choices || []).map((c) => c.id)
    if (ids.join() !== CHOICE_IDS.join()) errors.push(`${at}: choices must be a, b, c, d in order`)
    const choiceTexts = new Set()
    for (const choice of q.choices || []) {
      checkText(`${at} choice ${choice.id}`, choice, LIMITS.choiceWords)
      const key = norm(choice.en || "")
      if (choiceTexts.has(key)) errors.push(`${at}: duplicate choice text "${choice.en}"`)
      choiceTexts.add(key)
      if (/\b(all|none) of the above\b/i.test(choice.en || "")) errors.push(`${at}: avoid all/none of the above`)
    }
    if (!CHOICE_IDS.includes(q.correctChoice)) errors.push(`${at}: correctChoice must be a-d`)
    else letterCounts[q.correctChoice]++

    if (!Array.isArray(q.evidence) || q.evidence.length === 0) errors.push(`${at}: needs at least one textbook quote`)
    for (const ev of q.evidence || []) {
      if (!Number.isInteger(ev.pdfPage) || !ev.quote || words(ev.quote) < 5) errors.push(`${at}: evidence needs pdfPage and a quote of 5+ words`)
    }
    if (!Array.isArray(q.authorityRefs) || q.authorityRefs.length === 0) errors.push(`${at}: needs authorityRefs`)

    const stemKey = norm(q.question?.en || "")
    if (seenStems.has(stemKey)) errors.push(`${at}: same stem as ${seenStems.get(stemKey)}`)
    seenStems.set(stemKey, q.id)
    const tokens = new Set(stemKey.split(" "))
    for (const other of otherStems) {
      if (jaccard(tokens, other.tokens) >= 0.8) warnings.push(`${at}: stem very close to existing ${other.id}`)
    }
  })

  const counts = Object.values(letterCounts)
  if (Math.max(...counts) - Math.min(...counts) > 1) {
    errors.push(`${where}: correct letters unbalanced ${JSON.stringify(letterCounts)}`)
  }
}

for (const w of warnings) console.warn(`warn: ${w}`)
if (errors.length) {
  for (const e of errors) console.error(`error: ${e}`)
  console.error(`\nNIC Domain Practice: ${errors.length} error(s) across ${setFiles.length} set(s).`)
  process.exit(1)
}
console.log(`NIC Domain Practice OK: ${setFiles.length} set(s), ${total} questions, ${warnings.length} warning(s).`)
