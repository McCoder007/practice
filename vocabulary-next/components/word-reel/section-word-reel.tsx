"use client"

import Link from "next/link"
import { Fragment, useCallback, useEffect, useLayoutEffect, useMemo, useRef, useState } from "react"
import { ChevronDown, ChevronLeft, RotateCcw, Turtle, Volume2, VolumeX, X } from "lucide-react"

import { NavigationMenu } from "@/components/NavigationMenu"
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet"
import { useLanguage } from "@/contexts/LanguageContext"
import type { LocalizedText } from "@/data/exam-quiz/types"
import hardWordData from "@/data/word-reel/hard-words.json"
import type { ReelCard, ReelSection, ReelTitle } from "@/data/word-reel/types"
import { initializeAnalytics, logWordInteraction } from "@/lib/analytics"
import { clearAudioQueue, playText, playTextQueued, playTextSlow, preloadTexts, warmAudioSession } from "@/lib/tts"
import { buildHardWordIndex, splitSentence, type HardWord, type SentencePart } from "@/lib/sentence-words"
import { getBackgroundByIndex } from "@/lib/word-reel-backgrounds"
import { reelSectionStarts, reelStartIndex, shuffleReelSections } from "@/lib/word-reel-order"
import { cn } from "@/lib/utils"

type Item =
  | { kind: "card"; card: ReelCard; sectionIndex: number; index: number }
  | { kind: "end"; index: number }

const SWIPE_MS = 300
/** A press that moves farther than this is a swipe, not a tap. */
const TAP_SLOP_PX = 10

const HARD_WORDS = buildHardWordIndex(hardWordData.words as HardWord[])

/** All-caps exam words ("EXCEPT") are read as words; abbreviations ("EPA") stay spelled out. */
function spokenWord(part: Extract<SentencePart, { kind: "word" }>): string {
  const isAbbreviation = part.entry ? part.entry.word === part.entry.word.toUpperCase() : false
  return /^[A-Z]{2,}$/.test(part.text) && !isAbbreviation ? part.text.toLowerCase() : part.text
}

type Lookup = { cardId: string; partIndex: number; entry: HardWord }

/**
 * Full-screen swipe reel. Cards are grouped into named sections (e.g. one per
 * question set). There is no wrap-around: the last card leads to an end card.
 * The reel remembers the last card seen; `?section=<id>` in the URL starts at a section.
 * With `shuffle`, cards come in a new order inside each section on every visit
 * (and on "Start again"), and a return visit starts at the section where the learner stopped.
 * In the example sentence, a tap on a word says that word; a hard word also opens a
 * word card with its Chinese and meaning. The speaker on the divider reads the whole sentence.
 */
