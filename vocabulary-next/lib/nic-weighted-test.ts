import { fisherYatesShuffle } from "./nail-technician-qa-reel.ts"

export type WeightedTopic = { id: string; examWeightPercent: number }

/**
 * How many questions each topic gets in a test of `total` questions, in
 * proportion to the NIC exam weights (largest-remainder rounding). Topics with
 * fewer questions than their share give the rest to the other topics.
 */
export function weightedQuotas(
  topics: readonly WeightedTopic[],
  available: Readonly<Record<string, number>>,
  total: number,
): Record<string, number> {
  const quotas: Record<string, number> = {}
  for (const topic of topics) quotas[topic.id] = 0
  let remaining = Math.min(
    total,
    topics.reduce((sum, topic) => sum + (available[topic.id] ?? 0), 0),
  )

  while (remaining > 0) {
    const open = topics.filter((topic) => quotas[topic.id] < (available[topic.id] ?? 0))
    const weightSum = open.reduce((sum, topic) => sum + topic.examWeightPercent, 0)
    if (open.length === 0 || weightSum <= 0) break

    const shares = open.map((topic) => {
      const exact = (remaining * topic.examWeightPercent) / weightSum
      const room = (available[topic.id] ?? 0) - quotas[topic.id]
      return { topic, whole: Math.min(Math.floor(exact), room), fraction: exact - Math.floor(exact), room }
    })
    let given = 0
    for (const share of shares) {
      quotas[share.topic.id] += share.whole
      given += share.whole
    }
    // Hand out what's left one at a time, biggest fraction (then biggest weight) first.
    const leftovers = shares
      .filter((share) => share.room > share.whole)
      .sort((a, b) => b.fraction - a.fraction || b.topic.examWeightPercent - a.topic.examWeightPercent)
    for (const share of leftovers) {
      if (given >= remaining) break
      quotas[share.topic.id] += 1
      given += 1
    }
    if (given === 0) break
    remaining -= given
  }
  return quotas
}

/** A fresh random test: each topic's share drawn at random, then the whole test shuffled. */
export function drawWeightedTest<T extends { id: string; domainId: string }>(
  pool: readonly T[],
  topics: readonly WeightedTopic[],
  total: number,
  random: () => number = Math.random,
): T[] {
  const byTopic = new Map<string, T[]>()
  const seen = new Set<string>()
  for (const question of pool) {
    if (seen.has(question.id)) continue
    seen.add(question.id)
    const list = byTopic.get(question.domainId) ?? []
    list.push(question)
    byTopic.set(question.domainId, list)
  }
  const available: Record<string, number> = {}
  for (const topic of topics) available[topic.id] = byTopic.get(topic.id)?.length ?? 0

  const quotas = weightedQuotas(topics, available, total)
  const picked: T[] = []
  for (const topic of topics) {
    picked.push(...fisherYatesShuffle(byTopic.get(topic.id) ?? [], random).slice(0, quotas[topic.id]))
  }
  return fisherYatesShuffle(picked, random)
}
