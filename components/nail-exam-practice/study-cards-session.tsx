"use client"

import {
  useCallback,
  useEffect,
  useLayoutEffect,
  useRef,
  useState,
  type CSSProperties,
  type PointerEvent as ReactPointerEvent,
  type ReactNode,
  type RefObject,
} from "react"

import {
  leaveNailExamSession,
  NailExamSessionBackButton,
} from "@/components/nail-exam-practice/session-back-button"
import { NavigationMenu } from "@/components/NavigationMenu"
import { Button } from "@/components/ui/button"
import { Progress } from "@/components/ui/progress"
import type { LocalizedText } from "@/data/exam-quiz/types"
import { initializeAnalytics, logEvent } from "@/lib/analytics"
import {
  canQaAdvanceNext,
  classifyQaReelGesture,
  type QaCard,
} from "@/lib/nail-technician-qa-reel"
import {
  getBackgroundForWord,
  getBackgroundIndexForWord,
} from "@/lib/word-reel-backgrounds"
import { clearAudioQueue, playText, preloadTexts, stopTTS } from "@/lib/tts"
import { Home, RotateCcw } from "lucide-react"

const ANIMATION_MS = 300

type Screen = { step: "quiz" } | { step: "finished" }

type ActiveGesture = {
  pointerId: number
  startX: number
  startY: number
  startedInAnswerRegion: boolean
}

function responsiveTextStyle(length: number, kind: "question" | "answer"): CSSProperties {
  const longTextScale = length > 140 ? 1.05 : length > 90 ? 1.2 : length > 55 ? 1.4 : 1.65
  const maximum = kind === "question" ? 2.75 : 2.5

  return {
    fontSize: `clamp(${longTextScale}rem, ${kind === "question" ? 4.5 : 4}vw, ${maximum}rem)`,
    overflowWrap: "anywhere",
  }
}

function stopPointerGesture(event: ReactPointerEvent<HTMLElement>) {
  event.stopPropagation()
}

function QuestionCard({
  card,
  isCurrent,
  isRevealed,
  showChinese,
  background,
  cardRef,
  position,
  onReveal,
  onSpeakQuestion,
  onSpeakAnswer,
}: {
  card: QaCard
  isCurrent: boolean
  isRevealed: boolean
  showChinese: boolean
  background: string
  cardRef?: RefObject<HTMLDivElement | null>
  position: "-100%" | "0" | "100%"
  onReveal: () => void
  onSpeakQuestion: () => void
  onSpeakAnswer: () => void
}) {
  return (
    <div
      ref={cardRef}
      aria-hidden={!isCurrent}
      className="absolute inset-0 grid grid-rows-2 text-center text-white will-change-transform"
      style={{ background, transform: `translateY(${position})` }}
    >
      <div className="pointer-events-none absolute inset-0 bg-black/30" />

      <section className="relative z-10 flex min-h-0 flex-col items-center justify-center gap-3 px-5 py-4 sm:gap-5 sm:px-10">
        {isCurrent ? (
          <button
            type="button"
            onPointerDown={stopPointerGesture}
            onClick={(event) => {
              event.stopPropagation()
              onSpeakQuestion()
            }}
            className="max-w-5xl cursor-pointer rounded-2xl px-2 py-1 font-bold leading-tight drop-shadow-2xl outline-none focus-visible:ring-4 focus-visible:ring-white/80"
            style={responsiveTextStyle(card.question.en.length, "question")}
            aria-label="Speak English question"
          >
            {card.question.en}
          </button>
        ) : (
          <h2
            className="max-w-5xl font-bold leading-tight drop-shadow-2xl"
            style={responsiveTextStyle(card.question.en.length, "question")}
          >
            {card.question.en}
          </h2>
        )}
        {showChinese && (
          <p
            className="max-w-5xl font-medium leading-snug text-[#FFD700] drop-shadow-lg"
            style={responsiveTextStyle(card.question.zh.length, "answer")}
            lang="zh-Hans"
          >
            {card.question.zh}
          </p>
        )}
      </section>

      <section className="relative z-10 min-h-0 border-t border-white/25">
        {!isRevealed ? (
          <button
            type="button"
            data-qa-answer-region="true"
            aria-expanded="false"
            onClick={(event) => {
              event.stopPropagation()
              if (isCurrent) onReveal()
            }}
            className="flex h-full w-full flex-col items-center justify-center gap-2 px-5 py-6 text-white/80"
          >
            <span className="text-sm font-semibold tracking-wide uppercase">
              Tap to reveal{showChinese && " | 点按揭晓"}
            </span>
          </button>
        ) : (
          <div className="flex h-full flex-col items-center justify-center gap-3 px-5 py-4 sm:px-10">
            {isCurrent ? (
              <button
                type="button"
                onPointerDown={stopPointerGesture}
                onClick={(event) => {
                  event.stopPropagation()
                  onSpeakAnswer()
                }}
                className="max-w-5xl cursor-pointer rounded-2xl px-2 py-1 font-bold leading-tight drop-shadow-2xl outline-none focus-visible:ring-4 focus-visible:ring-white/80"
                style={responsiveTextStyle(card.answer.en.length, "answer")}
                aria-label="Speak English answer"
              >
                {card.answer.en}
              </button>
            ) : (
              <p
                className="max-w-5xl font-bold leading-tight drop-shadow-2xl"
                style={responsiveTextStyle(card.answer.en.length, "answer")}
              >
                {card.answer.en}
              </p>
            )}
            {showChinese && (
              <p
                className="max-w-5xl font-medium leading-snug text-[#FFD700] drop-shadow-lg"
                style={responsiveTextStyle(card.answer.zh.length, "answer")}
                lang="zh-Hans"
              >
                {card.answer.zh}
              </p>
            )}
          </div>
        )}
      </section>
    </div>
  )
}

