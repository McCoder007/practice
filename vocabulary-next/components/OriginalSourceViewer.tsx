"use client"

import { useEffect, useRef, useState } from "react"
import Link from "next/link"

import { ExamQuizChineseToggle } from "@/components/ExamQuizChineseToggle"
import { NavigationMenu } from "@/components/NavigationMenu"
import { useExamQuizPreferences } from "@/contexts/ExamQuizPreferencesContext"
import type { PracticeSourceMeta } from "@/data/exam-quiz/catalog"
import { cn } from "@/lib/utils"

function publicAssetUrl(path: string) {
  const prefix = window.location.pathname.startsWith("/practice") ? "/practice" : ""
  return `${prefix}${path}`
}

export function OriginalSourceViewer({ source }: { source: PracticeSourceMeta }) {
  const { showChinese } = useExamQuizPreferences()
  const pagesRef = useRef<HTMLDivElement>(null)
  const [status, setStatus] = useState<"loading" | "ready" | "error">("loading")
  const [errorMessage, setErrorMessage] = useState("")

  useEffect(() => {
    const container = pagesRef.current
    if (!container) return

    let cancelled = false
    const loadingTasks: { destroy(): Promise<unknown> }[] = []

    async function renderPdf() {
      setStatus("loading")
      setErrorMessage("")
      container.replaceChildren()

      try {
        const pdfjs = await import("pdfjs-dist")
        pdfjs.GlobalWorkerOptions.workerSrc = publicAssetUrl("/pdfjs/pdf.worker.min.mjs")

        const loadingTask = pdfjs.getDocument({ url: publicAssetUrl(source.originalHref) })
        loadingTasks.push(loadingTask)
        const pdf = await loadingTask.promise
        if (cancelled) {
          await pdf.destroy()
          return
        }

        const width = container.clientWidth || window.innerWidth
        const outputScale = Math.min(window.devicePixelRatio || 1, 2)

        for (let pageNumber = 1; pageNumber <= pdf.numPages; pageNumber += 1) {
          const page = await pdf.getPage(pageNumber)
          if (cancelled) break

          const unscaled = page.getViewport({ scale: 1 })
          const scale = width / unscaled.width
          const viewport = page.getViewport({ scale })
          const transform = outputScale !== 1 ? [outputScale, 0, 0, outputScale, 0, 0] : undefined

          const canvas = document.createElement("canvas")
          canvas.width = Math.floor(viewport.width * outputScale)
          canvas.height = Math.floor(viewport.height * outputScale)
          canvas.style.width = `${Math.floor(viewport.width)}px`
          canvas.style.height = `${Math.floor(viewport.height)}px`
          canvas.className = "mb-3 w-full rounded-md bg-white shadow-sm last:mb-0"
          canvas.setAttribute("aria-label", `Page ${pageNumber}`)

          const canvasContext = canvas.getContext("2d")
          if (!canvasContext) throw new Error("Could not create canvas context")

          await page.render({ canvasContext, viewport, transform }).promise
          if (!cancelled) container.appendChild(canvas)
        }

        await pdf.destroy()
        if (!cancelled) setStatus("ready")
      } catch (error) {
        if (cancelled) return
        setStatus("error")
        setErrorMessage(error instanceof Error ? error.message : "Could not open the original PDF.")
      }
    }

    void renderPdf()

    return () => {
      cancelled = true
      for (const task of loadingTasks) {
        void task.destroy()
      }
    }
  }, [source.originalHref])

  return (
    <>
      <NavigationMenu />
      <ExamQuizChineseToggle />
      <main className="min-h-screen bg-[#f7f3ea] text-stone-900">
        <div className="mx-auto flex w-full max-w-md flex-col gap-4 px-4 pb-16 pt-20">
          <Link
            href="/exam-quiz"
            className="ml-12 text-sm font-medium text-stone-600 underline-offset-4 hover:text-stone-900 hover:underline sm:ml-0"
          >
            Back to Exam Practice{showChinese && " | 返回考试练习"}
          </Link>
          <header className="rounded-2xl border border-violet-200 bg-[#fff8ee] px-4 py-5">
            <p className="text-xs font-semibold tracking-[0.18em] text-violet-800/80 uppercase">
              Original{showChinese && " | 原文"}
            </p>
            <h1 className={cn("mt-2 text-xl font-semibold leading-snug")}>
              {source.title.en}
              {showChinese && <> | {source.title.zh}</>}
            </h1>
          </header>
          {status === "loading" ? (
            <p className="text-sm text-stone-600">
              Loading original…{showChinese && " | 正在加载原文…"}
            </p>
          ) : null}
          {status === "error" ? (
            <p className="text-sm text-rose-700">
              Could not open the original.{showChinese && " | 无法打开原文。"}
              {errorMessage ? ` ${errorMessage}` : ""}
            </p>
          ) : null}
          <div ref={pagesRef} className="overflow-x-hidden" />
        </div>
      </main>
    </>
  )
}
