"use client"

import {
  useCallback,
  useEffect,
  useLayoutEffect,
  useRef,
  useState,
  type CSSProperties,
  type PointerEvent as ReactPointerEvent,
} from "react"

import Link from "next/link"

import { ExamQuizChineseToggle } from "@/components/ExamQuizChineseToggle"
import { NavigationMenu } from "@/components/NavigationMenu"
import { PerfectScoreCelebration } from "@/components/PerfectScoreCelebration"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { useExamQuizPreferences } from "@/contexts/ExamQuizPreferencesContext"
import {
  PRACTICE_COUNT,
  PRACTICE_SOURCES,
  PRACTICE_TITLE,
  QUESTIONS_TO_REVIEW_TITLE,
  QUICK_COUNT,
  HELD_FOR_REVIEW_COUNT,
  OMITTED_PRACTICE_IDS,
  getPracticeSource,
  sourceRangeCards,
} from "@/data/exam-quiz/catalog"
import { loadPracticeQuestions, loadQuestionsToReview } from "@/data/exam-quiz/loadChapter"
import type {
  ExamAnswerRecord,
  ExamQuestion,
  ExamResultsSummary,
  ExamSession,
  QuizMode,
} from "@/data/exam-quiz/types"
import { isRandomQuizMode } from "@/data/exam-quiz/types"
import {
  canAdvanceNext,
  choicePositionLabel,
  classifyExamReelGesture,
  drawPracticeSession,
  assertPlayablePool,
  shuffleQuestionChoices,
  sliceSourceRange,
  summarizeSession,
  visibleChoicesAfterReveal,
} from "@/lib/exam-quiz-reel"
import {
  getBackgroundForWord,
  getBackgroundIndexForWord,
} from "@/lib/word-reel-backgrounds"
import { clearAudioQueue, playText, preloadTexts, stopTTS } from "@/lib/tts"
import { cn } from "@/lib/utils"
import {
  ArrowRight,
  CheckCircle2,
  Home,
  RotateCcw,
  SkipForward,
  XCircle,
} from "lucide-react"

type ExamQuizScreen = { step: "mode" } | { step: "quiz" } | { step: "results" }

const ANIMATION_MS = 300

function responsiveTextStyle(length: number): CSSProperties {
  const scale = length > 140 ? 1 : length > 90 ? 1.15 : length > 55 ? 1.3 : 1.5
  return {
    fontSize: `clamp(${scale}rem, 4vw, 2.25rem)`,
    overflowWrap: "anywhere",
  }
}

function stopPointerGesture(event: ReactPointerEvent<HTMLElement>) {
  event.stopPropagation()
}

const SOURCE_ACCENT_CLASSES = {
  violet:
    "border-violet-200 bg-gradient-to-r from-violet-50 to-white dark:border-violet-900/50 dark:from-violet-950/30 dark:to-slate-800",
  rose: "border-rose-200 bg-gradient-to-r from-rose-50 to-white dark:border-rose-900/50 dark:from-rose-950/30 dark:to-slate-800",
  cyan: "border-cyan-200 bg-gradient-to-r from-cyan-50 to-white dark:border-cyan-900/50 dark:from-cyan-950/30 dark:to-slate-800",
} as const

