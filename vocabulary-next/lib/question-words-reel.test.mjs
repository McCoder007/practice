import assert from "node:assert/strict"
import test from "node:test"

import { QUESTION_WORD_SECTIONS } from "../data/nail-exam-practice/question-words.ts"

const cards = QUESTION_WORD_SECTIONS.flatMap((section) => section.cards)

test("question-word cards have unique ids and full Chinese", () => {
  assert.equal(new Set(cards.map((card) => card.id)).size, cards.length)
  for (const card of cards) {
    for (const zh of [card.translation, card.exampleTranslation, card.note?.zh]) {
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

test("each example uses its word", () => {
  for (const card of cards) {
    const first = card.word.split(/[\s/→]+/)[0].toLowerCase()
    assert.ok(card.example.toLowerCase().includes(first), `${card.id}: "${card.example}"`)
  }
})
