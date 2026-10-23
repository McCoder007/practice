import type { ReelSection } from "@/data/word-reel/types"
import { fisherYatesShuffle } from "./nail-technician-qa-reel.ts"

/**
 * A fresh card order for a word reel: cards are shuffled inside each section,
 * and the sections keep their order (so "Jump to" and section names still work).
 */
export function shuffleReelSections(sections: readonly ReelSection[], random: () => number = Math.random): ReelSection[] {
  return sections.map((section) => ({ ...section, cards: fisherYatesShuffle(section.cards, random) }))
}

/** Index of the first card of each section, counting across the whole reel. */
export function reelSectionStarts(sections: readonly ReelSection[]): number[] {
  const starts: number[] = []
  let offset = 0
  for (const section of sections) {
    starts.push(offset)
    offset += section.cards.length
  }
  return starts
}

/**
 * Where to start the reel. A `?section=` id wins. Otherwise go back to the saved card:
 * in a shuffled reel, to the start of that card's section (the order inside it is new,
 * so the learner sees the whole section again); in a fixed reel, to the card itself.
 */
export function reelStartIndex(
  sections: readonly ReelSection[],
  { sectionId, savedCardId, shuffled }: { sectionId?: string | null; savedCardId?: string | null; shuffled: boolean },
): number {
  const starts = reelSectionStarts(sections)
  if (sectionId) {
    const sectionIndex = sections.findIndex((section) => section.id === sectionId)
    if (sectionIndex >= 0) return starts[sectionIndex]
  }
  if (savedCardId) {
    for (let s = 0; s < sections.length; s++) {
      const cardIndex = sections[s].cards.findIndex((card) => card.id === savedCardId)
      if (cardIndex >= 0) return shuffled ? starts[s] : starts[s] + cardIndex
    }
  }
  return 0
}
