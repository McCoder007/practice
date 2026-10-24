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
  type Query,
  type QueryDocumentSnapshot,
} from "firebase/firestore"

import { getFirebaseApp } from "@/lib/firebase-app"
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
  type MissedQuestion,
  type NailExamAttempt,
  type NailExamLearnerActivity,
} from "@/lib/nail-exam-usage"

function getAttemptsCollection() {
  const app = getFirebaseApp()
  if (!app) return null
  return collection(getFirestore(app), NAIL_EXAM_ATTEMPTS_COLLECTION)
}

function getLearnersCollection() {
  const app = getFirebaseApp()
  if (!app) return null
  return collection(getFirestore(app), NAIL_EXAM_LEARNERS_COLLECTION)
}

async function writeLearnerActivity(learnerId: string, recentActiveAt: number[]): Promise<void> {
  const col = getLearnersCollection()
  if (!col) return
  await setDoc(doc(col, learnerId), {
    learnerId,
    lastActiveAt: recentActiveAt[0],
    recentActiveAt,
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
  const col = getAttemptsCollection()
  if (!col || typeof window === "undefined") return

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
    setDoc(doc(col, attempt.attemptId), attempt),
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
  const col = getAttemptsCollection()
  if (!col || typeof window === "undefined") return

  const now = Date.now()
  const learnerId = getOrCreateLearnerId(window.localStorage)

  // Learners can't read attempts, so never check whether the start record
  // exists first: saveCompletedAttempt writes and falls back on failure.
  const [attemptResult] = await Promise.allSettled([
    saveCompletedAttempt(
      { ...input, learnerId, completedAt: now },
      {
        updateScore: (attemptId, fields) => updateDoc(doc(col, attemptId), fields),
        createCompleted: (attempt) => setDoc(doc(col, attempt.attemptId), attempt),
      },
    ),
    reportActivity(window.localStorage, learnerId, now, 0),
  ])
  if (attemptResult.status === "fulfilled" && attemptResult.value === "failed") {
    console.error("Failed to report nail exam score for attempt", input.attemptId)
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
  const col = getAttemptsCollection()
  if (!col) return
  try {
    await updateDoc(doc(col, input.attemptId), buildProgressFields({ ...input, at: Date.now() }))
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
  const col = getCollection(NAIL_EXAM_PRACTICE_SESSIONS_COLLECTION)
  if (!col) return
  await setDoc(doc(col, record.sessionId), toStoredPracticeSession(record))
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
