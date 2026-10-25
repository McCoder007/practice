/**
 * Learner insight writes saved on the phone while Firestore can't be reached
 * (e.g. in mainland China), then sent in order once it can.
 */

export const INSIGHTS_OUTBOX_STORAGE_KEY = "nail-exam-insights-outbox"
/** Oldest writes are dropped past this, so the outbox can't fill storage. */
export const INSIGHTS_OUTBOX_MAX_WRITES = 600

export type OutboxWrite = {
  collection: string
  id: string
  op: "set" | "update"
  data: Record<string, unknown>
  /** Written instead when an update finds no document to change. */
  fallback?: Record<string, unknown>
}

type StorageReaderWriter = Pick<Storage, "getItem" | "setItem">

/**
 * Adds a write. A repeat of the same kind of write to the same document is
 * combined with the queued one, keeping its place, so a session saved every
 * 30 seconds stays one entry. A set and a later update are kept apart, in
 * order, because the server rules only allow a score on an existing start.
 */
export function addToOutbox(writes: readonly OutboxWrite[], write: OutboxWrite): OutboxWrite[] {
  let lastIndex = -1
  for (let i = writes.length - 1; i >= 0; i -= 1) {
    if (writes[i].collection === write.collection && writes[i].id === write.id) {
      lastIndex = i
      break
    }
  }
  const last = lastIndex >= 0 ? writes[lastIndex] : null
  if (last && last.op === write.op) {
    const combined: OutboxWrite =
      write.op === "set"
        ? write
        : { ...write, data: { ...last.data, ...write.data }, fallback: write.fallback ?? last.fallback }
    return writes.map((entry, i) => (i === lastIndex ? combined : entry))
  }
  const next = [...writes, write]
  return next.length > INSIGHTS_OUTBOX_MAX_WRITES ? next.slice(next.length - INSIGHTS_OUTBOX_MAX_WRITES) : next
}

function sameWrite(a: OutboxWrite, b: OutboxWrite): boolean {
  return a.collection === b.collection && a.id === b.id && a.op === b.op && JSON.stringify(a.data) === JSON.stringify(b.data)
}

/** Removes a sent write. If it was combined with a newer one meanwhile, the newer one stays. */
export function removeFromOutbox(writes: readonly OutboxWrite[], sent: OutboxWrite): OutboxWrite[] {
  const index = writes.findIndex((entry) => sameWrite(entry, sent))
  return index < 0 ? [...writes] : [...writes.slice(0, index), ...writes.slice(index + 1)]
}

function isOutboxWrite(value: unknown): value is OutboxWrite {
  if (!value || typeof value !== "object") return false
  const entry = value as Record<string, unknown>
  return (
    typeof entry.collection === "string" &&
    typeof entry.id === "string" &&
    (entry.op === "set" || entry.op === "update") &&
    !!entry.data &&
    typeof entry.data === "object"
  )
}

export function readOutbox(storage: StorageReaderWriter): OutboxWrite[] {
  try {
    const parsed: unknown = JSON.parse(storage.getItem(INSIGHTS_OUTBOX_STORAGE_KEY) ?? "[]")
    return Array.isArray(parsed) ? parsed.filter(isOutboxWrite) : []
  } catch {
    return []
  }
}

export function saveOutbox(storage: StorageReaderWriter, writes: readonly OutboxWrite[]): void {
  try {
    storage.setItem(INSIGHTS_OUTBOX_STORAGE_KEY, JSON.stringify(writes))
  } catch {
    // Storage full or blocked: these insights are lost, the app keeps working.
  }
}

export function queueInsightsWrite(storage: StorageReaderWriter, write: OutboxWrite): void {
  saveOutbox(storage, addToOutbox(readOutbox(storage), write))
}

/** Firestore error codes worth trying again later; anything else is dropped. */
const RETRY_LATER_CODES = new Set(["unavailable", "deadline-exceeded", "resource-exhausted", "aborted", "cancelled", "internal", "unknown"])

export function shouldRetryLater(error: unknown): boolean {
  const code = error && typeof error === "object" ? (error as { code?: unknown }).code : undefined
  return typeof code !== "string" || RETRY_LATER_CODES.has(code)
}
