export type GestureOutcome =
  | "swipeNext"
  | "swipePrevious"
  | "tapReveal"
  | "cancel"

export type GestureInput = {
  deltaX: number
  deltaY: number
  startedInAnswerRegion: boolean
  swipeThresholdPx: number
}

export const TAP_TOLERANCE_PX = 24

export function classifyQaReelGesture({
  deltaX,
  deltaY,
  startedInAnswerRegion,
  swipeThresholdPx,
}: GestureInput): GestureOutcome {
  if (deltaY >= swipeThresholdPx) return "swipeNext"
  if (deltaY <= -swipeThresholdPx) return "swipePrevious"

  if (
    startedInAnswerRegion &&
    Math.abs(deltaX) <= TAP_TOLERANCE_PX &&
    Math.abs(deltaY) <= TAP_TOLERANCE_PX
  ) {
    return "tapReveal"
  }

  return "cancel"
}

export function fisherYatesShuffle<T>(
  source: readonly T[],
  random: () => number = Math.random,
): T[] {
  const shuffled = [...source]

  for (let index = shuffled.length - 1; index > 0; index -= 1) {
    const swapIndex = Math.floor(random() * (index + 1))
    ;[shuffled[index], shuffled[swapIndex]] = [
      shuffled[swapIndex],
      shuffled[index],
    ]
  }

  return shuffled
}
