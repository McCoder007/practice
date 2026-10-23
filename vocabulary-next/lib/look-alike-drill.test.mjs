import assert from "node:assert/strict"
import test from "node:test"

import { buildLookAlikeRound } from "./look-alike-drill.ts"

function seeded(seed) {
  return () => {
    seed = (seed * 1103515245 + 12345) % 2147483648
    return seed / 2147483648
  }
}

const groups = Array.from({ length: 6 }, (_, g) => ({ id: `g${g}`, items: g % 2 ? ["a", "b", "c"] : ["a", "b"] }))

test("a round uses each group once before repeating any group", () => {
  const round = buildLookAlikeRound(groups, 10, seeded(7))
  assert.equal(round.length, 10)
  assert.equal(new Set(round.slice(0, 6).map((p) => p.group.id)).size, 6)
})

test("no prompt repeats, and no group appears twice in a row", () => {
  for (let seed = 1; seed < 50; seed++) {
    const round = buildLookAlikeRound(groups, 15, seeded(seed))
    assert.equal(round.length, 15) // 6 groups have 15 items in all
    const keys = round.map((p) => `${p.group.id}:${p.answer}`)
    assert.equal(new Set(keys).size, keys.length)
    for (let i = 1; i < round.length; i++) assert.notEqual(round[i].group.id, round[i - 1].group.id)
  }
})

test("choices show every item of the group once", () => {
  for (const prompt of buildLookAlikeRound(groups, 10, seeded(3))) {
    assert.deepEqual([...prompt.order].sort(), prompt.group.items.map((_, i) => i))
  }
})

test("small pools give a shorter round instead of repeats", () => {
  const round = buildLookAlikeRound(groups.slice(0, 1), 10, seeded(1))
  assert.equal(round.length, 2)
})
