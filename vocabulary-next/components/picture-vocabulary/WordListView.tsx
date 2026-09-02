"use client"

import type { PictureVocabularyWord, WordStatus } from "@/data/picture-vocabulary"

interface WordListViewProps {
  words: PictureVocabularyWord[]
  statuses: Record<string, WordStatus>
  status: "learning" | "known"
  emptyMessage: string
}

export function WordListView({ words, statuses, status, emptyMessage }: WordListViewProps) {
  const filtered = words.filter((word) => (statuses[word.english] ?? "new") === status)

  if (filtered.length === 0) {
    return <p className="text-center text-muted-foreground py-12">{emptyMessage}</p>
  }

  return (
    <ul className="divide-y divide-border">
      {filtered.map((word) => (
        <li key={word.english} className="flex justify-between items-center py-3">
          <span className="font-medium">{word.english}</span>
          <span className="text-muted-foreground">{word.chinese}</span>
        </li>
      ))}
    </ul>
  )
}
