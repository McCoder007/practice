"use client"

import Link from "next/link"

import { MiladyReviewChineseToggle } from "@/components/MiladyReviewChineseToggle"
import { NavigationMenu } from "@/components/NavigationMenu"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { useMiladyReviewPreferences } from "@/contexts/MiladyReviewPreferencesContext"
import {
  MILADY_REVIEW_HREF,
  MILADY_REVIEW_TITLE,
  miladyReviewChapterCards,
  miladyReviewSectionTitle,
} from "@/data/nail-exam-practice/catalog"

export function MiladyReviewChapterList({ section }: { section: "foundations" | "nails" }) {
  const { showChinese } = useMiladyReviewPreferences()
  const title = miladyReviewSectionTitle(section)
  const chapters = miladyReviewChapterCards(section)

  return (
    <>
      <NavigationMenu />
      <MiladyReviewChineseToggle />
      <div className="min-h-screen bg-gradient-to-b from-slate-50 to-slate-100 px-4 pb-10 pt-20 dark:from-slate-900 dark:to-slate-800">
        <div className="mx-auto flex w-full max-w-md flex-col gap-4">
          <Link
            href={MILADY_REVIEW_HREF}
            className="text-lg font-medium text-slate-600 underline-offset-2 hover:underline dark:text-slate-300"
          >
            ← {MILADY_REVIEW_TITLE.en}
            {showChinese && <> | {MILADY_REVIEW_TITLE.zh}</>}
          </Link>
          <div>
            <h1 className="text-2xl font-bold text-slate-900 dark:text-white">
              {title.en}
              {showChinese && (
                <span className="ml-2 text-lg font-semibold text-slate-400 dark:text-slate-500">{title.zh}</span>
              )}
            </h1>
            <p className="mt-1 text-sm text-slate-600 dark:text-slate-300">
              {chapters.length} chapters
              {showChinese && <> | {chapters.length} 章</>}
            </p>
          </div>

          {chapters.map((chapter) => (
            <Link key={chapter.chapter} href={chapter.href}>
              <Card className="gap-1 border-2 border-slate-200 bg-white py-3 transition-shadow hover:shadow-md dark:border-slate-700 dark:bg-slate-900/60">
                <CardHeader className="px-5 pb-0">
                  <CardTitle className="text-base">
                    Ch. {chapter.chapter} — {chapter.title.en}
                    {showChinese && (
                      <span className="block text-sm font-medium text-slate-400 dark:text-slate-500">
                        第 {chapter.chapter} 章 — {chapter.title.zh}
                      </span>
                    )}
                  </CardTitle>
                </CardHeader>
                <CardContent className="px-5">
                  <p className="text-xs text-slate-500 dark:text-slate-400">
                    {chapter.questionCount} questions · {chapter.groupCount} groups
                    {showChinese && (
                      <> | {chapter.questionCount} 道题目 · {chapter.groupCount} 组</>
                    )}
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
