"use client"

import { ChevronRight } from "lucide-react"
import { Card, CardTitle } from "@/components/ui/card"
import type { PictureVocabularySet, PictureVocabularyWord } from "@/data/picture-vocabulary"

interface SetPickerProps {
  sets: PictureVocabularySet[]
  onSelect: (setId: string) => void
}

const THUMBNAIL_COUNT = 5

// Statically resolved at build time (matches app/layout.tsx), so server-rendered
// HTML and the client's first render agree — a window.location check would not.
function publicAssetUrl(path: string) {
  const prefix = process.env.NODE_ENV === "production" ? "/practice" : ""
  return `${prefix}${path}`
}

function pickThumbnails(words: PictureVocabularyWord[]): PictureVocabularyWord[] {
  if (words.length <= THUMBNAIL_COUNT) return words
  const step = words.length / THUMBNAIL_COUNT
  return Array.from({ length: THUMBNAIL_COUNT }, (_, i) => words[Math.floor(i * step)])
}

export function SetPicker({ sets, onSelect }: SetPickerProps) {
  return (
    <div className="w-full max-w-md mx-auto space-y-3">
      {sets.map((set) => {
        const thumbnails = pickThumbnails(set.words)
        return (
          <Card
            key={set.id}
            className="cursor-pointer select-none border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800/60 shadow-sm transition-all duration-150 active:scale-[0.98] active:bg-slate-50 dark:active:bg-slate-800 py-4 rounded-2xl"
            onClick={() => onSelect(set.id)}
          >
            <div className="flex items-center justify-between gap-3 px-5">
              <div className="flex flex-col gap-2 min-w-0">
                <CardTitle className="text-lg">{set.name}</CardTitle>
                <div className="flex -space-x-3">
                  {thumbnails.map((word, i) => (
                    <div
                      key={word.english}
                      className="relative h-9 w-9 rounded-full ring-2 ring-white dark:ring-slate-800 overflow-hidden bg-slate-100 dark:bg-slate-700"
                      style={{ zIndex: thumbnails.length - i }}
                    >
                      <img
                        src={publicAssetUrl(word.image)}
                        alt=""
                        className="h-full w-full object-cover"
                      />
                    </div>
                  ))}
                </div>
              </div>
              <div className="flex items-center gap-2 shrink-0">
                <span className="text-xs font-medium text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-500/10 px-2.5 py-1 rounded-full whitespace-nowrap">
                  {set.words.length} words
                </span>
                <ChevronRight className="h-5 w-5 text-slate-400" />
              </div>
            </div>
          </Card>
        )
      })}
    </div>
  )
}