export function NailExamStudyCardsSession({
  title,
  cards,
  showChinese,
  chineseToggle,
  chineseToggleFixed,
  onRestart,
  onExit,
}: {
  title: LocalizedText
  cards: QaCard[]
  showChinese: boolean
  chineseToggle: ReactNode
  chineseToggleFixed?: ReactNode
  onRestart: () => void
  onExit: () => void
}) {
  const [screen, setScreen] = useState<Screen>({ step: "quiz" })
  const [currentIndex, setCurrentIndex] = useState(0)
  const [revealedCardId, setRevealedCardId] = useState<string | null>(null)
  const [animating, setAnimating] = useState(false)

  const containerRef = useRef<HTMLDivElement>(null)
  const currentCardRef = useRef<HTMLDivElement>(null)
  const previousCardRef = useRef<HTMLDivElement>(null)
  const nextCardRef = useRef<HTMLDivElement>(null)
  const currentIndexRef = useRef(0)
  const activeGestureRef = useRef<ActiveGesture | null>(null)
  const gestureInvalidatedRef = useRef(false)
  const animationTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const isNavigatingHistoryRef = useRef(false)
  const hasMountedHistoryRef = useRef(false)

  useEffect(() => {
    currentIndexRef.current = 0
    setCurrentIndex(0)
    setRevealedCardId(null)
    setScreen({ step: "quiz" })
  }, [cards])

  useEffect(() => {
    initializeAnalytics().catch((error) => {
      console.error("Failed to initialize analytics:", error)
    })
  }, [])

  useEffect(() => {
    const handlePopState = (event: PopStateEvent) => {
      isNavigatingHistoryRef.current = true
      const nextScreen = event.state?.nailExamScreen as Screen["step"] | undefined
      if (nextScreen === "finished") {
        setScreen({ step: "finished" })
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

  const resetCardPositions = useCallback((withAnimation: boolean) => {
    const transition = withAnimation ? `transform ${ANIMATION_MS}ms ease-out` : "none"
    const currentCard = currentCardRef.current
    const previousCard = previousCardRef.current
    const nextCard = nextCardRef.current

    if (currentCard) {
      currentCard.style.transition = transition
      currentCard.style.transform = "translateY(0)"
    }
    if (previousCard) {
      previousCard.style.transition = transition
      previousCard.style.transform = "translateY(-100%)"
    }
    if (nextCard) {
      nextCard.style.transition = transition
      nextCard.style.transform = "translateY(100%)"
    }
  }, [])

  const cancelGesture = useCallback(() => {
    activeGestureRef.current = null
    gestureInvalidatedRef.current = true
    resetCardPositions(true)
  }, [resetCardPositions])

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
      if (animationTimeoutRef.current) clearTimeout(animationTimeoutRef.current)
      clearAudioQueue()
      stopTTS()
    }
  }, [screen.step])

  useLayoutEffect(() => {
    if (screen.step !== "quiz") return
    resetCardPositions(false)
  }, [currentIndex, resetCardPositions, screen.step])

  useEffect(() => {
    if (screen.step !== "quiz" || !cards.length) return
    const previous = currentIndex > 0 ? cards[currentIndex - 1] : null
    const current = cards[currentIndex]
    const next = currentIndex < cards.length - 1 ? cards[currentIndex + 1] : null
    const texts = [current.question.en, current.answer.en]
    if (previous) texts.push(previous.question.en)
    if (next) texts.push(next.question.en)
    preloadTexts(texts)
  }, [cards, currentIndex, screen.step])

  const revealCurrentAnswer = useCallback(() => {
    if (animating) return
    const currentCard = cards[currentIndexRef.current]
    if (!currentCard || revealedCardId === currentCard.id) return
    setRevealedCardId(currentCard.id)
    logEvent("qa_answer_revealed", { card_id: currentCard.id })
  }, [animating, cards, revealedCardId])

  const speak = useCallback((text: string, cardId: string, kind: "question" | "answer") => {
    playText(text)
    logEvent(kind === "question" ? "qa_question_audio_played" : "qa_answer_audio_played", {
      card_id: cardId,
    })
  }, [])

  const finishBank = useCallback(() => {
    setAnimating(false)
    setScreen({ step: "finished" })
  }, [])

  const advance = useCallback(
    (direction: "next" | "previous") => {
      if (!cards.length || animating) return

      const idx = currentIndexRef.current
      const currentCard = cards[idx]
      const isRevealed = revealedCardId === currentCard.id

      if (direction === "previous" && idx === 0) {
        resetCardPositions(true)
        return
      }

      if (direction === "next" && !canQaAdvanceNext(isRevealed)) {
        resetCardPositions(true)
        return
      }

      activeGestureRef.current = null
      gestureInvalidatedRef.current = false
      setRevealedCardId(null)
      clearAudioQueue()
      stopTTS()

      const isFinishing = direction === "next" && idx === cards.length - 1
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
          finishBank()
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
    [animating, cards, finishBank, resetCardPositions, revealedCardId],
  )

  const handlePointerDown = useCallback(
    (event: ReactPointerEvent<HTMLDivElement>) => {
      if (animating) return
      if (activeGestureRef.current) {
        cancelGesture()
        return
      }
      const target = event.target as HTMLElement
      const startedInAnswerRegion = Boolean(
        target.closest('[data-qa-answer-region="true"][aria-expanded="false"]'),
      )
      gestureInvalidatedRef.current = false
      activeGestureRef.current = {
        pointerId: event.pointerId,
        startX: event.clientX,
        startY: event.clientY,
        startedInAnswerRegion,
      }
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

      const outcome = classifyQaReelGesture({
        deltaX: event.clientX - gesture.startX,
        deltaY: gesture.startY - event.clientY,
        startedInAnswerRegion: gesture.startedInAnswerRegion,
        swipeThresholdPx: window.innerHeight * 0.1,
      })

      activeGestureRef.current = null
      if (event.currentTarget.hasPointerCapture(event.pointerId)) {
        event.currentTarget.releasePointerCapture(event.pointerId)
      }

      if (outcome === "swipeNext" || outcome === "swipePrevious") {
        advance(outcome === "swipeNext" ? "next" : "previous")
      } else {
        resetCardPositions(true)
        if (outcome === "tapReveal") revealCurrentAnswer()
      }
    },
    [animating, advance, cancelGesture, resetCardPositions, revealCurrentAnswer],
  )

  const handleLostPointerCapture = useCallback(() => {
    if (activeGestureRef.current) cancelGesture()
  }, [cancelGesture])

  useEffect(() => {
    if (screen.step !== "quiz") return
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.defaultPrevented || animating) return
      const target = event.target as HTMLElement | null
      if (target?.closest("button, a, input, textarea, select")) return
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
  }, [advance, animating, screen.step])

  const restart = useCallback(() => {
    currentIndexRef.current = 0
    setCurrentIndex(0)
    setRevealedCardId(null)
    setAnimating(false)
    setScreen({ step: "quiz" })
    onRestart()
  }, [onRestart])

  if (screen.step === "finished") {
    return (
      <>
        <NavigationMenu />
        {chineseToggleFixed ?? chineseToggle}
        <div className="min-h-screen bg-gradient-to-b from-slate-50 to-slate-100 dark:from-slate-900 dark:to-slate-800">
          <div className="mx-auto flex w-full max-w-xl flex-col gap-4 px-4 pt-20">
            <h1 className="bg-gradient-to-r from-cyan-600 to-blue-600 bg-clip-text text-center text-2xl font-bold text-transparent">
              Set complete!{showChinese && " | 本组完成！"}
            </h1>
            <p className="text-center text-base font-medium text-slate-600 dark:text-slate-300">
              {title.en}
              {showChinese && <> | {title.zh}</>}
            </p>
            <p className="text-center text-lg text-slate-700 dark:text-slate-200">
              You reviewed {cards.length} questions
              {showChinese && <> | 你已复习 {cards.length} 道题目</>}
            </p>
            <div className="mt-2 flex flex-col gap-2 sm:flex-row">
              <Button onClick={restart} size="lg" className="flex-1 gap-2">
                <RotateCcw className="h-4 w-4" />
                Restart{showChinese && " | 重新开始"}
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

  const total = cards.length
  const currentCard = cards[currentIndex]
  const previousCard = currentIndex > 0 ? cards[currentIndex - 1] : null
  const nextCard = currentIndex < total - 1 ? cards[currentIndex + 1] : null
  const currentBgIndex = getBackgroundIndexForWord(currentIndex, 0)
  const currentBg = getBackgroundForWord(currentIndex, 0)
  const previousBg = previousCard
    ? getBackgroundForWord(currentIndex - 1, 0, currentBgIndex)
    : "#000"
  const nextBg = nextCard ? getBackgroundForWord(currentIndex + 1, 0, currentBgIndex) : "#000"
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
          <QuestionCard
            card={currentCard}
            isCurrent
            isRevealed={revealedCardId === currentCard.id}
            showChinese={showChinese}
            background={currentBg}
            cardRef={currentCardRef}
            position="0"
            onReveal={revealCurrentAnswer}
            onSpeakQuestion={() => speak(currentCard.question.en, currentCard.id, "question")}
            onSpeakAnswer={() => speak(currentCard.answer.en, currentCard.id, "answer")}
          />
          {previousCard ? (
            <QuestionCard
              card={previousCard}
              isCurrent={false}
              isRevealed={false}
              showChinese={showChinese}
              background={previousBg}
              cardRef={previousCardRef}
              position="-100%"
              onReveal={() => {}}
              onSpeakQuestion={() => {}}
              onSpeakAnswer={() => {}}
            />
          ) : (
            <div ref={previousCardRef} className="absolute inset-0 -translate-y-full" aria-hidden />
          )}
          {nextCard ? (
            <QuestionCard
              card={nextCard}
              isCurrent={false}
              isRevealed={false}
              showChinese={showChinese}
              background={nextBg}
              cardRef={nextCardRef}
              position="100%"
              onReveal={() => {}}
              onSpeakQuestion={() => {}}
              onSpeakAnswer={() => {}}
            />
          ) : (
            <div ref={nextCardRef} className="absolute inset-0 translate-y-full" aria-hidden />
          )}
        </div>
      </main>
    </>
  )
}
