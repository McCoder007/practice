/**
 * Page side of the offline Study copy. The service worker (public/sw.js) owns the
 * caches; this file asks it for status, sends it the file list to save, and listens
 * for progress. See docs/offline-study-china-plan.md.
 */

export const OFFLINE_BASE_PATH = process.env.NODE_ENV === "production" ? "/practice" : ""
export const SERVICE_WORKER_URL = `${OFFLINE_BASE_PATH}/sw.js`
export const SERVICE_WORKER_SCOPE = `${OFFLINE_BASE_PATH}/`

export type OfflineManifest = {
  version: string
  builtAt: string
  totalBytes: number
  appBytes: number
  audioBytes: number
  app: Array<[string, number] | [string, number, string]>
  audio: Array<[string, number]>
}

export type CacheCheck = {
  present: number
  total: number
  bytesPresent: number
  bytesTotal: number
  complete: boolean
}

export type SaveProgress = {
  done: number
  total: number
  bytesDone: number
  bytesTotal: number
}

export type OfflineStatus = {
  /** The copy used offline, checked against what is really in the caches. */
  active: (CacheCheck & { version: string; savedAt: number }) | null
  /** A save or update that stopped before it finished. */
  pending: (CacheCheck & { version: string }) | null
  /** A save running right now. */
  saving: (SaveProgress & { version: string }) | null
}

export type SaveResult =
  | { result: "ready" }
  | { result: "stopped"; quotaExceeded?: boolean }
  | { result: "changed" }

/** One word for the menu and the page. */
export type OfflineState = "unsupported" | "none" | "saving" | "partial" | "ready"

export function offlineState(status: OfflineStatus | null): OfflineState {
  if (!status) return "unsupported"
  if (status.saving) return "saving"
  if (status.active?.complete) return "ready"
  if (status.active || status.pending) return "partial"
  return "none"
}

export function savingPercent(progress: Pick<SaveProgress, "bytesDone" | "bytesTotal"> | null | undefined): number {
  if (!progress || !progress.bytesTotal) return 0
  return Math.min(100, Math.floor((progress.bytesDone / progress.bytesTotal) * 100))
}

/** "About 150 MB" style size: whole tens of MB above 100, whole MB below. */
export function roundedMegabytes(bytes: number): number {
  const mb = bytes / 1_000_000
  if (mb >= 100) return Math.round(mb / 10) * 10
  return Math.max(1, Math.round(mb))
}

export function serviceWorkerSupported(): boolean {
  return (
    typeof window !== "undefined" &&
    process.env.NODE_ENV === "production" &&
    window.isSecureContext &&
    "serviceWorker" in navigator &&
    "caches" in window
  )
}

export function registerServiceWorker(): void {
  if (!serviceWorkerSupported()) return
  navigator.serviceWorker.register(SERVICE_WORKER_URL, { scope: SERVICE_WORKER_SCOPE }).catch(() => {
    // No worker means no offline copy; the app still works online.
  })
}

async function activeWorker(timeoutMs: number): Promise<ServiceWorker | null> {
  if (!serviceWorkerSupported()) return null
  const ready = navigator.serviceWorker.ready.then((registration) => registration.active)
  const timeout = new Promise<null>((resolve) => setTimeout(() => resolve(null), timeoutMs))
  return Promise.race([ready, timeout])
}

type WorkerReply = { ok: boolean; error?: string; [key: string]: unknown }

function ask(worker: ServiceWorker, message: unknown, timeoutMs: number): Promise<WorkerReply> {
  return new Promise((resolve, reject) => {
    const channel = new MessageChannel()
    const timer = setTimeout(() => {
      channel.port1.close()
      reject(new Error("The offline helper did not answer"))
    }, timeoutMs)
    channel.port1.onmessage = (event) => {
      clearTimeout(timer)
      channel.port1.close()
      const reply = event.data as WorkerReply
      if (reply && reply.ok) resolve(reply)
      else reject(new Error(reply?.error || "Offline helper error"))
    }
    worker.postMessage(message, [channel.port2])
  })
}

