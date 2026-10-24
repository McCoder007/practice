import {
  collection,
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
  NAIL_EXAM_ATTEMPTS_COLLECTION,
  NAIL_EXAM_LEARNERS_COLLECTION,
  buildStartedAttempt,
  saveCompletedAttempt,
  createActivityThrottle,
  getExistingLearnerId,
  getOrCreateLearnerId,
  parseNailExamLearnerActivity,
  parseNailExamAttempt,
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

const ATTEMPTS_PAGE_SIZE = 500
const MAX_ATTEMPT_PAGES = 40

/** Loads every attempt, newest start first, one page at a time. */
export async function loadNailExamAttempts(): Promise<NailExamAttempt[]> {
  const col = getAttemptsCollection()
  if (!col) {
    throw new Error("Firebase is not configured")
  }

  const attempts: NailExamAttempt[] = []
  let cursor: QueryDocumentSnapshot | null = null
  for (let page = 0; page < MAX_ATTEMPT_PAGES; page += 1) {
    const pageQuery: Query = cursor
      ? query(col, orderBy("startedAt", "desc"), startAfter(cursor), limit(ATTEMPTS_PAGE_SIZE))
      : query(col, orderBy("startedAt", "desc"), limit(ATTEMPTS_PAGE_SIZE))
    const snapshot = await getDocs(pageQuery)
    for (const entry of snapshot.docs) {
      const attempt = parseNailExamAttempt(entry.data())
      if (attempt) attempts.push(attempt)
    }
    if (snapshot.docs.length < ATTEMPTS_PAGE_SIZE) break
    cursor = snapshot.docs[snapshot.docs.length - 1]
  }
  return attempts
}

export async function loadNailExamLearnerActivity(max = 150): Promise<NailExamLearnerActivity[]> {
  const col = getLearnersCollection()
  if (!col) throw new Error("Firebase is not configured")
  const snapshot = await getDocs(query(col, orderBy("lastActiveAt", "desc"), limit(max)))
  return snapshot.docs
    .map((entry) => parseNailExamLearnerActivity(entry.data()))
    .filter((activity): activity is NailExamLearnerActivity => activity !== null)
}
