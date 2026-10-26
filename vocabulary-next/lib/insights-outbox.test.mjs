import assert from "node:assert/strict"
import test from "node:test"

import { combineWrites, deliverWrite, isOutboxWrite, isSameWrite, shouldRetryLater } from "./insights-outbox.ts"
import { GOOGLE_UNREACHABLE_RETRY_MS, isRecentFailure } from "./google-reachability.ts"

const start = { collection: "nailExamAttempts", id: "a1", op: "set", data: { status: "started", startedAt: 1 } }
const progress = { collection: "nailExamAttempts", id: "a1", op: "update", data: { answered: 3, correctSoFar: 2 } }
const score = {
  collection: "nailExamAttempts",
  id: "a1",
  op: "update",
  data: { status: "completed", correct: 8 },
  fallback: { status: "completed", startedAt: null },
}

test("a repeated set to the same document replaces the queued one", () => {
  const session1 = { collection: "nailExamPracticeSessions", id: "s1", op: "set", data: { activeSeconds: 30 } }
  const session2 = { ...session1, data: { activeSeconds: 60 } }
  assert.deepEqual(combineWrites(session1, session2), session2)
})

test("later updates merge into the queued update and keep its fallback", () => {
  const combined = combineWrites(progress, score)
  assert.deepEqual(combined.data, { answered: 3, correctSoFar: 2, status: "completed", correct: 8 })
  assert.deepEqual(combined.fallback, score.fallback)
  assert.deepEqual(combineWrites(score, { ...progress, data: { answered: 4 } }).fallback, score.fallback)
})

test("a set and an update stay separate, and other documents never combine", () => {
  assert.equal(combineWrites(start, progress), null)
  assert.equal(combineWrites(progress, start), null)
  assert.equal(combineWrites(null, start), null)
  assert.equal(combineWrites(start, { ...start, id: "a2" }), null)
})

test("a sent write is only removed if nothing newer was combined into it", () => {
  assert.equal(isSameWrite(start, { ...start, data: { ...start.data } }), true)
  assert.equal(isSameWrite(combineWrites(progress, score), progress), false)
  assert.equal(isSameWrite(score, { ...score, fallback: undefined }), false)
})

test("only well-formed writes are moved from the old outbox", () => {
  assert.equal(isOutboxWrite(start), true)
  assert.equal(isOutboxWrite({ id: "x" }), false)
  assert.equal(isOutboxWrite({ ...start, op: "delete" }), false)
})

test("network problems are retried later; refusals are dropped", () => {
  assert.equal(shouldRetryLater({ code: "unavailable" }), true)
  assert.equal(shouldRetryLater(new Error("Timed out")), true)
  assert.equal(shouldRetryLater({ code: "permission-denied" }), false)
  assert.equal(shouldRetryLater({ code: "not-found" }), false)
})

test("a delivered write is sent once, as queued", async () => {
  const calls = []
  const result = await deliverWrite(score, async (op, data) => { calls.push([op, data]) })
  assert.equal(result, "sent")
  assert.deepEqual(calls, [["update", score.data]])
})

test("a refused score writes its fallback (the start record is missing)", async () => {
  const calls = []
  const result = await deliverWrite(score, async (op, data) => {
    calls.push([op, data])
    if (op === "update") throw { code: "not-found" }
  })
  assert.equal(result, "sent")
  assert.deepEqual(calls, [["update", score.data], ["set", score.fallback]])
})

test("network trouble keeps the write for later instead of using the fallback", async () => {
  const calls = []
  const result = await deliverWrite(score, async (op) => {
    calls.push(op)
    throw new Error("Timed out")
  })
  assert.equal(result, "retry")
  assert.deepEqual(calls, ["update"])
})

test("refused writes without a fallback, or with a refused fallback, are dropped", async () => {
  const refuse = async () => { throw { code: "permission-denied" } }
  assert.equal(await deliverWrite(progress, refuse), "dropped")
  assert.equal(await deliverWrite(score, refuse), "dropped")
})

test("a failed Google check is trusted for a while, then checked again", () => {
  const now = 1_000_000_000
  assert.equal(isRecentFailure(null, now), false)
  assert.equal(isRecentFailure(now - 1_000, now), true)
  assert.equal(isRecentFailure(now - GOOGLE_UNREACHABLE_RETRY_MS, now), false)
  assert.equal(isRecentFailure(now + 60_000, now), false)
})
