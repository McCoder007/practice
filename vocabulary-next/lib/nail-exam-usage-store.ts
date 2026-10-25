import {
  collection,
  deleteDoc,
  doc,
  getDocs,
  getFirestore,
  limit,
  orderBy,
  query,
  setDoc,
  startAfter,
  updateDoc,
  type DocumentData,
  type Firestore,
  type Query,
  type QueryDocumentSnapshot,
  type UpdateData,
} from "firebase/firestore"

import { getFirebaseApp } from "@/lib/firebase-app"
import { isGoogleReachable } from "@/lib/google-reachability"
import {
  queueInsightsWrite,
  readOutbox,
  removeFromOutbox,
  saveOutbox,
  shouldRetryLater,
  type OutboxWrite,
} from "@/lib/insights-outbox"
import {
  NAIL_EXAM_PRACTICE_SESSIONS_COLLECTION,
  parsePracticeSession,
  toStoredPracticeSession,
  type PracticeSession,
} from "@/lib/nail-exam-practice-sessions"
import {
  NAIL_EXAM_ATTEMPTS_COLLECTION,
  NAIL_EXAM_LEARNERS_COLLECTION,
  NAIL_EXAM_LEARNER_NAMES_COLLECTION,
  buildCompletedAttemptWrites,
  buildProgressFields,
  buildStartedAttempt,
  cleanLearnerName,
  parseLearnerName,
  saveCompletedAttempt,
  createActivityThrottle,
  getExistingLearnerId,
  getOrCreateLearnerId,
  parseNailExamLearnerActivity,
  parseNailExamAttempt,
  type CompletedAttemptInput,
  type MissedQuestion,
  type NailExamAttempt,
  type NailExamLearnerActivity,
} from "@/lib/nail-exam-usage"

function getLearnersCollection() {
  const app = getFirebaseApp()
  if (!app) return null
  return collection(getFirestore(app), NAIL_EXAM_LEARNERS_COLLECTION)
}

/**
 * Where learner writes go: Firestore when Google can be reached, otherwise the
 * outbox on this phone. In mainland China Firebase is never started, so it
 * can't keep retrying in the background. Null when Firebase isn't configured.
 */
async function learnerWriteTarget(): Promise<Firestore | "outbox" | null> {
  const app = getFirebaseApp()
  if (!app) return null
  if (!(await isGoogleReachable())) return "outbox"
  const db = getFirestore(app)
  // Older saved writes go first, so a score never lands before its start.
  await flushOutbox(db)
  return db
}

function sendWrite(db: Firestore, write: Pick<OutboxWrite, "collection" | "id" | "op" | "data">): Promise<void> {
  const ref = doc(collection(db, write.collection), write.id)
  return write.op === "set" ? setDoc(ref, write.data) : updateDoc(ref, write.data as UpdateData<DocumentData>)
}

async function writeLearnerDoc(write: OutboxWrite): Promise<void> {
  const target = await learnerWriteTarget()
  if (!target) return
  if (target === "outbox") {
    try {
      queueInsightsWrite(window.localStorage, write)
    } catch {
      // Storage blocked: this insight is lost, the app keeps working.
    }
    return
  }
  await sendWrite(target, write)
}

// A write that never answers (flaky connection) is tried again on a later flush.
const FLUSH_WRITE_TIMEOUT_MS = 15_000
let flushing: Promise<void> | null = null

function withTimeout<T>(promise: Promise<T>, ms: number): Promise<T> {
  return new Promise((resolve, reject) => {
    const timer = window.setTimeout(() => reject(new Error("Timed out")), ms)
    promise.then(resolve, reject).finally(() => window.clearTimeout(timer))
  })
}

/**
 * Sends writes saved while Google couldn't be reached, oldest first. Stops at
 * the first one worth trying again later. Writes the server refuses (e.g. an
 * older copy of a record already saved) are dropped so they can't block the rest.
 */
function flushOutbox(db: Firestore): Promise<void> {
  flushing ??= sendOutbox(db).finally(() => {
    flushing = null
  })
  return flushing
}

