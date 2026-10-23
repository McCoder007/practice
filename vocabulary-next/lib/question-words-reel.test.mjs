import assert from "node:assert/strict"
import test from "node:test"

import { QUESTION_WORD_SECTIONS } from "../data/nail-exam-practice/question-words.ts"

const cards = QUESTION_WORD_SECTIONS.flatMap((section) => section.cards)

test("question-word cards have unique ids and full Chinese", () => {
  assert.equal(new Set(cards.map((card) => card.id)).size, cards.length)
  for (const card of cards) {
    for (const zh of [card.translation, card.exampleTranslation, ...(card.note ? [card.note.zh] : [])]) {
      assert.match(zh ?? "", /[一-鿿]/, `${card.id} needs Chinese`)
    }
  }
})

test("English lines have no Chinese characters (they are read aloud)", () => {
  for (const card of cards) {
    for (const en of [card.word, card.tts, card.example, card.note?.en]) {
      assert.doesNotMatch(en ?? "", /[一-鿿]/, `${card.id}: ${en}`)
    }
  }
})

test("each example uses its word (any form of a word family)", () => {
  for (const card of cards) {
    // "expose → exposure" or "artificial / natural": any one form counts.
    const forms = card.word.split(/\s*(?:→|\/)\s*/).map((form) => form.split(/\s+/)[0].toLowerCase())
    const example = card.example.toLowerCase()
    assert.ok(forms.some((form) => example.includes(form)), `${card.id}: "${card.example}"`)
  }
})

test("common exam words skip words the topic reels already teach", () => {
  const common = QUESTION_WORD_SECTIONS.find((section) => section.id === "common-words")
  assert.ok(common)
  assert.equal(common.cards.length, 39)
  const words = common.cards.map((card) => card.word)
  for (const taught of ["equipment", "solution", "discoloration"]) assert.ok(!words.includes(taught), taught)
  for (const kept of ["practitioner", "characteristic", "porous / absorbent"]) assert.ok(words.includes(kept), kept)
})
