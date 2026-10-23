import assert from "node:assert/strict"
import test from "node:test"

import { reelSectionStarts, reelStartIndex, shuffleReelSections } from "./word-reel-order.ts"

function seeded(seed) {
  return () => {
    seed = (seed * 1103515245 + 12345) % 2147483648
    return seed / 2147483648
  }
}

const card = (id) => ({ id, word: id, translation: id, partOfSpeech: "Noun", example: id, exampleTranslation: id })
const sections = [
  { id: "1A", title: { en: "A", zh: "甲" }, cards: ["a1", "a2", "a3", "a4", "a5"].map(card) },
  { id: "1B", title: { en: "B", zh: "乙" }, cards: ["b1", "b2", "b3", "b4"].map(card) },
  { id: "1D", title: { en: "More Key Facts", zh: "更多重点" }, cards: ["d1", "d2", "d3"].map(card) },
]

test("shuffling keeps the sections in order and each section's cards inside it", () => {
  const shuffled = shuffleReelSections(sections, seeded(3))
  assert.deepEqual(shuffled.map((s) => s.id), ["1A", "1B", "1D"])
  shuffled.forEach((section, i) => {
    assert.deepEqual(section.cards.map((c) => c.id).sort(), sections[i].cards.map((c) => c.id).sort())
  })
  assert.equal(sections[0].cards[0].id, "a1", "the original sections are not changed")
})

test("different visits get different card orders", () => {
  const orders = new Set()
  for (let seed = 1; seed <= 20; seed++) {
    orders.add(shuffleReelSections(sections, seeded(seed)).flatMap((s) => s.cards.map((c) => c.id)).join())
  }
  assert.ok(orders.size > 10)
})

test("section starts count across the whole reel", () => {
  assert.deepEqual(reelSectionStarts(sections), [0, 5, 9])
})

test("start index: ?section wins, a shuffled reel resumes at the saved card's section", () => {
  assert.equal(reelStartIndex(sections, { sectionId: "1D", savedCardId: "a3", shuffled: true }), 9)
  assert.equal(reelStartIndex(sections, { savedCardId: "b3", shuffled: true }), 5)
  assert.equal(reelStartIndex(sections, { savedCardId: "b3", shuffled: false }), 7)
  assert.equal(reelStartIndex(sections, { sectionId: "nope", savedCardId: "gone", shuffled: true }), 0)
})
