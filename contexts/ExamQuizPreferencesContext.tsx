"use client"

import {
  createContext,
  useCallback,
  useContext,
  useLayoutEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react"

const CHINESE_VISIBILITY_STORAGE_KEY = "exam-quiz-show-chinese"

type ExamQuizPreferences = {
  showChinese: boolean
  setShowChinese: (showChinese: boolean) => void
  toggleChinese: () => void
}

const ExamQuizPreferencesContext = createContext<ExamQuizPreferences | undefined>(undefined)

export function ExamQuizPreferencesProvider({ children }: { children: ReactNode }) {
  const [showChinese, setShowChineseState] = useState(true)
  const [preferenceReady, setPreferenceReady] = useState(false)

  useLayoutEffect(() => {
    try {
      const stored = window.localStorage.getItem(CHINESE_VISIBILITY_STORAGE_KEY)
      if (stored === "false") setShowChineseState(false)
      if (stored === "true") setShowChineseState(true)
    } catch (error) {
      console.warn("Failed to read the Exam Practice Chinese preference:", error)
    } finally {
      setPreferenceReady(true)
    }
  }, [])

  const setShowChinese = useCallback((nextShowChinese: boolean) => {
    setShowChineseState(nextShowChinese)
    try {
      window.localStorage.setItem(CHINESE_VISIBILITY_STORAGE_KEY, String(nextShowChinese))
    } catch (error) {
      console.warn("Failed to save the Exam Practice Chinese preference:", error)
    }
  }, [])

  const toggleChinese = useCallback(() => {
    setShowChineseState((currentShowChinese) => {
      const nextShowChinese = !currentShowChinese
      try {
        window.localStorage.setItem(CHINESE_VISIBILITY_STORAGE_KEY, String(nextShowChinese))
      } catch (error) {
        console.warn("Failed to save the Exam Practice Chinese preference:", error)
      }
      return nextShowChinese
    })
  }, [])

  const value = useMemo(
    () => ({ showChinese, setShowChinese, toggleChinese }),
    [showChinese, setShowChinese, toggleChinese],
  )

  return (
    <ExamQuizPreferencesContext.Provider value={value}>
      <div className={preferenceReady ? undefined : "invisible"}>{children}</div>
    </ExamQuizPreferencesContext.Provider>
  )
}

export function useExamQuizPreferences() {
  const context = useContext(ExamQuizPreferencesContext)
  if (!context) {
    throw new Error("useExamQuizPreferences must be used within ExamQuizPreferencesProvider")
  }
  return context
}
