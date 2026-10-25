export const NAIL_EXAM_ATTEMPTS_COLLECTION = "nailExamAttempts"
export const NAIL_EXAM_LEARNERS_COLLECTION = "nailExamLearners"
export const NAIL_EXAM_LEARNER_NAMES_COLLECTION = "nailExamLearnerNames"
export const NAIL_EXAM_LEARNER_NAME_MAX = 40
/** Limits shared with firestore.rules. */
export const NAIL_EXAM_MISSED_MAX = 60
export const NAIL_EXAM_MISSED_TEXT_MAX = 160
/** Missed questions are saved as JSON text no longer than this. */
export const NAIL_EXAM_MISSED_JSON_MAX = 12000
export const NAIL_EXAM_LEARNER_ID_STORAGE_KEY = "nail-exam-learner-id:v1"
export const NAIL_EXAM_ACTIVITY_STORAGE_KEY = "nail-exam-app-activity:v1"
export const NAIL_EXAM_RECENT_HISTORY_LIMIT = 5
export const NAIL_EXAM_REPORTING_TIME_ZONE = "America/Los_Angeles"

export type NailExamAttemptStatus = "started" | "completed"

export type NailExamAttempt = {
  attemptId: string
  learnerId: string
  startedAt: number | null
  completedAt: number | null
  bankId: string
  bankName: string
  sessionTitle: string
  isRandom: boolean
  questionCount: number
  correct: number | null
  status: NailExamAttemptStatus
  /** Questions answered so far; saved while the test is open. */
  answered?: number | null
  correctSoFar?: number | null
  lastAnsweredAt?: number | null
  /** Saved when the test is finished. */
  skipped?: number | null
  missed?: MissedQuestion[]
}

export type MissedQuestion = {
  id: string
  /** The question in English, shortened. */
  question: string
  /** True when the learner skipped it instead of picking a wrong answer. */
  skipped: boolean
}

export type NailExamLearnerActivity = {
  learnerId: string
  lastActiveAt: number
  recentActiveAt: number[]
}

type StorageReaderWriter = Pick<Storage, "getItem" | "setItem">

const ALIAS_COLORS = ["Rose", "Pearl", "Ink", "Blush", "Amber", "Jade", "Ivory", "Plum"]
const ALIAS_TOOLS = ["Buffer", "Clipper", "File", "Brush", "Lamp", "Tip", "Wand", "Towel"]

function isNonEmptyString(value: unknown): value is string {
  return typeof value === "string" && value.trim().length > 0
}

function isFiniteInteger(value: unknown): value is number {
  return typeof value === "number" && Number.isInteger(value)
}

export function createId(): string {
  if (typeof crypto !== "undefined" && typeof crypto.randomUUID === "function") {
    return crypto.randomUUID()
  }
  return `id-${Date.now()}-${Math.random().toString(16).slice(2)}`
}

export function getOrCreateLearnerId(storage: StorageReaderWriter): string {
  const existing = storage.getItem(NAIL_EXAM_LEARNER_ID_STORAGE_KEY)
  if (existing && existing.trim()) return existing
  const created = createId()
  storage.setItem(NAIL_EXAM_LEARNER_ID_STORAGE_KEY, created)
  return created
}

export function getExistingLearnerId(storage: Pick<Storage, "getItem">): string | null {
  const learnerId = storage.getItem(NAIL_EXAM_LEARNER_ID_STORAGE_KEY)
  return learnerId && learnerId.trim() ? learnerId : null
}

/**
 * Computes the next recent-activity timestamps without touching storage, so a
 * caller can decide whether to persist them only after a remote write succeeds.
 * Returns null when the gap since the last recorded activity is too small.
 */
