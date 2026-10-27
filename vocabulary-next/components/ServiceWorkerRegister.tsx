"use client"

import { useEffect } from "react"
import { usePathname } from "next/navigation"

import { OFFLINE_BASE_PATH, registerServiceWorker } from "@/lib/offline-study"

/** Registers public/sw.js (production only) so the Study section can be saved for offline use. */
export function ServiceWorkerRegister() {
  const pathname = usePathname()

  useEffect(() => {
    registerServiceWorker()
  }, [])

  // Links to the home page lead to "/practice", which is outside the offline
  // worker's scope ("/practice/"). Add the slash, so reloading the home page
  // with no internet still finds the saved copy.
  useEffect(() => {
    if (!OFFLINE_BASE_PATH || pathname !== "/") return
    if (window.location.pathname !== OFFLINE_BASE_PATH) return
    const { search, hash } = window.location
    window.history.replaceState(window.history.state, "", `${OFFLINE_BASE_PATH}/${search}${hash}`)
  }, [pathname])

  return null
}
