import assert from "node:assert/strict"
import test from "node:test"

import { buildHardWordIndex, normalizeToken, splitSentence } from "./sentence-words.ts"

const entry = (word, forms) => ({ word, forms, zh: word, en: word, enZh: word })
const particle = entry("particle", ["particle", "particles"])
const freeEdge = entry("free edge", ["free edge"])
const edge = entry("edge", ["edge"])
const index = buildHardWordIndex([particle, freeEdge, edge, entry("client", ["client"])])

const words = (parts) => parts.filter((p) => p.kind === "word")

test("normalizeToken lowercases and drops a possessive 's", () => {
  assert.equal(normalizeToken("Client's"), "client")
  assert.equal(normalizeToken("CLIENT’S"), "client")
  assert.equal(normalizeToken("single-use"), "single-use")
})

test("splitSentence keeps every character, in order", () => {
  const sentence = "Tiny particles hang in the air, near the client's free edge."
  const parts = splitSentence(sentence, index)
  assert.equal(parts.map((p) => p.text).join(""), sentence)
})

test("hard words get their entry; common words have none", () => {
  const parts = words(splitSentence("Tiny particles hang.", index))
  assert.deepEqual(parts.map((p) => [p.text, p.entry?.word]), [["Tiny", undefined], ["particles", "particle"], ["hang", undefined]])
})

test("the longest term wins", () => {
  const parts = words(splitSentence("File the free edge.", index))
  assert.deepEqual(parts.map((p) => p.text), ["File", "the", "free edge"])
  assert.equal(parts[2].entry, freeEdge)
})

test("punctuation between words breaks a term", () => {
  const parts = words(splitSentence("Keep it free, edge first.", index))
  assert.deepEqual(parts.map((p) => [p.text, p.entry?.word]), [["Keep", undefined], ["it", undefined], ["free", undefined], ["edge", "edge"], ["first", undefined]])
})

test("possessive forms still match", () => {
  const parts = words(splitSentence("Check the client's nails.", index))
  assert.equal(parts[2].text, "client's")
  assert.equal(parts[2].entry?.word, "client")
})

test("accented letters stay inside the word", () => {
  const parts = words(splitSentence("Pétrissage lifts the muscle.", index))
  assert.equal(parts[0].text, "Pétrissage")
  assert.equal(parts[0].key, "pétrissage")
})
