/**
 * Checks whether Google's servers can be reached, so Firebase is only started
 * when it can work. In mainland China they are blocked, and the Firebase SDKs
 * would otherwise keep retrying in the background.
 */

const PROBE_URL = "https://firestore.googleapis.com/"
const PROBE_TIMEOUT_MS = 3_000
/** How long a failed check is trusted before trying again (also across reloads). */
export const GOOGLE_UNREACHABLE_RETRY_MS = 10 * 60_000
export const GOOGLE_UNREACHABLE_STORAGE_KEY = "google-unreachable-at"

type StorageReaderWriter = Pick<Storage, "getItem" | "setItem" | "removeItem">

/** True when a failed check at `failedAt` is recent enough to skip a new one. */
export function isRecentFailure(failedAt: number | null, now: number): boolean {
  return failedAt !== null && now - failedAt >= 0 && now - failedAt < GOOGLE_UNREACHABLE_RETRY_MS
}

function readFailedAt(storage: StorageReaderWriter | null): number | null {
  try {
    const value = Number(storage?.getItem(GOOGLE_UNREACHABLE_STORAGE_KEY))
    return Number.isFinite(value) && value > 0 ? value : null
  } catch {
    return null
  }
}

function writeFailedAt(storage: StorageReaderWriter | null, failedAt: number | null) {
  try {
    if (failedAt === null) storage?.removeItem(GOOGLE_UNREACHABLE_STORAGE_KEY)
    else storage?.setItem(GOOGLE_UNREACHABLE_STORAGE_KEY, String(failedAt))
  } catch {
    // Storage full or blocked: the check just runs again next time.
  }
}

async function probe(): Promise<boolean> {
  const controller = new AbortController()
  const timer = window.setTimeout(() => controller.abort(), PROBE_TIMEOUT_MS)
  try {
    // An opaque no-cors response is enough: it means the server answered.
    await fetch(PROBE_URL, { mode: "no-cors", cache: "no-store", signal: controller.signal })
    return true
  } catch {
    return false
  } finally {
    window.clearTimeout(timer)
  }
}

let reachable = false
let pending: Promise<boolean> | null = null

function getStorage(): StorageReaderWriter | null {
  try {
    return window.localStorage
  } catch {
    // Private mode with storage blocked: check without remembering.
    return null
  }
}

/** Whether Google can be reached. Stays true until a send fails (see markGoogleUnreachable). */
export function isGoogleReachable(): Promise<boolean> {
  if (typeof window === "undefined") return Promise.resolve(false)
  if (reachable) return Promise.resolve(true)
  if (pending) return pending
  if (!navigator.onLine) return Promise.resolve(false)

  const storage = getStorage()
  if (isRecentFailure(readFailedAt(storage), Date.now())) return Promise.resolve(false)

  pending = probe()
    .then((ok) => {
      reachable = ok
      writeFailedAt(storage, ok ? null : Date.now())
      return ok
    })
    .finally(() => {
      pending = null
    })
  return pending
}

/** Records that Google stopped answering (e.g. a send timed out), so it is left alone for a while. */
export function markGoogleUnreachable(): void {
  if (typeof window === "undefined") return
  reachable = false
  writeFailedAt(getStorage(), Date.now())
}