export function prepareRecentActivity(
  storage: Pick<Storage, "getItem">,
  timestamp: number,
  minimumGapMs = 5 * 60 * 1000,
): number[] | null {
  let previous: number[] = []
  try {
    const parsed = JSON.parse(storage.getItem(NAIL_EXAM_ACTIVITY_STORAGE_KEY) || "[]")
    if (Array.isArray(parsed)) {
      previous = parsed.filter(isFiniteInteger).slice(0, NAIL_EXAM_RECENT_HISTORY_LIMIT)
    }
  } catch {
    previous = []
  }
  if (previous[0] && timestamp - previous[0] < minimumGapMs) return null
  return [timestamp, ...previous.filter((item) => item !== timestamp)].slice(
    0,
    NAIL_EXAM_RECENT_HISTORY_LIMIT,
  )
}

export function commitRecentActivity(storage: Pick<Storage, "setItem">, recentActiveAt: number[]): void {
  storage.setItem(NAIL_EXAM_ACTIVITY_STORAGE_KEY, JSON.stringify(recentActiveAt))
}

export type ActivityWriter = (learnerId: string, recentActiveAt: number[]) => Promise<void>

/**
 * Wraps an activity writer so the local throttle is only committed once the
 * write actually succeeds (a failed write must stay retryable), and so
 * overlapping calls (e.g. focus + visibilitychange firing together) collapse
 * into a single in-flight write instead of racing.
 */
export function createActivityThrottle(writeActivity: ActivityWriter) {
  let inFlight: Promise<boolean> | null = null

  return function reportActivity(
    storage: StorageReaderWriter,
    learnerId: string,
    timestamp: number,
    minimumGapMs?: number,
  ): Promise<boolean> {
    if (inFlight) return inFlight
    const recentActiveAt = prepareRecentActivity(storage, timestamp, minimumGapMs)
    if (!recentActiveAt) return Promise.resolve(false)

    inFlight = writeActivity(learnerId, recentActiveAt)
      .then(() => {
        commitRecentActivity(storage, recentActiveAt)
        return true
      })
      .catch(() => false)
      .finally(() => {
        inFlight = null
      })
    return inFlight
  }
}

export function learnerAlias(learnerId: string): string {
  let hash = 0
  for (let i = 0; i < learnerId.length; i += 1) {
    hash = (hash * 33 + learnerId.charCodeAt(i)) >>> 0
  }
  const color = ALIAS_COLORS[hash % ALIAS_COLORS.length]
  const tool = ALIAS_TOOLS[Math.floor(hash / ALIAS_COLORS.length) % ALIAS_TOOLS.length]
  return `${color} ${tool}`
}

export function buildStartedAttempt(input: {
  attemptId: string
  learnerId: string
  startedAt: number
  bankId: string
  bankName: string
  sessionTitle: string
  isRandom: boolean
  questionCount: number
}): NailExamAttempt {
  return {
    attemptId: input.attemptId,
    learnerId: input.learnerId,
    startedAt: input.startedAt,
    completedAt: null,
    bankId: input.bankId,
    bankName: input.bankName,
    sessionTitle: input.sessionTitle,
    isRandom: Boolean(input.isRandom),
    questionCount: Math.max(1, Math.floor(input.questionCount)),
    correct: null,
    status: "started",
  }
}

/**
 * Builds a completed attempt when no "started" record exists (e.g. the start
 * write never landed). startedAt is left null rather than fabricated, so the
 * UI can show duration as unavailable instead of a false ~0-minute duration.
 */
export function buildAttemptWithoutStart(input: {
  attemptId: string
  learnerId: string
  bankId: string
  bankName: string
  sessionTitle: string
  isRandom: boolean
  questionCount: number
  correct: number
  completedAt: number
}): NailExamAttempt {
  const questionCount = Math.max(1, Math.floor(input.questionCount))
  return {
    attemptId: input.attemptId,
    learnerId: input.learnerId,
    startedAt: null,
    completedAt: input.completedAt,
    bankId: input.bankId,
    bankName: input.bankName,
    sessionTitle: input.sessionTitle,
    isRandom: Boolean(input.isRandom),
    questionCount,
    correct: Math.min(questionCount, Math.max(0, Math.floor(input.correct))),
    status: "completed",
  }
}

