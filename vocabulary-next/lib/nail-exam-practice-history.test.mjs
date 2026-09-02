import assert from "node:assert/strict"
import test from "node:test"

import {
  NAIL_EXAM_GROUP_HISTORY_STORAGE_KEY,
  clearNailExamBankHistory,
  nailExamGroupHistoryId,
  nextNailExamGroupHistoryEntry,
  readNailExamGroupHistory,
  writeNailExamGroupHistory,
} from "./nail-exam-practice-history.ts"

function memoryStorage(initial = {}) {
  const values = new Map(Object.entries(initial))
  return {
    getItem(key) {
      return values.get(key) ?? null
    },
    setItem(key, value) {
      values.set(key, value)
    },
    removeItem(key) {
      values.delete(key)
    },
  }
}

test("group history IDs keep banks and visible ranges separate", () => {
  assert.equal(nailExamGroupHistoryId("official", 21, 40), "official:21-40")
  assert.notEqual(
    nailExamGroupHistoryId("official", 1, 20),
    nailExamGroupHistoryId("bank-a", 1, 20),
  )
})

test("completed attempts, perfect scores, and best score accumulate", () => {
  const first = nextNailExamGroupHistoryEntry(undefined, 18, 20)
  assert.deepEqual(first, { attempts: 1, perfect: 0, bestScore: 18, total: 20 })

  const second = nextNailExamGroupHistoryEntry(first, 20, 20)
  assert.deepEqual(second, { attempts: 2, perfect: 1, bestScore: 20, total: 20 })

  const third = nextNailExamGroupHistoryEntry(second, 17, 20)
  assert.deepEqual(third, { attempts: 3, perfect: 1, bestScore: 20, total: 20 })
})

test("a changed group size starts a fresh compatible history", () => {
  const previous = { attempts: 4, perfect: 2, bestScore: 20, total: 20 }
  assert.deepEqual(nextNailExamGroupHistoryEntry(previous, 7, 8), {
    attempts: 1,
    perfect: 0,
    bestScore: 7,
    total: 8,
  })
})

test("storage parsing ignores corrupt payloads and invalid entries", () => {
  const corrupt = memoryStorage({ [NAIL_EXAM_GROUP_HISTORY_STORAGE_KEY]: "{" })
  assert.deepEqual(readNailExamGroupHistory(corrupt), {})

  const mixed = memoryStorage({
    [NAIL_EXAM_GROUP_HISTORY_STORAGE_KEY]: JSON.stringify({
      "official:1-20": { attempts: 2, perfect: 1, bestScore: 20, total: 20 },
      invalid: { attempts: -1, perfect: 4, bestScore: 99, total: 20 },
    }),
  })
  assert.deepEqual(readNailExamGroupHistory(mixed), {
    "official:1-20": { attempts: 2, perfect: 1, bestScore: 20, total: 20 },
  })
})

test("history writes and bank-scoped clearing preserve other banks", () => {
  const storage = memoryStorage()
  const history = {
    "official:1-20": { attempts: 2, perfect: 1, bestScore: 20, total: 20 },
    "bank-a:1-20": { attempts: 3, perfect: 0, bestScore: 18, total: 20 },
  }

  assert.equal(writeNailExamGroupHistory(storage, history), true)
  const next = clearNailExamBankHistory(storage, history, "official")
  assert.deepEqual(next, {
    "bank-a:1-20": { attempts: 3, perfect: 0, bestScore: 18, total: 20 },
  })
  assert.deepEqual(readNailExamGroupHistory(storage), next)
})
