"use client"

import { useCallback, useEffect, useRef, useState } from "react"
import { Volume2 } from "lucide-react"
import { AnimatePresence, motion } from "framer-motion"
import { Button } from "@/components/ui/button"
import { Progress } from "@/components/ui/progress"
import { playText } from "@/lib/tts"
import type { PictureVocabularyWord, WordStatus } from "@/data/picture-vocabulary"

const REVEAL_DELAY_MS = 3600
const PROMPT_AUDIO_COUNT = 9
// Matches the image's fade transition duration below. AnimatePresence mode="wait"
// runs the exit then the enter, so the new image isn't visible until 2x this.
const IMAGE_TRANSITION_MS = 200

// Statically resolved at build time (matches app/layout.tsx), so server-rendered
// HTML and the client's first render agree — a window.location check would not.
function publicAssetUrl(path: string) {
  const prefix = process.env.NODE_ENV === "production" ? "/practice" : ""
  return `${prefix}${path}`
}

// Picks a random "what's this?" prompt clip, never repeating the previous one back-to-back.
function pickPromptIndex(avoidIndex: number | null): number {
  if (PROMPT_AUDIO_COUNT <= 1) return 0
  let index = Math.floor(Math.random() * PROMPT_AUDIO_COUNT)
  if (index === avoidIndex) {
    index = (index + 1) % PROMPT_AUDIO_COUNT
  }
  return index
}

interface FlashcardViewProps {
  words: PictureVocabularyWord[]
  statuses: Record<string, WordStatus>
  onStatusChange: (english: string, status: WordStatus) => void
}

function pickNextIndex(
  words: PictureVocabularyWord[],
  statuses: Record<string, WordStatus>,
  avoidIndex: number | null
): number | null {
  const eligible: number[] = []
  words.forEach((word, index) => {
    if ((statuses[word.english] ?? "new") !== "known") eligible.push(index)
  })
  if (eligible.length === 0) return null
  let pick = eligible[Math.floor(Math.random() * eligible.length)]
  if (eligible.length > 1 && pick === avoidIndex) {
    pick = eligible[(eligible.indexOf(pick) + 1) % eligible.length]
  }
  return pick
}

export function FlashcardView({ words, statuses, onStatusChange }: FlashcardViewProps) {
  const [currentIndex, setCurrentIndex] = useState<number | null>(() =>
    pickNextIndex(words, statuses, null)
  )
  const [revealed, setRevealed] = useState(false)
  const [barActive, setBarActive] = useState(false)
  const revealTimeout = useRef<ReturnType<typeof setTimeout> | null>(null)
  const audioTimeout = useRef<ReturnType<typeof setTimeout> | null>(null)
  const transitioning = useRef(false)
  const lastPromptIndex = useRef<number | null>(null)

  const currentWord = currentIndex !== null ? words[currentIndex] : null
  const knownCount = words.filter((word) => statuses[word.english] === "known").length
  const progressPercent = words.length > 0 ? Math.round((knownCount / words.length) * 100) : 0

  const reveal = useCallback(() => {
    if (revealTimeout.current) {
      clearTimeout(revealTimeout.current)
      revealTimeout.current = null
    }
    setRevealed(true)
    setBarActive(false)
  }, [])

  // Reveal after the countdown, and play pronunciation once revealed.
  useEffect(() => {
    if (!currentWord) return
    setRevealed(false)
    setBarActive(false)
    transitioning.current = false

    const promptIndex = pickPromptIndex(lastPromptIndex.current)
    lastPromptIndex.current = promptIndex
    audioTimeout.current = setTimeout(() => {
      new Audio(publicAssetUrl(`/picture-vocabulary/audio/w${promptIndex + 1}.mp3`))
        .play()
        .catch(() => {
          // Autoplay can be blocked before the user has interacted with the page; ignore.
        })
    }, IMAGE_TRANSITION_MS * 2)

    const startRaf = requestAnimationFrame(() => {
      requestAnimationFrame(() => setBarActive(true))
    })
    revealTimeout.current = setTimeout(reveal, REVEAL_DELAY_MS)

    return () => {
      cancelAnimationFrame(startRaf)
      if (revealTimeout.current) clearTimeout(revealTimeout.current)
      if (audioTimeout.current) clearTimeout(audioTimeout.current)
    }
    // Only re-run when the card itself changes, not on every statuses update.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentIndex])

  // Speak the word once its translation is revealed.
  useEffect(() => {
    if (revealed && currentWord) {
      playText(currentWord.english)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [revealed])

  const advance = useCallback(
    (status: WordStatus) => {
      if (!currentWord || transitioning.current) return
      transitioning.current = true
      onStatusChange(currentWord.english, status)
      const nextStatuses = { ...statuses, [currentWord.english]: status }
      // Hide before the next word paints. Leaving `revealed` true for one frame
      // (or fading it out with CSS) would flash the new answer, then hide it.
      setRevealed(false)
      setBarActive(false)
      setCurrentIndex(pickNextIndex(words, nextStatuses, currentIndex))
    },
    [currentIndex, currentWord, onStatusChange, statuses, words]
  )

  if (!currentWord) {
    return (
      <div className="flex flex-col items-center justify-center flex-1 text-center gap-2 py-16 px-4">
        <p className="text-2xl font-semibold">🎉 All words learned!</p>
        <p className="text-muted-foreground">Every word in this set is marked as known.</p>
      </div>
    )
  }

  return (
    <div className="flex flex-col flex-1 p-4 gap-3">
      <div>
        <p className="text-sm text-muted-foreground text-center mb-1">
          Words known: {knownCount}/{words.length}
        </p>
        <Progress value={progressPercent} />
      </div>

      <div
        className="relative flex-1 min-h-[220px] rounded-xl overflow-hidden bg-muted flex items-center justify-center cursor-pointer"
        onClick={() => !revealed && reveal()}
      >
        <AnimatePresence mode="wait">
          <motion.img
            key={currentWord.image}
            src={publicAssetUrl(currentWord.image)}
            alt=""
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: IMAGE_TRANSITION_MS / 1000 }}
            className="w-full h-full object-contain"
          />
        </AnimatePresence>
      </div>

      <div className="relative min-h-[130px]">
        <div className="h-1 rounded-full bg-muted overflow-hidden">
          <div
            className="h-full bg-blue-500 origin-left"
            style={{
              transform: barActive ? "scaleX(0)" : "scaleX(1)",
              transition: barActive ? `transform ${REVEAL_DELAY_MS}ms linear` : "none",
            }}
          />
        </div>

        <div className="flex flex-col items-center text-center mt-4 min-h-[72px]">
          {revealed && (
            <motion.div
              className="flex flex-col items-center"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.3 }}
            >
              <button
                className="flex items-center gap-2 text-2xl font-bold"
                onClick={() => playText(currentWord.english)}
              >
                {currentWord.english}
                <Volume2 className="h-5 w-5 text-blue-500 shrink-0" />
              </button>
              <p className="text-lg text-muted-foreground mt-1">{currentWord.chinese}</p>
            </motion.div>
          )}
        </div>
      </div>

      <div className="flex gap-3 min-h-12 -mt-1">
        {revealed && (
          <>
            <Button
              variant="outline"
              className="flex-1 h-12 text-base font-semibold border-amber-400 text-amber-600 hover:bg-amber-50"
              onClick={() => advance("learning")}
            >
              🤔 Still learning
            </Button>
            <Button
              className="flex-1 h-12 text-base font-semibold bg-green-600 hover:bg-green-700 text-white"
              onClick={() => advance("known")}
            >
              🎉 Got it
            </Button>
          </>
        )}
      </div>
    </div>
  )
}
