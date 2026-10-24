import assert from "node:assert/strict"
import test from "node:test"

import {
  NAIL_EXAM_ACTIVITY_STORAGE_KEY,
  NAIL_EXAM_LEARNER_ID_STORAGE_KEY,
  NAIL_EXAM_STALE_ATTEMPT_MS,
  applyAttemptScore,
  attemptProgress,
  attemptsToCsv,
  buildAttemptWithoutStart,
  buildProgressFields,
  buildStartedAttempt,
  cleanLearnerName,
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
  parseLearnerName,
  parseNailExamLearnerActivity,
  parseNailExamAttempt,
  prepareRecentActivity,
  recentAttemptsPerLearner,
  saveCompletedAttempt,
  serializeMissedQuestions,
  startOfPacificDay,
  summarizeLearnerTests,
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

test("Today starts at Pacific midnight in standard and daylight time", () => {
  assert.equal(
    startOfPacificDay(Date.parse("2026-01-15T18:00:00Z")),
    Date.parse("2026-01-15T08:00:00Z"),
  )
  assert.equal(
    startOfPacificDay(Date.parse("2026-07-15T18:00:00Z")),
    Date.parse("2026-07-15T07:00:00Z"),
  )
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

const finishInput = {
  attemptId: "a1",
  learnerId: "learner-1",
  bankId: "official",
  bankName: "Official Practice",
  sessionTitle: "Official Practice Q1–20",
  isRandom: false,
  questionCount: 20,
  correct: 17,
  completedAt: 5_000,
}

test("saving a score adds it to the start record without reading first", async () => {
  const calls = []
  const result = await saveCompletedAttempt(finishInput, {
    updateScore: async (attemptId, fields) => { calls.push(["update", attemptId, fields]) },
    createCompleted: async (attempt) => { calls.push(["create", attempt]) },
  })
  assert.equal(result, "updated")
  assert.deepEqual(calls, [
    ["update", "a1", { correct: 17, completedAt: 5_000, questionCount: 20, status: "completed", skipped: 0, missed: "[]" }],
  ])
})

test("saving a score creates a completed record when the start record is missing", async () => {
  const created = []
  const result = await saveCompletedAttempt(finishInput, {
    updateScore: async () => { throw new Error("not-found or permission-denied") },
    createCompleted: async (attempt) => { created.push(attempt) },
  })
  assert.equal(result, "created")
  assert.equal(created.length, 1)
  assert.equal(created[0].startedAt, null)
  assert.equal(created[0].correct, 17)
  assert.equal(created[0].status, "completed")
  const parsed = parseNailExamAttempt(created[0])
  assert.equal(parsed.correct, 17)
  assert.equal(parsed.startedAt, null)
  assert.deepEqual(parsed.missed, [])
})

test("saving a score reports failure instead of throwing when both writes fail", async () => {
  const result = await saveCompletedAttempt(finishInput, {
    updateScore: async () => { throw new Error("offline") },
    createCompleted: async () => { throw new Error("offline") },
  })
  assert.equal(result, "failed")
})

test("saving a score keeps correct answers within the question count", async () => {
  let saved
  await saveCompletedAttempt({ ...finishInput, correct: 25 }, {
    updateScore: async (_id, fields) => { saved = fields },
    createCompleted: async () => {},
  })
  assert.equal(saved.correct, 20)
})

function startedAt(time, overrides = {}) {
  return buildStartedAttempt({
    attemptId: `a-${time}`,
    learnerId: "learner-1",
    startedAt: time,
    bankId: "official",
    bankName: "Official Practice",
    sessionTitle: "Official Practice Q1–20",
    isRandom: false,
    questionCount: 20,
    ...overrides,
  })
}

test("old unfinished exams read as not finished, recent ones as in progress", () => {
  const now = 10 * NAIL_EXAM_STALE_ATTEMPT_MS
  assert.equal(attemptProgress(startedAt(now - 60_000), now), "in-progress")
  assert.equal(attemptProgress(startedAt(now - NAIL_EXAM_STALE_ATTEMPT_MS - 1), now), "not-finished")
  assert.equal(attemptProgress(applyAttemptScore(startedAt(1), 10, 2), now), "finished")
})

test("learner summary counts every test and averages only finished ones", () => {
  const summary = summarizeLearnerTests([
    applyAttemptScore(startedAt(1), 20, 2),
    applyAttemptScore(startedAt(3), 10, 4),
    startedAt(5),
  ])
  assert.deepEqual(summary, { total: 3, finished: 2, averagePercent: 75 })
  assert.deepEqual(summarizeLearnerTests([startedAt(1)]), { total: 1, finished: 0, averagePercent: null })
})

test("CSV export has one row per test with Pacific times and safe cells", () => {
  const start = Date.parse("2026-10-23T19:00:00Z")
  const finished = applyAttemptScore(startedAt(start), 18, start + 5 * 60_000)
  const tricky = startedAt(start, { attemptId: "a-2", sessionTitle: '=HYPERLINK("x"), Q1' })
  const csv = attemptsToCsv([finished, tricky], start + 1000)
  const lines = csv.split("\r\n")
  assert.equal(lines.length, 3)
  assert.match(lines[0], /^Learner,Learner ID,Test,/)
  assert.ok(lines[1].includes("2026-10-23 12:00,2026-10-23 12:05,5,18,20,90,Finished"))
  assert.ok(lines[2].includes(`"'=HYPERLINK(""x""), Q1"`))
  assert.ok(lines[2].endsWith(",,20,,In progress,,"))
})

test("a finished test saves which questions were missed or skipped", async () => {
  let saved
  const missed = [
    { id: "q1", question: "x".repeat(500), skipped: false },
    { id: "q2", question: "Which tool?", skipped: true },
  ]
  await saveCompletedAttempt({ ...finishInput, skipped: 1, missed }, {
    updateScore: async (_id, fields) => { saved = fields },
    createCompleted: async () => {},
  })
  assert.equal(saved.skipped, 1)
  assert.equal(typeof saved.missed, "string")
  const savedMissed = JSON.parse(saved.missed)
  assert.equal(savedMissed.length, 2)
  assert.equal(savedMissed[0].question.length, 160)
  assert.equal(savedMissed[1].skipped, true)

  let created
  await saveCompletedAttempt({ ...finishInput, skipped: 1, missed }, {
    updateScore: async () => { throw new Error("missing") },
    createCompleted: async (attempt) => { created = attempt },
  })
  const parsed = parseNailExamAttempt(created)
  assert.equal(parsed.skipped, 1)
  assert.deepEqual(parsed.missed.map((item) => item.id), ["q1", "q2"])
})

test("progress for an open test stays within the question count", () => {
  assert.deepEqual(buildProgressFields({ answered: 7, correctSoFar: 9, questionCount: 20, at: 50 }), {
    answered: 7,
    correctSoFar: 7,
    lastAnsweredAt: 50,
  })
  assert.equal(buildProgressFields({ answered: 30, correctSoFar: 1, questionCount: 20, at: 1 }).answered, 20)
  const started = startedAt(1_000)
  const withProgress = parseNailExamAttempt({ ...started, answered: 7, correctSoFar: 5, lastAnsweredAt: 2_000 })
  assert.equal(withProgress.answered, 7)
  assert.equal(withProgress.correctSoFar, 5)
})

test("learner names are trimmed and short", () => {
  assert.equal(cleanLearnerName("  Mom's   phone  "), "Mom's phone")
  assert.equal(cleanLearnerName("x".repeat(80)).length, 40)
  assert.equal(parseLearnerName({ name: "  " }), null)
  assert.equal(parseLearnerName({ name: "Lan" }), "Lan")
})

test("missed questions stay under the saved size cap", () => {
  const many = Array.from({ length: 200 }, (_, i) => ({ id: `question-${i}`, question: "x".repeat(400), skipped: false }))
  const text = serializeMissedQuestions(many)
  assert.ok(text.length <= 12000)
  const items = JSON.parse(text)
  assert.ok(items.length > 0 && items.length <= 60)
  assert.equal(serializeMissedQuestions([]), "[]")
})
