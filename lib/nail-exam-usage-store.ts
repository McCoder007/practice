import {
  collection,
  deleteDoc,
  doc,
  disableNetwork,
  enableNetwork,
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
import { isGoogleReachable, markGoogleUnreachable } from "@/lib/google-reachability"
import {
  deliverWrite,
  listOutbox,
  moveLegacyOutbox,
  queueOutboxWrite,
  removeSentWrite,
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
  createActivityThrottle,
  getExistingLearnerId,
  getOrCreateLearnerId,
  parseNailExamLearnerActivity,
  parseNailExamAttempt,
  type MissedQuestion,
  type NailExamAttempt,
  type NailExamLearnerActivity,
} from "@/lib/nail-exam-usage"

function getLearnersCollection() {
  const app = getFirebaseApp()
  if (!app) return null
  return collection(getFirestore(app), NAIL_EXAM_LEARNERS_COLLECTION)
}

function sendWrite(db: Firestore, write: Pick<OutboxWrite, "collection" | "id" | "op" | "data">): Promise<void> {
  const ref = doc(collection(db, write.collection), write.id)
  return write.op === "set" ? setDoc(ref, write.data) : updateDoc(ref, write.data as UpdateData<DocumentData>)
}

/**
 * Saves a learner write on this phone first, then tries to send everything
 * saved. Writes are deleted only after Firestore confirms them, so nothing is
 * lost when Google is blocked (mainland China) or the connection drops.
 */
async function writeLearnerDoc(write: OutboxWrite): Promise<void> {
  const app = getFirebaseApp()
  if (!app) return
  try {
    await queueOutboxWrite(write)
  } catch {
    // IndexedDB unavailable (rare): send directly, without the safety net.
    if (await isGoogleReachable()) await sendWrite(getFirestore(app), write)
    return
  }
  void flushOutbox()
}

// A write that never answers (flaky connection) is tried again later.
const SEND_TIMEOUT_MS = 15_000
let flushing: Promise<void> | null = null
let networkOff = false
let legacyMoved = false

function withTimeout<T>(promise: Promise<T>, ms: number): Promise<T> {
  return new Promise((resolve, reject) => {
    const timer = window.setTimeout(() => reject(new Error("Timed out")), ms)
    promise.then(resolve, reject).finally(() => window.clearTimeout(timer))
  })
}

function flushOutbox(): Promise<void> {
  flushing ??= sendOutbox().finally(() => {
    flushing = null
  })
  return flushing
}

/**
 * Sends saved writes oldest first (so a score never lands before its start),
 * then any added meanwhile. Stops at the first network problem; the rest wait
 * for the next write or app open. Writes the server refuses (e.g. an older
 * copy of a record already saved) are dropped so they can't block the rest.
 * Firebase is only started once Google answers, so in mainland China it never
 * retries in the background.
 */
async function sendOutbox(): Promise<void> {
  const app = getFirebaseApp()
  if (!app) return
  try {
    if (!legacyMoved) {
      legacyMoved = true
      await moveLegacyOutbox(window.localStorage)
    }
    if (!(await isGoogleReachable())) return
    const db = getFirestore(app)
    if (networkOff) {
      await enableNetwork(db)
      networkOff = false
    }
    for (let pass = 0; pass < 5; pass += 1) {
      const writes = await listOutbox()
      if (writes.length === 0) return
      for (const write of writes) {
        const result = await deliverWrite(write, (op, data) =>
          withTimeout(sendWrite(db, { ...write, op, data }), SEND_TIMEOUT_MS),
        )
        if (result === "retry") {
          // Leave Google alone for a while, and stop the SDK retrying meanwhile.
          markGoogleUnreachable()
          networkOff = true
          void disableNetwork(db).catch(() => {})
          return
        }
        await removeSentWrite(write)
      }
    }
  } catch {
    // Storage failed part-way: whatever is still saved is tried next time.
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
// the local throttle only advances once that write is saved on the phone.
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
  // Each app open also sends anything still saved from earlier.
  void flushOutbox()
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

  // The score is added to the start record. If that record is missing when
  // it is sent, the fallback creates a completed record instead.
  const { fields, attempt } = buildCompletedAttemptWrites({ ...input, learnerId, completedAt: now })
  const [attemptResult] = await Promise.allSettled([
    writeLearnerDoc({
      collection: NAIL_EXAM_ATTEMPTS_COLLECTION,
      id: input.attemptId,
      op: "update",
      data: fields,
      fallback: attempt,
    }),
    reportActivity(window.localStorage, learnerId, now, 0),
  ])
  if (attemptResult.status === "rejected") {
    console.error("Failed to report nail exam score:", attemptResult.reason)
  }
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
