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

const CHINESE_VISIBILITY_STORAGE_KEY = "official-exam-quiz-show-chinese"

type OfficialExamQuizPreferences = {
  showChinese: boolean
  setShowChinese: (showChinese: boolean) => void
  toggleChinese: () => void
}

const OfficialExamQuizPreferencesContext = createContext<OfficialExamQuizPreferences | undefined>(undefined)

export function OfficialExamQuizPreferencesProvider({ children }: { children: ReactNode }) {
  const [showChinese, setShowChineseState] = useState(true)
  const [preferenceReady, setPreferenceReady] = useState(false)

  useLayoutEffect(() => {
    try {
      const stored = window.localStorage.getItem(CHINESE_VISIBILITY_STORAGE_KEY)
      if (stored === "false") setShowChineseState(false)
      if (stored === "true") setShowChineseState(true)
    } catch (error) {
      console.warn("Failed to read the Official Exam Practice Chinese preference:", error)
    } finally {
      setPreferenceReady(true)
    }
  }, [])

  const setShowChinese = useCallback((nextShowChinese: boolean) => {
    setShowChineseState(nextShowChinese)
    try {
      window.localStorage.setItem(CHINESE_VISIBILITY_STORAGE_KEY, String(nextShowChinese))
    } catch (error) {
      console.warn("Failed to save the Official Exam Practice Chinese preference:", error)
    }
  }, [])

  const toggleChinese = useCallback(() => {
    setShowChineseState((currentShowChinese) => {
      const nextShowChinese = !currentShowChinese
      try {
        window.localStorage.setItem(CHINESE_VISIBILITY_STORAGE_KEY, String(nextShowChinese))
      } catch (error) {
        console.warn("Failed to save the Official Exam Practice Chinese preference:", error)
      }
      return nextShowChinese
    })
  }, [])

  const value = useMemo(
    () => ({ showChinese, setShowChinese, toggleChinese }),
    [showChinese, setShowChinese, toggleChinese],
  )

  return (
    <OfficialExamQuizPreferencesContext.Provider value={value}>
      <div className={preferenceReady ? undefined : "invisible"}>{children}</div>
    </OfficialExamQuizPreferencesContext.Provider>
  )
}

export function useOfficialExamQuizPreferences() {
  const context = useContext(OfficialExamQuizPreferencesContext)
  if (!context) {
    throw new Error(
      "useOfficialExamQuizPreferences must be used within OfficialExamQuizPreferencesProvider",
    )
  }
  return context
}
