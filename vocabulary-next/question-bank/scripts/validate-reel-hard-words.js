#!/usr/bin/env node
// Checks the tap-a-word lists for the nail word reels:
//   data/word-reel/hard-words.json   words that open a word card (Chinese + simple meaning)
//   data/word-reel/easy-words.json   words a beginner already knows (tap only says the word)
// Every word in every reel sentence must be in one of the two lists, so a new card
// can't ship with a hard word that has no help.

const fs = require("node:fs")
const path = require("node:path")

const root = path.resolve(__dirname, "../..")
const { normalizeToken, sentenceTokens } = require(path.join(root, "lib/sentence-words.ts"))

const LIMITS = { meaningWords: 10 }
const HAS_ZH = /[一-鿿]/
const FOREIGN_ORIGIN = /\b(latin|greek|italian|old word|from an old)\b|拉丁|希腊|法语|法文|意大利/i

const errors = []
const words = (text) => String(text || "").trim().split(/\s+/).filter(Boolean).length
const readJson = (file) => JSON.parse(fs.readFileSync(path.join(root, file), "utf8"))

const hard = readJson("data/word-reel/hard-words.json").words
const easy = new Set(readJson("data/word-reel/easy-words.json").words)

// --- The hard-word entries ---
const formOwner = new Map()
hard.forEach((entry, i) => {
  const at = `hard-words #${i + 1} (${entry.word})`
  for (const field of ["word", "zh", "en", "enZh"]) {
    if (typeof entry[field] !== "string" || !entry[field].trim()) errors.push(`${at}: missing ${field}`)
  }
  if (!Array.isArray(entry.forms) || entry.forms.length === 0) errors.push(`${at}: no forms`)
  if (!HAS_ZH.test(entry.zh || "")) errors.push(`${at}: zh has no Chinese`)
  if (!HAS_ZH.test(entry.enZh || "")) errors.push(`${at}: enZh has no Chinese`)
  if (HAS_ZH.test(entry.en || "") || HAS_ZH.test(entry.word || "")) errors.push(`${at}: English field contains Chinese (read aloud by an English voice)`)
  if (words(entry.en) > LIMITS.meaningWords) errors.push(`${at}: meaning is ${words(entry.en)} words (max ${LIMITS.meaningWords})`)
  if (FOREIGN_ORIGIN.test(`${entry.en} ${entry.enZh}`)) errors.push(`${at}: uses a foreign-language word origin (ESL rule)`)
  for (const form of entry.forms || []) {
    const normal = form.split(" ").map(normalizeToken).join(" ")
    if (form !== normal) errors.push(`${at}: form "${form}" should be written "${normal}"`)
    if (formOwner.has(form)) errors.push(`${at}: form "${form}" is also in "${formOwner.get(form)}"`)
    formOwner.set(form, entry.word)
    if (!form.includes(" ") && easy.has(form)) errors.push(`${at}: "${form}" is in both lists`)
  }
})

// --- Every sentence word is sorted ---
async function reelSentences() {
  const list = []
  const reelsDir = path.join(root, "question-bank/nic-domain-practice/word-reels")
  for (const file of fs.readdirSync(reelsDir).filter((f) => f.endsWith(".json")).sort()) {
    for (const word of JSON.parse(fs.readFileSync(path.join(reelsDir, file), "utf8")).words) {
      list.push({ at: `${file} ${word.setId} "${word.word}"`, example: word.example })
    }
  }
  const { QUESTION_WORD_SECTIONS } = await import(path.join(root, "data/nail-exam-practice/question-words.ts"))
  for (const section of QUESTION_WORD_SECTIONS) {
    for (const card of section.cards) list.push({ at: `question-words "${card.word}"`, example: card.example })
  }
  const nailTechnician = (await import(path.join(root, "data/nailTechnicianReel.ts"))).default
  for (const day of nailTechnician) {
    for (const word of day.words) list.push({ at: `nail-technician "${word.word}"`, example: word.example })
  }
  return list
}

async function main() {
  const sentences = await reelSentences()
  const unsorted = new Map()
  for (const { at, example } of sentences) {
    for (const token of sentenceTokens(example)) {
      if (formOwner.has(token.key) || easy.has(token.key)) continue
      if (!unsorted.has(token.key)) unsorted.set(token.key, at)
    }
  }
  for (const [token, at] of unsorted) {
    errors.push(`${at}: "${token}" is in neither hard-words.json nor easy-words.json`)
  }

  if (errors.length) {
    console.error(`Reel hard words: ${errors.length} problem(s)`)
    for (const error of errors.slice(0, 60)) console.error(`  - ${error}`)
    if (errors.length > 60) console.error(`  ...and ${errors.length - 60} more`)
    process.exit(1)
  }
  console.log(`Reel hard words OK: ${hard.length} hard words, ${easy.size} easy words, ${sentences.length} sentences`)
}

main().catch((error) => {
  console.error(error)
  process.exit(1)
})
