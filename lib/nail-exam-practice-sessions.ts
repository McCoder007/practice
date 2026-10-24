/**
 * Practice sessions that are not scored exams: word reels, study cards and the
 * look-alike drill. One record per visit. The app rewrites the whole record
 * every so often while the learner is using it, so the admin page can show
 * which reels and sections they used, for how long, and what they tapped.
 */

export const NAIL_EXAM_PRACTICE_SESSIONS_COLLECTION = "nailExamPracticeSessions"

export const PRACTICE_SESSION_KINDS = ["word-reel", "study-cards", "look-alike"] as const
export type PracticeSessionKind = (typeof PRACTICE_SESSION_KINDS)[number]

/** Limits shared with firestore.rules. */
export const PRACTICE_SESSION_LIMITS = {
  idMax: 80,
  sourceIdMax: 120,
  titleMax: 160,
  sectionsMax: 60,
  wordsMax: 100,
  wordMax: 40,
  /** Lists are saved as one line-separated text, so the rules can cap their size. */
  sectionsTextMax: 5000,
  wordsTextMax: 4500,
  activeSecondsMax: 24 * 60 * 60,
  countMax: 100_000,
} as const

/** Time stops counting after this long without a swipe or tap. */
export const PRACTICE_IDLE_MS = 3 * 60 * 1000

export type PracticeSession = {
  sessionId: string
  learnerId: string
  kind: PracticeSessionKind
  sourceId: string
  title: string
  startedAt: number
  lastSeenAt: number
  activeSeconds: number
  cardsSeen: number
  reachedEnd: boolean
  sections: string[]
  wordsTapped: string[]
  hardWordsOpened: string[]
  wordsMissed: string[]
  audioPlays: number
  answered: number
  correct: number
}

export const PRACTICE_SESSION_KIND_LABELS: Record<PracticeSessionKind, string> = {
  "word-reel": "Word reel",
  "study-cards": "Study cards",
  "look-alike": "Look-alike drill",
}

/** Cuts by whole characters, so an emoji is never split in half (a broken string fails the save). */
export function clip(text: string, max: number): string {
  if (text.length <= max) return text
  let out = ""
  for (const char of text) {
    if (out.length + char.length > max) break
    out += char
  }
  return out
}

/** Joins whole items with new lines, dropping the newest ones that don't fit. */
export function joinCapped(items: string[], maxChars: number): string {
  let out = ""
  for (const item of items) {
    const clean = item.replace(/\s+/g, " ").trim()
    if (!clean) continue
    const next = out ? `${out}\n${clean}` : clean
    if (next.length > maxChars) break
    out = next
  }
  return out
}

function addUnique(list: string[], value: string, max: number, itemMax: number = PRACTICE_SESSION_LIMITS.titleMax): string[] {
  const item = clip(value.trim(), itemMax)
  if (!item || list.includes(item) || list.length >= max) return list
  return [...list, item]
}

function bounded(value: number, max: number = PRACTICE_SESSION_LIMITS.countMax): number {
  return Math.min(max, Math.max(0, Math.floor(value)))
}

export function createPracticeSession(input: {
  sessionId: string
  learnerId: string
  kind: PracticeSessionKind
  sourceId: string
  title: string
  startedAt: number
}): PracticeSession {
  return {
    sessionId: clip(input.sessionId, PRACTICE_SESSION_LIMITS.idMax),
    learnerId: clip(input.learnerId, PRACTICE_SESSION_LIMITS.idMax),
    kind: input.kind,
    sourceId: clip(input.sourceId, PRACTICE_SESSION_LIMITS.sourceIdMax),
    title: clip(input.title, PRACTICE_SESSION_LIMITS.titleMax),
    startedAt: input.startedAt,
    lastSeenAt: input.startedAt,
    activeSeconds: 0,
    cardsSeen: 0,
    reachedEnd: false,
    sections: [],
    wordsTapped: [],
    hardWordsOpened: [],
    wordsMissed: [],
    audioPlays: 0,
    answered: 0,
    correct: 0,
  }
}

/**
 * Tracks the session's record plus the card IDs seen so far (kept in memory
 * only; the record stores the count).
 */
export class PracticeSessionLog {
  record: PracticeSession
  private seenCards = new Set<string>()
  private timer: ActiveTimer
  /** Bumped on every change, so a writer can skip unchanged records. */
  version = 0

  constructor(record: PracticeSession, timer: ActiveTimer = new ActiveTimer(record.startedAt)) {
    this.record = record
    this.timer = timer
  }