export function SectionWordReel({
  title,
  sections: sourceSections,
  storageKey,
  backHref,
  backTitle,
  shuffle = false,
}: {
  title: ReelTitle
  sections: ReelSection[]
  /** Prefix for saved settings (auto-speak, last card). */
  storageKey: string
  backHref: string
  backTitle: LocalizedText
  /** New card order inside each section on every visit. */
  shuffle?: boolean
}) {
  const { language } = useLanguage()
  const japanese = language === "japanese"

  // The fixed order renders first (it matches the static page); the shuffle happens on the client.
  const [sections, setSections] = useState(sourceSections)
  const items = useMemo((): Item[] => {
    const list: Item[] = []
    sections.forEach((section, sectionIndex) => {
      section.cards.forEach((card) => list.push({ kind: "card", card, sectionIndex, index: list.length }))
    })
    list.push({ kind: "end", index: list.length })
    return list
  }, [sections])
  const cardCount = items.length - 1
  const sectionStarts = useMemo(() => reelSectionStarts(sections), [sections])

  const [ready, setReady] = useState(false)
  const [index, setIndex] = useState(0)
  const [animating, setAnimating] = useState(false)
  const [autoSpeak, setAutoSpeak] = useState(false)
  const [sheetOpen, setSheetOpen] = useState(false)
  const [windowWidth, setWindowWidth] = useState(0)
  const [analyticsReady, setAnalyticsReady] = useState(false)
  const [lookup, setLookup] = useState<Lookup | null>(null)

  const indexRef = useRef(0)
  const startY = useRef(0)
  const draggingRef = useRef(false)
  /** True when the current press moved like a swipe, so it is not a tap. */
  const movedRef = useRef(false)
  const userNavigated = useRef(false)
  const containerRef = useRef<HTMLDivElement>(null)
  const currentRef = useRef<HTMLDivElement>(null)
  const nextRef = useRef<HTMLDivElement>(null)
  const prevRef = useRef<HTMLDivElement>(null)

  const autoSpeakKey = `${storageKey}-auto-speak`
  const positionKey = `${storageKey}-position`

  // Start at ?section=..., else where the learner stopped, else the first card.
  useEffect(() => {
    const ordered = shuffle ? shuffleReelSections(sourceSections) : sourceSections
    if (shuffle) setSections(ordered)
    let start = 0
    try {
      start = reelStartIndex(ordered, {
        sectionId: new URLSearchParams(window.location.search).get("section"),
        savedCardId: localStorage.getItem(positionKey),
        shuffled: shuffle,
      })
      if (localStorage.getItem(autoSpeakKey) === "true") setAutoSpeak(true)
    } catch {
      // Storage can be unavailable (private mode); start at the beginning.
    }
    indexRef.current = start
    setIndex(start)
    setReady(true)
    // Only on first load.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  // A word card belongs to one sentence; close it when the card changes.
  useEffect(() => setLookup(null), [index])

  // Remember the current card.
  useEffect(() => {
    if (!ready) return
    const item = items[index]
    if (item?.kind !== "card") return
    try {
      localStorage.setItem(positionKey, item.card.id)
    } catch {
      // ignore
    }
  }, [index, items, positionKey, ready])

  useEffect(() => {
    initializeAnalytics()
      .then(() => setAnalyticsReady(true))
      .catch(() => {})
  }, [])

  useEffect(() => {
    const update = () => setWindowWidth(window.innerWidth)
    update()
    window.addEventListener("resize", update)
    return () => window.removeEventListener("resize", update)
  }, [])

  // The page itself must not scroll while swiping.
  useEffect(() => {
    const { touchAction, overflow } = document.body.style
    document.body.style.touchAction = "none"
    document.body.style.overflow = "hidden"
    return () => {
      document.body.style.touchAction = touchAction
      document.body.style.overflow = overflow
      clearAudioQueue()
    }
  }, [])

  // Put the three cards back in place after every move.
  useLayoutEffect(() => {
    const place = (el: HTMLDivElement | null, y: string) => {
      if (!el) return
      el.style.transition = "none"
      el.style.transform = `translateY(${y})`
    }
    place(currentRef.current, "0")
    place(nextRef.current, "100%")
    place(prevRef.current, "-100%")
  }, [index, ready])

  const speechFor = (card: ReelCard) => card.tts ?? card.word

  // Load audio for this card and its neighbors.
  useEffect(() => {
    const texts: string[] = []
    for (const i of [index, index + 1, index - 1]) {
      const item = items[i]
      if (item?.kind === "card") texts.push(speechFor(item.card), item.card.example)
    }
    const current = items[index]
    if (current?.kind === "card") {
      for (const part of splitSentence(current.card.example, HARD_WORDS)) {
        if (part.kind === "word" && part.entry) texts.push(spokenWord(part))
      }
    }
    preloadTexts(texts.filter(Boolean))
  }, [index, items])

  // Auto-speak the word after the learner moves to a new card.
  useEffect(() => {
    if (!autoSpeak || !userNavigated.current || sheetOpen) return
    const item = items[index]
    if (item?.kind !== "card") return
    const timer = setTimeout(() => {
      playTextQueued(speechFor(item.card)).catch(() => {})
      if (analyticsReady) logWordInteraction(item.card.word, "word_audio_played")
    }, 50)
    return () => clearTimeout(timer)
  }, [index, autoSpeak, sheetOpen, items, analyticsReady])

  const playAudio = useCallback(
    (text: string, type: "word_audio_played" | "sentence_audio_played", lemma?: string) => {
      try {
        playText(text)
        if (analyticsReady) logWordInteraction(lemma ?? text, type)
      } catch (error) {
        console.error("Failed to play audio:", error)
      }
    },
    [analyticsReady],
  )

  /** Say the tapped word only; a hard word also opens its word card. */
  const tapWord = (card: ReelCard, part: Extract<SentencePart, { kind: "word" }>, partIndex: number) => {
    if (movedRef.current) return
    playAudio(spokenWord(part), "word_audio_played", part.key)
    setLookup(part.entry ? { cardId: card.id, partIndex, entry: part.entry } : null)
  }

  const renderSentence = (card: ReelCard, isCurrent: boolean) =>
    splitSentence(card.example, HARD_WORDS).map((part, i) => {
      if (part.kind === "text") return <Fragment key={i}>{part.text}</Fragment>
      const selected = lookup?.cardId === card.id && lookup.partIndex === i
      return (
        <button
          key={i}
          type="button"
          tabIndex={isCurrent ? 0 : -1}
          onClick={(e) => {
            e.stopPropagation()
            tapWord(card, part, i)
          }}
          className={cn(
            "inline cursor-pointer rounded-md text-left transition-colors active:bg-white/25",
            part.entry && "underline decoration-[#FFD700]/80 decoration-dotted decoration-2 underline-offset-[7px]",
            selected && "bg-white/25 decoration-solid",
          )}
          aria-label={part.entry ? `${part.text}: ${part.entry.zh}` : part.text}
        >
          {part.text}
        </button>
      )
    })

  const toggleAutoSpeak = () => {
    setAutoSpeak((on) => {
      const next = !on
      try {
        localStorage.setItem(autoSpeakKey, String(next))
      } catch {
        // ignore
      }
      if (next) userNavigated.current = true
      else clearAudioQueue()
      return next
    })
  }

  const jumpTo = (target: number) => {
    clearAudioQueue()
    userNavigated.current = true
    draggingRef.current = false
    setAnimating(false)
    indexRef.current = target
    setIndex(target)
    setSheetOpen(false)
  }

  // --- Swiping ---
  const handleStart = useCallback(
    (clientY: number) => {
      if (animating) return
      if (autoSpeak) warmAudioSession()
      startY.current = clientY
      draggingRef.current = true
      movedRef.current = false
      for (const el of [currentRef.current, nextRef.current, prevRef.current]) {
        if (el) el.style.transition = "none"
      }
    },
    [animating, autoSpeak],
  )

  const handleMove = useCallback(
    (clientY: number) => {
      if (!draggingRef.current || animating) return
      const delta = startY.current - clientY
      if (Math.abs(delta) > TAP_SLOP_PX) movedRef.current = true
      const atStart = indexRef.current === 0
      const atEnd = indexRef.current === items.length - 1
      // Resist past the first and last card instead of wrapping around.
      const blocked = (delta > 0 && atEnd) || (delta < 0 && atStart)
      const percent = Math.min((Math.abs(delta) / window.innerHeight) * 100, 100) * (blocked ? 0.15 : 1)
      const current = currentRef.current
      if (delta > 0) {
        if (current) current.style.transform = `translateY(-${percent}%)`
        if (nextRef.current) nextRef.current.style.transform = `translateY(${100 - percent}%)`
        if (prevRef.current) prevRef.current.style.transform = "translateY(-100%)"
      } else if (delta < 0) {
        if (current) current.style.transform = `translateY(${percent}%)`
        if (prevRef.current) prevRef.current.style.transform = `translateY(${-100 + percent}%)`
        if (nextRef.current) nextRef.current.style.transform = "translateY(100%)"
      }
    },
    [animating, items.length],
  )

  const handleEnd = useCallback(
    (clientY: number) => {
      if (!draggingRef.current || animating) return
      draggingRef.current = false
      const delta = startY.current - clientY
      const threshold = window.innerHeight * 0.1
      const current = currentRef.current
      const next = nextRef.current
      const prev = prevRef.current
      if (!current) return
      for (const el of [current, next, prev]) {
        if (el) el.style.transition = `transform ${SWIPE_MS}ms ease-out`
      }
      const goNext = delta > threshold && next && indexRef.current < items.length - 1
      const goPrev = delta < -threshold && prev && indexRef.current > 0
      if (!goNext && !goPrev) {
        current.style.transform = "translateY(0)"
        if (next) next.style.transform = "translateY(100%)"
        if (prev) prev.style.transform = "translateY(-100%)"
        return
      }
      current.style.transform = goNext ? "translateY(-100%)" : "translateY(100%)"
      ;(goNext ? next : prev)!.style.transform = "translateY(0)"
      setAnimating(true)
      setTimeout(() => {
        for (const el of [current, next, prev]) {
          if (el) el.style.transition = "none"
        }
        userNavigated.current = true
        const target = indexRef.current + (goNext ? 1 : -1)
        indexRef.current = target
        setIndex(target)
        setAnimating(false)
      }, SWIPE_MS)
    },
    [animating, items.length],
  )

  useEffect(() => {
    const container = containerRef.current
    if (!container) return
    const onStart = (e: TouchEvent) => e.touches.length > 0 && handleStart(e.touches[0].clientY)
    const onMove = (e: TouchEvent) => {
      if (draggingRef.current && e.touches.length > 0) {
        e.preventDefault()
        handleMove(e.touches[0].clientY)
      }
    }
    const onEnd = (e: TouchEvent) => e.changedTouches.length > 0 && handleEnd(e.changedTouches[0].clientY)
    container.addEventListener("touchstart", onStart, { passive: true })
    container.addEventListener("touchmove", onMove, { passive: false })
    container.addEventListener("touchend", onEnd, { passive: true })
    return () => {
      container.removeEventListener("touchstart", onStart)
      container.removeEventListener("touchmove", onMove)
      container.removeEventListener("touchend", onEnd)
    }
  }, [handleStart, handleMove, handleEnd, ready])

  const snapBack = () => {
    if (!draggingRef.current) return
    draggingRef.current = false
    const reset: [HTMLDivElement | null, string][] = [
      [currentRef.current, "0"],
      [nextRef.current, "100%"],
      [prevRef.current, "-100%"],
    ]
    for (const [el, y] of reset) {
      if (!el) continue
      el.style.transition = `transform ${SWIPE_MS}ms ease-out`
      el.style.transform = `translateY(${y})`
    }
  }

  // --- Sizing ---
  const wordFontSize = (word: string) => {
    const base = windowWidth >= 1024 ? 64 : windowWidth >= 640 ? 56 : 44
    if (word.length <= 10) return `${base}px`
    const scale = Math.max(0.44, 1 - (word.length - 10) * 0.06)
    return `${Math.max(22, Math.round(base * scale))}px`
  }
  const translationFontSize = (text: string) => {
    const base = windowWidth >= 1024 ? 44 : windowWidth >= 640 ? 38 : 32
    if (text.length <= 6) return `${base}px`
    return `${Math.max(18, Math.round(base * Math.max(0.5, 1 - (text.length - 6) * 0.08)))}px`
  }

  const translationOf = (card: ReelCard) => (japanese ? card.japanese || card.translation : card.translation)
  const sentenceOf = (card: ReelCard) => (japanese ? card.japaneseSentence || card.exampleTranslation : card.exampleTranslation)

  const renderWord = (card: ReelCard) =>
    card.word.split(/(\s+)/).map((token, i) =>
      /\s+/.test(token) ? (
        <Fragment key={i}>{token}</Fragment>
      ) : (
        <span
          key={i}
          className="cursor-pointer hover:underline"
          onClick={(e) => {
            e.stopPropagation()
            playAudio(speechFor(card), "word_audio_played", card.word)
          }}
        >
          {token}
        </span>
      ),
    )

  const renderFace = (item: Item, isCurrent: boolean) => {
    if (item.kind === "end") {
      return (
        <div className="relative z-10 w-full max-w-md space-y-6 px-4">
          <p className="text-4xl font-bold text-white drop-shadow-lg">Well done!</p>
          <p className="text-2xl text-white/90">
            You finished all {cardCount} words.
            <br />
            <span className="text-xl text-white/75">你学完了全部 {cardCount} 个词。</span>
          </p>
          <div className="flex flex-col gap-3 pt-4">
            <button
              type="button"
              onMouseDown={(e) => e.stopPropagation()}
              onClick={() => {
                if (shuffle) setSections(shuffleReelSections(sourceSections))
                jumpTo(0)
              }}
              className="flex items-center justify-center gap-2 rounded-full bg-white px-6 py-3 text-lg font-semibold text-slate-900 shadow-lg"
            >
              <RotateCcw className="size-5" aria-hidden />
              Start again | 重新开始
            </button>
            <Link
              href={backHref}
              onMouseDown={(e) => e.stopPropagation()}
              className="rounded-full border border-white/60 bg-white/15 px-6 py-3 text-lg font-semibold text-white backdrop-blur-sm"
            >
              {backTitle.en} | {backTitle.zh}
            </Link>
          </div>
        </div>
      )
    }
    const { card } = item
    return (
      <div className="relative z-10 w-full max-w-2xl space-y-5 overflow-hidden px-4">
        <div className="space-y-3">
          <h2
            className="font-bold text-white"
            style={{
              fontSize: wordFontSize(card.word),
              textShadow: "0 4px 12px rgba(0,0,0,0.5)",
              wordBreak: "keep-all",
              overflowWrap: "normal",
            }}
          >
            {renderWord(card)}
          </h2>
          {card.sayIt && (
            <button
              type="button"
              onMouseDown={(e) => e.stopPropagation()}
              onClick={() => {
                // Same word, spoken slowly (0.6) so each part is easy to hear.
                playTextSlow(speechFor(card))
                if (analyticsReady) logWordInteraction(card.word, "word_audio_played")
              }}
              className="inline-flex items-center gap-2 rounded-full bg-black/25 px-4 py-1.5 text-xl font-medium tracking-wide text-white active:bg-black/40"
              aria-label={`Say it slowly: ${card.sayIt}`}
              title="Play slowly | 慢速播放"
            >
              <Turtle className="size-5 shrink-0" aria-hidden />
              {card.sayIt}
            </button>
          )}
          <p
            className="font-medium text-[#FFD700]"
            style={{
              fontSize: translationFontSize(translationOf(card)),
              textShadow: "0 2px 8px rgba(0,0,0,0.5)",
            }}
          >
            {translationOf(card)}
          </p>
        </div>

        {/* The speaker sits on the divider and reads the sentence below it. */}
        <div className="mx-auto my-6 flex w-full max-w-md items-center gap-3">
          <div className="h-px flex-1 bg-white/30" />
          <button
            type="button"
            tabIndex={isCurrent ? 0 : -1}
            onClick={(e) => {
              e.stopPropagation()
              if (movedRef.current) return
              playAudio(card.example, "sentence_audio_played")
            }}
            className="flex size-12 shrink-0 items-center justify-center rounded-full border border-white/40 bg-white/20 text-white shadow-md active:bg-white/35"
            aria-label="Play the sentence"
            title="Play the sentence | 播放句子"
          >
            <Volume2 className="size-6" aria-hidden />
          </button>
          <div className="h-px flex-1 bg-white/30" />
        </div>

        <div className="space-y-3">
          <p className="text-[26px] leading-relaxed text-white" style={{ textShadow: "0 2px 8px rgba(0,0,0,0.5)" }}>
            {renderSentence(card, isCurrent)}
          </p>
          <p className="text-[22px] text-[#D0D0D0]" style={{ textShadow: "0 2px 8px rgba(0,0,0,0.5)" }}>
            {sentenceOf(card)}
          </p>
        </div>

        {card.note && (
          <div className="mx-auto max-w-md rounded-2xl bg-black/30 px-4 py-3 text-left text-lg text-white">
            <p className="font-semibold">{card.note.en}</p>
            <p className="text-white/80">{card.note.zh}</p>
          </div>
        )}

        <div className="pt-2">
          <span className="inline-block rounded-full border border-white/30 bg-white/20 px-4 py-2 text-sm font-medium text-white">
            {card.partOfSpeech}
          </span>
        </div>

        {isCurrent && item.index === 0 && (
          <div className="flex flex-col items-center gap-1 pt-4 text-sm text-white/60">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="animate-bounce" aria-hidden>
              <path d="M18 15l-6-6-6 6" />
            </svg>
            Swipe up | 向上滑
          </div>
        )}
      </div>
    )
  }

  const backgroundFor = (i: number) => getBackgroundByIndex(i * 5 + 3)

  const renderCard = (i: number, ref: React.RefObject<HTMLDivElement | null>, start: string) => {
    const item = items[i]
    if (!item) return null
    const isCurrent = start === "0"
    return (
      <div
        ref={ref}
        className="absolute inset-0 flex flex-col items-center justify-center p-6 text-center will-change-transform"
        style={{ background: item.kind === "end" ? "linear-gradient(135deg, #1e3a8a 0%, #7c3aed 100%)" : backgroundFor(i), transform: `translateY(${start})` }}
        aria-hidden={!isCurrent}
      >
        <div className="pointer-events-none absolute inset-0 bg-black/25" />
        {renderFace(item, isCurrent)}
      </div>
    )
  }

  const currentItem = items[index]
  const currentSection = currentItem?.kind === "card" ? sections[currentItem.sectionIndex] : null
  const showSections = sections.length > 1
  const position = Math.min(index + 1, cardCount)

  return (
    <>
      <NavigationMenu />
      <div className="flex h-dvh w-screen flex-col overflow-hidden bg-black">
        <header className="sticky top-0 z-20 border-b border-white/10 bg-black/70 px-2 pt-2 pb-2 backdrop-blur-md">
          <div className="relative flex min-h-10 items-center justify-center px-24">
            <Link
              href={backHref}
              className="absolute left-14 flex size-10 items-center justify-center rounded-full text-white hover:bg-white/20"
              aria-label={`Back to ${backTitle.en}`}
            >
              <ChevronLeft className="size-6" aria-hidden />
            </Link>
            <h1 className="min-w-0 text-center text-base leading-tight font-semibold text-white" title={title.en}>
              <span className="line-clamp-2">{title.en}</span>
              <span className="line-clamp-1 text-sm font-medium text-white/70">{japanese ? title.ja || title.zh : title.zh}</span>
            </h1>
            <button
              type="button"
              className={cn("absolute right-2 flex size-10 items-center justify-center rounded-full text-white hover:bg-white/20", autoSpeak && "bg-white/20")}
              onClick={toggleAutoSpeak}
              aria-pressed={autoSpeak}
              aria-label={autoSpeak ? "Turn off auto-speak" : "Turn on auto-speak"}
            >
              {autoSpeak ? <Volume2 className="size-5" aria-hidden /> : <VolumeX className="size-5" aria-hidden />}
            </button>
          </div>
          <div className="mt-1.5 flex items-center justify-center gap-2">
            {showSections ? (
              <button
                type="button"
                onClick={() => setSheetOpen(true)}
                className="flex max-w-[75vw] items-center gap-1.5 rounded-full border border-white/25 bg-white/15 px-4 py-1 text-sm font-medium text-white"
              >
                <span className="truncate">{currentSection ? currentSection.title.en : "All words"}</span>
                <ChevronDown className="size-4 shrink-0" aria-hidden />
              </button>
            ) : null}
            <span className="rounded-full bg-white/10 px-3 py-1 text-sm font-medium text-white/80 tabular-nums">
              {position} / {cardCount}
            </span>
          </div>
        </header>

        <div className="relative flex-1 overflow-hidden">
          <div
            ref={containerRef}
            className="absolute inset-0"
            onMouseDown={(e) => handleStart(e.clientY)}
            onMouseMove={(e) => draggingRef.current && handleMove(e.clientY)}
            onMouseUp={(e) => draggingRef.current && handleEnd(e.clientY)}
            onMouseLeave={snapBack}
            // A tap anywhere else on the card closes the word card.
            onClick={() => !movedRef.current && setLookup(null)}
          >
            {ready && (
              <>
                {renderCard(index, currentRef, "0")}
                {renderCard(index - 1, prevRef, "-100%")}
                {renderCard(index + 1, nextRef, "100%")}
              </>
            )}
          </div>
          {lookup && <WordCard key={lookup.entry.word} entry={lookup.entry} onSpeak={(text) => playAudio(text, "word_audio_played")} onClose={() => setLookup(null)} />}
        </div>
      </div>

      {showSections && (
        <Sheet open={sheetOpen} onOpenChange={setSheetOpen}>
          <SheetContent side="bottom" className="border-white/20 bg-black/95">
            <SheetHeader>
              <SheetTitle className="text-center text-white">Jump to | 跳到</SheetTitle>
            </SheetHeader>
            <div className="mt-4 flex max-h-[60vh] flex-col gap-2 overflow-y-auto px-4 pb-6">
              {sections.map((section, i) => {
                const here = currentSection?.id === section.id
                return (
                  <button
                    key={section.id}
                    type="button"
                    onClick={() => jumpTo(sectionStarts[i])}
                    className={cn(
                      "rounded-xl px-4 py-3 text-left transition-colors",
                      here ? "bg-white text-slate-900" : "bg-white/15 text-white hover:bg-white/25",
                    )}
                  >
                    <span className="block text-base font-semibold">{section.title.en}</span>
                    <span className={cn("block text-sm", here ? "text-slate-600" : "text-white/70")}>
                      {section.title.zh} · {section.cards.length} words | {section.cards.length} 个词
                    </span>
                  </button>
                )
              })}
            </div>
          </SheetContent>
        </Sheet>
      )}
    </>
  )
}

/** Chinese and meaning for a tapped hard word, docked at the bottom of the reel. */
function WordCard({ entry, onSpeak, onClose }: { entry: HardWord; onSpeak: (text: string) => void; onClose: () => void }) {
  return (
    <div className="pointer-events-none absolute inset-x-0 bottom-0 z-30 flex justify-center px-4 pb-[max(1rem,env(safe-area-inset-bottom))]">
      <div
        role="dialog"
        aria-label={`${entry.word}: ${entry.zh}`}
        className="pointer-events-auto w-full max-w-md animate-in rounded-3xl border border-white/20 bg-black/80 px-5 py-4 text-left text-white shadow-2xl backdrop-blur-md duration-200 fade-in slide-in-from-bottom-4"
      >
        <div className="flex items-start gap-3">
          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-2">
              <p className="min-w-0 text-2xl font-bold break-words">{entry.word}</p>
              <button
                type="button"
                onClick={() => onSpeak(entry.word)}
                className="flex size-10 shrink-0 items-center justify-center rounded-full bg-white/15 active:bg-white/30"
                aria-label={`Hear ${entry.word}`}
              >
                <Volume2 className="size-5" aria-hidden />
              </button>
            </div>
            <p className="mt-1 text-3xl font-semibold text-[#FFD700]">{entry.zh}</p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="-mt-1 -mr-2 flex size-10 shrink-0 items-center justify-center rounded-full text-white/70 hover:bg-white/15"
            aria-label="Close | 关闭"
          >
            <X className="size-5" aria-hidden />
          </button>
        </div>
        <p className="mt-3 text-lg leading-snug">{entry.en}</p>
        <p className="mt-1 text-base leading-snug text-white/75">{entry.enZh}</p>
      </div>
    </div>
  )
}