async function sendOutbox(db: Firestore): Promise<void> {
  try {
    const storage = window.localStorage
    for (const write of readOutbox(storage)) {
      try {
        await withTimeout(sendWrite(db, write), FLUSH_WRITE_TIMEOUT_MS)
      } catch (error) {
        if (shouldRetryLater(error)) return
        if (write.fallback) {
          try {
            await withTimeout(sendWrite(db, { ...write, op: "set", data: write.fallback }), FLUSH_WRITE_TIMEOUT_MS)
          } catch (fallbackError) {
            if (shouldRetryLater(fallbackError)) return
          }
        }
      }
      saveOutbox(storage, removeFromOutbox(readOutbox(storage), write))
    }
  } catch {
    // Storage blocked: nothing was queued.
  }
}

async function writeLearnerActivity(learnerId: string, recentActiveAt: number[]): Promise<void> {
  await writeLearnerDoc({
    collection: NAIL_EXAM_LEARNERS_COLLECTION,
    id: learnerId,
    op: "set",
    data: { learnerId, lastActiveAt: recentActiveAt[0], recentActiveAt },
  })
}

// Shared across all call sites so overlapping reports (e.g. focus and
// visibilitychange firing together) collapse into one in-flight write, and
// the local throttle only advances once that write actually succeeds.
const reportActivity = createActivityThrottle(async (learnerId, recentActiveAt) => {
  try {
    await writeLearnerActivity(learnerId, recentActiveAt)
  } catch (error) {
    console.error("Failed to report app activity:", error)
    throw error
  }
})

export async function reportNailExamAppActivity(): Promise<void> {
  if (typeof window === "undefined") return
  const learnerId = getExistingLearnerId(window.localStorage)
  if (!learnerId) return
  await reportActivity(window.localStorage, learnerId, Date.now())
}

export async function reportNailExamStarted(input: {
  attemptId: string
  bankId: string
  bankName: string
  sessionTitle: string
  isRandom: boolean
  questionCount: number
}): Promise<void> {
  if (typeof window === "undefined" || !getFirebaseApp()) return

  const learnerId = getOrCreateLearnerId(window.localStorage)
  const startedAt = Date.now()
  const attempt = buildStartedAttempt({
    ...input,
    learnerId,
    startedAt,
  })

  // The attempt write and the activity-summary write are independent: one
  // failing must not roll back or block the other.
  const [attemptResult] = await Promise.allSettled([
    writeLearnerDoc({ collection: NAIL_EXAM_ATTEMPTS_COLLECTION, id: attempt.attemptId, op: "set", data: attempt }),
    reportActivity(window.localStorage, learnerId, startedAt),
  ])
  if (attemptResult.status === "rejected") {
    console.error("Failed to report nail exam start:", attemptResult.reason)
  }
}

export async function reportNailExamCompleted(input: {
  attemptId: string
  bankId: string
  bankName: string
  sessionTitle: string
  isRandom: boolean
  questionCount: number
  correct: number
  skipped?: number
  missed?: MissedQuestion[]
}): Promise<void> {
  if (typeof window === "undefined" || !getFirebaseApp()) return

  const now = Date.now()
  const learnerId = getOrCreateLearnerId(window.localStorage)

  // Learners can't read attempts, so never check whether the start record
  // exists first: saveCompletedAttempt writes and falls back on failure.
  const [attemptResult] = await Promise.allSettled([
    saveCompletedScore({ ...input, learnerId, completedAt: now }),
    reportActivity(window.localStorage, learnerId, now, 0),
  ])
  if (attemptResult.status === "fulfilled" && attemptResult.value === "failed") {
    console.error("Failed to report nail exam score for attempt", input.attemptId)
  }
}

async function saveCompletedScore(input: CompletedAttemptInput): Promise<"updated" | "created" | "failed" | "queued"> {
  const target = await learnerWriteTarget()
  if (!target) return "failed"
  if (target === "outbox") {
    // Saved with the same fallback, used when the outbox is sent.
    const { fields, attempt } = buildCompletedAttemptWrites(input)
    try {
      queueInsightsWrite(window.localStorage, {
        collection: NAIL_EXAM_ATTEMPTS_COLLECTION,
        id: input.attemptId,
        op: "update",
        data: fields,
        fallback: attempt,
      })
    } catch {
      return "failed"
    }
    return "queued"
  }
  const col = collection(target, NAIL_EXAM_ATTEMPTS_COLLECTION)
  return saveCompletedAttempt(input, {
    updateScore: (attemptId, fields) => updateDoc(doc(col, attemptId), fields),
    createCompleted: (attempt) => setDoc(doc(col, attempt.attemptId), attempt),
  })
}

