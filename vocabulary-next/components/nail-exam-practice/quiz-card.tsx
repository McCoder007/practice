"use client"

import type { CSSProperties, PointerEvent as ReactPointerEvent, RefObject } from "react"

import { Button } from "@/components/ui/button"
import type { ExamAnswerRecord, ExamQuestion } from "@/data/exam-quiz/types"
import { choicePositionLabel, visibleChoicesAfterReveal } from "@/lib/exam-quiz-reel"
import { cn } from "@/lib/utils"
import { ArrowRight, CheckCircle2, SkipForward, XCircle } from "lucide-react"

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

      <section className="relative z-10 flex min-h-0 flex-none basis-[26%] flex-col items-center justify-center gap-1.5 px-5 py-2 sm:px-10">
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
            className="max-w-4xl text-center text-sm font-medium leading-snug text-[#FFD700] drop-shadow-lg sm:text-base"
            lang="zh-Hans"
          >
            {question.question.zh}
          </p>
        )}
      </section>

      <section className="relative z-10 min-h-0 flex-1 overflow-y-auto border-t border-white/25 px-3 py-2 sm:px-6">
        <div className="flex flex-col gap-2.5">
          {shownChoices.map((choice) => {
            const isSelected = answer?.selectedChoiceId === choice.id
            const isCorrectChoice = choice.id === question.correctChoiceId
            const positionLabel = choicePositionLabel(question.choices, choice.id)

            return (
              <button
                key={choice.id}
                type="button"
                onPointerDown={stopPointerGesture}
                onClick={(event) => {
                  event.stopPropagation()
                  if (isCurrent && !isRevealed) onSelectChoice(choice.id)
                }}
                disabled={!isCurrent || isRevealed}
                className={cn(
                  "flex flex-col rounded-2xl border border-white/30 bg-black/20 px-3.5 py-2.5 text-left backdrop-blur-sm transition-colors",
                  !isRevealed &&
                    isCurrent &&
                    "hover:bg-black/30 focus-visible:ring-4 focus-visible:ring-white/80",
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
                  <span className="text-sm text-[#FFD700] sm:text-base" lang="zh-Hans">
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

      {isCurrent && isRevealed && (
        <section
          className={cn(
            "qa-answer-reveal relative z-10 flex min-h-0 flex-none flex-col gap-2.5 overflow-y-auto border-t px-3.5 py-3 backdrop-blur-sm sm:px-6",
            isSkipped
              ? "border-amber-400/60 bg-amber-500/20"
              : isCorrect
                ? "border-emerald-400/60 bg-emerald-500/20"
                : "border-rose-400/60 bg-rose-500/20",
          )}
        >
          <div className="flex items-center gap-2">
            {isSkipped ? (
              <SkipForward className="h-5 w-5 shrink-0 text-amber-200" />
            ) : isCorrect ? (
              <CheckCircle2 className="h-5 w-5 shrink-0 text-emerald-300" />
            ) : (
              <XCircle className="h-5 w-5 shrink-0 text-rose-300" />
            )}
            <p className="text-lg font-bold">
              {isSkipped
                ? `Skipped${showChinese ? " | 已跳过" : ""}`
                : isCorrect
                  ? `Correct!${showChinese ? " 正确！" : ""}`
                  : `Not quite${showChinese ? " 不太对" : ""}`}
            </p>
          </div>
          {!isCorrect && correctChoice && (
            <p className="text-base text-white/90">
              {correctChoice.en}
              {showChinese && <> · <span lang="zh-Hans">{correctChoice.zh}</span></>}
            </p>
          )}
          {question.sourceWarning && (
            <div className="rounded-lg border border-amber-300/60 bg-amber-950/35 p-3">
              <p className="text-sm font-semibold tracking-wide text-amber-200 uppercase">
                Original source note{showChinese && " / 原始资料说明"}
              </p>
              <Speakable
                text={question.sourceWarning.en}
                enabled={isCurrent}
                onSpeak={onSpeak}
                label="Speak source warning"
                className="mt-1 text-left text-base text-white"
              />
              {showChinese && (
                <p className="mt-1 text-sm text-[#FFD700]" lang="zh-Hans">
                  {question.sourceWarning.zh}
                </p>
              )}
            </div>
          )}
          <div className="space-y-1">
            <p className="text-sm font-semibold tracking-wide text-white/70 uppercase">
              Why{showChinese && " / 为什么"}
            </p>
            <Speakable
              text={question.explanation.en}
              enabled={isCurrent}
              onSpeak={onSpeak}
              label="Speak Why"
              className="text-left text-base text-white"
            />
            {showChinese && (
              <p className="text-sm text-[#FFD700]" lang="zh-Hans">
                {question.explanation.zh}
              </p>
            )}
          </div>
          <div className="space-y-1">
            <p className="text-sm font-semibold tracking-wide text-white/70 uppercase">
              Lock this{showChinese && " / 记重点"}
            </p>
            <Speakable
              text={question.lockPoint.en}
              enabled={isCurrent}
              onSpeak={onSpeak}
              label="Speak Lock this"
              className="text-left text-base font-medium text-white"
            />
            {showChinese && (
              <p className="text-sm text-[#FFD700]" lang="zh-Hans">
                {question.lockPoint.zh}
              </p>
            )}
          </div>
          <Button
            type="button"
            onPointerDown={stopPointerGesture}
            onClick={(event) => {
              event.stopPropagation()
              onNext()
            }}
            className="mt-1 gap-2 self-start bg-white text-slate-900 hover:bg-white/90"
            size="sm"
          >
            {isLast
              ? `See results${showChinese ? " | 查看结果" : ""}`
              : `Next${showChinese ? " | 下一题" : ""}`}
            <ArrowRight className="h-4 w-4" />
          </Button>
        </section>
      )}
    </div>
  )
}
