"use client"

import {
  useCallback,
  useEffect,
  useLayoutEffect,
  useRef,
  useState,
  type PointerEvent as ReactPointerEvent,
  type ReactNode,
} from "react"

import { NailExamQuizCard } from "@/components/nail-exam-practice/quiz-card"
import {
  leaveNailExamSession,
  NailExamSessionBackButton,
} from "@/components/nail-exam-practice/session-back-button"
import { NavigationMenu } from "@/components/NavigationMenu"
import { PerfectScoreCelebration } from "@/components/PerfectScoreCelebration"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import type { LocalizedText } from "@/data/exam-quiz/types"
import type { ExamAnswerRecord, ExamQuestion } from "@/data/exam-quiz/types"
import {
  canAdvanceNext,
  classifyExamReelGesture,
  summarizeSession,
} from "@/lib/exam-quiz-reel"
import type { NailExamGroupHistoryEntry } from "@/lib/nail-exam-practice-history"
import {
  getBackgroundForWord,
  getBackgroundIndexForWord,
} from "@/lib/word-reel-backgrounds"
import { clearAudioQueue, playText, preloadTexts, stopTTS } from "@/lib/tts"
import { cn } from "@/lib/utils"
import { Home, RotateCcw } from "lucide-react"

const ANIMATION_MS = 300

type QuizScreen = { step: "quiz" } | { step: "results" }

type SessionState = {
  questions: ExamQuestion[]
  answers: Record<string, ExamAnswerRecord>
}