  private change(now: number, patch: Partial<PracticeSession>) {
    this.timer.touch(now)
    this.record = { ...this.record, ...patch }
    this.version += 1
  }

  seeCard(now: number, cardId: string, sectionTitle?: string) {
    const isNew = !this.seenCards.has(cardId)
    this.seenCards.add(cardId)
    this.change(now, {
      cardsSeen: isNew ? bounded(this.record.cardsSeen + 1) : this.record.cardsSeen,
      sections: sectionTitle
        ? addUnique(this.record.sections, sectionTitle, PRACTICE_SESSION_LIMITS.sectionsMax)
        : this.record.sections,
    })
  }

  reachEnd(now: number) {
    this.change(now, { reachedEnd: true })
  }

  tapWord(now: number, word: string, isHardWord: boolean) {
    this.change(now, {
      wordsTapped: addUnique(this.record.wordsTapped, word, PRACTICE_SESSION_LIMITS.wordsMax, PRACTICE_SESSION_LIMITS.wordMax),
      hardWordsOpened: isHardWord
        ? addUnique(this.record.hardWordsOpened, word, PRACTICE_SESSION_LIMITS.wordsMax, PRACTICE_SESSION_LIMITS.wordMax)
        : this.record.hardWordsOpened,
      audioPlays: bounded(this.record.audioPlays + 1),
    })
  }

  playAudio(now: number) {
    this.change(now, { audioPlays: bounded(this.record.audioPlays + 1) })
  }

  answer(now: number, correct: boolean, missedWord?: string) {
    this.change(now, {
      answered: bounded(this.record.answered + 1),
      correct: bounded(this.record.correct + (correct ? 1 : 0)),
      wordsMissed:
        !correct && missedWord
          ? addUnique(this.record.wordsMissed, missedWord, PRACTICE_SESSION_LIMITS.wordsMax, PRACTICE_SESSION_LIMITS.wordMax)
          : this.record.wordsMissed,
    })
  }

  /** Any other swipe or tap: keeps the time counting. */
  touch(now: number) {
    this.timer.touch(now)
  }

  setVisible(now: number, visible: boolean) {
    this.timer.setVisible(now, visible)
  }

  /** The record as it should be written now. */
  snapshot(now: number): PracticeSession {
    const activeSeconds = bounded(this.timer.activeMs(now) / 1000, PRACTICE_SESSION_LIMITS.activeSecondsMax)
    this.record = {
      ...this.record,
      activeSeconds: Math.max(this.record.activeSeconds, activeSeconds),
      lastSeenAt: Math.max(this.record.lastSeenAt, this.timer.lastActiveAt()),
    }
    return this.record
  }
}

/**
 * Counts time while the page is visible and the learner touched it within
 * the idle limit. Leaving a reel open on the table doesn't add time.
 */
export class ActiveTimer {
  private total = 0
  private countedUntil: number
  private lastInteraction: number
  private visible = true
  private idleMs: number

  constructor(now: number, idleMs: number = PRACTICE_IDLE_MS) {
    this.countedUntil = now
    this.lastInteraction = now
    this.idleMs = idleMs
  }

  private advance(now: number) {
    if (this.visible) {
      const end = Math.min(now, this.lastInteraction + this.idleMs)
      if (end > this.countedUntil) this.total += end - this.countedUntil
    }
    this.countedUntil = Math.max(this.countedUntil, now)
  }

  touch(now: number) {
    this.advance(now)
    this.lastInteraction = Math.max(this.lastInteraction, now)
    this.visible = true
  }

  setVisible(now: number, visible: boolean) {
    this.advance(now)
    this.visible = visible
    // Coming back to the page counts as using it.
    if (visible) this.lastInteraction = Math.max(this.lastInteraction, now)
  }

  activeMs(now: number): number {
    this.advance(now)
    return this.total
  }

  /** The last moment that counted as use. */
  lastActiveAt(): number {
    return Math.min(this.countedUntil, this.lastInteraction + this.idleMs)
  }
}

function isNonEmptyString(value: unknown): value is string {
  return typeof value === "string" && value.trim().length > 0
}

function isInt(value: unknown): value is number {
  return typeof value === "number" && Number.isInteger(value)
}

function stringList(value: unknown): string[] {
  if (typeof value === "string") return value.split("\n").filter(Boolean)
  return Array.isArray(value) ? value.filter((item): item is string => typeof item === "string") : []
}

