import assert from "node:assert/strict"
import test from "node:test"

import {
  ActiveTimer,
  PRACTICE_IDLE_MS,
  PRACTICE_SESSION_LIMITS,
  PracticeSessionLog,
  clip,
  countWords,
  createPracticeSession,
  formatMinutes,
  parsePracticeSession,
  summarizePracticeSources,
  toStoredPracticeSession,
} from "./nail-exam-practice-sessions.ts"

const MINUTE = 60_000

function newSession(overrides = {}) {
  return createPracticeSession({
    sessionId: "s1",
    learnerId: "learner-1",
    kind: "word-reel",
    sourceId: "exam-question-words",
    title: "Question Words",
    startedAt: 0,
    ...overrides,
  })
}

test("time counts while the learner is using the page", () => {
  const timer = new ActiveTimer(0)
  timer.touch(1 * MINUTE)
  timer.touch(2 * MINUTE)
  assert.equal(timer.activeMs(2 * MINUTE), 2 * MINUTE)
})

test("time stops counting after the idle limit with no taps", () => {
  const timer = new ActiveTimer(0)
  assert.equal(timer.activeMs(30 * MINUTE), PRACTICE_IDLE_MS)
  timer.touch(30 * MINUTE)
  assert.equal(timer.activeMs(31 * MINUTE), PRACTICE_IDLE_MS + MINUTE)
})

test("time does not count while the page is hidden", () => {
  const timer = new ActiveTimer(0)
  timer.setVisible(1 * MINUTE, false)
  assert.equal(timer.activeMs(10 * MINUTE), 1 * MINUTE)
  timer.setVisible(10 * MINUTE, true)
  assert.equal(timer.activeMs(11 * MINUTE), 2 * MINUTE)
})

test("the session log counts each card once and keeps sections and words in order", () => {
  const log = new PracticeSessionLog(newSession())
  log.seeCard(1_000, "c1", "Set 1")
  log.seeCard(2_000, "c2", "Set 1")
  log.seeCard(3_000, "c1", "Set 1")
  log.seeCard(4_000, "c3", "Set 2")
  log.tapWord(5_000, "sanitize", true)
  log.tapWord(6_000, "the", false)
  log.tapWord(7_000, "sanitize", true)
  log.playAudio(8_000)
  log.reachEnd(9_000)
  const record = log.snapshot(9_000)
  assert.equal(record.cardsSeen, 3)
  assert.deepEqual(record.sections, ["Set 1", "Set 2"])
  assert.deepEqual(record.wordsTapped, ["sanitize", "the"])
  assert.deepEqual(record.hardWordsOpened, ["sanitize"])
  assert.equal(record.audioPlays, 4)
  assert.equal(record.reachedEnd, true)
  assert.equal(record.activeSeconds, 9)
  assert.equal(record.lastSeenAt, 9_000)
})

test("drill answers count right and wrong and keep missed words", () => {
  const log = new PracticeSessionLog(newSession({ kind: "look-alike" }))
  log.answer(1_000, true)
  log.answer(2_000, false, "disinfect")
  log.answer(3_000, false, "disinfect")
  const record = log.snapshot(3_000)
  assert.equal(record.answered, 3)
  assert.equal(record.correct, 1)
  assert.deepEqual(record.wordsMissed, ["disinfect"])
})

test("the version only changes when something new happens", () => {
  const log = new PracticeSessionLog(newSession())
  const before = log.version
  log.snapshot(1_000)
  assert.equal(log.version, before)
  log.seeCard(2_000, "c1")
  assert.equal(log.version, before + 1)
})

test("lists stop growing at their limits", () => {
  const log = new PracticeSessionLog(newSession())
  for (let i = 0; i < 200; i += 1) log.tapWord(i, `word${i}`, false)
  assert.equal(log.snapshot(200).wordsTapped.length, 100)
})

test("a saved session parses back the same", () => {
  const log = new PracticeSessionLog(newSession())
  log.seeCard(1_000, "c1", "Set 1")
  const record = log.snapshot(1_000)
  assert.deepEqual(parsePracticeSession(record), record)
  assert.equal(parsePracticeSession({ ...record, kind: "other" }), null)
  assert.equal(parsePracticeSession({ ...record, startedAt: "x" }), null)
})

test("sources are summed per reel, most time first", () => {
  const a = { ...newSession(), activeSeconds: 60, cardsSeen: 5, lastSeenAt: 10 }
  const b = { ...newSession({ sessionId: "s2" }), activeSeconds: 120, cardsSeen: 7, lastSeenAt: 20 }
  const c = { ...newSession({ sessionId: "s3", sourceId: "nail-technician-reel", title: "Nail Technician" }), activeSeconds: 600, lastSeenAt: 5 }
  const summary = summarizePracticeSources([a, b, c])
  assert.equal(summary[0].sourceId, "nail-technician-reel")
  assert.deepEqual(
    { sessions: summary[1].sessions, activeSeconds: summary[1].activeSeconds, cardsSeen: summary[1].cardsSeen },
    { sessions: 2, activeSeconds: 180, cardsSeen: 12 },
  )
})

test("word counts ignore case and sort by count", () => {
  assert.deepEqual(countWords([["Sanitize", "pH"], ["sanitize"], ["pH", "sanitize"]]), [
    { word: "Sanitize", count: 3 },
    { word: "pH", count: 2 },
  ])
})

test("minutes read simply", () => {
  assert.equal(formatMinutes(0), "0 min")
  assert.equal(formatMinutes(20), "Under 1 min")
  assert.equal(formatMinutes(5 * 60), "5 min")
  assert.equal(formatMinutes(90 * 60), "1 hr 30 min")
})

test("saved sessions store lists as capped text and parse back to lists", () => {
  const log = new PracticeSessionLog(newSession())
  log.seeCard(1_000, "c1", "Set 1")
  log.seeCard(2_000, "c2", "Set 2")
  for (let i = 0; i < 100; i += 1) log.tapWord(3_000 + i, `averyveryverylongwordnumber${i}`, i % 2 === 0)
  const record = log.snapshot(5_000)
  const stored = toStoredPracticeSession(record)
  assert.equal(stored.sections, "Set 1\nSet 2")
  assert.equal(typeof stored.wordsTapped, "string")
  assert.ok(stored.wordsTapped.length <= PRACTICE_SESSION_LIMITS.wordsTextMax)
  const parsed = parsePracticeSession(stored)
  assert.deepEqual(parsed.sections, ["Set 1", "Set 2"])
  assert.deepEqual(parsed.wordsTapped, record.wordsTapped.slice(0, parsed.wordsTapped.length))
  assert.ok(parsed.wordsTapped.length > 50)
})

test("cutting text never splits an emoji", () => {
  assert.equal(clip("ab😀cd", 3), "ab")
  assert.equal(clip("ab😀cd", 4), "ab😀")
  assert.equal(clip("short", 10), "short")
})