/** What is saved right now, read from the caches. null when this browser cannot save. */
export async function getOfflineStatus(): Promise<OfflineStatus | null> {
  const worker = await activeWorker(8000)
  if (!worker) return null
  try {
    const reply = await ask(worker, { type: "status" }, 20000)
    return {
      active: (reply.active as OfflineStatus["active"]) ?? null,
      pending: (reply.pending as OfflineStatus["pending"]) ?? null,
      saving: (reply.saving as OfflineStatus["saving"]) ?? null,
    }
  } catch {
    return null
  }
}

/** The newest file list from the server, or null with no internet. */
export async function fetchLatestManifest(timeoutMs = 20000): Promise<OfflineManifest | null> {
  const controller = new AbortController()
  const timer = setTimeout(() => controller.abort(), timeoutMs)
  try {
    const response = await fetch(`${OFFLINE_BASE_PATH}/offline-manifest.json`, {
      cache: "no-store",
      signal: controller.signal,
    })
    if (!response.ok) return null
    const manifest = (await response.json()) as OfflineManifest
    return manifest && manifest.version && Array.isArray(manifest.app) ? manifest : null
  } catch {
    return null
  } finally {
    clearTimeout(timer)
  }
}

// If the worker says nothing for this long, the save is treated as stopped.
const SAVE_SILENCE_MS = 60000

/**
 * Saves `manifest` for offline use. The worker works in batches; this keeps asking
 * for the next batch until the copy is ready or the save stops.
 */
export async function saveOffline(
  manifest: OfflineManifest,
  onProgress: (progress: SaveProgress) => void,
): Promise<SaveResult> {
  const worker = await activeWorker(15000)
  if (!worker) throw new Error("This browser cannot save for offline")

  let lastHeard = Date.now()
  const onMessage = (event: MessageEvent) => {
    const data = event.data
    if (data?.type === "offline-progress" && data.version === manifest.version) {
      lastHeard = Date.now()
      onProgress(data as SaveProgress)
    }
  }
  navigator.serviceWorker.addEventListener("message", onMessage)

  try {
    for (;;) {
      lastHeard = Date.now()
      const reply = await new Promise<WorkerReply>((resolve, reject) => {
        const watchdog = setInterval(() => {
          if (Date.now() - lastHeard > SAVE_SILENCE_MS) {
            clearInterval(watchdog)
            reject(new Error("The save stopped"))
          }
        }, 2000)
        ask(worker, { type: "save", manifest }, 30 * 60 * 1000).then(
          (value) => {
            clearInterval(watchdog)
            resolve(value)
          },
          (error) => {
            clearInterval(watchdog)
            reject(error)
          },
        )
      })
      if (reply.result === "more") continue
      if (reply.result === "ready") return { result: "ready" }
      if (reply.result === "changed") return { result: "changed" }
      return { result: "stopped", quotaExceeded: Boolean(reply.quotaExceeded) }
    }
  } finally {
    navigator.serviceWorker.removeEventListener("message", onMessage)
  }
}

export async function removeOffline(): Promise<void> {
  const worker = await activeWorker(8000)
  if (!worker) return
  await ask(worker, { type: "remove" }, 60000)
}

/** Asks the phone to keep the saved files. Returns false when it says no or cannot say. */
export async function requestPersistentStorage(): Promise<boolean> {
  try {
    if (!navigator.storage?.persist) return false
    if (await navigator.storage.persisted()) return true
    return await navigator.storage.persist()
  } catch {
    return false
  }
}

export async function isStoragePersisted(): Promise<boolean | null> {
  try {
    if (!navigator.storage?.persisted) return null
    return await navigator.storage.persisted()
  } catch {
    return null
  }
}

/** iPhone or iPad Safari, not opened from the home-screen icon. */
export function isIosSafariTab(): boolean {
  if (typeof window === "undefined") return false
  const ua = navigator.userAgent
  const ios = /iPad|iPhone|iPod/.test(ua) || (ua.includes("Macintosh") && navigator.maxTouchPoints > 1)
  if (!ios) return false
  const standalone =
    (navigator as Navigator & { standalone?: boolean }).standalone === true ||
    window.matchMedia("(display-mode: standalone)").matches
  return !standalone
}