export function applyAttemptScore(
  attempt: NailExamAttempt,
  correct: number,
  completedAt: number,
): NailExamAttempt {
  const safeCorrect = Math.min(attempt.questionCount, Math.max(0, Math.floor(correct)))
  return {
    ...attempt,
    correct: safeCorrect,
    completedAt,
    status: "completed",
  }
}

export type CompletedScoreFields = {
  correct: number
  completedAt: number
  questionCount: number
  status: "completed"
  skipped: number
  /** JSON text of MissedQuestion[] (text, so the rules can cap its size). */
  missed: string
}

/** Cuts by whole characters, so an emoji is never split in half. */
function clipText(text: string, max: number): string {
  if (text.length <= max) return text
  let out = ""
  for (const char of text) {
    if (out.length + char.length > max) break
    out += char
  }
  return out
}

export function cleanMissedQuestions(missed: MissedQuestion[] = []): MissedQuestion[] {
  return missed.slice(0, NAIL_EXAM_MISSED_MAX).map((item) => ({
    id: clipText(String(item.id), 80),
    question: clipText(String(item.question), NAIL_EXAM_MISSED_TEXT_MAX),
    skipped: Boolean(item.skipped),
  }))
}

/** Missed questions as JSON text within the size cap (drops the last ones if needed). */
export function serializeMissedQuestions(missed: MissedQuestion[] = []): string {
  const items = cleanMissedQuestions(missed)
  while (items.length > 0) {
    const text = JSON.stringify(items)
    if (text.length <= NAIL_EXAM_MISSED_JSON_MAX) return text
    items.pop()
  }
  return "[]"
}

/** A completed attempt as written to the database (missed questions as JSON text). */
export type StoredCompletedAttempt = Omit<NailExamAttempt, "missed"> & { skipped: number; missed: string }

export type CompletedAttemptWriters = {
  /** Adds the score to the existing "started" record. Rejects if there is none. */
  updateScore: (attemptId: string, fields: CompletedScoreFields) => Promise<void>
  /** Creates a full completed record when no "started" record exists. */
  createCompleted: (attempt: StoredCompletedAttempt) => Promise<void>
}

export type CompletedAttemptInput = {
  attemptId: string
  learnerId: string
  bankId: string
  bankName: string
  sessionTitle: string
  isRandom: boolean
  questionCount: number
  correct: number
  completedAt: number
  skipped?: number
  missed?: MissedQuestion[]
}

/** The score to add to a "started" record, and the full record to create if there is none. */
export function buildCompletedAttemptWrites(input: CompletedAttemptInput): {
  fields: CompletedScoreFields
  attempt: StoredCompletedAttempt
} {
  const questionCount = Math.max(1, Math.floor(input.questionCount))
  const fields: CompletedScoreFields = {
    correct: Math.min(questionCount, Math.max(0, Math.floor(input.correct))),
    completedAt: input.completedAt,
    questionCount,
    status: "completed",
    skipped: Math.min(questionCount, Math.max(0, Math.floor(input.skipped ?? 0))),
    missed: serializeMissedQuestions(input.missed),
  }
  return {
    fields,
    attempt: { ...buildAttemptWithoutStart(input), skipped: fields.skipped, missed: fields.missed },
  }
}

/**
 * Saves a finished exam's score. Learners are not allowed to read attempts
 * (only admins can), so this must never check first: it tries to add the
 * score to the "started" record, and if that fails (usually because the start
 * never saved), it creates a completed record instead.
 */
export async function saveCompletedAttempt(
  input: CompletedAttemptInput,
  writers: CompletedAttemptWriters,
): Promise<"updated" | "created" | "failed"> {
  const { fields, attempt } = buildCompletedAttemptWrites(input)
  try {
    await writers.updateScore(input.attemptId, fields)
    return "updated"
  } catch {
    // Fall through: the start record is most likely missing.
  }
  try {
    await writers.createCompleted(attempt)
    return "created"
  } catch {
    return "failed"
  }
}

export type ProgressFields = { answered: number; correctSoFar: number; lastAnsweredAt: number }