function ModePicker({
  loading,
  onSelect,
  showChinese,
}: {
  loading: boolean
  onSelect: (mode: QuizMode) => void
  showChinese: boolean
}) {
  return (
    <div className="mx-auto flex w-full max-w-md flex-col gap-3 px-4 pb-8 pt-20">
      <h1 className="text-center text-xl font-bold text-slate-900 sm:text-2xl dark:text-white">
        {PRACTICE_TITLE.en}
        {showChinese && <> | {PRACTICE_TITLE.zh}</>}
      </h1>
      <p className="text-center text-sm text-slate-600 dark:text-slate-300">
        {loading
          ? `Loading questions…${showChinese ? " | 正在加载题目…" : ""}`
          : `Random questions from the approved practice pool${showChinese ? " | 从已审核练习题库随机抽题" : ""}`}
      </p>
      <div className="mt-2 flex flex-col gap-3">
        <Card
          onClick={() => !loading && onSelect("quick")}
          className={cn(
            "cursor-pointer border-2 border-emerald-200 bg-gradient-to-r from-emerald-50 to-white transition-shadow hover:shadow-md dark:border-emerald-900/50 dark:from-emerald-950/30 dark:to-slate-800",
            loading && "pointer-events-none opacity-60",
          )}
        >
          <CardContent className="px-5">
            <h2 className="text-lg font-bold text-slate-900 dark:text-white">
              Quick practice{showChinese && " | 快速练习"}
            </h2>
            <p className="text-sm text-slate-600 dark:text-slate-300">
              {QUICK_COUNT} random questions
              {showChinese && ` | ${QUICK_COUNT} 道随机题目`}
            </p>
          </CardContent>
        </Card>
        <Card
          onClick={() => !loading && onSelect("practice")}
          className={cn(
            "cursor-pointer border-2 border-blue-200 bg-gradient-to-r from-blue-50 to-white transition-shadow hover:shadow-md dark:border-blue-900/50 dark:from-blue-950/30 dark:to-slate-800",
            loading && "pointer-events-none opacity-60",
          )}
        >
          <CardContent className="px-5">
            <h2 className="text-lg font-bold text-slate-900 dark:text-white">
              Practice set{showChinese && " | 练习套题"}
            </h2>
            <p className="text-sm text-slate-600 dark:text-slate-300">
              {PRACTICE_COUNT} random questions
              {showChinese && ` | ${PRACTICE_COUNT} 道随机题目`}
            </p>
          </CardContent>
        </Card>

        {PRACTICE_SOURCES.map((source) => {
          const ranges = sourceRangeCards(source.approvedCount)
          return (
            <section key={source.id} className="mt-6 flex flex-col gap-3">
              <h2 className="px-1 text-sm font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400">
                {source.title.en}
                {showChinese && <> | {source.title.zh}</>}
              </h2>
              {ranges.map((range) => (
                <Card
                  key={`${source.id}-${range.offset}`}
                  onClick={() =>
                    !loading &&
                    onSelect({
                      kind: "source-range",
                      sourceId: source.id,
                      offset: range.offset,
                    })
                  }
                  className={cn(
                    "cursor-pointer border-2 transition-shadow hover:shadow-md",
                    SOURCE_ACCENT_CLASSES[source.accent],
                    loading && "pointer-events-none opacity-60",
                  )}
                >
                  <CardContent className="px-5">
                    <h3 className="text-lg font-bold text-slate-900 dark:text-white">
                      Questions {range.start}–{range.end}
                      {showChinese && <> | 第 {range.start}–{range.end} 题</>}
                    </h3>
                    <p className="text-sm text-slate-600 dark:text-slate-300">
                      {range.count} questions in source order
                      {showChinese && <> | {range.count} 道题目，按原顺序</>}
                    </p>
                  </CardContent>
                </Card>
              ))}
            </section>
          )
        })}

        <Link
          href="/exam-quiz/questions-to-review"
          className="mt-6 block rounded-xl border border-amber-200/80 bg-amber-50/70 px-5 py-4 text-left shadow-none transition-colors hover:bg-amber-50 dark:border-amber-900/40 dark:bg-amber-950/20 dark:hover:bg-amber-950/30"
        >
          <h2 className="text-base font-semibold text-amber-950 dark:text-amber-100">
            {QUESTIONS_TO_REVIEW_TITLE.en}
            {showChinese && <> | {QUESTIONS_TO_REVIEW_TITLE.zh}</>}
          </h2>
          <p className="mt-1 text-sm leading-relaxed text-amber-900/80 dark:text-amber-200/80">
            {HELD_FOR_REVIEW_COUNT} questions not in the approved study pool
            {showChinese && <> | {HELD_FOR_REVIEW_COUNT} 道题目不属于已审核学习题库</>}
          </p>
        </Link>
      </div>
    </div>
  )
}

