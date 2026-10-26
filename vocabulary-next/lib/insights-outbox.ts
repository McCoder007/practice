/**
 * Learner insight writes, saved on the phone first and deleted only after
 * Firestore confirms them. While Firestore can't be reached (e.g. in mainland
 * China, or when the connection drops), they wait here and are sent in order
 * later. Kept in IndexedDB, which has far more room than localStorage.
 */

const DB_NAME = "study-zone-insights"
const STORE = "outbox"
const DOC_INDEX = "doc"
/** The localStorage outbox used before IndexedDB; moved over on first use. */
export const LEGACY_OUTBOX_STORAGE_KEY = "nail-exam-insights-outbox"
/**
 * Oldest writes are dropped past this. Two months of daily study is about
 * 720 writes (8 visits and 2 tests a day), so this leaves 4x headroom.
 */
export const INSIGHTS_OUTBOX_MAX_WRITES = 3_000

export type OutboxWrite = {
  collection: string
  id: string
  op: "set" | "update"
  data: Record<string, unknown>
  /** Written instead when an update finds no document to change. */
  fallback?: Record<string, unknown>
}

/** A write as stored: `seq` gives the send order. */
export type QueuedWrite = OutboxWrite & { seq: number; doc: string }

const docKey = (write: Pick<OutboxWrite, "collection" | "id">) => `${write.collection}/${write.id}`

/**
 * Combines a new write with the last queued write to the same document, or
 * returns null to queue it separately. A repeat of the same kind is combined
 * (so a session saved every 30 seconds stays one entry). A set and a later
 * update stay apart, in order, because the server rules only allow a score
 * on an existing start.
 */
export function combineWrites(last: OutboxWrite | null, write: OutboxWrite): OutboxWrite | null {
  if (!last || last.op !== write.op || docKey(last) !== docKey(write)) return null
  if (write.op === "set") return write
  return { ...write, data: { ...last.data, ...write.data }, fallback: write.fallback ?? last.fallback }
}

/** True when `queued` still holds exactly what was sent (not combined with a newer write since). */
export function isSameWrite(queued: OutboxWrite, sent: OutboxWrite): boolean {
  return (
    docKey(queued) === docKey(sent) &&
    queued.op === sent.op &&
    JSON.stringify(queued.data) === JSON.stringify(sent.data) &&
    JSON.stringify(queued.fallback ?? null) === JSON.stringify(sent.fallback ?? null)
  )
}

export function isOutboxWrite(value: unknown): value is OutboxWrite {
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

/** Firestore error codes worth trying again later; anything else is a refusal. */
const RETRY_LATER_CODES = new Set(["unavailable", "deadline-exceeded", "resource-exhausted", "aborted", "cancelled", "internal", "unknown"])

export function shouldRetryLater(error: unknown): boolean {
  const code = error && typeof error === "object" ? (error as { code?: unknown }).code : undefined
  return typeof code !== "string" || RETRY_LATER_CODES.has(code)
}

/**
 * Sends one write. "retry" keeps it queued (network trouble); "sent" and
 * "dropped" remove it. An update the server refuses (usually because its
 * start record is missing) writes its fallback instead. Learners can't read
 * attempts, so this never checks first.
 */
export async function deliverWrite(
  write: OutboxWrite,
  send: (op: OutboxWrite["op"], data: Record<string, unknown>) => Promise<void>,
): Promise<"sent" | "retry" | "dropped"> {
  try {
    await send(write.op, write.data)
    return "sent"
  } catch (error) {
    if (shouldRetryLater(error)) return "retry"
  }
  if (!write.fallback) return "dropped"
  try {
    await send("set", write.fallback)
    return "sent"
  } catch (error) {
    return shouldRetryLater(error) ? "retry" : "dropped"
  }
}

// --- IndexedDB -------------------------------------------------------------

let dbPromise: Promise<IDBDatabase> | null = null

function openDb(): Promise<IDBDatabase> {
  dbPromise ??= new Promise<IDBDatabase>((resolve, reject) => {
    if (typeof indexedDB === "undefined") {
      reject(new Error("IndexedDB is not available"))
      return
    }
    const request = indexedDB.open(DB_NAME, 1)
    request.onupgradeneeded = () => {
      const store = request.result.createObjectStore(STORE, { keyPath: "seq", autoIncrement: true })
      store.createIndex(DOC_INDEX, "doc")
    }
    request.onsuccess = () => resolve(request.result)
    request.onerror = () => reject(request.error)
  }).catch((error) => {
    dbPromise = null
    throw error
  })
  return dbPromise
}

function finish(tx: IDBTransaction): Promise<void> {
  return new Promise((resolve, reject) => {
    tx.oncomplete = () => resolve()
    tx.onerror = () => reject(tx.error)
    tx.onabort = () => reject(tx.error)
  })
}

/** Saves a write, combined with the last queued write to the same document when possible. */
export async function queueOutboxWrite(write: OutboxWrite): Promise<void> {
  const db = await openDb()
  const tx = db.transaction(STORE, "readwrite")
  const store = tx.objectStore(STORE)
  const doc = docKey(write)
  const lastForDoc = store.index(DOC_INDEX).openCursor(IDBKeyRange.only(doc), "prev")
  lastForDoc.onsuccess = () => {
    const cursor = lastForDoc.result
    const last = cursor ? (cursor.value as QueuedWrite) : null
    const combined = combineWrites(last, write)
    if (cursor && last && combined) cursor.update({ ...combined, seq: last.seq, doc })
    else store.add({ ...write, doc })

    const count = store.count()
    count.onsuccess = () => {
      let extra = count.result - INSIGHTS_OUTBOX_MAX_WRITES
      if (extra <= 0) return
      const oldest = store.openCursor()
      oldest.onsuccess = () => {
        const old = oldest.result
        if (!old || extra <= 0) return
        old.delete()
        extra -= 1
        old.continue()
      }
    }
  }
  await finish(tx)
}

/** Every queued write, oldest first. */
export async function listOutbox(): Promise<QueuedWrite[]> {
  const db = await openDb()
  const tx = db.transaction(STORE, "readonly")
  const all = tx.objectStore(STORE).getAll()
  await finish(tx)
  return all.result as QueuedWrite[]
}

/** Deletes a sent write, unless a newer write was combined into it meanwhile. */
export async function removeSentWrite(sent: QueuedWrite): Promise<void> {
  const db = await openDb()
  const tx = db.transaction(STORE, "readwrite")
  const store = tx.objectStore(STORE)
  const current = store.get(sent.seq)
  current.onsuccess = () => {
    if (current.result && isSameWrite(current.result as QueuedWrite, sent)) store.delete(sent.seq)
  }
  await finish(tx)
}

type StorageReaderRemover = Pick<Storage, "getItem" | "removeItem">

/** Moves writes from the old localStorage outbox into IndexedDB, once. */
export async function moveLegacyOutbox(storage: StorageReaderRemover): Promise<void> {
  let legacy: unknown
  try {
    legacy = JSON.parse(storage.getItem(LEGACY_OUTBOX_STORAGE_KEY) ?? "null")
  } catch {
    legacy = null
  }
  if (Array.isArray(legacy)) {
    for (const write of legacy.filter(isOutboxWrite)) await queueOutboxWrite(write)
  }
  storage.removeItem(LEGACY_OUTBOX_STORAGE_KEY)
}
