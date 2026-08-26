"use client"

import { Button } from "@/components/ui/button"
import { useOfficialExamQuizPreferences } from "@/contexts/OfficialExamQuizPreferencesContext"
import { cn } from "@/lib/utils"

export function OfficialExamQuizChineseToggle({ placement = "fixed" }: { placement?: "fixed" | "inline" }) {
  const { showChinese, toggleChinese } = useOfficialExamQuizPreferences()

  return (
    <Button
      type="button"
      variant="ghost"
      aria-pressed={showChinese}
      aria-label={showChinese ? "Hide Chinese text" : "Show Chinese text"}
      title={showChinese ? "Hide Chinese text" : "Show Chinese text"}
      onClick={toggleChinese}
      className={cn(
        "group h-11 w-[4.75rem] min-w-0 rounded-full bg-transparent p-1 text-foreground shadow-none hover:bg-transparent focus-visible:ring-2 focus-visible:ring-ring",
        placement === "fixed" ? "fixed top-3 right-3 z-50" : "relative z-30",
      )}
    >
      <span className="flex h-8 w-full items-center justify-center gap-1.5 rounded-full border border-border/80 bg-background/90 px-2 shadow-md backdrop-blur-sm transition-colors group-hover:bg-accent">
        <span className="text-xs font-semibold">ZH</span>
        <span
          aria-hidden="true"
          className={cn(
            "relative h-4 w-7 shrink-0 rounded-full transition-colors",
            showChinese ? "bg-emerald-500" : "bg-muted-foreground/35",
          )}
        >
          <span
            className={cn(
              "absolute top-0.5 left-0.5 h-3 w-3 rounded-full bg-white shadow-sm transition-transform",
              showChinese ? "translate-x-3" : "translate-x-0",
            )}
          />
        </span>
      </span>
    </Button>
  )
}
