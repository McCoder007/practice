"use client"

import { cn } from "@/lib/utils"

export function MockExamChineseToggle({
  showChinese,
  onToggle,
}: {
  showChinese: boolean
  onToggle: () => void
}) {
  return (
    <button
      type="button"
      aria-pressed={showChinese}
      aria-label={showChinese ? "Hide Chinese text" : "Show Chinese text"}
      title={showChinese ? "Hide Chinese text" : "Show Chinese text"}
      onClick={onToggle}
      className="group flex h-8 w-[4.5rem] shrink-0 items-center justify-center gap-1.5 rounded-full border border-neutral-300 bg-white px-2 shadow-sm transition-colors hover:bg-neutral-50"
    >
      <span className="text-xs font-semibold text-neutral-700">ZH</span>
      <span
        aria-hidden="true"
        className={cn(
          "relative h-4 w-7 shrink-0 rounded-full transition-colors",
          showChinese ? "bg-emerald-500" : "bg-neutral-300",
        )}
      >
        <span
          className={cn(
            "absolute top-0.5 left-0.5 h-3 w-3 rounded-full bg-white shadow-sm transition-transform",
            showChinese ? "translate-x-3" : "translate-x-0",
          )}
        />
      </span>
    </button>
  )
}
