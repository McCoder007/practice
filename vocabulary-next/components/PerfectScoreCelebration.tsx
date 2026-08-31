import type { CSSProperties } from "react"
import { Check } from "lucide-react"

type PerfectScoreCelebrationProps = {
  correct: number
  total: number
  quizLabel: { en: string; zh: string }
  showChinese: boolean
}

const CONFETTI_COLORS = ["#f59e0b", "#facc15", "#8b5cf6", "#3b82f6", "#ec4899"]

const CONFETTI_PIECES = Array.from({ length: 36 }, (_, index) => ({
  color: CONFETTI_COLORS[index % CONFETTI_COLORS.length],
  delay: `${(index % 9) * 0.035}s`,
  drift: `${((index * 37) % 121) - 60}px`,
  duration: `${1.25 + (index % 6) * 0.1}s`,
  left: `${3 + ((index * 29) % 94)}%`,
  rotation: `${180 + ((index * 47) % 360)}deg`,
  size: `${5 + (index % 4) * 2}px`,
}))

export function PerfectScoreCelebration({
  correct,
  total,
  quizLabel,
  showChinese,
}: PerfectScoreCelebrationProps) {
  return (
    <section className="relative flex flex-col items-center gap-3 text-center" aria-labelledby="perfect-score-title">
      <div className="perfect-score-confetti" aria-hidden="true">
        {CONFETTI_PIECES.map((piece, index) => (
          <span
            key={index}
            style={
              {
                "--confetti-drift": piece.drift,
                "--confetti-rotation": piece.rotation,
                animationDelay: piece.delay,
                animationDuration: piece.duration,
                backgroundColor: piece.color,
                height: piece.size,
                left: piece.left,
                width: piece.size,
              } as CSSProperties
            }
          />
        ))}
      </div>

      <div className="perfect-score-medal flex h-20 w-20 items-center justify-center rounded-full border-4 border-amber-300 bg-gradient-to-br from-amber-300 via-yellow-400 to-amber-500 shadow-[0_0_30px_rgba(245,158,11,0.45)]">
        <Check className="h-11 w-11 text-white drop-shadow-sm" strokeWidth={3.25} aria-hidden="true" />
      </div>

      <div className="space-y-1">
        <h1
          id="perfect-score-title"
          className="bg-gradient-to-r from-amber-500 via-yellow-500 to-amber-600 bg-clip-text text-3xl font-extrabold tracking-tight text-transparent dark:from-amber-300 dark:via-yellow-300 dark:to-amber-400"
        >
          Perfect score!{showChinese && " | 满分！"}
        </h1>
        <p className="text-base font-medium text-slate-600 dark:text-slate-300">
          {quizLabel.en}
          {showChinese && <> | {quizLabel.zh}</>}
        </p>
      </div>

      <div className="rounded-2xl border border-amber-200 bg-amber-50/90 px-8 py-4 shadow-sm dark:border-amber-800/70 dark:bg-amber-950/30">
        <p className="text-3xl font-bold tabular-nums text-slate-900 dark:text-white">
          {correct} / {total}
        </p>
        <p className="mt-1 text-sm font-bold tracking-[0.2em] text-amber-700 uppercase dark:text-amber-300">
          100%
        </p>
      </div>

      <p className="max-w-sm text-base text-slate-700 dark:text-slate-200">
        You answered every question correctly.
        {showChinese && <span lang="zh-Hans"> | 你答对了所有题目。</span>}
      </p>
    </section>
  )
}
