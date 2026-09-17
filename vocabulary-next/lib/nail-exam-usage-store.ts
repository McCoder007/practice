import { collection, doc, getDoc, getDocs, getFirestore, limit, orderBy, query, setDoc } from "firebase/firestore"

import { getFirebaseApp } from "@/lib/firebase-app"
import {
  NAIL_EXAM_ATTEMPTS_COLLECTION,
  NAIL_EXAM_LEARNERS_COLLECTION,
  applyAttemptScore,
  buildAttemptWithoutStart,
  buildStartedAttempt,
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
  const ref = doc(col, input.attemptId)

  let attemptWrite: Promise<void>
  try {
    const existing = await getDoc(ref)
    if (existing.exists()) {
      const started = buildStartedAttempt({
        attemptId: input.attemptId,
        learnerId,
        startedAt: now,
        bankId: input.bankId,
        bankName: input.bankName,
        sessionTitle: input.sessionTitle,
        isRandom: input.isRandom,
        questionCount: input.questionCount,
      })
      const completed = applyAttemptScore(started, input.correct, now)
      attemptWrite = setDoc(
        ref,
        {
          correct: completed.correct,
          completedAt: completed.completedAt,
          questionCount: completed.questionCount,
          status: completed.status,
        },
        { merge: true },
      )
    } else {
      // The "started" write never landed (offline, dropped, etc). Preserve
      // the completion and score honestly rather than fabricating a start
      // time that would show a false ~0-minute duration.
      const completed = buildAttemptWithoutStart({
        attemptId: input.attemptId,
        learnerId,
        bankId: input.bankId,
        bankName: input.bankName,
        sessionTitle: input.sessionTitle,
        isRandom: input.isRandom,
        questionCount: input.questionCount,
        correct: input.correct,
        completedAt: now,
      })
      attemptWrite = setDoc(ref, completed)
    }
  } catch (error) {
    console.error("Failed to report nail exam score:", error)
    return
  }

  const [attemptResult] = await Promise.allSettled([
    attemptWrite,
    reportActivity(window.localStorage, learnerId, now, 0),
  ])
  if (attemptResult.status === "rejected") {
    console.error("Failed to report nail exam score:", attemptResult.reason)
  }
}

export async function loadNailExamAttempts(max = 500): Promise<NailExamAttempt[]> {
  const col = getAttemptsCollection()
  if (!col) {
    throw new Error("Firebase is not configured")
  }

  const snapshot = await getDocs(query(col, orderBy("startedAt", "desc"), limit(max)))
  return snapshot.docs
    .map((entry) => parseNailExamAttempt(entry.data()))
    .filter((attempt): attempt is NailExamAttempt => attempt !== null)
}

export async function loadNailExamLearnerActivity(max = 150): Promise<NailExamLearnerActivity[]> {
  const col = getLearnersCollection()
  if (!col) throw new Error("Firebase is not configured")
  const snapshot = await getDocs(query(col, orderBy("lastActiveAt", "desc"), limit(max)))
  return snapshot.docs
    .map((entry) => parseNailExamLearnerActivity(entry.data()))
    .filter((activity): activity is NailExamLearnerActivity => activity !== null)
}
