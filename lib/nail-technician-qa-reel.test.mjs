import assert from "node:assert/strict"
import test from "node:test"

import {
  TAP_TOLERANCE_PX,
  classifyQaReelGesture,
  fisherYatesShuffle,
} from "./nail-technician-qa-reel.ts"

test("Fisher-Yates returns every item once without mutating its source", () => {
  const source = Array.from({ length: 227 }, (_, id) => ({ id }))
  const originalIds = source.map(({ id }) => id)
  const randomValues = [0.12, 0.94, 0.33, 0.71]
  let randomIndex = 0

  const shuffled = fisherYatesShuffle(
    source,
    () => randomValues[randomIndex++ % randomValues.length],
  )

  assert.notStrictEqual(shuffled, source)
  assert.deepEqual(source.map(({ id }) => id), originalIds)
  assert.deepEqual(
    shuffled.map(({ id }) => id).sort((a, b) => a - b),
    originalIds,
  )
})

test("gesture classification gives completed swipes priority", () => {
  assert.equal(
    classifyQaReelGesture({
      deltaX: 0,
      deltaY: 80,
      startedInAnswerRegion: true,
      swipeThresholdPx: 80,
    }),
    "swipeNext",
  )
  assert.equal(
    classifyQaReelGesture({
      deltaX: 0,
      deltaY: -80,
      startedInAnswerRegion: true,
      swipeThresholdPx: 80,
    }),
    "swipePrevious",
  )
})

test("only answer-region movement within the tap tolerance reveals", () => {
  const base = {
    startedInAnswerRegion: true,
    swipeThresholdPx: 80,
  }

  assert.equal(
    classifyQaReelGesture({
      ...base,
      deltaX: TAP_TOLERANCE_PX,
      deltaY: TAP_TOLERANCE_PX,
    }),
    "tapReveal",
  )
  assert.equal(
    classifyQaReelGesture({
      ...base,
      deltaX: TAP_TOLERANCE_PX + 0.01,
      deltaY: 0,
    }),
    "cancel",
  )
  assert.equal(
    classifyQaReelGesture({
      ...base,
      deltaX: 0,
      deltaY: TAP_TOLERANCE_PX + 0.01,
    }),
    "cancel",
  )
  assert.equal(
    classifyQaReelGesture({
      ...base,
      deltaX: 0,
      deltaY: 0,
      startedInAnswerRegion: false,
    }),
    "cancel",
  )
})
