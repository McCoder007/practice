import assert from "node:assert/strict"
import test from "node:test"

import {
  NAIL_EXAM_ACTIVITY_STORAGE_KEY,
  NAIL_EXAM_LEARNER_ID_STORAGE_KEY,
  applyAttemptScore,
  buildAttemptWithoutStart,
  buildStartedAttempt,
  commitRecentActivity,
  createActivityThrottle,
  createId,
  formatDuration,
  formatRelativeTime,
  formatScore,
  getExistingLearnerId,
  getOrCreateLearnerId,
  latestAttemptPerLearner,
  learnerAlias,
  parseNailExamLearnerActivity,
  parseNailExamAttempt,
  prepareRecentActivity,
  recentAttemptsPerLearner,
} from "./nail-exam-usage.ts"

function memoryStorage(initial = {}) {
  const values = new Map(Object.entries(initial))
  return {
    getItem(key) {
      return values.get(key) ?? null
    },
    setItem(key, value) {
      values.set(key, value)
    },
  }
}

test("learner IDs persist in storage", () => {
  const storage = memoryStorage()
  const first = getOrCreateLearnerId(storage)
  const second = getOrCreateLearnerId(storage)
  assert.equal(first, second)
  assert.equal(storage.getItem(NAIL_EXAM_LEARNER_ID_STORAGE_KEY), first)
  assert.equal(getExistingLearnerId(storage), first)
})

test("app activity keeps the last five distinct returns and throttles repeats", () => {
  const storage = memoryStorage()
  function record(timestamp, minimumGapMs) {
    const next = prepareRecentActivity(storage, timestamp, minimumGapMs)
    if (next) commitRecentActivity(storage, next)
    return next
  }
  assert.deepEqual(record(1_000, 100), [1_000])
  assert.equal(record(1_050, 100), null)
  assert.deepEqual(record(2_000, 100), [2_000, 1_000])
  assert.deepEqual(record(3_000, 100), [3_000, 2_000, 1_000])
  assert.deepEqual(record(4_000, 100), [4_000, 3_000, 2_000, 1_000])
  assert.deepEqual(record(5_000, 100), [5_000, 4_000, 3_000, 2_000, 1_000])
  assert.deepEqual(record(6_000, 100), [6_000, 5_000, 4_000, 3_000, 2_000])
  assert.equal(storage.getItem(NAIL_EXAM_ACTIVITY_STORAGE_KEY), "[6000,5000,4000,3000,2000]")
})

test("prepareRecentActivity never mutates storage; only commitRecentActivity does", () => {
  const storage = memoryStorage()
  const next = prepareRecentActivity(storage, 1_000, 100)
  assert.deepEqual(next, [1_000])
  assert.equal(storage.getItem(NAIL_EXAM_ACTIVITY_STORAGE_KEY), null)
  commitRecentActivity(storage, next)
  assert.equal(storage.getItem(NAIL_EXAM_ACTIVITY_STORAGE_KEY), "[1000]")
})

test("activity throttle only commits after a successful write, so a failed write can retry", async () => {
  const storage = memoryStorage()
  let shouldFail = true
  const calls = []
  const reportActivity = createActivityThrottle(async (learnerId, recentActiveAt) => {
    calls.push(recentActiveAt)
    if (shouldFail) throw new Error("network down")
  })

  const first = await reportActivity(storage, "learner-1", 1_000, 100)
  assert.equal(first, false)
  assert.equal(storage.getItem(NAIL_EXAM_ACTIVITY_STORAGE_KEY), null, "failed write must not commit the throttle")

  shouldFail = false
  const retry = await reportActivity(storage, "learner-1", 1_050, 100)
  assert.equal(retry, true)
  assert.deepEqual(calls, [[1_000], [1_050]], "retry must not be blocked by the earlier failed attempt")
  assert.equal(storage.getItem(NAIL_EXAM_ACTIVITY_STORAGE_KEY), "[1050]")
})

test("activity throttle collapses overlapping calls into a single in-flight write", async () => {
  const storage = memoryStorage()
  let resolveWrite
  let writeCount = 0
  const reportActivity = createActivityThrottle(() => {
    writeCount += 1
    return new Promise((resolve) => {
      resolveWrite = () => resolve(undefined)
    })
  })

  const first = reportActivity(storage, "learner-1", 1_000, 100)
  const second = reportActivity(storage, "learner-1", 1_000, 100)
  assert.equal(writeCount, 1, "a second call while one is in flight must not start another write")
  resolveWrite()
  assert.deepEqual(await Promise.all([first, second]), [true, true])
})

test("aliases stay stable for the same learner", () => {
  assert.equal(learnerAlias("abc"), learnerAlias("abc"))
  assert.notEqual(learnerAlias("abc"), learnerAlias("xyz"))
})

test("completion fills in score without changing the start time", () => {
  const started = buildStartedAttempt({
    attemptId: "a1",
    learnerId: "learner-1",
    startedAt: 1_000,
    bankId: "official",
    bankName: "Official Practice",
    sessionTitle: "Official Practice Q1–20",
    isRandom: false,
    questionCount: 20,
  })
  const completed = applyAttemptScore(started, 17, 2_000)
  assert.equal(completed.startedAt, 1_000)
  assert.equal(completed.completedAt, 2_000)
  assert.equal(completed.correct, 17)
  assert.equal(completed.status, "completed")
  assert.equal(formatScore(started), "In progress")
  assert.equal(formatScore(completed), "17 / 20")
})

