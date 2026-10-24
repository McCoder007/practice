/** Numbers for the insights page that combine tests and practice sessions. */

import {
  PRACTICE_SESSION_KIND_LABELS,
  type PracticeSession,
} from "./nail-exam-practice-sessions.ts"
import {
  NAIL_EXAM_REPORTING_TIME_ZONE,
  attemptScorePercent,
  learnerAlias,
  startOfPacificDay,
  type NailExamAttempt,
} from "./nail-exam-usage.ts"

/** A test left open for hours isn't hours of study; cap what one test adds. */
export const MAX_TEST_SECONDS = 90 * 60

/** Seconds spent on one test: start to finish, or to the last answer if it wasn't finished. */
export function attemptTestSeconds(attempt: NailExamAttempt): number {
  if (attempt.startedAt === null) return 0
  const end = attempt.completedAt ?? attempt.lastAnsweredAt ?? null
  if (end === null) return 0
  return Math.min(MAX_TEST_SECONDS, Math.max(0, Math.round((end - attempt.startedAt) / 1000)))
}

export type PracticeDay = {
  dayStart: number
  label: string
  testSeconds: number
  practiceSeconds: number
}

const DAY_LABEL = new Intl.DateTimeFormat("en-US", {
  timeZone: NAIL_EXAM_REPORTING_TIME_ZONE,
  weekday: "short",
  month: "numeric",
  day: "numeric",
})

/** The last `count` Pacific days, oldest first, with test and reel/card time for each. */
export function practiceByDay(
  attempts: NailExamAttempt[],
  sessions: PracticeSession[],
  count: number,
  now: number = Date.now(),
): PracticeDay[] {
  const starts: number[] = []
  let dayStart = startOfPacificDay(now)
  for (let i = 0; i < count; i += 1) {
    starts.unshift(dayStart)
    // Step back half a day and snap, so daylight-saving days still line up.
    dayStart = startOfPacificDay(dayStart - 12 * 60 * 60 * 1000)
  }
  const days: PracticeDay[] = starts.map((start) => ({
    dayStart: start,
    label: DAY_LABEL.format(start),
    testSeconds: 0,
    practiceSeconds: 0,
  }))
  const dayFor = (timestamp: number) => {
    for (let i = days.length - 1; i >= 0; i -= 1) {
      if (timestamp >= days[i].dayStart) return i
    }
    return -1
  }
  for (const attempt of attempts) {
    if (attempt.startedAt === null) continue
    const index = dayFor(attempt.startedAt)
    if (index >= 0) days[index].testSeconds += attemptTestSeconds(attempt)
  }
  for (const session of sessions) {
    const index = dayFor(session.startedAt)
    if (index >= 0) days[index].practiceSeconds += session.activeSeconds
  }
  return days
}

export type MissedQuestionSummary = {
  id: string
  question: string
  bankName: string
  /** Times it was answered wrong or skipped. */
  count: number
  skippedCount: number
  lastMissedAt: number
}

/** Questions missed most often across finished tests. */
export function mostMissedQuestions(attempts: NailExamAttempt[], limit = 10): MissedQuestionSummary[] {
  const byId = new Map<string, MissedQuestionSummary>()
  for (const attempt of attempts) {
    for (const missed of attempt.missed ?? []) {
      const item = byId.get(missed.id) || {
        id: missed.id,
        question: missed.question,
        bankName: attempt.bankName,
        count: 0,
        skippedCount: 0,
        lastMissedAt: 0,
      }
      item.count += 1
      if (missed.skipped) item.skippedCount += 1
      item.lastMissedAt = Math.max(item.lastMissedAt, attempt.completedAt ?? 0)
      if (!item.question && missed.question) item.question = missed.question
      byId.set(missed.id, item)
    }
  }
  return [...byId.values()]
    .sort((a, b) => b.count - a.count || b.lastMissedAt - a.lastMissedAt)
    .slice(0, limit)
}

export type BankScoreSummary = {
  bankId: string
  bankName: string
  tests: number
  finished: number
  averagePercent: number | null
  bestPercent: number | null
  /** Scores of the last finished tests, oldest first. */
  recentPercents: number[]
}

/** Scores per question bank, most-used bank first. */
export function scoresByBank(attempts: NailExamAttempt[], recent = 6): BankScoreSummary[] {
  const byBank = new Map<string, { name: string; attempts: NailExamAttempt[] }>()
  for (const attempt of attempts) {
    const item = byBank.get(attempt.bankId) || { name: attempt.bankName, attempts: [] }
    item.attempts.push(attempt)
    byBank.set(attempt.bankId, item)
  }
  return [...byBank.entries()]
    .map(([bankId, { name, attempts: bankAttempts }]) => {
      const finished = bankAttempts
        .filter((attempt) => attemptScorePercent(attempt) !== null)
        .sort((a, b) => (a.completedAt ?? 0) - (b.completedAt ?? 0))
      const percents = finished.map((attempt) => attemptScorePercent(attempt) as number)
      return {
        bankId,
        bankName: name,
        tests: bankAttempts.length,
        finished: finished.length,
        averagePercent: percents.length
          ? Math.round(percents.reduce((total, percent) => total + percent, 0) / percents.length)
          : null,
        bestPercent: percents.length ? Math.max(...percents) : null,
        recentPercents: percents.slice(-recent),
      }
    })
    .sort((a, b) => b.tests - a.tests || a.bankName.localeCompare(b.bankName))
}

function csvCell(value: string | number | boolean | null): string {
  let text = value === null ? "" : String(value)
  if (/^[=+\-@\t\r]/.test(text)) text = `'${text}`
  return /[",\n\r]/.test(text) ? `"${text.replace(/"/g, '""')}"` : text
}

function pacificDateTime(timestamp: number): string {
  const parts = new Intl.DateTimeFormat("en-CA", {
    timeZone: NAIL_EXAM_REPORTING_TIME_ZONE,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    hourCycle: "h23",
  }).formatToParts(timestamp)
  const values = Object.fromEntries(parts.map((part) => [part.type, part.value]))
  return `${values.year}-${values.month}-${values.day} ${values.hour}:${values.minute}`
}

/** Every reel, study-card and drill session as CSV rows. Times are Pacific. */
export function practiceSessionsToCsv(
  sessions: PracticeSession[],
  nameOf: (learnerId: string) => string = learnerAlias,
): string {
  const header = [
    "Learner",
    "Learner ID",
    "Type",
    "Name",
    "Started (Pacific)",
    "Last used (Pacific)",
    "Active minutes",
    "Cards seen",
    "Reached the end",
    "Sections",
    "Words tapped",
    "Words looked up",
    "Words missed",
    "Answered",
    "Correct",
  ]
  const rows = sessions.map((session) => [
    nameOf(session.learnerId),
    session.learnerId,
    PRACTICE_SESSION_KIND_LABELS[session.kind],
    session.title,
    pacificDateTime(session.startedAt),
    pacificDateTime(session.lastSeenAt),
    Math.round(session.activeSeconds / 60),
    session.cardsSeen,
    session.reachedEnd ? "Yes" : "No",
    session.sections.join("; "),
    session.wordsTapped.join("; "),
    session.hardWordsOpened.join("; "),
    session.wordsMissed.join("; "),
    session.kind === "look-alike" ? session.answered : null,
    session.kind === "look-alike" ? session.correct : null,
  ])
  return [header, ...rows].map((row) => row.map(csvCell).join(",")).join("\r\n")
}
