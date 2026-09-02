"use client"

import { useEffect } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"

import { NAIL_EXAM_PRACTICE_TITLE } from "@/data/nail-exam-practice/catalog"

export function LegacyExamPracticeRedirect({ href }: { href: string }) {
  const router = useRouter()

  useEffect(() => {
    router.replace(href)
  }, [href, router])

  return (
    <div className="flex min-h-screen flex-col items-center justify-center gap-3 bg-slate-50 px-4 dark:bg-slate-900">
      <p className="text-center text-sm text-slate-600 dark:text-slate-300">
        This practice area moved to {NAIL_EXAM_PRACTICE_TITLE.en}.
      </p>
      <Link href={href} className="text-sm font-semibold text-slate-900 underline underline-offset-2 dark:text-white">
        Continue to {NAIL_EXAM_PRACTICE_TITLE.en}
      </Link>
    </div>
  )
}
