#!/usr/bin/env node
// Format and style checks for the NIC topic word reels and look-alike drills.
// Rules: question-bank/nic-domain-practice/word-reels/README.md
// Optional: `--topic anatomy-physiology` checks only that topic (others still count for duplicates).

const fs = require("node:fs")
const path = require("node:path")

const bankDir = path.resolve(__dirname, "../nic-domain-practice")
const reelsDir = path.join(bankDir, "word-reels")
const setsDir = path.join(bankDir, "sets")

const LIMITS = { exampleWords: 12, meaningWords: 8, tipWords: 20, perSetMin: 8, shortSetMin: 3, perSetMax: 12, groupsMin: 3, groupsMax: 6 }
const PARTS_OF_SPEECH = new Set(["Noun", "Verb", "Adjective", "Phrase"])
const FOREIGN_ORIGIN = /\b(latin|greek|italian|old word|from an old)\b|\bfrench\b(?!\s+(manicure|tips?|nails?|polish|smile|line|white))|拉丁|希腊|法语|法文|意大利/i
const HAS_ZH = /[一-鿿]/
const SAY_IT = /^[a-zA-Z]+(?:[- ][a-zA-Z]+)+$/

const errors = []
const words = (text) => String(text || "").trim().split(/\s+/).filter(Boolean).length
const key = (text) => String(text || "").toLowerCase().replace(/[^a-z0-9]+/g, " ").trim()

const onlyTopics = process.argv.flatMap((arg, i, all) => (arg === "--topic" ? [all[i + 1]] : []))

// Set ids per topic, from the question sets.
const setsByTopic = new Map()
// Short catch-up sets (under 20 questions) need fewer word cards.
const setSizes = new Map()
for (const file of fs.readdirSync(setsDir).filter((f) => f.endsWith(".json")).sort()) {
  const set = JSON.parse(fs.readFileSync(path.join(setsDir, file), "utf8"))
  if (!setsByTopic.has(set.domain.id)) setsByTopic.set(set.domain.id, { order: set.domain.order, sets: [] })
  setsByTopic.get(set.domain.id).sets.push(set.setId)
  setSizes.set(set.setId, (set.questions || []).length)
}

function checkEnglish(at, text, maxWords) {
  if (typeof text !== "string" || !text.trim()) return errors.push(`${at}: missing`)
  if (HAS_ZH.test(text)) errors.push(`${at}: English text contains Chinese characters (read aloud by an English voice)`)
  if (FOREIGN_ORIGIN.test(text)) errors.push(`${at}: uses a foreign-language word origin (ESL level 2 rule)`)
  if (maxWords && words(text) > maxWords) errors.push(`${at}: ${words(text)} words (max ${maxWords})`)
}

function checkChinese(at, text) {
  if (typeof text !== "string" || !HAS_ZH.test(text)) errors.push(`${at}: missing Chinese`)
  else if (FOREIGN_ORIGIN.test(text)) errors.push(`${at}: uses a foreign-language word origin (ESL level 2 rule)`)
}

function checkEvidence(at, evidence) {
  if (!Array.isArray(evidence) || evidence.length === 0) return errors.push(`${at}: needs at least one textbook quote`)
  for (const ev of evidence) {
    if (!Number.isInteger(ev.pdfPage) || words(ev.quote) < 5) errors.push(`${at}: evidence needs pdfPage and a quote of 5+ words`)
  }
}

const files = fs.existsSync(reelsDir) ? fs.readdirSync(reelsDir).filter((f) => f.endsWith(".json")).sort() : []
const seenWords = new Map()
let totalWords = 0
let totalGroups = 0
let checkedFiles = 0

