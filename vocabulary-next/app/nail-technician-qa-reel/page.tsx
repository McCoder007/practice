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

import { NavigationMenu } from "@/components/NavigationMenu"
import {
  nailTechnicianQuestions,
  type NailTechnicianQuestion,
} from "@/data/nail-technician-qa"
import { initializeAnalytics, logEvent } from "@/lib/analytics"
import {
  classifyQaReelGesture,
  fisherYatesShuffle,
  type GestureOutcome,
} from "@/lib/nail-technician-qa-reel"
import {
  getBackgroundForWord,
  getBackgroundIndexForWord,
} from "@/lib/word-reel-backgrounds"
import {
  clearAudioQueue,
  playText,
  preloadTexts,
  stopTTS,
} from "@/lib/tts"

type QuestionCardData = NailTechnicianQuestion & {
  id: number
}

type ActiveGesture = {
  pointerId: number
  startX: number
  startY: number
  startedInAnswerRegion: boolean
}

type QuestionCardProps = {
  card: QuestionCardData
  isCurrent: boolean
  isRevealed: boolean
  background: string
  cardRef?: React.RefObject<HTMLDivElement | null>
  position: "-100%" | "0" | "100%"
  onReveal: () => void
  onSpeakQuestion: () => void
  onSpeakAnswer: () => void
}

const ANIMATION_MS = 300

function responsiveTextStyle(length: number, kind: "question" | "answer"): CSSProperties {
  const longTextScale = length > 140 ? 1.05 : length > 90 ? 1.2 : length > 55 ? 1.4 : 1.65
  const maximum = kind === "question" ? 2.75 : 2.5

  return {
    fontSize: `clamp(${longTextScale}rem, ${kind === "question" ? 4.5 : 4}vw, ${maximum}rem)`,
    overflowWrap: "anywhere",
  }
}

function QuestionCard({
  card,
  isCurrent,
  isRevealed,
  background,
  cardRef,
  position,
  onReveal,
  onSpeakQuestion,
  onSpeakAnswer,
}: QuestionCardProps) {
  const stopPointerGesture = (event: ReactPointerEvent<HTMLElement>) => {
    event.stopPropagation()
  }

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
        <p
          className="max-w-5xl font-medium leading-snug text-[#FFD700] drop-shadow-lg"
          style={responsiveTextStyle(card.question.zh.length, "answer")}
        >
          {card.question.zh}
        </p>
      </section>

      <section className="relative z-10 min-h-0 border-t border-white/30 p-3 sm:p-5">
        {!isRevealed ? (
          isCurrent ? (
            <button
              type="button"
              data-qa-answer-region="true"
              aria-expanded="false"
              aria-label="Reveal answer"
              onKeyDown={(event) => {
                if (event.key === "Enter" || event.key === " ") {
                  event.preventDefault()
                  event.stopPropagation()
                  onReveal()
                }
              }}
              className="flex h-full w-full touch-none items-center justify-center rounded-3xl border border-white/35 bg-black/20 text-lg font-semibold text-white/90 shadow-inner backdrop-blur-sm outline-none transition-colors hover:bg-black/25 focus-visible:ring-4 focus-visible:ring-white/80"
            >
              Tap to reveal answer
            </button>
          ) : (
            <div className="flex h-full w-full items-center justify-center rounded-3xl border border-white/25 bg-black/20 text-lg font-semibold text-white/70">
              Tap to reveal answer
            </div>
          )
        ) : (
          <div
            data-qa-answer-region="true"
            className="qa-answer-reveal flex h-full flex-col items-center justify-center gap-3 rounded-3xl bg-black/15 px-3 py-2 sm:gap-5 sm:px-6"
          >
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
            <p
              className="max-w-5xl font-medium leading-snug text-[#FFD700] drop-shadow-lg"
              style={responsiveTextStyle(card.answer.zh.length, "answer")}
            >
              {card.answer.zh}
            </p>
          </div>
        )}
      </section>
    </div>
  )
}