/** Progress for a test that is still open, so a quit test shows how far it got. */
export function buildProgressFields(input: {
  answered: number
  correctSoFar: number
  questionCount: number
  at: number
}): ProgressFields {
  const answered = Math.min(Math.max(1, Math.floor(input.questionCount)), Math.max(0, Math.floor(input.answered)))
  return {
    answered,
    correctSoFar: Math.min(answered, Math.max(0, Math.floor(input.correctSoFar))),
    lastAnsweredAt: input.at,
  }
}

function parseMissed(value: unknown): MissedQuestion[] {
  if (typeof value === "string") {
    try {
      value = JSON.parse(value)
    } catch {
      return []
    }
  }
  if (!Array.isArray(value)) return []
  return value.flatMap((item) => {
    if (!item || typeof item !== "object") return []
    const record = item as Record<string, unknown>
    if (!isNonEmptyString(record.id) || typeof record.question !== "string") return []
    return [{ id: record.id, question: record.question, skipped: record.skipped === true }]
  })
}

function optionalInt(value: unknown): number | null {
  return isFiniteInteger(value) && value >= 0 ? value : null
}

export function cleanLearnerName(name: string): string {
  return name.replace(/\s+/g, " ").trim().slice(0, NAIL_EXAM_LEARNER_NAME_MAX)
}

export function parseLearnerName(value: unknown): string | null {
  if (!value || typeof value !== "object") return null
  const name = (value as Record<string, unknown>).name
  if (typeof name !== "string") return null
  return cleanLearnerName(name) || null
}

export function parseNailExamAttempt(value: unknown): NailExamAttempt | null {
  if (!value || typeof value !== "object") return null
  const record = value as Record<string, unknown>
  const startedAt =
    record.startedAt === null
      ? null
      : isFiniteInteger(record.startedAt)
        ? record.startedAt
        : undefined

  if (
    !isNonEmptyString(record.attemptId) ||
    !isNonEmptyString(record.learnerId) ||
    startedAt === undefined ||
    !isNonEmptyString(record.bankId) ||
    !isNonEmptyString(record.bankName) ||
    !isNonEmptyString(record.sessionTitle) ||
    !isFiniteInteger(record.questionCount) ||
    record.questionCount < 1
  ) {
    return null
  }

  const status = record.status === "completed" ? "completed" : "started"
  if (status === "started" && startedAt === null) return null
  const correct =
    record.correct === null || record.correct === undefined
      ? null
      : isFiniteInteger(record.correct)
        ? record.correct
        : null
  const completedAt =
    record.completedAt === null || record.completedAt === undefined
      ? null
      : isFiniteInteger(record.completedAt)
        ? record.completedAt
        : null

  if (status === "completed" && (correct === null || completedAt === null)) return null

  return {
    attemptId: record.attemptId,
    learnerId: record.learnerId,
    startedAt,
    completedAt,
    bankId: record.bankId,
    bankName: record.bankName,
    sessionTitle: record.sessionTitle,
    isRandom: Boolean(record.isRandom),
    questionCount: record.questionCount,
    correct,
    status,
    // Detail fields were added later; only include the ones that were saved.
    ...("answered" in record ? { answered: optionalInt(record.answered) } : {}),
    ...("correctSoFar" in record ? { correctSoFar: optionalInt(record.correctSoFar) } : {}),
    ...("lastAnsweredAt" in record ? { lastAnsweredAt: optionalInt(record.lastAnsweredAt) } : {}),
    ...("skipped" in record ? { skipped: optionalInt(record.skipped) } : {}),
    ...("missed" in record ? { missed: parseMissed(record.missed) } : {}),
  }
}

export function parseNailExamLearnerActivity(value: unknown): NailExamLearnerActivity | null {
  if (!value || typeof value !== "object") return null
  const record = value as Record<string, unknown>
  if (!isNonEmptyString(record.learnerId) || !isFiniteInteger(record.lastActiveAt)) return null
  if (!Array.isArray(record.recentActiveAt)) return null
  const recentActiveAt = record.recentActiveAt
    .filter(isFiniteInteger)
    .slice(0, NAIL_EXAM_RECENT_HISTORY_LIMIT)
  if (recentActiveAt.length === 0 || recentActiveAt[0] !== record.lastActiveAt) return null
  return { learnerId: record.learnerId, lastActiveAt: record.lastActiveAt, recentActiveAt }
}