/** What is written to the database: lists become capped text. */
export type StoredPracticeSession = Omit<PracticeSession, "sections" | "wordsTapped" | "hardWordsOpened" | "wordsMissed"> & {
  sections: string
  wordsTapped: string
  hardWordsOpened: string
  wordsMissed: string
}

export function toStoredPracticeSession(record: PracticeSession): StoredPracticeSession {
  return {
    ...record,
    sections: joinCapped(record.sections, PRACTICE_SESSION_LIMITS.sectionsTextMax),
    wordsTapped: joinCapped(record.wordsTapped, PRACTICE_SESSION_LIMITS.wordsTextMax),
    hardWordsOpened: joinCapped(record.hardWordsOpened, PRACTICE_SESSION_LIMITS.wordsTextMax),
    wordsMissed: joinCapped(record.wordsMissed, PRACTICE_SESSION_LIMITS.wordsTextMax),
  }
}

export function parsePracticeSession(value: unknown): PracticeSession | null {
  if (!value || typeof value !== "object") return null
  const record = value as Record<string, unknown>
  if (
    !isNonEmptyString(record.sessionId) ||
    !isNonEmptyString(record.learnerId) ||
    !PRACTICE_SESSION_KINDS.includes(record.kind as PracticeSessionKind) ||
    !isNonEmptyString(record.sourceId) ||
    !isNonEmptyString(record.title) ||
    !isInt(record.startedAt) ||
    !isInt(record.lastSeenAt)
  ) {
    return null
  }
  const count = (key: string) => (isInt(record[key]) ? Math.max(0, record[key] as number) : 0)
  return {
    sessionId: record.sessionId,
    learnerId: record.learnerId,
    kind: record.kind as PracticeSessionKind,
    sourceId: record.sourceId,
    title: record.title,
    startedAt: record.startedAt,
    lastSeenAt: Math.max(record.startedAt, record.lastSeenAt),
    activeSeconds: count("activeSeconds"),
    cardsSeen: count("cardsSeen"),
    reachedEnd: record.reachedEnd === true,
    sections: stringList(record.sections),
    wordsTapped: stringList(record.wordsTapped),
    hardWordsOpened: stringList(record.hardWordsOpened),
    wordsMissed: stringList(record.wordsMissed),
    audioPlays: count("audioPlays"),
    answered: count("answered"),
    correct: count("correct"),
  }
}

export type PracticeSourceSummary = {
  kind: PracticeSessionKind
  sourceId: string
  title: string
  sessions: number
  activeSeconds: number
  cardsSeen: number
  lastUsedAt: number
}

/** Totals per reel / study-card bank / drill, most time first. */
export function summarizePracticeSources(sessions: PracticeSession[]): PracticeSourceSummary[] {
  const bySource = new Map<string, PracticeSourceSummary>()
  for (const session of sessions) {
    const key = `${session.kind}:${session.sourceId}`
    const item = bySource.get(key) || {
      kind: session.kind,
      sourceId: session.sourceId,
      title: session.title,
      sessions: 0,
      activeSeconds: 0,
      cardsSeen: 0,
      lastUsedAt: 0,
    }
    item.sessions += 1
    item.activeSeconds += session.activeSeconds
    item.cardsSeen += session.cardsSeen
    if (session.lastSeenAt > item.lastUsedAt) {
      item.lastUsedAt = session.lastSeenAt
      item.title = session.title
    }
    bySource.set(key, item)
  }
  return [...bySource.values()].sort((a, b) => b.activeSeconds - a.activeSeconds || b.lastUsedAt - a.lastUsedAt)
}

/** How often each word appears across sessions, most first. */
export function countWords(lists: string[][], limit = 20): { word: string; count: number }[] {
  const counts = new Map<string, { word: string; count: number }>()
  for (const list of lists) {
    for (const word of list) {
      const key = word.toLowerCase()
      const item = counts.get(key) || { word, count: 0 }
      item.count += 1
      counts.set(key, item)
    }
  }
  return [...counts.values()].sort((a, b) => b.count - a.count || a.word.localeCompare(b.word)).slice(0, limit)
}

export function formatMinutes(seconds: number): string {
  if (seconds <= 0) return "0 min"
  const minutes = Math.round(seconds / 60)
  if (minutes < 1) return "Under 1 min"
  if (minutes < 60) return `${minutes} min`
  const hours = Math.floor(minutes / 60)
  const rest = minutes % 60
  return rest ? `${hours} hr ${rest} min` : `${hours} hr`
}