test("latest attempt per learner keeps the newest start", () => {
  const older = buildStartedAttempt({
    attemptId: "old",
    learnerId: "same",
    startedAt: 10,
    bankId: "bank-a",
    bankName: "Practice Bank A",
    sessionTitle: "Q1–20",
    isRandom: false,
    questionCount: 20,
  })
  const newer = applyAttemptScore(
    buildStartedAttempt({
      attemptId: "new",
      learnerId: "same",
      startedAt: 50,
      bankId: "bank-a",
      bankName: "Practice Bank A",
      sessionTitle: "Q21–40",
      isRandom: false,
      questionCount: 20,
    }),
    19,
    80,
  )
  const other = buildStartedAttempt({
    attemptId: "other",
    learnerId: "two",
    startedAt: 40,
    bankId: "mixed",
    bankName: "Mixed Practice",
    sessionTitle: "Quick practice",
    isRandom: true,
    questionCount: 10,
  })

  const latest = latestAttemptPerLearner([older, other, newer])
  assert.deepEqual(
    latest.map((attempt) => attempt.attemptId),
    ["new", "other"],
  )
  assert.deepEqual(
    recentAttemptsPerLearner([older, other, newer]).get("same").map((attempt) => attempt.attemptId),
    ["new", "old"],
  )
})

test("recent attempts keep the newest five exams and scores per learner", () => {
  const attempts = Array.from({ length: 6 }, (_, index) =>
    applyAttemptScore(
      buildStartedAttempt({
        attemptId: `attempt-${index + 1}`,
        learnerId: "same",
        startedAt: index + 1,
        bankId: "bank-a",
        bankName: "Practice Bank A",
        sessionTitle: `Exam ${index + 1}`,
        isRandom: false,
        questionCount: 20,
      }),
      10 + index,
      100 + index,
    ),
  )

  const recent = recentAttemptsPerLearner(attempts).get("same")
  assert.deepEqual(
    recent.map((attempt) => [attempt.attemptId, attempt.correct]),
    [
      ["attempt-6", 15],
      ["attempt-5", 14],
      ["attempt-4", 13],
      ["attempt-3", 12],
      ["attempt-2", 11],
    ],
  )
})

test("learner activity parsing requires newest activity first", () => {
  const activity = { learnerId: "learner-1", lastActiveAt: 5_000, recentActiveAt: [5_000, 4_000, 3_000, 2_000, 1_000] }
  assert.deepEqual(parseNailExamLearnerActivity(activity), activity)
  assert.equal(parseNailExamLearnerActivity({ ...activity, lastActiveAt: 4_000 }), null)
})

test("exam duration is compact and handles unfinished or missing-start attempts", () => {
  assert.equal(formatDuration(0, null), "In progress")
  assert.equal(formatDuration(0, 20_000), "Under 1 min")
  assert.equal(formatDuration(0, 12 * 60_000), "12 min")
  assert.equal(formatDuration(0, 75 * 60_000), "1 hr 15 min")
  assert.equal(formatDuration(null, 20_000), "Unavailable")
})

test("a completion reported without a matching start preserves score honestly", () => {
  const completed = buildAttemptWithoutStart({
    attemptId: "a1",
    learnerId: "learner-1",
    bankId: "official",
    bankName: "Official Practice",
    sessionTitle: "Official Practice Q1–20",
    isRandom: false,
    questionCount: 20,
    correct: 17,
    completedAt: 5_000,
  })
  assert.equal(completed.startedAt, null)
  assert.equal(completed.completedAt, 5_000)
  assert.equal(completed.correct, 17)
  assert.equal(completed.status, "completed")
  assert.equal(formatScore(completed), "17 / 20")
  assert.equal(formatDuration(completed.startedAt, completed.completedAt), "Unavailable")

  assert.deepEqual(parseNailExamAttempt(completed), completed)
})

test("parseNailExamAttempt rejects a null start time for an in-progress attempt", () => {
  const started = buildStartedAttempt({
    attemptId: "a1",
    learnerId: "learner-1",
    startedAt: 1_000,
    bankId: "official",
    bankName: "Official Practice",
    sessionTitle: "Official Practice Q1–20",
    isRandom: false,
    questionCount: 20,
  })
  assert.equal(parseNailExamAttempt({ ...started, startedAt: null }), null)
})

test("restarting an exam creates a new attempt id", () => {
  const first = createId()
  const second = createId()
  assert.notEqual(first, second)
})

test("parseNailExamAttempt rejects incomplete completed records", () => {
  const started = buildStartedAttempt({
    attemptId: "a1",
    learnerId: "learner-1",
    startedAt: 1_000,
    bankId: "official",
    bankName: "Official Practice",
    sessionTitle: "Official Practice Q1–20",
    isRandom: false,
    questionCount: 20,
  })
  assert.deepEqual(parseNailExamAttempt(started), started)
  assert.equal(parseNailExamAttempt({ ...started, status: "completed" }), null)
})

test("relative times stay compact on a phone", () => {
  const now = 1_000_000
  assert.equal(formatRelativeTime(now - 10_000, now), "just now")
  assert.equal(formatRelativeTime(now - 5 * 60_000, now), "5 min ago")
  assert.equal(formatRelativeTime(now - 3 * 3_600_000, now), "3 hr ago")
})