export default function NailTechnicianQaReelPage() {
  const [deck, setDeck] = useState<QuestionCardData[] | null>(null)
  const [currentIndex, setCurrentIndex] = useState(0)
  const [revealedCardId, setRevealedCardId] = useState<number | null>(null)
  const [animating, setAnimating] = useState(false)

  const containerRef = useRef<HTMLDivElement>(null)
  const currentCardRef = useRef<HTMLDivElement>(null)
  const previousCardRef = useRef<HTMLDivElement>(null)
  const nextCardRef = useRef<HTMLDivElement>(null)
  const currentIndexRef = useRef(0)
  const activeGestureRef = useRef<ActiveGesture | null>(null)
  const gestureInvalidatedRef = useRef(false)
  const animationTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null)

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
    const cards = nailTechnicianQuestions.map((question, id) => ({
      ...question,
      id,
    }))
    setDeck(fisherYatesShuffle(cards))
  }, [])

  useEffect(() => {
    initializeAnalytics().catch((error) => {
      console.error("Failed to initialize analytics:", error)
    })
  }, [])

  useEffect(() => {
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
  }, [])

  useLayoutEffect(() => {
    resetCardPositions(false)
  }, [currentIndex, resetCardPositions])

  useEffect(() => {
    if (!deck?.length) return
    const previousIndex = (currentIndex - 1 + deck.length) % deck.length
    const nextIndex = (currentIndex + 1) % deck.length

    preloadTexts([
      deck[currentIndex].question.en,
      deck[currentIndex].answer.en,
      deck[previousIndex].question.en,
      deck[nextIndex].question.en,
    ])
  }, [currentIndex, deck])

  const revealCurrentAnswer = useCallback(() => {
    if (!deck || animating) return
    const currentCard = deck[currentIndexRef.current]
    if (!currentCard || revealedCardId === currentCard.id) return

    setRevealedCardId(currentCard.id)
    logEvent("qa_answer_revealed", { card_id: currentCard.id })
  }, [animating, deck, revealedCardId])

  const speak = useCallback((text: string, cardId: number, kind: "question" | "answer") => {
    playText(text)
    logEvent(kind === "question" ? "qa_question_audio_played" : "qa_answer_audio_played", {
      card_id: cardId,
    })
  }, [])

  const commitNavigation = useCallback((outcome: Extract<GestureOutcome, "swipeNext" | "swipePrevious">) => {
    if (!deck?.length || animating) return

    activeGestureRef.current = null
    gestureInvalidatedRef.current = false
    setRevealedCardId(null)
    clearAudioQueue()
    stopTTS()
    setAnimating(true)

    const currentCard = currentCardRef.current
    const targetCard = outcome === "swipeNext" ? nextCardRef.current : previousCardRef.current
    if (currentCard) {
      currentCard.style.transition = `transform ${ANIMATION_MS}ms ease-out`
      currentCard.style.transform = outcome === "swipeNext"
        ? "translateY(-100%)"
        : "translateY(100%)"
    }
    if (targetCard) {
      targetCard.style.transition = `transform ${ANIMATION_MS}ms ease-out`
      targetCard.style.transform = "translateY(0)"
    }

    animationTimeoutRef.current = setTimeout(() => {
      const offset = outcome === "swipeNext" ? 1 : -1
      const nextIndex = (currentIndexRef.current + offset + deck.length) % deck.length
      currentIndexRef.current = nextIndex
      setCurrentIndex(nextIndex)
      setAnimating(false)
      animationTimeoutRef.current = null
    }, ANIMATION_MS)
  }, [animating, deck])

  const handlePointerDown = useCallback((event: ReactPointerEvent<HTMLDivElement>) => {
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
  }, [animating, cancelGesture])

  const handlePointerMove = useCallback((event: ReactPointerEvent<HTMLDivElement>) => {
    const gesture = activeGestureRef.current
    if (!gesture || gesture.pointerId !== event.pointerId || gestureInvalidatedRef.current || animating) {
      return
    }

    const deltaY = gesture.startY - event.clientY
    const movePercent = Math.min(100, Math.abs(deltaY) / window.innerHeight * 100)
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
  }, [animating])

  const handlePointerUp = useCallback((event: ReactPointerEvent<HTMLDivElement>) => {
    const gesture = activeGestureRef.current
    if (
      !gesture ||
      gesture.pointerId !== event.pointerId ||
      gestureInvalidatedRef.current ||
      animating
    ) {
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
      commitNavigation(outcome)
    } else {
      resetCardPositions(true)
      if (outcome === "tapReveal") revealCurrentAnswer()
    }
  }, [animating, cancelGesture, commitNavigation, resetCardPositions, revealCurrentAnswer])

  const handleLostPointerCapture = useCallback(() => {
    if (activeGestureRef.current) cancelGesture()
  }, [cancelGesture])

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.defaultPrevented || animating) return
      const target = event.target as HTMLElement | null
      if (target?.closest("button, a, input, textarea, select")) return

      if (event.key === "ArrowDown") {
        event.preventDefault()
        commitNavigation("swipeNext")
      } else if (event.key === "ArrowUp") {
        event.preventDefault()
        commitNavigation("swipePrevious")
      }
    }

    window.addEventListener("keydown", handleKeyDown)
    return () => window.removeEventListener("keydown", handleKeyDown)
  }, [animating, commitNavigation])

  if (!deck) {
    return (
      <>
        <NavigationMenu />
        <main className="flex h-dvh items-center justify-center bg-black text-white/70">
          Loading questions…
        </main>
      </>
    )
  }

  if (deck.length === 0) {
    return (
      <>
        <NavigationMenu />
        <main className="flex h-dvh items-center justify-center bg-black text-white/70">
          No questions available.
        </main>
      </>
    )
  }

  const previousIndex = (currentIndex - 1 + deck.length) % deck.length
  const nextIndex = (currentIndex + 1) % deck.length
  const currentCard = deck[currentIndex]
  const previousCard = deck[previousIndex]
  const nextCard = deck[nextIndex]
  const currentBackgroundIndex = getBackgroundIndexForWord(currentCard.id, 0)
  const currentBackground = getBackgroundForWord(currentCard.id, 0)
  const previousBackground = getBackgroundForWord(previousCard.id, 0, currentBackgroundIndex)
  const nextBackground = getBackgroundForWord(nextCard.id, 0, currentBackgroundIndex)

  return (
    <>
      <NavigationMenu />
      <main className="flex h-dvh w-screen flex-col overflow-hidden bg-black">
        <header className="relative z-20 flex h-14 shrink-0 items-center justify-center border-b border-white/10 bg-black/65 px-16 text-center backdrop-blur-md">
          <h1 className="text-base font-semibold text-white sm:text-lg">
            Nail Technician Q&amp;A | 美甲问答
          </h1>
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
            background={currentBackground}
            cardRef={currentCardRef}
            position="0"
            onReveal={revealCurrentAnswer}
            onSpeakQuestion={() => speak(currentCard.question.en, currentCard.id, "question")}
            onSpeakAnswer={() => speak(currentCard.answer.en, currentCard.id, "answer")}
          />
          <QuestionCard
            card={previousCard}
            isCurrent={false}
            isRevealed={false}
            background={previousBackground}
            cardRef={previousCardRef}
            position="-100%"
            onReveal={() => {}}
            onSpeakQuestion={() => {}}
            onSpeakAnswer={() => {}}
          />
          <QuestionCard
            card={nextCard}
            isCurrent={false}
            isRevealed={false}
            background={nextBackground}
            cardRef={nextCardRef}
            position="100%"
            onReveal={() => {}}
            onSpeakQuestion={() => {}}
            onSpeakAnswer={() => {}}
          />
        </div>
      </main>
    </>
  )
}
