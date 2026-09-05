import type { PictureVocabularySet } from "@/data/picture-vocabulary"

interface SetTitleProps {
  set: Pick<PictureVocabularySet, "number" | "name" | "chinese">
  align?: "left" | "center"
  showNumber?: boolean
}

export function SetTitle({ set, align = "left", showNumber = true }: SetTitleProps) {
  return (
    <div
      className={`flex items-center gap-3 min-w-0 ${align === "center" ? "justify-center" : ""}`}
      aria-label={`Set ${set.number} ${set.name} ${set.chinese}`}
    >
      {showNumber && (
        <span
          aria-hidden="true"
          className="w-4 shrink-0 text-right text-[15px] font-medium tabular-nums text-slate-400 dark:text-slate-500"
        >
          {set.number}
        </span>
      )}
      <div className={`min-w-0 leading-tight ${align === "center" ? "text-center" : ""}`}>
        <div className="text-base font-semibold tracking-tight text-slate-900 dark:text-slate-50">
          {set.name}
        </div>
        <div lang="zh-Hans" className="text-[13px] text-slate-500 dark:text-slate-400">
          {set.chinese}
        </div>
      </div>
    </div>
  )
}
