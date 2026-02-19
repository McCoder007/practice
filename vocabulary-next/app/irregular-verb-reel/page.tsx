"use client"

import React, { useState, useEffect, useCallback, useRef, useMemo, useLayoutEffect } from "react"
import { ChevronLeft, ChevronRight, Volume2, VolumeX } from "lucide-react"
import { Button } from "@/components/ui/button"
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet"
import { irregularVerbs } from "@/data/irregularVerbLists"
import { playText, playTextQueued, preloadTexts, clearAudioQueue, warmAudioSession } from "@/lib/tts"
import {
  getBackgroundForWord,
  getBackgroundIndexForWord,
} from "@/lib/word-reel-backgrounds"
import { NavigationMenu } from "@/components/NavigationMenu"

interface VerbCard {
  base: string
  past: string
  baseSentence: string
  pastSentence: string
  stage: number
  verbIndex: number // global index in irregularVerbs[] for gradient hash
}

const STAGES: (number | "all")[] = ["all", 1, 2, 3, 4, 5]

const STAGE_COUNTS = [1, 2, 3, 4, 5].map(
  (s) => irregularVerbs.filter((v) => v.stage === s).length
)

export default function IrregularVerbReelPage() {
  const [currentStage, setCurrentStage] = useState<number | "all">("all")
  const [sheetOpen, setSheetOpen] = useState(false)
  const [currentIndex, setCurrentIndex] = useState(0)
  const [animating, setAnimating] = useState(false)
  const [autoSpeak, setAutoSpeak] = useState(false)
  const [windowWidth, setWindowWidth] = useState(
    typeof window !== "undefined" ? window.innerWidth : 0
  )
  const [, forceUpdate] = useState(0)

  const hasUserNavigated = useRef(false)
  const audioGenerationRef = useRef(0)
  const autoSpeakRef = useRef(false)
  const speakTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const lastStageChangeTimeRef = useRef<number>(0)

  const startY = useRef(0)
  const containerRef = useRef<HTMLDivElement>(null)
  const currentCardRef = useRef<HTMLDivElement>(null)
  const nextCardRef = useRef<HTMLDivElement>(null)
  const prevCardRef = useRef<HTMLDivElement>(null)
  const isDraggingRef = useRef(false)
  const currentIndexRef = useRef(0)
  const verbsRef = useRef<VerbCard[]>([])

  // Keep refs in sync with state
  useEffect(() => {
    currentIndexRef.current = currentIndex
  }, [currentIndex])

  useEffect(() => {
    autoSpeakRef.current = autoSpeak
  }, [autoSpeak])

  const verbCards = useMemo((): VerbCard[] => {
    const source =
      currentStage === "all"
        ? irregularVerbs
        : irregularVerbs.filter((v) => v.stage === currentStage)
    return source.map((verb) => {
      const globalIdx = irregularVerbs.indexOf(verb)
      return {
        base: verb.base,
        past: verb.past,
        baseSentence: verb.examples[0] ?? "",
        pastSentence: verb.examples[1] ?? "",
        stage: verb.stage,
        verbIndex: globalIdx,
      }
    })
  }, [currentStage])

  // Keep verbsRef in sync
  useEffect(() => {
    verbsRef.current = verbCards
  }, [verbCards])

  // Initialize card positions after index changes
  useLayoutEffect(() => {
    const currentCard = currentCardRef.current
    const nextCard = nextCardRef.current
    const prevCard = prevCardRef.current

    if (currentCard) {
      currentCard.style.transition = "none"
      currentCard.style.transform = "translateY(0)"
    }
    if (nextCard) {
      nextCard.style.transition = "none"
      nextCard.style.transform = "translateY(100%)"
    }
    if (prevCard) {
      prevCard.style.transition = "none"
      prevCard.style.transform = "translateY(-100%)"
    }
  }, [currentIndex])

  // Load auto-speak preference from localStorage
  useEffect(() => {
    try {
      const stored = localStorage.getItem("verb-reel-auto-speak")
      if (stored === "true") {
        setAutoSpeak(true)
      }
    } catch {
      // localStorage might not be available
    }
  }, [])

  // Prevent body scroll
  useEffect(() => {
    const originalTouchAction = document.body.style.touchAction
    const originalOverflow = document.body.style.overflow

    document.body.style.touchAction = "none"
    document.body.style.overflow = "hidden"

    return () => {
      document.body.style.touchAction = originalTouchAction
      document.body.style.overflow = originalOverflow
    }
  }, [])

  // Track window width for responsive font sizing
  useEffect(() => {
    const updateWindowWidth = () => {
      setWindowWidth(window.innerWidth)
    }
    updateWindowWidth()
    window.addEventListener("resize", updateWindowWidth)
    return () => window.removeEventListener("resize", updateWindowWidth)
  }, [])

  // Clear audio queue when stage changes
  useEffect(() => {
    clearAudioQueue()
    audioGenerationRef.current += 1
  }, [currentStage])

  // Preload audio for current, next, and previous verbs
  useEffect(() => {
    if (verbCards.length === 0) return
    if (currentIndex < 0 || currentIndex >= verbCards.length) return

    const prevIdx = (currentIndex - 1 + verbCards.length) % verbCards.length
    const nextIdx = (currentIndex + 1) % verbCards.length

    const textsToPreload: string[] = []

    for (const idx of [currentIndex, prevIdx, nextIdx]) {
      const verb = verbCards[idx]
      if (!verb) continue
      if (verb.base) textsToPreload.push(verb.base)
      if (verb.baseSentence) textsToPreload.push(verb.baseSentence)
      if (verb.past) textsToPreload.push(verb.past)
      if (verb.pastSentence) textsToPreload.push(verb.pastSentence)
    }

    preloadTexts(textsToPreload.filter(Boolean))
  }, [currentIndex, verbCards])

  // Auto-speak the current verb (base word, base sentence, past word, past sentence)
  const speakCurrentVerb = useCallback((generation: number) => {
    if (!autoSpeakRef.current) return
    if (audioGenerationRef.current !== generation) return

    const idx = currentIndexRef.current
    const verbs = verbsRef.current

    if (idx < 0 || idx >= verbs.length) return

    const verb = verbs[idx]
    if (!verb?.base) return

    if (audioGenerationRef.current !== generation) return

    playTextQueued(verb.base).catch(console.error)
    playTextQueued(verb.past).catch(console.error)
  }, [])

  // Auto-speak effect — fires when current index changes
  useEffect(() => {
    if (!autoSpeak) return
    if (!hasUserNavigated.current) return
    if (sheetOpen) return
    if (verbCards.length === 0) return
    if (currentIndex < 0 || currentIndex >= verbCards.length) return

    const timeSinceStageChange = Date.now() - lastStageChangeTimeRef.current
    const delay = timeSinceStageChange < 200 ? 250 : 50

    const generation = audioGenerationRef.current

    const timeoutId = setTimeout(() => {
      speakCurrentVerb(generation)
    }, delay)

    return () => {
      clearTimeout(timeoutId)
    }
  }, [currentIndex, autoSpeak, verbCards, sheetOpen, speakCurrentVerb, currentStage])

  // Clear audio queue when auto-speak is disabled
  useEffect(() => {
    if (!autoSpeak) {
      clearAudioQueue()
      if (speakTimeoutRef.current) {
        clearTimeout(speakTimeoutRef.current)
        speakTimeoutRef.current = null
      }
    }
  }, [autoSpeak])

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      clearAudioQueue()
      if (speakTimeoutRef.current) {
        clearTimeout(speakTimeoutRef.current)
        speakTimeoutRef.current = null
      }
    }
  }, [])

  // Toggle auto-speak and persist to localStorage
  const handleAutoSpeakToggle = useCallback(() => {
    if (speakTimeoutRef.current) {
      clearTimeout(speakTimeoutRef.current)
      speakTimeoutRef.current = null
    }

    setAutoSpeak((prev) => {
      const newValue = !prev
      try {
        localStorage.setItem("verb-reel-auto-speak", String(newValue))
      } catch {
        // localStorage might not be available
      }
      if (!newValue) {
        clearAudioQueue()
        autoSpeakRef.current = false
      } else {
        hasUserNavigated.current = true
        autoSpeakRef.current = true
      }
      return newValue
    })
  }, [])

  // Stage navigation
  const handleStageSelect = useCallback((stage: number | "all") => {
    audioGenerationRef.current += 1
    clearAudioQueue()
    isDraggingRef.current = false
    setAnimating(false)
    lastStageChangeTimeRef.current = Date.now()
    setCurrentStage(stage)
    setCurrentIndex(0)
    currentIndexRef.current = 0
    setSheetOpen(false)
    hasUserNavigated.current = true
  }, [])

  const handlePreviousStage = useCallback(() => {
    if (animating) return
    setCurrentStage((prev) => {
      const idx = STAGES.indexOf(prev)
      const newStage = STAGES[(idx - 1 + STAGES.length) % STAGES.length]
      audioGenerationRef.current += 1
      clearAudioQueue()
      isDraggingRef.current = false
      lastStageChangeTimeRef.current = Date.now()
      setCurrentIndex(0)
      currentIndexRef.current = 0
      hasUserNavigated.current = true
      return newStage
    })
    setAnimating(false)
  }, [animating])

  const handleNextStage = useCallback(() => {
    if (animating) return
    setCurrentStage((prev) => {
      const idx = STAGES.indexOf(prev)
      const newStage = STAGES[(idx + 1) % STAGES.length]
      audioGenerationRef.current += 1
      clearAudioQueue()
      isDraggingRef.current = false
      lastStageChangeTimeRef.current = Date.now()
      setCurrentIndex(0)
      currentIndexRef.current = 0
      hasUserNavigated.current = true
      return newStage
    })
    setAnimating(false)
  }, [animating])

  // Touch/mouse handlers (adapted from word-reel)
  const handleStart = useCallback(
    (clientY: number) => {
      if (animating) return

      if (autoSpeakRef.current) {
        warmAudioSession()
      }

      startY.current = clientY
      isDraggingRef.current = true

      const currentCard = currentCardRef.current
      const nextCard = nextCardRef.current
      const prevCard = prevCardRef.current

      if (currentCard) currentCard.style.transition = "none"
      if (nextCard) nextCard.style.transition = "none"
      if (prevCard) prevCard.style.transition = "none"
    },
    [animating]
  )

  const handleMove = useCallback(
    (clientY: number) => {
      if (!isDraggingRef.current || animating) return

      const deltaY = startY.current - clientY
      const movePercent = Math.min(
        (Math.abs(deltaY) / window.innerHeight) * 100,
        100
      )

      const currentCard = currentCardRef.current
      const nextCard = nextCardRef.current
      const prevCard = prevCardRef.current

      if (deltaY > 0) {
        if (currentCard)
          currentCard.style.transform = `translateY(-${movePercent}%)`
        if (nextCard)
          nextCard.style.transform = `translateY(${100 - movePercent}%)`
        if (prevCard) prevCard.style.transform = "translateY(-100%)"
      } else if (deltaY < 0) {
        if (currentCard)
          currentCard.style.transform = `translateY(${movePercent}%)`
        if (prevCard)
          prevCard.style.transform = `translateY(${-100 + movePercent}%)`
        if (nextCard) nextCard.style.transform = "translateY(100%)"
      } else {
        if (currentCard) currentCard.style.transform = "translateY(0)"
        if (nextCard) nextCard.style.transform = "translateY(100%)"
        if (prevCard) prevCard.style.transform = "translateY(-100%)"
      }
    },
    [animating]
  )

  const handleEnd = useCallback(
    (clientY: number) => {
      if (!isDraggingRef.current || animating) return

      isDraggingRef.current = false

      const deltaY = startY.current - clientY
      const threshold = window.innerHeight * 0.15

      const currentCard = currentCardRef.current
      const nextCard = nextCardRef.current
      const prevCard = prevCardRef.current

      if (!currentCard) return

      currentCard.style.transition = "transform 0.3s ease-out"
      if (nextCard) nextCard.style.transition = "transform 0.3s ease-out"
      if (prevCard) prevCard.style.transition = "transform 0.3s ease-out"

      if (deltaY > threshold && verbCards.length > 0) {
        if (nextCard) {
          currentCard.style.transform = "translateY(-100%)"
          nextCard.style.transform = "translateY(0)"
        }

        setAnimating(true)

        setTimeout(() => {
          const verbsLength = verbCards.length
          if (verbsLength === 0) {
            setAnimating(false)
            return
          }

          const nextIdx = (currentIndexRef.current + 1) % verbsLength

          if (nextIdx < 0 || nextIdx >= verbsLength) {
            setAnimating(false)
            return
          }

          if (currentCard) currentCard.style.transition = "none"
          if (nextCard) nextCard.style.transition = "none"
          if (prevCard) prevCard.style.transition = "none"

          hasUserNavigated.current = true
          setCurrentIndex(nextIdx)
          currentIndexRef.current = nextIdx
          forceUpdate((n) => n + 1)
          setAnimating(false)
        }, 300)
      } else if (deltaY < -threshold && verbCards.length > 0) {
        if (prevCard) {
          currentCard.style.transform = "translateY(100%)"
          prevCard.style.transform = "translateY(0)"
        }

        setAnimating(true)

        setTimeout(() => {
          const verbsLength = verbCards.length
          if (verbsLength === 0) {
            setAnimating(false)
            return
          }

          const prevIdx =
            (currentIndexRef.current - 1 + verbsLength) % verbsLength

          if (prevIdx < 0 || prevIdx >= verbsLength) {
            setAnimating(false)
            return
          }

          if (currentCard) currentCard.style.transition = "none"
          if (nextCard) nextCard.style.transition = "none"
          if (prevCard) prevCard.style.transition = "none"

          hasUserNavigated.current = true
          setCurrentIndex(prevIdx)
          currentIndexRef.current = prevIdx
          forceUpdate((n) => n + 1)
          setAnimating(false)
        }, 300)
      } else {
        // Snap back
        currentCard.style.transform = "translateY(0)"
        if (nextCard) nextCard.style.transform = "translateY(100%)"
        if (prevCard) prevCard.style.transform = "translateY(-100%)"
      }
    },
    [animating, verbCards.length]
  )

  // Touch event handlers
  const handleTouchStart = useCallback(
    (e: TouchEvent) => {
      if (e.touches.length > 0) handleStart(e.touches[0].clientY)
    },
    [handleStart]
  )

  const handleTouchMove = useCallback(
    (e: TouchEvent) => {
      if (isDraggingRef.current && e.touches.length > 0) {
        e.preventDefault()
        handleMove(e.touches[0].clientY)
      }
    },
    [handleMove]
  )

  const handleTouchEnd = useCallback(
    (e: TouchEvent) => {
      if (e.changedTouches.length > 0) handleEnd(e.changedTouches[0].clientY)
    },
    [handleEnd]
  )

  // Set up touch event listeners
  useEffect(() => {
    const container = containerRef.current
    if (!container) return

    container.addEventListener("touchstart", handleTouchStart, {
      passive: true,
    })
    container.addEventListener("touchmove", handleTouchMove, { passive: false })
    container.addEventListener("touchend", handleTouchEnd, { passive: true })

    return () => {
      container.removeEventListener("touchstart", handleTouchStart)
      container.removeEventListener("touchmove", handleTouchMove)
      container.removeEventListener("touchend", handleTouchEnd)
    }
  }, [handleTouchStart, handleTouchMove, handleTouchEnd])

  // Mouse event handlers (for desktop testing)
  const handleMouseDown = useCallback(
    (e: React.MouseEvent) => handleStart(e.clientY),
    [handleStart]
  )
  const handleMouseMove = useCallback(
    (e: React.MouseEvent) => {
      if (isDraggingRef.current) handleMove(e.clientY)
    },
    [handleMove]
  )
  const handleMouseUp = useCallback(
    (e: React.MouseEvent) => {
      if (isDraggingRef.current) handleEnd(e.clientY)
    },
    [handleEnd]
  )
  const handleMouseLeave = useCallback(() => {
    if (isDraggingRef.current) {
      isDraggingRef.current = false
      const currentCard = currentCardRef.current
      const nextCard = nextCardRef.current
      const prevCard = prevCardRef.current
      if (currentCard) {
        currentCard.style.transition = "transform 0.3s ease-out"
        currentCard.style.transform = "translateY(0)"
      }
      if (nextCard) {
        nextCard.style.transition = "transform 0.3s ease-out"
        nextCard.style.transform = "translateY(100%)"
      }
      if (prevCard) {
        prevCard.style.transition = "transform 0.3s ease-out"
        prevCard.style.transform = "translateY(-100%)"
      }
    }
  }, [])

  // Font size for verb pair (slightly smaller than Word Reel to fit two words)
  const getVerbFontSize = useCallback(
    (base: string, past: string): string => {
      const longerWord = base.length > past.length ? base : past
      let baseSize = 52
      if (windowWidth > 0) {
        if (windowWidth < 640) baseSize = 38
        else if (windowWidth < 1024) baseSize = 44
      } else {
        baseSize = 38
      }

      if (longerWord.length > 8) {
        const charsOver = longerWord.length - 8
        const scale = Math.max(0.5, 1 - charsOver * 0.07)
        return `${Math.round(baseSize * scale)}px`
      }
      return `${baseSize}px`
    },
    [windowWidth]
  )

  // Highlight the verb word inside a sentence with a given color
  const highlightVerb = (sentence: string, verbForms: string[], color: string) => {
    const escaped = verbForms.map((w) => w.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"))
    const regex = new RegExp(`\\b(${escaped.join("|")})\\b`, "i")
    const match = sentence.match(regex)
    if (!match || match.index === undefined) return <>{sentence}</>
    const before = sentence.slice(0, match.index)
    const found = sentence.slice(match.index, match.index + match[0].length)
    const after = sentence.slice(match.index + match[0].length)
    return (
      <>
        {before}
        <span style={{ color, fontWeight: "bold" }}>
          {found}
        </span>
        {after}
      </>
    )
  }

  // Render a single verb card's content
  const renderCardContent = (verb: VerbCard) => {
    const fontSize = getVerbFontSize(verb.base, verb.past)
    // Past may be "was/were" — split so we can match either form in the sentence
    const pastForms = verb.past.split("/").map((s) => s.trim())
    return (
      <div className="relative z-10 w-full max-w-2xl flex flex-col items-center px-4">
        {/* Verb forms row */}
        <div className="flex items-center justify-center gap-4 md:gap-8 flex-wrap mb-2">
          <button
            onClick={(e) => {
              e.stopPropagation()
              playText(verb.base)
            }}
            className="cursor-pointer hover:scale-105 transition-transform"
          >
            <span
              className="font-bold text-white drop-shadow-2xl"
              style={{
                fontSize,
                textShadow: "0 4px 12px rgba(0,0,0,0.5)",
                wordBreak: "keep-all",
              }}
            >
              {verb.base}
            </span>
          </button>

          <span className="text-white/40 font-light" style={{ fontSize: "1.5rem" }}>
            →
          </span>

          <button
            onClick={(e) => {
              e.stopPropagation()
              playText(verb.past)
            }}
            className="cursor-pointer hover:scale-105 transition-transform"
          >
            <span
              className="font-bold drop-shadow-2xl"
              style={{
                fontSize,
                color: "#FFD700",
                textShadow: "0 4px 12px rgba(0,0,0,0.5)",
                wordBreak: "keep-all",
              }}
            >
              {verb.past}
            </span>
          </button>
        </div>

        {/* Divider */}
        <div className="h-px bg-white/30 w-full max-w-md mx-auto my-8" />

        {/* Example sentences */}
        <div className="space-y-5 text-center">
          <p
            onClick={() => playText(verb.baseSentence)}
            className="text-[22px] text-white cursor-pointer hover:scale-105 transition-transform drop-shadow-lg leading-relaxed"
            style={{ textShadow: "0 2px 8px rgba(0,0,0,0.5)" }}
          >
            {highlightVerb(verb.baseSentence, [verb.base], "white")}
          </p>
          <p
            onClick={() => playText(verb.pastSentence)}
            className="text-[22px] text-[#B0B0B0] cursor-pointer hover:scale-105 transition-transform drop-shadow-lg leading-relaxed"
            style={{ textShadow: "0 2px 8px rgba(0,0,0,0.5)" }}
          >
            {highlightVerb(verb.pastSentence, pastForms, "#FFD700")}
          </p>
        </div>
      </div>
    )
  }

  // Early return if no verbs
  if (verbCards.length === 0) {
    return (
      <div className="flex items-center justify-center h-screen bg-black">
        <p className="text-gray-500">No verbs available</p>
      </div>
    )
  }

  // Calculate visible indices
  const prevIdx = (currentIndex - 1 + verbCards.length) % verbCards.length
  const nextIdx = (currentIndex + 1) % verbCards.length
  const currentVerb = verbCards[currentIndex]
  const prevVerb = verbCards[prevIdx]
  const nextVerb = verbCards[nextIdx]

  if (!currentVerb) {
    return (
      <div className="flex items-center justify-center h-screen bg-black">
        <p className="text-gray-500">Loading...</p>
      </div>
    )
  }

  // Get backgrounds
  const currentBgIndex = getBackgroundIndexForWord(
    currentVerb.verbIndex,
    currentVerb.stage - 1,
    -1
  )
  const currentBackground = getBackgroundForWord(
    currentVerb.verbIndex,
    currentVerb.stage - 1,
    -1
  )
  const prevBackground = prevVerb
    ? getBackgroundForWord(prevVerb.verbIndex, prevVerb.stage - 1, currentBgIndex)
    : currentBackground
  const nextBackground = nextVerb
    ? getBackgroundForWord(nextVerb.verbIndex, nextVerb.stage - 1, currentBgIndex)
    : currentBackground

  const stageLabel =
    currentStage === "all" ? `All (${verbCards.length})` : `Stage ${currentStage}`

  return (
    <>
      <NavigationMenu />
      <div className="flex flex-col h-screen w-screen overflow-hidden bg-black">
        {/* Header */}
        <header className="bg-black/60 backdrop-blur-md p-2 border-b border-white/10 sticky top-0 z-20">
          <div className="flex items-center justify-center relative mb-1">
            <div className="flex flex-col items-center flex-grow">
              <h1 className="text-lg font-semibold text-white">
                Verb Reel | 动词卷轴
              </h1>
            </div>
            <div className="absolute right-2 flex items-center gap-1">
              <Button
                variant="ghost"
                size="icon"
                className={`text-white hover:bg-white/20 rounded-full ${autoSpeak ? "bg-white/20" : ""}`}
                onClick={handleAutoSpeakToggle}
                title={autoSpeak ? "Disable Auto-Speak" : "Enable Auto-Speak"}
              >
                {autoSpeak ? (
                  <Volume2 className="h-5 w-5" />
                ) : (
                  <VolumeX className="h-5 w-5" />
                )}
              </Button>
            </div>
          </div>

          {/* Stage navigation row */}
          <div className="flex items-center justify-center">
            <Button
              variant="ghost"
              size="icon"
              className="text-white hover:bg-white/20 rounded-full p-3 h-12 w-16"
              onClick={handlePreviousStage}
              disabled={animating}
            >
              <ChevronLeft className="h-10 w-10" />
              <span className="sr-only">Previous Stage</span>
            </Button>

            <Sheet open={sheetOpen} onOpenChange={setSheetOpen}>
              <SheetTrigger asChild>
                <button
                  className="bg-white/20 backdrop-blur-sm text-white px-6 py-0.5 rounded-full text-sm font-medium shadow-sm mx-4 border border-white/20 min-w-[140px] text-center hover:bg-white/30 transition-colors cursor-pointer"
                  disabled={animating}
                >
                  {stageLabel}
                </button>
              </SheetTrigger>
              <SheetContent side="bottom" className="bg-black/95 border-white/20">
                <SheetHeader>
                  <SheetTitle className="text-white text-center">
                    Select Stage
                  </SheetTitle>
                </SheetHeader>
                <div className="grid grid-cols-3 gap-3 mt-6">
                  <button
                    onClick={() => handleStageSelect("all")}
                    className={`px-4 py-3 rounded-lg text-sm font-medium transition-colors ${
                      currentStage === "all"
                        ? "bg-white text-black"
                        : "bg-white/20 text-white hover:bg-white/30"
                    }`}
                  >
                    All ({irregularVerbs.length})
                  </button>
                  {[1, 2, 3, 4, 5].map((s) => (
                    <button
                      key={s}
                      onClick={() => handleStageSelect(s)}
                      className={`px-4 py-3 rounded-lg text-sm font-medium transition-colors ${
                        currentStage === s
                          ? "bg-white text-black"
                          : "bg-white/20 text-white hover:bg-white/30"
                      }`}
                    >
                      Stage {s} ({STAGE_COUNTS[s - 1]})
                    </button>
                  ))}
                </div>
              </SheetContent>
            </Sheet>

            <Button
              variant="ghost"
              size="icon"
              className="text-white hover:bg-white/20 rounded-full p-3 h-12 w-16"
              onClick={handleNextStage}
              disabled={animating}
            >
              <ChevronRight className="h-10 w-10" />
              <span className="sr-only">Next Stage</span>
            </Button>
          </div>
        </header>

        {/* Verb Card Container */}
        <div
          ref={containerRef}
          className="flex-1 relative overflow-hidden"
          onMouseDown={handleMouseDown}
          onMouseMove={handleMouseMove}
          onMouseUp={handleMouseUp}
          onMouseLeave={handleMouseLeave}
        >
          {/* Current Card */}
          <div
            ref={currentCardRef}
            className="absolute inset-0 flex flex-col justify-start items-center pt-16 pb-8 px-8 text-center will-change-transform"
            style={{
              background: currentBackground,
              transform: "translateY(0)",
            }}
          >
            <div className="absolute inset-0 bg-black/25 pointer-events-none" />
            {renderCardContent(currentVerb)}

            {/* Swipe indicator on first card */}
            {currentIndex === 0 && (
              <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2 text-white/50 text-sm flex flex-col items-center gap-1">
                <svg
                  width="24"
                  height="24"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  className="animate-bounce"
                >
                  <path d="M18 15l-6-6-6 6" />
                </svg>
                <span>Swipe to continue</span>
              </div>
            )}
          </div>

          {/* Previous Card */}
          {prevVerb && (
            <div
              ref={prevCardRef}
              className="absolute inset-0 flex flex-col justify-start items-center pt-16 pb-8 px-8 text-center will-change-transform"
              style={{
                background: prevBackground,
                transform: "translateY(-100%)",
              }}
            >
              <div className="absolute inset-0 bg-black/25 pointer-events-none" />
              {renderCardContent(prevVerb)}
            </div>
          )}

          {/* Next Card */}
          {nextVerb && (
            <div
              ref={nextCardRef}
              className="absolute inset-0 flex flex-col justify-start items-center pt-16 pb-8 px-8 text-center will-change-transform"
              style={{
                background: nextBackground,
                transform: "translateY(100%)",
              }}
            >
              <div className="absolute inset-0 bg-black/25 pointer-events-none" />
              {renderCardContent(nextVerb)}
            </div>
          )}
        </div>
      </div>
    </>
  )
}
