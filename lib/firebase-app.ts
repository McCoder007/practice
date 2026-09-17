import { getApps, initializeApp, type FirebaseApp } from "firebase/app"

export const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY || "",
  authDomain: "esl-preposition-practice.firebaseapp.com",
  projectId: "esl-preposition-practice",
  storageBucket: "esl-preposition-practice.firebasestorage.app",
  messagingSenderId: "23182734978",
  appId: "1:23182734978:web:060de369f972ec36baa69b",
  measurementId: "G-Z3QP99QCWD",
}

export function getFirebaseApp(): FirebaseApp | null {
  if (typeof window === "undefined") return null
  if (!firebaseConfig.apiKey) return null
  const existing = getApps()[0]
  if (existing) return existing
  return initializeApp(firebaseConfig)
}