// Attempts with an unavailable start time still need a stable sort position;
// fall back to completedAt so they slot in near when they actually happened.
function attemptSortTime(attempt: NailExamAttempt): number {
  return attempt.startedAt ?? attempt.completedAt ?? 0
}

export function latestAttemptPerLearner(attempts: NailExamAttempt[]): NailExamAttempt[] {
  const latest = new Map<string, NailExamAttempt>()
  for (const attempt of attempts) {
    const previous = latest.get(attempt.learnerId)
    if (!previous || attemptSortTime(attempt) > attemptSortTime(previous)) {
      latest.set(attempt.learnerId, attempt)
    }
  }
  return [...latest.values()].sort((a, b) => attemptSortTime(b) - attemptSortTime(a))
}

export function recentAttemptsPerLearner(
  attempts: NailExamAttempt[],
  count = NAIL_EXAM_RECENT_HISTORY_LIMIT,
): Map<string, NailExamAttempt[]> {
  const recent = new Map<string, NailExamAttempt[]>()
  for (const attempt of [...attempts].sort((a, b) => attemptSortTime(b) - attemptSortTime(a))) {
    const learnerAttempts = recent.get(attempt.learnerId) || []
    if (learnerAttempts.length < count) learnerAttempts.push(attempt)
    recent.set(attempt.learnerId, learnerAttempts)
  }
  return recent
}

export function formatDuration(startedAt: number | null, completedAt: number | null): string {
  if (completedAt === null) return "In progress"
  if (startedAt === null) return "Unavailable"
  const totalMinutes = Math.max(0, Math.round((completedAt - startedAt) / 60_000))
  if (totalMinutes < 1) return "Under 1 min"
  if (totalMinutes < 60) return `${totalMinutes} min`
  const hours = Math.floor(totalMinutes / 60)
  const minutes = totalMinutes % 60
  return minutes ? `${hours} hr ${minutes} min` : `${hours} hr`
}

export function formatScore(attempt: NailExamAttempt): string {
  if (attempt.status !== "completed" || attempt.correct === null) return "In progress"
  return `${attempt.correct} / ${attempt.questionCount}`
}

/** An unfinished exam older than this is shown as "Not finished", not "In progress". */
export const NAIL_EXAM_STALE_ATTEMPT_MS = 3 * 60 * 60 * 1000

export type AttemptProgress = "finished" | "in-progress" | "not-finished"

export function attemptProgress(attempt: NailExamAttempt, now: number = Date.now()): AttemptProgress {
  if (attempt.status === "completed" && attempt.correct !== null) return "finished"
  const startedAt = attempt.startedAt ?? 0
  return now - startedAt > NAIL_EXAM_STALE_ATTEMPT_MS ? "not-finished" : "in-progress"
}

export function attemptScorePercent(attempt: NailExamAttempt): number | null {
  if (attempt.status !== "completed" || attempt.correct === null) return null
  return Math.round((attempt.correct / attempt.questionCount) * 100)
}

export type LearnerTestSummary = {
  total: number
  finished: number
  averagePercent: number | null
}

export function summarizeLearnerTests(attempts: NailExamAttempt[]): LearnerTestSummary {
  const percents = attempts.map(attemptScorePercent).filter((percent): percent is number => percent !== null)
  return {
    total: attempts.length,
    finished: percents.length,
    averagePercent: percents.length
      ? Math.round(percents.reduce((total, percent) => total + percent, 0) / percents.length)
      : null,
  }
}

