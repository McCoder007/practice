import { fisherYatesShuffle } from "./nail-technician-qa-reel.ts"

export type LookAlikeGroupLike = { id: string; items: readonly unknown[] }

export type LookAlikePrompt<G extends LookAlikeGroupLike> = {
  group: G
  /** Index of the item whose meaning is asked. */
  answer: number
  /** Item indices in the order the choices are shown. */
  order: number[]
}

/**
 * Builds one drill round. Each group gives one prompt before any group gives a
 * second, so a 10-question round covers 10 different groups when it can. The
 * same group never appears twice in a row unless only one group is left.
 */
export function buildLookAlikeRound<G extends LookAlikeGroupLike>(
  groups: readonly G[],
  size: number,
  random: () => number,
): LookAlikePrompt<G>[] {
  const unused = new Map(groups.map((group) => [group, fisherYatesShuffle(group.items.map((_, i) => i), random)]))
  const round: LookAlikePrompt<G>[] = []
  while (round.length < size) {
    const pass = fisherYatesShuffle(
      groups.filter((group) => (unused.get(group)?.length ?? 0) > 0),
      random,
    )
    if (pass.length === 0) break
    // Don't start a pass with the group that ended the last one.
    const last = round[round.length - 1]?.group
    if (pass.length > 1 && pass[0] === last) pass.push(pass.shift()!)
    for (const group of pass) {
      if (round.length >= size) break
      const answer = unused.get(group)!.shift()!
      round.push({ group, answer, order: fisherYatesShuffle(group.items.map((_, i) => i), random) })
    }
  }
  return round
}
