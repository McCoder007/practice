import assert from "node:assert/strict"
import test from "node:test"

import {
  MAX_TEST_SECONDS,
  attemptTestSeconds,
  mostMissedQuestions,
  practiceByDay,
  practiceSessionsToCsv,
  scoresByBank,
} from "./nail-exam-insights.ts"
import { createPracticeSession } from "./nail-exam-practice-sessions.ts"
import { applyAttemptScore, buildStartedAttempt } from "./nail-exam-usage.ts"

const MINUTE = 60_000

function attempt(startedAt, overrides = {}) {
  return {
    ...buildStartedAttempt({
      attemptId: `a-${startedAt}`,
      learnerId: "learner-1",
      startedAt,
      bankId: "official",
      bankName: "Official Practice",
      sessionTitle: "Official Practice Q1–20",
      isRandom: false,
      questionCount: 20,
    }),
    ...overrides,
  }
}

function finished(startedAt, correct, minutes, overrides = {}) {
  return { ...applyAttemptScore(attempt(startedAt, overrides), correct, startedAt + minutes * MINUTE), ...overrides }
}

test("test time runs to the finish, or the last answer when quit, and is capped", () => {
  assert.equal(attemptTestSeconds(finished(0, 10, 5)), 300)
  assert.equal(attemptTestSeconds(attempt(0, { lastAnsweredAt: 2 * MINUTE })), 120)
  assert.equal(attemptTestSeconds(attempt(0)), 0)
  assert.equal(attemptTestSeconds(finished(0, 10, 600)), MAX_TEST_SECONDS)
})

test("practice is grouped into Pacific days, oldest first", () => {
  const now = Date.parse("2026-10-23T19:00:00Z") // noon Pacific
  const today = Date.parse("2026-10-23T16:00:00Z")
  const yesterdayLate = Date.parse("2026-10-23T06:30:00Z") // 11:30 PM Pacific on the 22nd
  const session = { ...createPracticeSession({ sessionId: "s", learnerId: "l", kind: "word-reel", sourceId: "r", title: "Reel", startedAt: today }), activeSeconds: 240 }
  const days = practiceByDay([finished(today, 10, 5), finished(yesterdayLate, 10, 10)], [session], 3, now)
  assert.equal(days.length, 3)
  assert.equal(days[2].label, "Fri, 10/23")
  assert.equal(days[2].testSeconds, 300)
  assert.equal(days[2].practiceSeconds, 240)
  assert.equal(days[1].testSeconds, 600)
  assert.equal(days[0].testSeconds, 0)
})

test("days line up across the daylight-saving change", () => {
  const now = Date.parse("2026-11-03T20:00:00Z")
  const days = practiceByDay([], [], 4, now)
  // Daylight saving time ends on Sunday, November 1, 2026.
  assert.deepEqual(days.map((day) => day.label), ["Sat, 10/31", "Sun, 11/1", "Mon, 11/2", "Tue, 11/3"])
  assert.equal(days[2].dayStart - days[1].dayStart, 25 * 60 * MINUTE)
})

test("most-missed questions count every miss and skip", () => {
  const missedA = { id: "q1", question: "Which tool?", skipped: false }
  const missedB = { id: "q2", question: "What pH?", skipped: true }
  const list = mostMissedQuestions([
    finished(0, 18, 5, { missed: [missedA, missedB] }),
    finished(10 * MINUTE, 19, 5, { missed: [missedA] }),
  ])
  assert.deepEqual(list.map((item) => [item.id, item.count, item.skippedCount]), [["q1", 2, 0], ["q2", 1, 1]])
})

test("scores per bank show average, best and recent scores in order", () => {
  const banks = scoresByBank([
    finished(0, 10, 5),
    finished(MINUTE, 20, 5),
    attempt(2 * MINUTE),
    finished(3 * MINUTE, 15, 5, { bankId: "bank-a", bankName: "Practice Bank A" }),
  ])
  assert.equal(banks[0].bankId, "official")
  assert.deepEqual(
    { tests: banks[0].tests, finished: banks[0].finished, average: banks[0].averagePercent, best: banks[0].bestPercent, recent: banks[0].recentPercents },
    { tests: 3, finished: 2, average: 75, best: 100, recent: [50, 100] },
  )
})

test("session CSV lists words and uses the learner's name", () => {
  const session = {
    ...createPracticeSession({ sessionId: "s", learnerId: "l1", kind: "word-reel", sourceId: "r", title: "Question Words", startedAt: Date.parse("2026-10-23T19:00:00Z") }),
    activeSeconds: 600,
    cardsSeen: 12,
    wordsTapped: ["sanitize", "pH"],
  }
  const csv = practiceSessionsToCsv([session], () => "Lan")
  const [header, row] = csv.split("\r\n")
  assert.match(header, /^Learner,Learner ID,Type,Name,/)
  assert.ok(row.startsWith("Lan,l1,Word reel,Question Words,2026-10-23 12:00,"))
  assert.ok(row.includes(",10,12,No,,sanitize; pH,,,,"))
})
