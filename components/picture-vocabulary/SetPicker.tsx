"use client"

import { ChevronRight } from "lucide-react"
import { Card } from "@/components/ui/card"
import type { PictureVocabularySet, PictureVocabularyWord } from "@/data/picture-vocabulary"
import { SetTitle } from "@/components/picture-vocabulary/SetTitle"

interface SetPickerProps {
  sets: PictureVocabularySet[]
  onSelect: (setId: string) => void
}

const THUMBNAIL_COUNT = 6

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
            <div className="flex flex-col gap-3 px-5">
              <div className="flex items-center justify-between gap-3">
                <SetTitle set={set} />
                <div className="flex items-center gap-1.5 shrink-0 text-slate-400 dark:text-slate-500">
                  <span className="text-sm tabular-nums whitespace-nowrap">
                    {set.words.length}
                  </span>
                  <ChevronRight className="h-5 w-5" />
                </div>
              </div>
              <div className="flex gap-2 overflow-hidden" aria-hidden="true">
                {thumbnails.map((word) => (
                  <div
                    key={word.english}
                    className="aspect-square shrink-0 overflow-hidden rounded-xl border border-slate-200 bg-white p-1 shadow-sm dark:border-slate-600"
                    style={{ width: "calc((100% - 2rem) / 5.5)" }}
                  >
                    <img
                      src={publicAssetUrl(word.image)}
                      alt=""
                      className="h-full w-full object-contain"
                    />
                  </div>
                ))}
              </div>
            </div>
          </Card>
        )
      })}
    </div>
  )
}
