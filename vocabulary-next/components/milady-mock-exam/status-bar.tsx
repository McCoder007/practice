"use client"

import { formatCountdown } from "@/lib/milady-mock-exam"
import { MOCK_EXAM_TEXT } from "@/lib/milady-mock-exam-i18n"

export function MockExamStatusBar({
  questionNumber,
  flagged,
  timeRemainingSeconds,
  answeredCount,
  unansweredCount,
  showChinese,
}: {
  questionNumber: number
  flagged: boolean
  timeRemainingSeconds: number
  answeredCount: number
  unansweredCount: number
  showChinese: boolean
}) {
  const lowTime = timeRemainingSeconds <= 5 * 60
  return (
    <div className="flex items-stretch">
      <div className="flex min-w-[110px] flex-col items-center justify-center gap-0.5 bg-neutral-200 px-4 py-2">
        <span className="text-center text-xs text-neutral-600">
          {MOCK_EXAM_TEXT.question.en}
          {showChinese ? <span className="block">{MOCK_EXAM_TEXT.question.zh}</span> : null}
        </span>
        <span className="flex items-center gap-1.5 text-2xl font-semibold text-neutral-900">
          {questionNumber}
          {flagged ? <span className="text-red-600" aria-label="Flagged">⚑</span> : null}
        </span>
      </div>
      <div className="flex flex-1 flex-col items-center justify-center gap-0.5 bg-neutral-200 px-4 py-2">
        <span className="flex items-center gap-1.5 text-center text-xs text-neutral-600">
          <span aria-hidden="true">⏱</span>
          <span>
            {MOCK_EXAM_TEXT.timeRemaining.en}
            {showChinese ? <span className="block">{MOCK_EXAM_TEXT.timeRemaining.zh}</span> : null}
          </span>
        </span>
        <span className={lowTime ? "text-xl font-semibold text-red-600" : "text-xl font-semibold text-neutral-900"}>
          {formatCountdown(timeRemainingSeconds)}
        </span>
      </div>
      <div className="flex min-w-[130px] flex-col items-center justify-center gap-0.5 bg-red-600 px-4 py-2 text-white">
        <span className="text-center text-xs opacity-90">
          {MOCK_EXAM_TEXT.questionAnswered.en}
          {showChinese ? <span className="block">{MOCK_EXAM_TEXT.questionAnswered.zh}</span> : null}
        </span>
        <span className="text-2xl font-semibold">{answeredCount}</span>
      </div>
      <div className="flex min-w-[150px] flex-col items-center justify-center gap-0.5 bg-red-600 px-4 py-2 text-white">
        <span className="text-center text-xs opacity-90">
          {MOCK_EXAM_TEXT.questionUnanswered.en}
          {showChinese ? <span className="block">{MOCK_EXAM_TEXT.questionUnanswered.zh}</span> : null}
        </span>
        <span className="text-2xl font-semibold">{unansweredCount}</span>
      </div>
    </div>
  )
}
