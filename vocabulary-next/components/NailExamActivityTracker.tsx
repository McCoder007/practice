"use client"

import { useEffect } from "react"

import { usePathname } from "next/navigation"

export function NailExamActivityTracker() {
  const pathname = usePathname()

  useEffect(() => {
    if (pathname.startsWith("/admin")) return

    const report = () => {
      if (document.visibilityState !== "visible") return
      void import("@/lib/nail-exam-usage-store").then(({ reportNailExamAppActivity }) =>
        reportNailExamAppActivity(),
      )
    }

    report()
    document.addEventListener("visibilitychange", report)
    window.addEventListener("focus", report)
    return () => {
      document.removeEventListener("visibilitychange", report)
      window.removeEventListener("focus", report)
    }
  }, [pathname])

  return null
}
