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

const CHINESE_VISIBILITY_STORAGE_KEY = "milady-review-show-chinese"

type MiladyReviewPreferences = {
  showChinese: boolean
  setShowChinese: (showChinese: boolean) => void
  toggleChinese: () => void
}

const MiladyReviewPreferencesContext = createContext<MiladyReviewPreferences | undefined>(undefined)

export function MiladyReviewPreferencesProvider({ children }: { children: ReactNode }) {
  const [showChinese, setShowChineseState] = useState(true)
  const [preferenceReady, setPreferenceReady] = useState(false)

  useLayoutEffect(() => {
    try {
      const stored = window.localStorage.getItem(CHINESE_VISIBILITY_STORAGE_KEY)
      if (stored === "false") setShowChineseState(false)
      if (stored === "true") setShowChineseState(true)
    } catch (error) {
      console.warn("Failed to read the Milady Exam Review Chinese preference:", error)
    } finally {
      setPreferenceReady(true)
    }
  }, [])

  const setShowChinese = useCallback((nextShowChinese: boolean) => {
    setShowChineseState(nextShowChinese)
    try {
      window.localStorage.setItem(CHINESE_VISIBILITY_STORAGE_KEY, String(nextShowChinese))
    } catch (error) {
      console.warn("Failed to save the Milady Exam Review Chinese preference:", error)
    }
  }, [])

  const toggleChinese = useCallback(() => {
    setShowChineseState((currentShowChinese) => {
      const nextShowChinese = !currentShowChinese
      try {
        window.localStorage.setItem(CHINESE_VISIBILITY_STORAGE_KEY, String(nextShowChinese))
      } catch (error) {
        console.warn("Failed to save the Milady Exam Review Chinese preference:", error)
      }
      return nextShowChinese
    })
  }, [])

  const value = useMemo(
    () => ({ showChinese, setShowChinese, toggleChinese }),
    [showChinese, setShowChinese, toggleChinese],
  )

  return (
    <MiladyReviewPreferencesContext.Provider value={value}>
      <div className={preferenceReady ? undefined : "invisible"}>{children}</div>
    </MiladyReviewPreferencesContext.Provider>
  )
}

export function useMiladyReviewPreferences() {
  const context = useContext(MiladyReviewPreferencesContext)
  if (!context) {
    throw new Error("useMiladyReviewPreferences must be used within MiladyReviewPreferencesProvider")
  }
  return context
}
