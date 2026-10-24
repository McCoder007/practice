"use client"

import { useEffect, useMemo, useRef } from "react"

import {
  PracticeSessionLog,
  createPracticeSession,
  type PracticeSession,
  type PracticeSessionKind,
} from "@/lib/nail-exam-practice-sessions"
import { createId, getOrCreateLearnerId } from "@/lib/nail-exam-usage"

const FIRST_SAVE_MS = 5_000
const SAVE_EVERY_MS = 30_000

export type PracticeTracker = {
  seeCard: (cardId: string, sectionTitle?: string) => void
  reachEnd: () => void
  tapWord: (word: string, isHardWord: boolean) => void
  playAudio: () => void
  answer: (correct: boolean, missedWord?: string) => void
}

/** A visit this short with nothing done is a bounce, not practice. */
function worthSaving(record: PracticeSession): boolean {
  return record.cardsSeen > 0 || record.answered > 0 || record.activeSeconds >= 5
}

/**
 * Records one practice session (word reel, study cards, look-alike drill) for
 * the insights page. Pass null to record nothing. Saving never blocks or
 * breaks the page: failed writes are retried on the next save.
 */
export function usePracticeSession(
  meta: { kind: PracticeSessionKind; sourceId: string; title: string } | null,
): PracticeTracker {
  const logRef = useRef<PracticeSessionLog | null>(null)
  const kind = meta?.kind
  const sourceId = meta?.sourceId
  const title = meta?.title

  useEffect(() => {
    if (!kind || !sourceId || !title) return
    let learnerId: string
    try {
      learnerId = getOrCreateLearnerId(window.localStorage)
    } catch {
      return
    }
    const now = Date.now()
    const log = new PracticeSessionLog(
      createPracticeSession({ sessionId: createId(), learnerId, kind, sourceId, title, startedAt: now }),
    )
    logRef.current = log
    let savedKey = ""

    const save = () => {
      const record = log.snapshot(Date.now())
      const key = `${log.version}:${record.activeSeconds}`
      if (key === savedKey || !worthSaving(record)) return
      void import("@/lib/nail-exam-usage-store")
        .then(({ writePracticeSession }) => writePracticeSession(record))
        .then(() => {
          savedKey = key
        })
        .catch(() => {
          // Try again on the next save.
        })
    }

    const onVisibility = () => {
      const visible = document.visibilityState === "visible"
      log.setVisible(Date.now(), visible)
      if (!visible) save()
    }
    const onTouch = () => log.touch(Date.now())

    const first = window.setTimeout(save, FIRST_SAVE_MS)
    const every = window.setInterval(save, SAVE_EVERY_MS)
    document.addEventListener("visibilitychange", onVisibility)
    window.addEventListener("pagehide", save)
    window.addEventListener("pointerdown", onTouch, { passive: true })
    window.addEventListener("keydown", onTouch)
    return () => {
      window.clearTimeout(first)
      window.clearInterval(every)
      document.removeEventListener("visibilitychange", onVisibility)
      window.removeEventListener("pagehide", save)
      window.removeEventListener("pointerdown", onTouch)
      window.removeEventListener("keydown", onTouch)
      save()
      if (logRef.current === log) logRef.current = null
    }
  }, [kind, sourceId, title])

  return useMemo(
    () => ({
      seeCard: (cardId, sectionTitle) => logRef.current?.seeCard(Date.now(), cardId, sectionTitle),
      reachEnd: () => logRef.current?.reachEnd(Date.now()),
      tapWord: (word, isHardWord) => logRef.current?.tapWord(Date.now(), word, isHardWord),
      playAudio: () => logRef.current?.playAudio(Date.now()),
      answer: (correct, missedWord) => logRef.current?.answer(Date.now(), correct, missedWord),
    }),
    [],
  )
}
