export const NAIL_EXAM_ATTEMPTS_COLLECTION = "nailExamAttempts"
export const NAIL_EXAM_LEARNERS_COLLECTION = "nailExamLearners"
export const NAIL_EXAM_LEARNER_ID_STORAGE_KEY = "nail-exam-learner-id:v1"
export const NAIL_EXAM_ACTIVITY_STORAGE_KEY = "nail-exam-app-activity:v1"

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
    if (Array.isArray(parsed)) previous = parsed.filter(isFiniteInteger).slice(0, 3)
  } catch {
    previous = []
  }
  if (previous[0] && timestamp - previous[0] < minimumGapMs) return null
  return [timestamp, ...previous.filter((item) => item !== timestamp)].slice(0, 3)
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
  }
}

export function parseNailExamLearnerActivity(value: unknown): NailExamLearnerActivity | null {
  if (!value || typeof value !== "object") return null
  const record = value as Record<string, unknown>
  if (!isNonEmptyString(record.learnerId) || !isFiniteInteger(record.lastActiveAt)) return null
  if (!Array.isArray(record.recentActiveAt)) return null
  const recentActiveAt = record.recentActiveAt.filter(isFiniteInteger).slice(0, 3)
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
  count = 3,
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
