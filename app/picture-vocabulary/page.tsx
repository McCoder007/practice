"use client"

import { useEffect, useState } from "react"
import { ChevronLeft } from "lucide-react"
import { Button } from "@/components/ui/button"
import { NavigationMenu } from "@/components/NavigationMenu"
import { pictureVocabularySets, type WordStatus } from "@/data/picture-vocabulary"
import { SetPicker } from "@/components/picture-vocabulary/SetPicker"
import { FlashcardView } from "@/components/picture-vocabulary/FlashcardView"
import { WordListView } from "@/components/picture-vocabulary/WordListView"

const LEGACY_STORAGE_KEY = "pictureVocabProgress"

type Progress = Record<string, Record<string, WordStatus>>
type Tab = "flashcards" | "learning" | "known"

const TABS: Tab[] = ["flashcards", "learning", "known"]

export default function PictureVocabularyPage() {
  const [progress, setProgress] = useState<Progress>({})
  const [activeSetId, setActiveSetId] = useState<string | null>(null)
  const [activeTab, setActiveTab] = useState<Tab>("flashcards")

  // Drop leftover long-lived progress from earlier builds.
  useEffect(() => {
    try {
      localStorage.removeItem(LEGACY_STORAGE_KEY)
    } catch {
      // localStorage might not be available
    }
  }, [])

  const activeSet = pictureVocabularySets.find((set) => set.id === activeSetId) ?? null

  const handleStatusChange = (english: string, status: WordStatus) => {
    if (!activeSetId) return
    setProgress((prev) => ({
      ...prev,
      [activeSetId]: { ...prev[activeSetId], [english]: status },
    }))
  }

  if (!activeSet) {
    return (
      <>
        <NavigationMenu />
        <div
          className="min-h-screen flex flex-col items-center bg-gradient-to-b from-slate-50 to-slate-100 dark:from-slate-900 dark:to-slate-800 p-4"
          style={{ paddingBottom: "calc(1rem + env(safe-area-inset-bottom))" }}
        >
          <h1 className="text-2xl font-bold mt-12 mb-6 text-center bg-gradient-to-r from-blue-600 to-cyan-600 bg-clip-text text-transparent">
            Picture Vocabulary | 图片词汇
          </h1>
          <SetPicker
            sets={pictureVocabularySets}
            onSelect={(id) => {
              setActiveSetId(id)
              setActiveTab("flashcards")
            }}
          />
        </div>
      </>
    )
  }

  const setStatuses = progress[activeSet.id] ?? {}

  return (
    <>
      <NavigationMenu />
      <Button
        type="button"
        variant="ghost"
        size="icon"
        className="fixed top-4 left-4 z-50 h-10 w-10 rounded-full border bg-background/80 shadow-lg backdrop-blur-sm hover:bg-accent"
        aria-label="Back to sets"
        onClick={() => setActiveSetId(null)}
      >
        <ChevronLeft className="h-5 w-5" />
      </Button>
      <div className="flex flex-col h-screen bg-slate-50 dark:bg-slate-900">
        <header className="p-2 pt-3 border-b sticky top-0 z-10 bg-white/80 dark:bg-slate-900/80 backdrop-blur-sm">
          <div className="flex items-center justify-center relative mb-2">
            <h1 className="text-lg font-semibold">{activeSet.name}</h1>
          </div>
          <div className="flex justify-center gap-1">
            {TABS.map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`px-4 py-1.5 rounded-full text-sm font-medium capitalize transition-colors ${
                  activeTab === tab
                    ? "bg-blue-600 text-white"
                    : "text-muted-foreground hover:bg-muted"
                }`}
              >
                {tab}
              </button>
            ))}
          </div>
        </header>

        <div className="flex-1 flex flex-col overflow-y-auto max-w-md w-full mx-auto">
          {activeTab === "flashcards" && (
            <FlashcardView
              key={activeSet.id}
              words={activeSet.words}
              statuses={setStatuses}
              onStatusChange={handleStatusChange}
            />
          )}
          {activeTab === "learning" && (
            <div className="p-4">
              <WordListView
                words={activeSet.words}
                statuses={setStatuses}
                status="learning"
                emptyMessage="No words marked as still learning."
              />
            </div>
          )}
          {activeTab === "known" && (
            <div className="p-4">
              <WordListView
                words={activeSet.words}
                statuses={setStatuses}
                status="known"
                emptyMessage="No words marked as known yet."
              />
            </div>
          )}
        </div>
      </div>
    </>
  )
}
