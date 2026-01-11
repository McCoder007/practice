"use client"

import React, { createContext, useContext, useState, useEffect } from "react"

export type Language = "chinese" | "japanese"

interface LanguageContextType {
  language: Language
  setLanguage: (lang: Language) => void
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined)

const LANGUAGE_STORAGE_KEY = "vocabulary-app-language"

export function LanguageProvider({ children }: { children: React.ReactNode }) {
  const [language, setLanguageState] = useState<Language>("chinese")
  const [isMounted, setIsMounted] = useState(false)

  // Load language from localStorage on mount
  useEffect(() => {
    setIsMounted(true)
    try {
      const stored = localStorage.getItem(LANGUAGE_STORAGE_KEY)
      if (stored === "chinese" || stored === "japanese") {
        setLanguageState(stored)
      }
    } catch (error) {
      // localStorage might not be available in some environments
      console.warn("Failed to read language from localStorage:", error)
    }
  }, [])

  const setLanguage = (lang: Language) => {
    setLanguageState(lang)
    if (isMounted) {
      try {
        localStorage.setItem(LANGUAGE_STORAGE_KEY, lang)
      } catch (error) {
        console.warn("Failed to save language to localStorage:", error)
      }
    }
  }

  // Always provide the context, even during initial render
  return (
    <LanguageContext.Provider value={{ language, setLanguage }}>
      {children}
    </LanguageContext.Provider>
  )
}

export function useLanguage() {
  const context = useContext(LanguageContext)
  if (context === undefined) {
    throw new Error("useLanguage must be used within a LanguageProvider")
  }
  return context
}