for (const file of files) {
  const data = JSON.parse(fs.readFileSync(path.join(reelsDir, file), "utf8"))
  const topic = setsByTopic.get(data.topicId)
  const report = !onlyTopics.length || onlyTopics.includes(data.topicId)
  const before = errors.length
  if (!topic) {
    errors.push(`${file}: unknown topicId "${data.topicId}"`)
    continue
  }
  if (file !== `${topic.order}-${data.topicId}.json`) errors.push(`${file}: file name should be ${topic.order}-${data.topicId}.json`)
  if (!["draft", "reviewed"].includes(data.status)) errors.push(`${file}: status must be draft or reviewed`)

  const perSet = new Map(topic.sets.map((id) => [id, 0]))
  let lastSetIndex = 0
  ;(data.words || []).forEach((card, index) => {
    const at = `${file} words[${index}] "${card.word}"`
    const setIndex = topic.sets.indexOf(card.setId)
    if (setIndex < 0) errors.push(`${at}: setId ${card.setId} is not in this topic (${topic.sets.join(", ")})`)
    else {
      if (setIndex < lastSetIndex) errors.push(`${at}: cards must follow set order`)
      lastSetIndex = setIndex
      perSet.set(card.setId, perSet.get(card.setId) + 1)
    }
    checkEnglish(`${at} word`, card.word)
    const wordKey = key(card.word)
    if (seenWords.has(wordKey)) errors.push(`${at}: word already used in ${seenWords.get(wordKey)}`)
    seenWords.set(wordKey, `${file} (${card.setId})`)
    if (card.sayIt !== undefined) {
      if (!SAY_IT.test(card.sayIt)) errors.push(`${at}: sayIt must be sound chunks joined by hyphens, e.g. ep-oh-NICK-ee-um`)
      else if (!card.sayIt.split(/[- ]/).some((chunk) => chunk.length > 0 && chunk === chunk.toUpperCase())) {
        errors.push(`${at}: sayIt needs one stressed chunk in CAPS`)
      }
    }
    checkChinese(`${at} translation`, card.translation)
    if (!PARTS_OF_SPEECH.has(card.partOfSpeech)) errors.push(`${at}: partOfSpeech must be ${[...PARTS_OF_SPEECH].join(", ")}`)
    checkEnglish(`${at} example`, card.example, LIMITS.exampleWords)
    // The example must use the headword (allowing plural/verb endings on the last word).
    const stem = key(card.word).replace(/(es|s|ed|ing)$/, "")
    if (card.example && !key(card.example).includes(stem.slice(0, Math.max(4, stem.length - 2)))) {
      errors.push(`${at}: example does not use the word`)
    }
    checkChinese(`${at} exampleTranslation`, card.exampleTranslation)
    checkEvidence(at, card.evidence)
  })
  for (const [setId, count] of perSet) {
    const min = (setSizes.get(setId) ?? 20) < 20 ? LIMITS.shortSetMin : LIMITS.perSetMin
    if (count < min || count > LIMITS.perSetMax) {
      errors.push(`${file}: set ${setId} has ${count} words (expected ${min}-${LIMITS.perSetMax})`)
    }
  }
  totalWords += (data.words || []).length

  const groups = data.lookAlikes || []
  if (groups.length < LIMITS.groupsMin || groups.length > LIMITS.groupsMax) {
    errors.push(`${file}: has ${groups.length} look-alike groups (expected ${LIMITS.groupsMin}-${LIMITS.groupsMax})`)
  }
  const groupIds = new Set()
  groups.forEach((group, index) => {
    const at = `${file} lookAlikes[${index}] "${group.id}"`
    if (!/^[a-z0-9-]+$/.test(group.id || "")) errors.push(`${at}: id must be lowercase-with-dashes`)
    if (groupIds.has(group.id)) errors.push(`${at}: duplicate id`)
    groupIds.add(group.id)
    if (!topic.sets.includes(group.setId)) errors.push(`${at}: setId ${group.setId} is not in this topic`)
    const items = group.items || []
    if (items.length < 2 || items.length > 3) errors.push(`${at}: needs 2 or 3 items`)
    const itemWords = new Set()
    const meanings = new Set()
    items.forEach((item, i) => {
      const itemAt = `${at} item ${i + 1}`
      checkEnglish(`${itemAt} word`, item.word)
      checkChinese(`${itemAt} translation`, item.translation)
      checkEnglish(`${itemAt} meaning.en`, item.meaning?.en, LIMITS.meaningWords)
      checkChinese(`${itemAt} meaning.zh`, item.meaning?.zh)
      if (itemWords.has(key(item.word))) errors.push(`${itemAt}: duplicate word`)
      if (meanings.has(key(item.meaning?.en))) errors.push(`${itemAt}: duplicate meaning`)
      itemWords.add(key(item.word))
      meanings.add(key(item.meaning?.en))
      // The meaning must not give away the answer by repeating it.
      if (item.meaning?.en && key(item.meaning.en).includes(key(item.word))) errors.push(`${itemAt}: meaning repeats the word`)
    })
    // Every group needs a memory hook for which word is which.
    checkEnglish(`${at} tip.en`, group.tip?.en, LIMITS.tipWords)
    checkChinese(`${at} tip.zh`, group.tip?.zh)
    const tipKey = key(group.tip?.en)
    const named = items.filter((item) => {
      const stem = key(item.word).split(" ")[0]
      return tipKey.includes(stem.slice(0, Math.min(stem.length, 5)))
    })
    if (group.tip?.en && named.length === 0) errors.push(`${at}: tip should name at least one of the group's words`)
    checkEvidence(at, group.evidence)
  })
  totalGroups += groups.length
  checkedFiles++
  if (!report) errors.splice(before)
}

if (errors.length) {
  for (const e of errors) console.error(`error: ${e}`)
  console.error(`\nNIC word reels: ${errors.length} error(s).`)
  process.exit(1)
}
console.log(`NIC word reels OK: ${checkedFiles} topic file(s), ${totalWords} words, ${totalGroups} look-alike groups.`)
