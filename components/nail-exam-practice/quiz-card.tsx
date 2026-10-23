"use client"

import type { CSSProperties, PointerEvent as ReactPointerEvent, RefObject } from "react"

import { Button } from "@/components/ui/button"
import type { ExamAnswerRecord, ExamQuestion } from "@/data/exam-quiz/types"
import { choicePositionLabel, visibleChoicesAfterReveal } from "@/lib/exam-quiz-reel"
import { cn } from "@/lib/utils"
import {
  AlertTriangle,
  ArrowRight,
  Bookmark,
  Check,
  CheckCircle2,
  Lightbulb,
  SkipForward,
  X,
} from "lucide-react"

function responsiveTextStyle(length: number): CSSProperties {
  const scale = length > 140 ? 0.95 : length > 90 ? 1.1 : length > 55 ? 1.25 : 1.4
  return {
    fontSize: `clamp(${scale}rem, 3.6vw, 2rem)`,
    overflowWrap: "anywhere",
  }
}

function stopPointerGesture(event: ReactPointerEvent<HTMLElement>) {
  event.stopPropagation()
}

function Speakable({
  text,
  className,
  style,
  label,
  enabled,
  onSpeak,
}: {
  text: string
  className: string
  style?: CSSProperties
  label: string
  enabled: boolean
  onSpeak: (text: string) => void
}) {
  if (!enabled) {
    return (
      <p className={className} style={style}>
        {text}
      </p>
    )
  }
  return (
    <button
      type="button"
      onPointerDown={stopPointerGesture}
      onClick={(event) => {
        event.stopPropagation()
        onSpeak(text)
      }}
      className={cn(className, "cursor-pointer rounded-2xl px-2 py-1 outline-none focus-visible:ring-4 focus-visible:ring-white/80")}
      style={style}
      aria-label={label}
    >
      {text}
    </button>
  )
}