type QuizCardProps = {
  question: ExamQuestion | null
  isCurrent: boolean
  answer: ExamAnswerRecord | undefined
  background: string
  cardRef?: React.RefObject<HTMLDivElement | null>
  position: "-100%" | "0" | "100%"
  isLast: boolean
  showChinese: boolean
  onSelectChoice: (choiceId: string) => void
  onSkip: () => void
  onSpeak: (text: string) => void
  onNext: () => void
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

function QuizCard({
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
}: QuizCardProps) {
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

      <section className="relative z-10 flex min-h-0 flex-none basis-[34%] flex-col items-center justify-center gap-2 px-5 py-3 sm:px-10">
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
        <div className="flex flex-col gap-2">
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
                  "flex flex-col rounded-2xl border border-white/30 bg-black/20 px-3 py-2 text-left backdrop-blur-sm transition-colors",
                  !isRevealed &&
                    isCurrent &&
                    "hover:bg-black/30 focus-visible:ring-4 focus-visible:ring-white/80",
                  isRevealed && isSelected && isCorrectChoice && "border-emerald-400 bg-emerald-500/25",
                  isRevealed && isSelected && !isCorrectChoice && "border-rose-400 bg-rose-500/25",
                  isRevealed && !isSelected && isCorrectChoice && "border-emerald-400/80 bg-emerald-500/10",
                )}
              >
                <span className="text-sm font-semibold sm:text-base">
                  <span className="mr-1.5 opacity-70">{positionLabel}.</span>
                  {choice.en}
                </span>
                {showChinese && (
                  <span className="text-xs text-[#FFD700] sm:text-sm" lang="zh-Hans">
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
            "qa-answer-reveal relative z-10 flex min-h-0 flex-none flex-col gap-2 overflow-y-auto border-t px-3 py-2.5 backdrop-blur-sm sm:px-6",
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
            <p className="font-bold">
              {isSkipped
                ? `Skipped${showChinese ? " | 已跳过" : ""}`
                : isCorrect
                  ? `Correct!${showChinese ? " 正确！" : ""}`
                  : `Not quite${showChinese ? " 不太对" : ""}`}
            </p>
          </div>
          {!isCorrect && correctChoice && (
            <p className="text-sm text-white/90">
              {correctChoice.en}
              {showChinese && <> · <span lang="zh-Hans">{correctChoice.zh}</span></>}
            </p>
          )}
          {question.sourceWarning && (
            <div className="rounded-lg border border-amber-300/60 bg-amber-950/35 p-2.5">
              <p className="text-xs font-semibold tracking-wide text-amber-200 uppercase">
                Original source note{showChinese && " / 原始资料说明"}
              </p>
              <Speakable
                text={question.sourceWarning.en}
                enabled={isCurrent}
                onSpeak={onSpeak}
                label="Speak source warning"
                className="mt-1 text-left text-sm text-white"
              />
              {showChinese && (
                <p className="mt-1 text-xs text-[#FFD700]" lang="zh-Hans">
                  {question.sourceWarning.zh}
                </p>
              )}
            </div>
          )}
          <div className="space-y-1">
            <p className="text-xs font-semibold tracking-wide text-white/70 uppercase">
              Why{showChinese && " / 为什么"}
            </p>
            <Speakable
              text={question.explanation.en}
              enabled={isCurrent}
              onSpeak={onSpeak}
              label="Speak Why"
              className="text-left text-sm text-white"
            />
            {showChinese && (
              <p className="text-xs text-[#FFD700]" lang="zh-Hans">
                {question.explanation.zh}
              </p>
            )}
          </div>
          <div className="space-y-1">
            <p className="text-xs font-semibold tracking-wide text-white/70 uppercase">
              Lock this{showChinese && " / 记重点"}
            </p>
            <Speakable
              text={question.lockPoint.en}
              enabled={isCurrent}
              onSpeak={onSpeak}
              label="Speak Lock this"
              className="text-left text-sm font-medium text-white"
            />
            {showChinese && (
              <p className="text-xs text-[#FFD700]" lang="zh-Hans">
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

function quizModeLabel(mode: QuizMode): { en: string; zh: string } {
  if (mode === "quick") {
    return { en: "Quick practice", zh: "快速练习" }
  }
  if (mode === "practice") {
    return { en: "Practice set", zh: "练习套题" }
  }
  const source = getPracticeSource(mode.sourceId)
  const range = sourceRangeCards(source.approvedCount).find((card) => card.offset === mode.offset)
  if (!range) {
    return { en: source.title.en, zh: source.title.zh }
  }
  return {
    en: `${source.title.en} Q${range.start}–${range.end}`,
    zh: `${source.title.zh} 第 ${range.start}–${range.end} 题`,
  }
}

function ResultsScreen({
  session,
  summary,
  showChinese,
  onRestart,
  onHome,
}: {
  session: ExamSession
  summary: ExamResultsSummary
  showChinese: boolean
  onRestart: () => void
  onHome: () => void
}) {
  const quizLabel = quizModeLabel(session.mode)
  const isPerfectScore = summary.total > 0 && summary.correct === summary.total

  return (
    <div className="quiz-results-screen mx-auto flex w-full max-w-xl flex-col gap-4 px-4 pt-20">
      {isPerfectScore ? (
        <PerfectScoreCelebration
          correct={summary.correct}
          total={summary.total}
          quizLabel={quizLabel}
          showChinese={showChinese}
        />
      ) : (
        <>
          <h1 className="bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-center text-2xl font-bold text-transparent">
            Practice complete!{showChinese && " | 练习完成！"}
          </h1>
          <p className="text-center text-base font-medium text-slate-600 dark:text-slate-300">
            {quizLabel.en}
            {showChinese && <> | {quizLabel.zh}</>}
          </p>
          <p className="text-center text-xl font-medium text-slate-900 dark:text-white">
            Your score: {summary.correct} / {summary.total}
            {showChinese && <> | 得分：{summary.correct} / {summary.total}</>}
          </p>
        </>
      )}

      {summary.missed.length > 0 && (
        <Card>
          <CardContent className="space-y-3 px-5">
            <h3 className="text-sm font-semibold text-slate-700 dark:text-slate-200">
              Review missed questions{showChinese && " | 复习错题"}
            </h3>
            {summary.missed.map((answer) => {
              const question = session.questions.find((candidate) => candidate.id === answer.questionId)
              const correctChoice = question?.choices.find((choice) => choice.id === question.correctChoiceId)
              if (!question || !correctChoice) return null

              return (
                <div
                  key={answer.questionId}
                  className={cn(
                    "rounded-lg border-l-4 px-3 py-2",
                    answer.skipped
                      ? "border-amber-400 bg-amber-50 dark:bg-amber-950/20"
                      : "border-rose-400 bg-rose-50 dark:bg-rose-950/20",
                  )}
                >
                  <p className="text-xs font-semibold tracking-wide text-slate-500 uppercase dark:text-slate-400">
                    {answer.skipped
                      ? `Skipped${showChinese ? " | 已跳过" : ""}`
                      : `Incorrect${showChinese ? " | 错误" : ""}`}
                  </p>
                  <p className="text-sm font-medium text-slate-900 dark:text-white">{question.question.en}</p>
                  {showChinese && (
                    <p className="text-xs text-slate-500 dark:text-slate-400" lang="zh-Hans">
                      {question.question.zh}
                    </p>
                  )}
                  <p className="mt-1 text-xs text-emerald-700 dark:text-emerald-400">
                    Correct: {correctChoice.en}
                    {showChinese && <> | 正确答案：<span lang="zh-Hans">{correctChoice.zh}</span></>}
                  </p>
                  {question.sourceWarning && (
                    <div className="mt-2 rounded-md border border-amber-300 bg-amber-50 p-2 dark:border-amber-700 dark:bg-amber-950/30">
                      <p className="text-xs font-semibold text-amber-900 dark:text-amber-200">
                        Original source note{showChinese && " / 原始资料说明"}
                      </p>
                      <p className="text-xs text-amber-900 dark:text-amber-100">{question.sourceWarning.en}</p>
                      {showChinese && (
                        <p className="text-xs text-amber-700 dark:text-amber-300" lang="zh-Hans">
                          {question.sourceWarning.zh}
                        </p>
                      )}
                    </div>
                  )}
                  <p className="mt-1 text-xs text-slate-700 dark:text-slate-200">
                    Why{showChinese && " / 为什么"}: {question.explanation.en}
                  </p>
                  {showChinese && (
                    <p className="text-xs text-slate-500 dark:text-slate-400" lang="zh-Hans">
                      {question.explanation.zh}
                    </p>
                  )}
                  <p className="mt-1 text-xs font-medium text-slate-800 dark:text-slate-100">
                    Lock this{showChinese && " / 记重点"}: {question.lockPoint.en}
                  </p>
                  {showChinese && (
                    <p className="text-xs text-slate-500 dark:text-slate-400" lang="zh-Hans">
                      {question.lockPoint.zh}
                    </p>
                  )}
                </div>
              )
            })}
          </CardContent>
        </Card>
      )}

      <div className="quiz-results-actions mt-2 flex flex-col gap-2 sm:flex-row">
        <Button onClick={onRestart} size="lg" className="flex-1 gap-2">
          <RotateCcw className="h-4 w-4" />
          {isPerfectScore && isRandomQuizMode(session.mode)
            ? `Practice new questions${showChinese ? " | 练习新题目" : ""}`
            : `Restart${showChinese ? " | 重新开始" : ""}`}
        </Button>
        <Button onClick={onHome} size="lg" variant="ghost" className="flex-1 gap-2">
          <Home className="h-4 w-4" />
          Home{showChinese && " | 主页"}
        </Button>
      </div>
    </div>
  )
}

export default function ExamQuizPage() {
  const { showChinese } = useExamQuizPreferences()
  const [screen, setScreen] = useState<ExamQuizScreen>({ step: "mode" })
  const [session, setSession] = useState<ExamSession | null>(null)
  const [loadingQuiz, setLoadingQuiz] = useState(false)
  const [currentIndex, setCurrentIndex] = useState(0)
  const [animating, setAnimating] = useState(false)

  const containerRef = useRef<HTMLDivElement>(null)
  const currentCardRef = useRef<HTMLDivElement>(null)
  const previousCardRef = useRef<HTMLDivElement>(null)
  const nextCardRef = useRef<HTMLDivElement>(null)
  const currentIndexRef = useRef(0)
  const activeGestureRef = useRef<{ pointerId: number; startY: number } | null>(null)
  const gestureInvalidatedRef = useRef(false)
  const animationTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const isNavigatingHistoryRef = useRef(false)
  const hasMountedHistoryRef = useRef(false)

  useEffect(() => {
    const handlePopState = (event: PopStateEvent) => {
      isNavigatingHistoryRef.current = true
      const nextScreen: ExamQuizScreen =
        (event.state?.screen as ExamQuizScreen | undefined) ?? { step: "mode" }
      setScreen(nextScreen)
      if (nextScreen.step !== "quiz" && nextScreen.step !== "results") {
        setSession(null)
      }
      setTimeout(() => {
        isNavigatingHistoryRef.current = false
      }, 0)
    }

    window.addEventListener("popstate", handlePopState)
    return () => window.removeEventListener("popstate", handlePopState)
  }, [])

  useEffect(() => {
    if (isNavigatingHistoryRef.current) return
    if (!hasMountedHistoryRef.current) {
      hasMountedHistoryRef.current = true
      return
    }
    window.history.pushState({ screen }, "", `#exam-quiz-${screen.step}`)
  }, [screen])

  useEffect(() => {
    if (screen.step !== "quiz") return
    const originalOverflow = document.body.style.overflow
    const originalTouchAction = document.body.style.touchAction
    const originalHtmlOverflow = document.documentElement.style.overflow
    document.documentElement.style.overflow = "hidden"
    document.body.style.overflow = "hidden"
    document.body.style.touchAction = "none"

    return () => {
      document.documentElement.style.overflow = originalHtmlOverflow
      document.body.style.overflow = originalOverflow
      document.body.style.touchAction = originalTouchAction
      clearAudioQueue()
      stopTTS()
    }
  }, [screen.step])

  useEffect(() => {
    return () => {
      if (animationTimeoutRef.current) clearTimeout(animationTimeoutRef.current)
    }
  }, [])

  const resetCardPositions = useCallback((withAnimation: boolean) => {
    const transition = withAnimation ? `transform ${ANIMATION_MS}ms ease-out` : "none"
    if (currentCardRef.current) {
      currentCardRef.current.style.transition = transition
      currentCardRef.current.style.transform = "translateY(0)"
    }
    if (previousCardRef.current) {
      previousCardRef.current.style.transition = transition
      previousCardRef.current.style.transform = "translateY(-100%)"
    }
    if (nextCardRef.current) {
      nextCardRef.current.style.transition = transition
      nextCardRef.current.style.transform = "translateY(100%)"
    }
  }, [])

  const cancelGesture = useCallback(() => {
    activeGestureRef.current = null
    gestureInvalidatedRef.current = true
    resetCardPositions(true)
  }, [resetCardPositions])

  useLayoutEffect(() => {
    if (screen.step !== "quiz") return
    resetCardPositions(false)
  }, [currentIndex, screen.step, resetCardPositions])

  useEffect(() => {
    if (screen.step !== "quiz" || !session) return
    const questions = session.questions
    const current = questions[currentIndex]
    const previous = currentIndex > 0 ? questions[currentIndex - 1] : null
    const next = currentIndex < questions.length - 1 ? questions[currentIndex + 1] : null
    preloadTexts(
      [current, previous, next]
        .filter(Boolean)
        .flatMap((question) => [
          question!.question.en,
          question!.explanation.en,
          question!.lockPoint.en,
          question!.sourceWarning?.en,
        ].filter((text): text is string => Boolean(text))),
    )
  }, [screen.step, session, currentIndex])

  const skipQuestion = useCallback((question: ExamQuestion) => {
    setSession((prev) => {
      if (!prev || prev.answers[question.id]) return prev
      return {
        ...prev,
        answers: {
          ...prev.answers,
          [question.id]: { questionId: question.id, selectedChoiceId: null, correct: false, skipped: true },
        },
      }
    })
  }, [])

  const selectChoice = useCallback((question: ExamQuestion, choiceId: string) => {
    setSession((prev) => {
      if (!prev || prev.answers[question.id]) return prev
      const correct = choiceId === question.correctChoiceId
      return {
        ...prev,
        answers: {
          ...prev.answers,
          [question.id]: { questionId: question.id, selectedChoiceId: choiceId, correct, skipped: false },
        },
      }
    })
  }, [])

  const finishQuiz = useCallback(() => {
    setAnimating(false)
    setScreen({ step: "results" })
  }, [])

  const advance = useCallback(
    (direction: "next" | "previous") => {
      if (!session || animating) return
      const questions = session.questions
      const idx = currentIndexRef.current
      const question = questions[idx]

      if (direction === "previous" && idx === 0) {
        resetCardPositions(true)
        return
      }

      if (direction === "next" && !canAdvanceNext(session.answers[question.id])) {
        resetCardPositions(true)
        return
      }

      activeGestureRef.current = null
      gestureInvalidatedRef.current = false
      clearAudioQueue()
      stopTTS()

      const isFinishing = direction === "next" && idx === questions.length - 1
      setAnimating(true)

      const outgoing = currentCardRef.current
      const incoming = direction === "next" ? nextCardRef.current : previousCardRef.current
      if (outgoing) {
        outgoing.style.transition = `transform ${ANIMATION_MS}ms ease-out`
        outgoing.style.transform = direction === "next" ? "translateY(-100%)" : "translateY(100%)"
      }
      if (incoming && !isFinishing) {
        incoming.style.transition = `transform ${ANIMATION_MS}ms ease-out`
        incoming.style.transform = "translateY(0)"
      }

      animationTimeoutRef.current = setTimeout(() => {
        if (isFinishing) {
          finishQuiz()
          animationTimeoutRef.current = null
          return
        }
        const nextIdx = direction === "next" ? idx + 1 : idx - 1
        currentIndexRef.current = nextIdx
        setCurrentIndex(nextIdx)
        setAnimating(false)
        animationTimeoutRef.current = null
      }, ANIMATION_MS)
    },
    [session, animating, resetCardPositions, finishQuiz],
  )

  const handlePointerDown = useCallback(
    (event: ReactPointerEvent<HTMLDivElement>) => {
      if (animating) return
      if (activeGestureRef.current) {
        cancelGesture()
        return
      }
      gestureInvalidatedRef.current = false
      activeGestureRef.current = { pointerId: event.pointerId, startY: event.clientY }
      event.currentTarget.setPointerCapture(event.pointerId)
    },
    [animating, cancelGesture],
  )

  const handlePointerMove = useCallback(
    (event: ReactPointerEvent<HTMLDivElement>) => {
      const gesture = activeGestureRef.current
      if (!gesture || gesture.pointerId !== event.pointerId || gestureInvalidatedRef.current || animating) {
        return
      }

      const deltaY = gesture.startY - event.clientY
      const movePercent = Math.min(100, (Math.abs(deltaY) / window.innerHeight) * 100)
      const currentCard = currentCardRef.current
      const previousCard = previousCardRef.current
      const nextCard = nextCardRef.current

      if (currentCard) currentCard.style.transition = "none"
      if (previousCard) previousCard.style.transition = "none"
      if (nextCard) nextCard.style.transition = "none"

      if (deltaY > 0) {
        if (currentCard) currentCard.style.transform = `translateY(-${movePercent}%)`
        if (nextCard) nextCard.style.transform = `translateY(${100 - movePercent}%)`
        if (previousCard) previousCard.style.transform = "translateY(-100%)"
      } else if (deltaY < 0) {
        if (currentCard) currentCard.style.transform = `translateY(${movePercent}%)`
        if (previousCard) previousCard.style.transform = `translateY(${-100 + movePercent}%)`
        if (nextCard) nextCard.style.transform = "translateY(100%)"
      }
    },
    [animating],
  )

  const handlePointerUp = useCallback(
    (event: ReactPointerEvent<HTMLDivElement>) => {
      const gesture = activeGestureRef.current
      if (!gesture || gesture.pointerId !== event.pointerId || gestureInvalidatedRef.current || animating) {
        cancelGesture()
        return
      }

      const outcome = classifyExamReelGesture({
        deltaX: 0,
        deltaY: gesture.startY - event.clientY,
        swipeThresholdPx: window.innerHeight * 0.12,
      })

      activeGestureRef.current = null
      if (event.currentTarget.hasPointerCapture(event.pointerId)) {
        event.currentTarget.releasePointerCapture(event.pointerId)
      }

      if (outcome === "swipeNext") {
        advance("next")
      } else if (outcome === "swipePrevious") {
        advance("previous")
      } else {
        resetCardPositions(true)
      }
    },
    [animating, cancelGesture, advance, resetCardPositions],
  )

  const handleLostPointerCapture = useCallback(() => {
    if (activeGestureRef.current) cancelGesture()
  }, [cancelGesture])

  useEffect(() => {
    if (screen.step !== "quiz") return
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.defaultPrevented || animating) return
      if (event.key === "ArrowDown") {
        event.preventDefault()
        advance("next")
      } else if (event.key === "ArrowUp") {
        event.preventDefault()
        advance("previous")
      }
    }
    window.addEventListener("keydown", handleKeyDown)
    return () => window.removeEventListener("keydown", handleKeyDown)
  }, [screen.step, animating, advance])

  const startQuiz = useCallback(async (mode: QuizMode) => {
    setLoadingQuiz(true)
    try {
      const [questions, held] = await Promise.all([loadPracticeQuestions(), loadQuestionsToReview()])
      assertPlayablePool(questions, [
        ...held.questions.map((question) => question.id),
        ...OMITTED_PRACTICE_IDS,
      ])
      const selectedQuestions = isRandomQuizMode(mode)
        ? drawPracticeSession(questions, mode === "quick" ? QUICK_COUNT : PRACTICE_COUNT)
        : sliceSourceRange(questions, mode.sourceId, mode.offset)
      const sessionQuestions = shuffleQuestionChoices(selectedQuestions)
      if (sessionQuestions.length === 0) return
      currentIndexRef.current = 0
      setCurrentIndex(0)
      setSession({ mode, questions: sessionQuestions, answers: {} })
      setScreen({ step: "quiz" })
    } finally {
      setLoadingQuiz(false)
    }
  }, [])

  const goHome = useCallback(() => {
    setSession(null)
    setScreen({ step: "mode" })
  }, [])

  if (screen.step === "quiz" && session) {
    const questions = session.questions
    const total = questions.length
    const current = questions[currentIndex]
    const previousQuestion = currentIndex > 0 ? questions[currentIndex - 1] : null
    const nextQuestion = currentIndex < total - 1 ? questions[currentIndex + 1] : null
    const currentBgIndex = getBackgroundIndexForWord(currentIndex, 0)
    const currentBg = getBackgroundForWord(currentIndex, 0)
    const previousBg = previousQuestion
      ? getBackgroundForWord(currentIndex - 1, 0, currentBgIndex)
      : "#000"
    const nextBg = nextQuestion ? getBackgroundForWord(currentIndex + 1, 0, currentBgIndex) : "#000"
    const progress = (currentIndex / total) * 100

    return (
      <>
        <NavigationMenu />
        <main className="flex h-dvh w-screen flex-col overflow-hidden bg-black">
          <header className="relative z-20 grid h-16 shrink-0 grid-cols-[3.25rem_minmax(0,1fr)_auto] grid-rows-2 items-center gap-x-2 border-b border-white/10 bg-black/70 px-3 py-2 text-center backdrop-blur-md">
            <p className="col-start-2 row-start-1 text-[11px] font-medium leading-tight text-white/70 sm:text-xs">
              {PRACTICE_TITLE.en}
              {showChinese && <> | {PRACTICE_TITLE.zh}</>}
            </p>
            <div className="col-start-2 row-start-2 flex w-full items-center gap-2">
              <span className="shrink-0 text-xs text-white/80">
                {currentIndex + 1}/{total}
              </span>
              <Progress value={progress} className="h-1.5 flex-1 bg-white/15" />
            </div>
            <div className="col-start-3 row-span-2 row-start-1 flex justify-end">
              <ExamQuizChineseToggle placement="inline" />
            </div>
          </header>

          <div
            ref={containerRef}
            className="relative flex-1 touch-none overflow-hidden select-none"
            onPointerDown={handlePointerDown}
            onPointerMove={handlePointerMove}
            onPointerUp={handlePointerUp}
            onPointerCancel={cancelGesture}
            onLostPointerCapture={handleLostPointerCapture}
          >
            <QuizCard
              question={current}
              isCurrent
              answer={session.answers[current.id]}
              background={currentBg}
              cardRef={currentCardRef}
              position="0"
              isLast={currentIndex === total - 1}
              showChinese={showChinese}
              onSelectChoice={(choiceId) => selectChoice(current, choiceId)}
              onSkip={() => skipQuestion(current)}
              onSpeak={(text) => playText(text)}
              onNext={() => advance("next")}
            />
            <QuizCard
              question={previousQuestion}
              isCurrent={false}
              answer={previousQuestion ? session.answers[previousQuestion.id] : undefined}
              background={previousBg}
              cardRef={previousCardRef}
              position="-100%"
              isLast={false}
              showChinese={showChinese}
              onSelectChoice={() => {}}
              onSkip={() => {}}
              onSpeak={() => {}}
              onNext={() => {}}
            />
            <QuizCard
              question={nextQuestion}
              isCurrent={false}
              answer={nextQuestion ? session.answers[nextQuestion.id] : undefined}
              background={nextBg}
              cardRef={nextCardRef}
              position="100%"
              isLast={false}
              showChinese={showChinese}
              onSelectChoice={() => {}}
              onSkip={() => {}}
              onSpeak={() => {}}
              onNext={() => {}}
            />
          </div>
        </main>
      </>
    )
  }

  if (screen.step === "results" && session) {
    const summary = summarizeSession(session)
    return (
      <>
        <NavigationMenu />
        <ExamQuizChineseToggle />
        <div className="min-h-screen bg-gradient-to-b from-slate-50 to-slate-100 dark:from-slate-900 dark:to-slate-800">
          <ResultsScreen
            session={session}
            summary={summary}
            showChinese={showChinese}
            onRestart={() => startQuiz(session.mode)}
            onHome={goHome}
          />
        </div>
      </>
    )
  }

  return (
    <>
      <NavigationMenu />
      <ExamQuizChineseToggle />
      <div className="min-h-screen bg-gradient-to-b from-slate-50 to-slate-100 dark:from-slate-900 dark:to-slate-800">
        <ModePicker loading={loadingQuiz} onSelect={startQuiz} showChinese={showChinese} />
      </div>
    </>
  )
}