export function NailExamMultipleChoiceSession({
  title,
  questions,
  showChinese,
  chineseToggle,
  chineseToggleFixed,
  isRandom,
  onComplete,
  onRestart,
  onExit,
}: {
  title: LocalizedText
  questions: ExamQuestion[]
  showChinese: boolean
  chineseToggle: ReactNode
  chineseToggleFixed?: ReactNode
  isRandom: boolean
  onComplete?: (result: { correct: number; total: number }) => NailExamGroupHistoryEntry
  onRestart: () => void
  onExit: () => void
}) {
  const [screen, setScreen] = useState<QuizScreen>({ step: "quiz" })
  const [session, setSession] = useState<SessionState>({ questions, answers: {} })
  const [currentIndex, setCurrentIndex] = useState(0)
  const [animating, setAnimating] = useState(false)
  const [completionHistory, setCompletionHistory] = useState<NailExamGroupHistoryEntry | null>(null)

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
    setSession({ questions, answers: {} })
    currentIndexRef.current = 0
    setCurrentIndex(0)
    setScreen({ step: "quiz" })
    setCompletionHistory(null)
  }, [questions])

  useEffect(() => {
    const handlePopState = (event: PopStateEvent) => {
      isNavigatingHistoryRef.current = true
      const nextScreen = event.state?.nailExamScreen as QuizScreen["step"] | undefined
      if (nextScreen === "results") {
        setScreen({ step: "results" })
      } else if (nextScreen === "quiz") {
        setScreen({ step: "quiz" })
      } else {
        onExit()
      }
      setTimeout(() => {
        isNavigatingHistoryRef.current = false
      }, 0)
    }

    window.addEventListener("popstate", handlePopState)
    return () => window.removeEventListener("popstate", handlePopState)
  }, [onExit])

  useEffect(() => {
    if (isNavigatingHistoryRef.current) return
    if (!hasMountedHistoryRef.current) {
      hasMountedHistoryRef.current = true
      window.history.pushState({ nailExamScreen: "quiz" }, "", window.location.href)
      return
    }
    window.history.pushState({ nailExamScreen: screen.step }, "", window.location.href)
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
    if (screen.step !== "quiz") return
    const current = session.questions[currentIndex]
    const previous = currentIndex > 0 ? session.questions[currentIndex - 1] : null
    const next = currentIndex < session.questions.length - 1 ? session.questions[currentIndex + 1] : null
    preloadTexts(
      [current, previous, next]
        .filter(Boolean)
        .flatMap((question) =>
          [
            question!.question.en,
            question!.explanation.en,
            question!.lockPoint.en,
            question!.sourceWarning?.en,
          ].filter((text): text is string => Boolean(text)),
        ),
    )
  }, [screen.step, session.questions, currentIndex])

  const skipQuestion = useCallback((question: ExamQuestion) => {
    setSession((prev) => {
      if (prev.answers[question.id]) return prev
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
      if (prev.answers[question.id]) return prev
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
    const summary = summarizeSession({
      mode: isRandom ? "quick" : { kind: "source-range", sourceId: "nail-test", offset: 0 },
      questions: session.questions,
      answers: session.answers,
    })
    setCompletionHistory(onComplete?.({ correct: summary.correct, total: summary.total }) ?? null)
    setAnimating(false)
    setScreen({ step: "results" })
  }, [isRandom, onComplete, session.answers, session.questions])

  const advance = useCallback(
    (direction: "next" | "previous") => {
      if (animating) return
      const questionsInSession = session.questions
      const idx = currentIndexRef.current
      const question = questionsInSession[idx]

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

      const isFinishing = direction === "next" && idx === questionsInSession.length - 1
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

  if (screen.step === "results") {
    const summary = summarizeSession({
      mode: isRandom ? "quick" : { kind: "source-range", sourceId: "nail-test", offset: 0 },
      questions: session.questions,
      answers: session.answers,
    })
    const isPerfectScore = summary.total > 0 && summary.correct === summary.total

    return (
      <>
        <NavigationMenu />
        {chineseToggleFixed ?? chineseToggle}
        <div className="min-h-screen bg-gradient-to-b from-slate-50 to-slate-100 dark:from-slate-900 dark:to-slate-800">
          <div className="quiz-results-screen mx-auto flex w-full max-w-xl flex-col gap-4 px-4 pt-20">
            {isPerfectScore ? (
              <PerfectScoreCelebration
                correct={summary.correct}
                total={summary.total}
                quizLabel={title}
                showChinese={showChinese}
              />
            ) : (
              <>
                <h1 className="bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-center text-2xl font-bold text-transparent">
                  Practice complete!{showChinese && " | 练习完成！"}
                </h1>
                <p className="text-center text-base font-medium text-slate-600 dark:text-slate-300">
                  {title.en}
                  {showChinese && <> | {title.zh}</>}
                </p>
                <p className="text-center text-xl font-medium text-slate-900 dark:text-white">
                  Your score: {summary.correct} / {summary.total}
                  {showChinese && <> | 得分：{summary.correct} / {summary.total}</>}
                </p>
              </>
            )}

            {completionHistory && (
              <div className="rounded-xl border border-slate-200 bg-white/70 px-4 py-2 text-center text-sm font-medium text-slate-700 dark:border-slate-700 dark:bg-slate-900/40 dark:text-slate-200">
                <p>
                  Group history: {completionHistory.attempts}{" "}
                  {completionHistory.attempts === 1 ? "attempt" : "attempts"} · {completionHistory.perfect}{" "}
                  perfect {completionHistory.perfect === 1 ? "score" : "scores"} · Highest score:{" "}
                  {completionHistory.bestScore}/{completionHistory.total}
                </p>
                {showChinese && (
                  <p lang="zh-Hans">
                    本组记录：尝试 {completionHistory.attempts} 次 · 满分 {completionHistory.perfect} 次 · 最高分：
                    {completionHistory.bestScore}/{completionHistory.total}
                  </p>
                )}
              </div>
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
                      </div>
                    )
                  })}
                </CardContent>
              </Card>
            )}

            <div className="quiz-results-actions mt-2 flex flex-col gap-2 sm:flex-row">
              <Button onClick={onRestart} size="lg" className="flex-1 gap-2">
                <RotateCcw className="h-4 w-4" />
                {isPerfectScore && isRandom
                  ? `Practice new questions${showChinese ? " | 练习新题目" : ""}`
                  : `Restart${showChinese ? " | 重新开始" : ""}`}
              </Button>
              <Button onClick={onExit} size="lg" variant="ghost" className="flex-1 gap-2">
                <Home className="h-4 w-4" />
                Back to bank{showChinese && " | 返回题库"}
              </Button>
            </div>
          </div>
        </div>
      </>
    )
  }

  const total = session.questions.length
  const current = session.questions[currentIndex]
  const previousQuestion = currentIndex > 0 ? session.questions[currentIndex - 1] : null
  const nextQuestion = currentIndex < total - 1 ? session.questions[currentIndex + 1] : null
  const currentBgIndex = getBackgroundIndexForWord(currentIndex, 0)
  const currentBg = getBackgroundForWord(currentIndex, 0)
  const previousBg = previousQuestion
    ? getBackgroundForWord(currentIndex - 1, 0, currentBgIndex)
    : "#000"
  const nextBg = nextQuestion ? getBackgroundForWord(currentIndex + 1, 0, currentBgIndex) : "#000"
  const progress = (currentIndex / total) * 100

  return (
    <>
      <NailExamSessionBackButton onBack={() => leaveNailExamSession(onExit)} />
      <main className="flex h-dvh w-screen flex-col overflow-hidden bg-black">
        <header className="relative z-20 grid h-16 shrink-0 grid-cols-[3.25rem_minmax(0,1fr)_auto] grid-rows-2 items-center gap-x-2 border-b border-white/10 bg-black/70 px-3 py-2 text-center backdrop-blur-md">
          <p className="col-start-2 row-start-1 text-[11px] font-medium leading-tight text-white/70 sm:text-xs">
            {title.en}
            {showChinese && <> | {title.zh}</>}
          </p>
          <div className="col-start-2 row-start-2 flex w-full items-center gap-2">
            <span className="shrink-0 text-xs text-white/80">
              {currentIndex + 1}/{total}
            </span>
            <Progress value={progress} className="h-1.5 flex-1 bg-white/15" />
          </div>
          <div className="col-start-3 row-span-2 row-start-1 flex justify-end">{chineseToggle}</div>
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
          <NailExamQuizCard
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
          <NailExamQuizCard
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
          <NailExamQuizCard
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
