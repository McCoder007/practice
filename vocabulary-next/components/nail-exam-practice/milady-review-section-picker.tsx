"use client"

import Link from "next/link"

import { MiladyReviewChineseToggle } from "@/components/MiladyReviewChineseToggle"
import { NavigationMenu } from "@/components/NavigationMenu"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { useMiladyReviewPreferences } from "@/contexts/MiladyReviewPreferencesContext"
import {
  MILADY_REVIEW_DESCRIPTION,
  MILADY_REVIEW_SECTIONS,
  MILADY_REVIEW_TITLE,
  NAIL_EXAM_PRACTICE_HREF,
  NAIL_EXAM_PRACTICE_TITLE,
} from "@/data/nail-exam-practice/catalog"
import { cn } from "@/lib/utils"

const ACCENT = {
  comprehensive: "border-cyan-200 from-cyan-50 to-white dark:border-cyan-900/50 dark:from-cyan-950/30 dark:to-slate-800",
  foundations: "border-violet-200 from-violet-50 to-white dark:border-violet-900/50 dark:from-violet-950/30 dark:to-slate-800",
  nails: "border-rose-200 from-rose-50 to-white dark:border-rose-900/50 dark:from-rose-950/30 dark:to-slate-800",
} as const

export function MiladyReviewSectionPicker() {
  const { showChinese } = useMiladyReviewPreferences()

  return (
    <>
      <NavigationMenu />
      <MiladyReviewChineseToggle />
      <div className="min-h-screen bg-gradient-to-b from-slate-50 to-slate-100 px-4 pb-10 pt-20 dark:from-slate-900 dark:to-slate-800">
        <div className="mx-auto flex w-full max-w-md flex-col gap-4">
          <Link
            href={NAIL_EXAM_PRACTICE_HREF}
            className="text-lg font-medium text-slate-600 underline-offset-2 hover:underline dark:text-slate-300"
          >
            ← {NAIL_EXAM_PRACTICE_TITLE.en}
            {showChinese && <> | {NAIL_EXAM_PRACTICE_TITLE.zh}</>}
          </Link>
          <div>
            <h1 className="text-2xl font-bold text-slate-900 dark:text-white">
              {MILADY_REVIEW_TITLE.en}
              {showChinese && (
                <span className="ml-2 text-lg font-semibold text-slate-400 dark:text-slate-500">
                  {MILADY_REVIEW_TITLE.zh}
                </span>
              )}
            </h1>
            <p className="mt-1 text-sm text-slate-600 dark:text-slate-300">
              {MILADY_REVIEW_DESCRIPTION.en}
              {showChinese && <> | {MILADY_REVIEW_DESCRIPTION.zh}</>}
            </p>
          </div>

          {MILADY_REVIEW_SECTIONS.map((section) => (
            <Link key={section.id} href={section.href}>
              <Card
                className={cn(
                  "gap-1.5 border-2 bg-gradient-to-r py-4 transition-shadow hover:shadow-md",
                  ACCENT[section.id],
                )}
              >
                <CardHeader className="px-5 pb-0">
                  <CardTitle className="text-lg">
                    {section.title.en}
                    {showChinese && <> | {section.title.zh}</>}
                  </CardTitle>
                </CardHeader>
                <CardContent className="px-5">
                  <p className="text-sm text-slate-600 dark:text-slate-300">
                    {section.summary.en}
                    {showChinese && <> | {section.summary.zh}</>}
                  </p>
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>
      </div>
    </>
  )
}