export function NailExamQuizCard({
  question,
  isCurrent,
  answer,
  background,
  cardRef,
  position,
  isLast,
  showChinese,
  onSelectChoice,
  onSkip,
  onSpeak,
  onNext,
}: {
  question: ExamQuestion | null
  isCurrent: boolean
  answer: ExamAnswerRecord | undefined
  background: string
  cardRef?: RefObject<HTMLDivElement | null>
  position: "-100%" | "0" | "100%"
  isLast: boolean
  showChinese: boolean
  onSelectChoice: (choiceId: string) => void
  onSkip: () => void
  onSpeak: (text: string) => void
  onNext: () => void
}) {
  if (!question) {
    return (
      <div
        ref={cardRef}
        aria-hidden
        className="absolute inset-0 bg-black"
        style={{ transform: `translateY(${position})` }}
      />
    )
  }

  const isRevealed = Boolean(answer)
  const isCorrect = Boolean(answer && !answer.skipped && answer.correct)
  const isSkipped = Boolean(answer?.skipped)
  const correctChoice = question.choices.find((choice) => choice.id === question.correctChoiceId)
  const pickedWrongChoice =
    answer && !answer.skipped && !answer.correct
      ? question.choices.find((choice) => choice.id === answer.selectedChoiceId)
      : undefined
  // On the current card the drawer shows the answers, so the choice list is hidden to give it room.
  const showDrawer = isCurrent && isRevealed
  const shownChoices = isRevealed
    ? visibleChoicesAfterReveal(question.choices, question.correctChoiceId, answer?.selectedChoiceId ?? null)
    : question.choices

  return (
    <div
      ref={cardRef}
      aria-hidden={!isCurrent}
      className="absolute inset-0 flex flex-col text-white will-change-transform"
      style={{ background, transform: `translateY(${position})` }}
    >
      <div className="pointer-events-none absolute inset-0 bg-black/30" />

      <section
        className={cn(
          "relative z-10 flex min-h-0 flex-none flex-col items-center justify-center gap-1.5 px-5 sm:px-10",
          showDrawer ? "py-5" : "basis-[26%] py-2",
        )}
      >
        <Speakable
          text={question.question.en}
          enabled={isCurrent}
          onSpeak={onSpeak}
          label="Speak English question"
          className="max-w-4xl text-center font-bold leading-tight drop-shadow-2xl"
          style={responsiveTextStyle(question.question.en.length)}
        />
        {showChinese && (
          <p
            className="max-w-4xl text-center text-sm font-medium leading-snug text-caption-secondary drop-shadow-lg sm:text-base"
            lang="zh-Hans"
          >
            {question.question.zh}
          </p>
        )}
      </section>

      <section
        className={cn(
          "relative z-10 min-h-0 flex-1 overflow-y-auto border-t border-white/25 px-3 py-2 sm:px-6",
          showDrawer && "hidden",
        )}
      >
        <div className="flex flex-col gap-2.5">
          {shownChoices.map((choice) => {
            const isSelected = answer?.selectedChoiceId === choice.id
            const isCorrectChoice = choice.id === question.correctChoiceId
            const positionLabel = choicePositionLabel(question.choices, choice.id)

            return (
              <button
                key={`${question.id}-${choice.id}`}
                type="button"
                onPointerDown={stopPointerGesture}
                onClick={(event) => {
                  event.stopPropagation()
                  if (isCurrent && !isRevealed) onSelectChoice(choice.id)
                }}
                disabled={!isCurrent || isRevealed}
                className={cn(
                  "flex flex-col rounded-2xl border border-white/30 bg-black/20 px-3.5 py-2.5 text-left shadow-sm backdrop-blur-sm transition-colors",
                  !isRevealed &&
                    isCurrent &&
                    "hover:bg-black/30 hover:shadow-md focus-visible:ring-4 focus-visible:ring-white/80",
                  isRevealed && isSelected && isCorrectChoice && "border-emerald-400 bg-emerald-500/25",
                  isRevealed && isSelected && !isCorrectChoice && "border-rose-400 bg-rose-500/25",
                  isRevealed && !isSelected && isCorrectChoice && "border-emerald-400/80 bg-emerald-500/10",
                )}
              >
                <span className="text-base font-semibold sm:text-lg">
                  <span className="mr-1.5 opacity-70">{positionLabel}.</span>
                  {choice.en}
                </span>
                {showChinese && (
                  <span className="text-sm text-caption-secondary sm:text-base" lang="zh-Hans">
                    {choice.zh}
                  </span>
                )}
              </button>
            )
          })}
        </div>
      </section>

      {isCurrent && !isRevealed && (
        <section className="relative z-10 flex flex-none justify-start border-t border-white/20 px-3 py-2.5 sm:px-6">
          <Button
            type="button"
            variant="secondary"
            onPointerDown={stopPointerGesture}
            onClick={(event) => {
              event.stopPropagation()
              onSkip()
            }}
            className="gap-2 bg-white/15 text-white hover:bg-white/25"
            size="sm"
          >
            <SkipForward className="h-4 w-4" />
            Skip{showChinese && " | 跳过"}
          </Button>
        </section>
      )}

      {showDrawer && (
        <section
          className={cn(
            "qa-answer-reveal relative z-10 flex min-h-0 flex-1 flex-col overflow-hidden rounded-t-3xl backdrop-blur-sm",
            isSkipped ? "bg-amber-500/20" : isCorrect ? "bg-emerald-500/20" : "bg-rose-500/20",
          )}
        >
          {/* Solid banner so right/wrong reads at a glance, whatever the card's background color. */}
          <div
            role="status"
            className={cn(
              "flex flex-none items-center gap-3 px-4 py-3 shadow-md sm:px-6",
              isSkipped ? "bg-amber-500" : isCorrect ? "bg-emerald-600" : "bg-rose-600",
            )}
          >
            <span className="flex size-10 shrink-0 items-center justify-center rounded-full bg-white">
              {isSkipped ? (
                <SkipForward className="h-6 w-6 text-amber-600" strokeWidth={2.75} />
              ) : isCorrect ? (
                <Check className="h-7 w-7 text-emerald-600" strokeWidth={3.5} />
              ) : (
                <X className="h-7 w-7 text-rose-600" strokeWidth={3.5} />
              )}
            </span>
            <p className="text-2xl font-extrabold tracking-tight text-white drop-shadow-sm">
              {isSkipped
                ? `Skipped${showChinese ? " | 已跳过" : ""}`
                : isCorrect
                  ? `Correct!${showChinese ? " | 答对了" : ""}`
                  : `Wrong${showChinese ? " | 答错了" : ""}`}
            </p>
          </div>
          <div className="flex min-h-0 flex-1 flex-col gap-3 overflow-y-auto px-3.5 pt-3.5 pb-3 sm:px-6">
            {pickedWrongChoice && (
              <p className="flex flex-wrap items-baseline gap-x-2 rounded-xl border border-rose-300/40 bg-rose-950/25 px-3.5 py-2 text-sm">
                <span className="font-semibold tracking-wide text-rose-200 uppercase">
                  You picked{showChinese && " / 你选了"}
                </span>
                <span className="font-semibold text-white/75 line-through decoration-rose-300/80">
                  {pickedWrongChoice.en}
                </span>
                {showChinese && (
                  <span className="text-caption-secondary/80 line-through decoration-rose-300/60" lang="zh-Hans">
                    {pickedWrongChoice.zh}
                  </span>
                )}
              </p>
            )}
            {correctChoice && (
              <div
                className={cn(
                  "rounded-xl border px-3.5 py-2.5",
                  isCorrect ? "border-emerald-300/50 bg-emerald-500/20" : "border-emerald-300/40 bg-emerald-950/25",
                )}
              >
                <p className="flex items-center gap-1.5 text-sm font-semibold tracking-wide text-emerald-200 uppercase">
                  <CheckCircle2 className="h-3.5 w-3.5 shrink-0" aria-hidden />
                  Correct answer{showChinese && " / 正确答案"}
                </p>
                <Speakable
                  text={correctChoice.en}
                  enabled={isCurrent}
                  onSpeak={onSpeak}
                  label="Speak correct answer"
                  className="-ml-2 mt-0.5 text-left text-base font-semibold text-white"
                />
                {showChinese && (
                  <p className="text-sm font-medium text-caption-secondary" lang="zh-Hans">
                    {correctChoice.zh}
                  </p>
                )}
              </div>
            )}
            {question.sourceWarning && (
              <div className="rounded-xl border border-amber-300/60 bg-amber-950/35 p-3">
                <p className="flex items-center gap-1.5 text-sm font-semibold tracking-wide text-amber-200 uppercase">
                  <AlertTriangle className="h-4 w-4 shrink-0" aria-hidden />
                  Original source note{showChinese && " / 原始资料说明"}
                </p>
                <Speakable
                  text={question.sourceWarning.en}
                  enabled={isCurrent}
                  onSpeak={onSpeak}
                  label="Speak source warning"
                  className="-ml-2 mt-1 text-left text-base text-white"
                />
                {showChinese && (
                  <p className="mt-1 text-sm text-caption-secondary" lang="zh-Hans">
                    {question.sourceWarning.zh}
                  </p>
                )}
              </div>
            )}
            <div className="rounded-xl bg-black/20 px-3.5 py-2.5">
              <p className="flex items-center gap-1.5 text-sm font-semibold tracking-wide text-white/65 uppercase">
                <Lightbulb className="h-3.5 w-3.5 shrink-0" aria-hidden />
                Why{showChinese && " / 为什么"}
              </p>
              <Speakable
                text={question.explanation.en}
                enabled={isCurrent}
                onSpeak={onSpeak}
                label="Speak Why"
                className="-ml-2 mt-0.5 text-left text-base text-white"
              />
              {showChinese && (
                <p className="mt-1 text-sm text-caption-secondary" lang="zh-Hans">
                  {question.explanation.zh}
                </p>
              )}
            </div>
            <div className="rounded-xl bg-black/20 px-3.5 py-2.5">
              <p className="flex items-center gap-1.5 text-sm font-semibold tracking-wide text-white/65 uppercase">
                <Bookmark className="h-3.5 w-3.5 shrink-0" aria-hidden />
                Lock this{showChinese && " / 记重点"}
              </p>
              <Speakable
                text={question.lockPoint.en}
                enabled={isCurrent}
                onSpeak={onSpeak}
                label="Speak Lock this"
                className="-ml-2 mt-0.5 text-left text-base font-medium text-white"
              />
              {showChinese && (
                <p className="mt-1 text-sm text-caption-secondary" lang="zh-Hans">
                  {question.lockPoint.zh}
                </p>
              )}
            </div>
          </div>
          <div className="flex-none border-t border-white/15 px-3.5 pt-2.5 pb-3.5 sm:px-6">
            <Button
              type="button"
              onPointerDown={stopPointerGesture}
              onClick={(event) => {
                event.stopPropagation()
                onNext()
              }}
              className="h-11 w-full gap-2 sm:w-auto sm:px-10 rounded-xl bg-white text-base font-semibold text-slate-900 shadow-sm hover:bg-white/90"
            >
              {isLast
                ? `See results${showChinese ? " | 查看结果" : ""}`
                : `Next${showChinese ? " | 下一题" : ""}`}
              <ArrowRight className="h-4 w-4" />
            </Button>
          </div>
        </section>
      )}
    </div>
  )
}
