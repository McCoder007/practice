export const NAIL_EXAM_GROUP_HISTORY_STORAGE_KEY = "nail-exam-practice-group-history:v1"

export type NailExamGroupHistoryEntry = {
  attempts: number
  perfect: number
  bestScore: number
  total: number
}

export type NailExamGroupHistory = Record<string, NailExamGroupHistoryEntry>

type StorageReader = Pick<Storage, "getItem">
type StorageWriter = Pick<Storage, "setItem" | "removeItem">

function isNonNegativeInteger(value: unknown): value is number {
  return Number.isInteger(value) && Number(value) >= 0
}

function isHistoryEntry(value: unknown): value is NailExamGroupHistoryEntry {
  if (!value || typeof value !== "object") return false
  const entry = value as Partial<NailExamGroupHistoryEntry>
  const total = entry.total
  return (
    isNonNegativeInteger(entry.attempts) &&
    isNonNegativeInteger(entry.perfect) &&
    isNonNegativeInteger(entry.bestScore) &&
    typeof total === "number" &&
    Number.isInteger(total) &&
    total > 0 &&
    entry.perfect <= entry.attempts &&
    entry.bestScore <= total
  )
}

export function nailExamGroupHistoryId(bankId: string, start: number, end: number): string {
  return `${bankId}:${start}-${end}`
}

export function readNailExamGroupHistory(storage: StorageReader): NailExamGroupHistory {
  try {
    const raw = storage.getItem(NAIL_EXAM_GROUP_HISTORY_STORAGE_KEY)
    if (!raw) return {}
    const parsed: unknown = JSON.parse(raw)
    if (!parsed || typeof parsed !== "object" || Array.isArray(parsed)) return {}

    return Object.fromEntries(
      Object.entries(parsed).filter((entry): entry is [string, NailExamGroupHistoryEntry] =>
        isHistoryEntry(entry[1]),
      ),
    )
  } catch {
    return {}
  }
}

export function nextNailExamGroupHistoryEntry(
  previous: NailExamGroupHistoryEntry | undefined,
  correct: number,
  total: number,
): NailExamGroupHistoryEntry {
  const safeTotal = Math.max(1, Math.floor(total))
  const safeCorrect = Math.min(safeTotal, Math.max(0, Math.floor(correct)))
  const compatiblePrevious = previous?.total === safeTotal ? previous : undefined

  return {
    attempts: (compatiblePrevious?.attempts ?? 0) + 1,
    perfect: (compatiblePrevious?.perfect ?? 0) + (safeCorrect === safeTotal ? 1 : 0),
    bestScore: Math.max(compatiblePrevious?.bestScore ?? 0, safeCorrect),
    total: safeTotal,
  }
}

export function writeNailExamGroupHistory(
  storage: StorageWriter,
  history: NailExamGroupHistory,
): boolean {
  try {
    storage.setItem(NAIL_EXAM_GROUP_HISTORY_STORAGE_KEY, JSON.stringify(history))
    return true
  } catch {
    return false
  }
}

export function clearNailExamBankHistory(
  storage: StorageWriter,
  history: NailExamGroupHistory,
  bankId: string,
): NailExamGroupHistory {
  const prefix = `${bankId}:`
  const next = Object.fromEntries(Object.entries(history).filter(([key]) => !key.startsWith(prefix)))

  try {
    if (Object.keys(next).length === 0) {
      storage.removeItem(NAIL_EXAM_GROUP_HISTORY_STORAGE_KEY)
    } else {
      storage.setItem(NAIL_EXAM_GROUP_HISTORY_STORAGE_KEY, JSON.stringify(next))
    }
  } catch {
    // The in-memory reset still applies when browser storage is unavailable.
  }

  return next
}