/**
 * Saves how far an open test has got, so a test the learner quits still
 * shows how many questions they answered. Fails quietly if the start record
 * is missing or the test is already finished.
 */
export async function reportNailExamProgress(input: {
  attemptId: string
  answered: number
  correctSoFar: number
  questionCount: number
}): Promise<void> {
  try {
    await writeLearnerDoc({
      collection: NAIL_EXAM_ATTEMPTS_COLLECTION,
      id: input.attemptId,
      op: "update",
      data: buildProgressFields({ ...input, at: Date.now() }),
    })
  } catch {
    // Progress is a nice-to-have; the finished score is saved separately.
  }
}

const ATTEMPTS_PAGE_SIZE = 500
const MAX_ATTEMPT_PAGES = 40

/** Loads every attempt, newest start first, one page at a time. */
export async function loadNailExamAttempts(): Promise<NailExamAttempt[]> {
  return loadAllPages(NAIL_EXAM_ATTEMPTS_COLLECTION, "startedAt", parseNailExamAttempt)
}

export async function loadNailExamLearnerActivity(max = 150): Promise<NailExamLearnerActivity[]> {
  const col = getLearnersCollection()
  if (!col) throw new Error("Firebase is not configured")
  const snapshot = await getDocs(query(col, orderBy("lastActiveAt", "desc"), limit(max)))
  return snapshot.docs
    .map((entry) => parseNailExamLearnerActivity(entry.data()))
    .filter((activity): activity is NailExamLearnerActivity => activity !== null)
}

function getCollection(name: string) {
  const app = getFirebaseApp()
  if (!app) return null
  return collection(getFirestore(app), name)
}

/** Writes the whole session record (creates it the first time). */
export async function writePracticeSession(record: PracticeSession): Promise<void> {
  await writeLearnerDoc({
    collection: NAIL_EXAM_PRACTICE_SESSIONS_COLLECTION,
    id: record.sessionId,
    op: "set",
    data: toStoredPracticeSession(record),
  })
}

/** Learner ID for this browser, created on first use. */
export function currentLearnerId(): string | null {
  if (typeof window === "undefined") return null
  try {
    return getOrCreateLearnerId(window.localStorage)
  } catch {
    return null
  }
}

async function loadAllPages<T>(
  name: string,
  orderField: string,
  parse: (value: unknown) => T | null,
): Promise<T[]> {
  const col = getCollection(name)
  if (!col) throw new Error("Firebase is not configured")
  const items: T[] = []
  let cursor: QueryDocumentSnapshot | null = null
  for (let page = 0; page < MAX_ATTEMPT_PAGES; page += 1) {
    const pageQuery: Query = cursor
      ? query(col, orderBy(orderField, "desc"), startAfter(cursor), limit(ATTEMPTS_PAGE_SIZE))
      : query(col, orderBy(orderField, "desc"), limit(ATTEMPTS_PAGE_SIZE))
    const snapshot = await getDocs(pageQuery)
    for (const entry of snapshot.docs) {
      const item = parse(entry.data())
      if (item) items.push(item)
    }
    if (snapshot.docs.length < ATTEMPTS_PAGE_SIZE) break
    cursor = snapshot.docs[snapshot.docs.length - 1]
  }
  return items
}

export async function loadPracticeSessions(): Promise<PracticeSession[]> {
  return loadAllPages(NAIL_EXAM_PRACTICE_SESSIONS_COLLECTION, "startedAt", parsePracticeSession)
}

export async function loadLearnerNames(): Promise<Map<string, string>> {
  const col = getCollection(NAIL_EXAM_LEARNER_NAMES_COLLECTION)
  if (!col) throw new Error("Firebase is not configured")
  const snapshot = await getDocs(col)
  const names = new Map<string, string>()
  for (const entry of snapshot.docs) {
    const name = parseLearnerName(entry.data())
    if (name) names.set(entry.id, name)
  }
  return names
}

/** Saves an admin-chosen name; an empty name goes back to the alias. */
export async function saveLearnerName(learnerId: string, name: string): Promise<void> {
  const col = getCollection(NAIL_EXAM_LEARNER_NAMES_COLLECTION)
  if (!col) throw new Error("Firebase is not configured")
  const clean = cleanLearnerName(name)
  if (clean) await setDoc(doc(col, learnerId), { learnerId, name: clean })
  else await deleteDoc(doc(col, learnerId))
}
