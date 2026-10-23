import assert from "node:assert/strict"
import test from "node:test"

import { drawWeightedTest, weightedQuotas } from "./nic-weighted-test.ts"

const NIC_TOPICS = [
  { id: "infection-control", examWeightPercent: 15 },
  { id: "anatomy-physiology", examWeightPercent: 15 },
  { id: "chemistry", examWeightPercent: 10 },
  { id: "pre-service", examWeightPercent: 5 },
  { id: "tools", examWeightPercent: 13 },
  { id: "manicure-pedicure", examWeightPercent: 18 },
  { id: "enhancements", examWeightPercent: 20 },
  { id: "post-service", examWeightPercent: 4 },
]
const FULL_POOL = { "infection-control": 60, "anatomy-physiology": 80, chemistry: 40, "pre-service": 20, tools: 60, "manicure-pedicure": 80, enhancements: 100, "post-service": 20 }

function pool(counts) {
  return Object.entries(counts).flatMap(([domainId, n]) =>
    Array.from({ length: n }, (_, i) => ({ id: `${domainId}-${i}`, domainId })),
  )
}

function seeded(seed) {
  let s = seed
  return () => {
    s = (s * 1103515245 + 12345) % 2147483648
    return s / 2147483648
  }
}

test("a 100-question test matches the NIC exam weights exactly", () => {
  const quotas = weightedQuotas(NIC_TOPICS, FULL_POOL, 100)
  assert.deepEqual(
    NIC_TOPICS.map((t) => quotas[t.id]),
    [15, 15, 10, 5, 13, 18, 20, 4],
  )
})

test("a 50-question test keeps the proportions and adds up to 50", () => {
  const quotas = weightedQuotas(NIC_TOPICS, FULL_POOL, 50)
  assert.equal(Object.values(quotas).reduce((a, b) => a + b, 0), 50)
  assert.equal(quotas.enhancements, 10)
  assert.equal(quotas["post-service"], 2)
})

test("a topic with too few questions gives its share to the others", () => {
  const quotas = weightedQuotas(NIC_TOPICS, { ...FULL_POOL, "pre-service": 2 }, 100)
  assert.equal(quotas["pre-service"], 2)
  assert.equal(Object.values(quotas).reduce((a, b) => a + b, 0), 100)
})

test("each draw has no repeats, the right size, and differs between runs", () => {
  const questions = pool(FULL_POOL)
  const first = drawWeightedTest(questions, NIC_TOPICS, 100, seeded(1))
  const second = drawWeightedTest(questions, NIC_TOPICS, 100, seeded(2))
  assert.equal(first.length, 100)
  assert.equal(new Set(first.map((q) => q.id)).size, 100)
  assert.notDeepEqual(first.map((q) => q.id), second.map((q) => q.id))
  const perTopic = (draw) => NIC_TOPICS.map((t) => draw.filter((q) => q.domainId === t.id).length)
  assert.deepEqual(perTopic(first), [15, 15, 10, 5, 13, 18, 20, 4])
  assert.deepEqual(perTopic(second), [15, 15, 10, 5, 13, 18, 20, 4])
})

test("a smaller pool than the test size returns everything available", () => {
  const questions = pool({ "infection-control": 3, enhancements: 2 })
  assert.equal(drawWeightedTest(questions, NIC_TOPICS, 100, seeded(3)).length, 5)
})