function formatPacificDateTime(timestamp: number | null): string {
  if (timestamp === null) return ""
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

function csvCell(value: string | number | null): string {
  let text = value === null ? "" : String(value)
  // Attempt records are written by browsers, so stop a spreadsheet from
  // treating a value as a formula.
  if (/^[=+\-@\t\r]/.test(text)) text = `'${text}`
  return /[",\n\r]/.test(text) ? `"${text.replace(/"/g, '""')}"` : text
}

const PROGRESS_LABELS: Record<AttemptProgress, string> = {
  finished: "Finished",
  "in-progress": "In progress",
  "not-finished": "Not finished",
}

/** Every attempt as CSV rows for a spreadsheet. Times are Pacific. */
export function attemptsToCsv(
  attempts: NailExamAttempt[],
  now: number = Date.now(),
  nameOf: (learnerId: string) => string = learnerAlias,
): string {
  const header = [
    "Learner",
    "Learner ID",
    "Test",
    "Question bank",
    "Random draw",
    "Started (Pacific)",
    "Finished (Pacific)",
    "Minutes",
    "Correct",
    "Questions",
    "Score %",
    "Status",
    "Skipped",
    "Missed questions",
  ]
  const rows = attempts.map((attempt) => {
    const minutes =
      attempt.startedAt !== null && attempt.completedAt !== null
        ? Math.max(0, Math.round((attempt.completedAt - attempt.startedAt) / 60_000))
        : null
    return [
      nameOf(attempt.learnerId),
      attempt.learnerId,
      attempt.sessionTitle,
      attempt.bankName,
      attempt.isRandom ? "Yes" : "No",
      formatPacificDateTime(attempt.startedAt),
      formatPacificDateTime(attempt.completedAt),
      minutes,
      attempt.correct,
      attempt.questionCount,
      attemptScorePercent(attempt),
      attempt.status === "completed" || !attempt.answered
        ? PROGRESS_LABELS[attemptProgress(attempt, now)]
        : `${PROGRESS_LABELS[attemptProgress(attempt, now)]} (${attempt.answered} answered)`,
      attempt.skipped ?? null,
      (attempt.missed ?? []).map((item) => item.question).join(" | ") || null,
    ]
  })
  return [header, ...rows].map((row) => row.map(csvCell).join(",")).join("\r\n")
}

function timeZoneOffsetAt(timestamp: number, timeZone: string): number {
  const parts = new Intl.DateTimeFormat("en-US", {
    timeZone,
    year: "numeric",
    month: "numeric",
    day: "numeric",
    hour: "numeric",
    minute: "numeric",
    second: "numeric",
    hourCycle: "h23",
  }).formatToParts(timestamp)
  const values = Object.fromEntries(parts.map((part) => [part.type, part.value]))
  const timestampWithoutMilliseconds = Math.floor(timestamp / 1000) * 1000
  return Date.UTC(
    Number(values.year),
    Number(values.month) - 1,
    Number(values.day),
    Number(values.hour),
    Number(values.minute),
    Number(values.second),
  ) - timestampWithoutMilliseconds
}

export function startOfDayInTimeZone(timestamp: number, timeZone: string): number {
  const parts = new Intl.DateTimeFormat("en-US", {
    timeZone,
    year: "numeric",
    month: "numeric",
    day: "numeric",
  }).formatToParts(timestamp)
  const values = Object.fromEntries(parts.map((part) => [part.type, part.value]))
  const utcMidnight = Date.UTC(Number(values.year), Number(values.month) - 1, Number(values.day))
  const firstCandidate = utcMidnight - timeZoneOffsetAt(utcMidnight, timeZone)
  return utcMidnight - timeZoneOffsetAt(firstCandidate, timeZone)
}

export function startOfPacificDay(timestamp: number): number {
  return startOfDayInTimeZone(timestamp, NAIL_EXAM_REPORTING_TIME_ZONE)
}

export function formatRelativeTime(timestamp: number, now: number = Date.now()): string {
  const deltaSeconds = Math.round((now - timestamp) / 1000)
  if (deltaSeconds < 45) return "just now"
  const minutes = Math.round(deltaSeconds / 60)
  if (minutes < 60) return `${minutes} min ago`
  const hours = Math.round(minutes / 60)
  if (hours < 24) return `${hours} hr ago`
  const days = Math.round(hours / 24)
  if (days < 14) return `${days} day${days === 1 ? "" : "s"} ago`
  return new Date(timestamp).toLocaleString()
}
