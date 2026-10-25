import assert from "node:assert/strict"
import test from "node:test"

import {
  INSIGHTS_OUTBOX_MAX_WRITES,
  INSIGHTS_OUTBOX_STORAGE_KEY,
  addToOutbox,
  queueInsightsWrite,
  readOutbox,
  removeFromOutbox,
  shouldRetryLater,
} from "./insights-outbox.ts"
import { GOOGLE_UNREACHABLE_RETRY_MS, isRecentFailure } from "./google-reachability.ts"

function memoryStorage(initial = {}) {
  const values = new Map(Object.entries(initial))
  return {
    getItem: (key) => (values.has(key) ? values.get(key) : null),
    setItem: (key, value) => values.set(key, String(value)),
  }
}

const start = { collection: "nailExamAttempts", id: "a1", op: "set", data: { status: "started", startedAt: 1 } }

test("a repeated set to the same document replaces the queued one in place", () => {
  const session1 = { collection: "nailExamPracticeSessions", id: "s1", op: "set", data: { activeSeconds: 30 } }
  const session2 = { ...session1, data: { activeSeconds: 60 } }
  const writes = addToOutbox(addToOutbox(addToOutbox([], session1), start), session2)
  assert.deepEqual(writes, [session2, start])
})

test("updates after a set stay separate and in order, and later updates merge", () => {
  const progress = { collection: "nailExamAttempts", id: "a1", op: "update", data: { answered: 3, correctSoFar: 2 } }
  const score = {
    collection: "nailExamAttempts",
    id: "a1",
    op: "update",
    data: { status: "completed", correct: 8 },
    fallback: { status: "completed", startedAt: null },
  }
  const writes = addToOutbox(addToOutbox(addToOutbox([], start), progress), score)
  assert.equal(writes.length, 2)
  assert.deepEqual(writes[0], start)
  assert.deepEqual(writes[1].data, { answered: 3, correctSoFar: 2, status: "completed", correct: 8 })
  assert.deepEqual(writes[1].fallback, score.fallback)
})

test("a set after an update on the same document is queued after it", () => {
  const update = { collection: "c", id: "d", op: "update", data: { a: 1 } }
  const set = { collection: "c", id: "d", op: "set", data: { a: 2 } }
  assert.deepEqual(addToOutbox([update], set), [update, set])
})

test("the oldest writes are dropped past the limit", () => {
  let writes = []
  for (let i = 0; i < INSIGHTS_OUTBOX_MAX_WRITES + 5; i += 1) {
    writes = addToOutbox(writes, { collection: "c", id: `d${i}`, op: "set", data: { i } })
  }
  assert.equal(writes.length, INSIGHTS_OUTBOX_MAX_WRITES)
  assert.equal(writes[0].id, "d5")
})

test("removing a sent write keeps a newer version of it", () => {
  const sent = { collection: "c", id: "d", op: "set", data: { v: 1 } }
  const newer = { ...sent, data: { v: 2 } }
  assert.deepEqual(removeFromOutbox([sent, start], sent), [start])
  assert.deepEqual(removeFromOutbox([newer, start], sent), [newer, start])
})

test("queueInsightsWrite stores writes and readOutbox ignores bad data", () => {
  const storage = memoryStorage()
  queueInsightsWrite(storage, start)
  assert.deepEqual(readOutbox(storage), [start])

  assert.deepEqual(readOutbox(memoryStorage({ [INSIGHTS_OUTBOX_STORAGE_KEY]: "not json" })), [])
  assert.deepEqual(
    readOutbox(memoryStorage({ [INSIGHTS_OUTBOX_STORAGE_KEY]: JSON.stringify([{ id: "x" }, start]) })),
    [start],
  )
})

test("network problems are retried later; refusals are dropped", () => {
  assert.equal(shouldRetryLater({ code: "unavailable" }), true)
  assert.equal(shouldRetryLater(new Error("Timed out")), true)
  assert.equal(shouldRetryLater({ code: "permission-denied" }), false)
  assert.equal(shouldRetryLater({ code: "not-found" }), false)
})

test("a failed Google check is trusted for a while, then checked again", () => {
  const now = 1_000_000_000
  assert.equal(isRecentFailure(null, now), false)
  assert.equal(isRecentFailure(now - 1_000, now), true)
  assert.equal(isRecentFailure(now - GOOGLE_UNREACHABLE_RETRY_MS, now), false)
  assert.equal(isRecentFailure(now + 60_000, now), false)
})
