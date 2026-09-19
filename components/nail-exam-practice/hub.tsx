"use client"

import Link from "next/link"

import { NavigationMenu } from "@/components/NavigationMenu"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import {
  MILADY_REVIEW_DESCRIPTION,
  MILADY_REVIEW_HREF,
  MILADY_REVIEW_TITLE,
  MIXED_PRACTICE,
  NAIL_EXAM_BANKS,
  NAIL_EXAM_PRACTICE_TITLE,
  bankSummaryLine,
} from "@/data/nail-exam-practice/catalog"
import { useExamQuizPreferences } from "@/contexts/ExamQuizPreferencesContext"
import { ExamQuizChineseToggle } from "@/components/ExamQuizChineseToggle"
import { cn } from "@/lib/utils"

const ACCENT = {
  pink: "border-pink-200 from-pink-50 to-white dark:border-pink-900/50 dark:from-pink-950/30 dark:to-slate-800",
  violet: "border-violet-200 from-violet-50 to-white dark:border-violet-900/50 dark:from-violet-950/30 dark:to-slate-800",
  rose: "border-rose-200 from-rose-50 to-white dark:border-rose-900/50 dark:from-rose-950/30 dark:to-slate-800",
  cyan: "border-cyan-200 from-cyan-50 to-white dark:border-cyan-900/50 dark:from-cyan-950/30 dark:to-slate-800",
  amber: "border-amber-200 from-amber-50 to-white dark:border-amber-900/50 dark:from-amber-950/30 dark:to-slate-800",
  emerald: "border-emerald-200 from-emerald-50 to-white dark:border-emerald-900/50 dark:from-emerald-950/30 dark:to-slate-800",
  indigo: "border-indigo-200 from-indigo-50 to-white dark:border-indigo-900/50 dark:from-indigo-950/30 dark:to-slate-800",
} as const

export function NailExamPracticeHub() {
  const { showChinese } = useExamQuizPreferences()

  return (
    <>
      <NavigationMenu />
      <ExamQuizChineseToggle />
      <div className="min-h-screen bg-gradient-to-b from-slate-50 to-slate-100 px-4 pb-10 pt-20 dark:from-slate-900 dark:to-slate-800">
        <div className="mx-auto flex w-full max-w-md flex-col gap-4">
          <Link
            href="/"
            className="text-lg font-medium text-slate-600 underline-offset-2 hover:underline dark:text-slate-300"
          >
            ← Study Zone
          </Link>
          <h1 className="text-center text-2xl font-bold text-slate-900 dark:text-white">
            {NAIL_EXAM_PRACTICE_TITLE.en}
            {showChinese && <> | {NAIL_EXAM_PRACTICE_TITLE.zh}</>}
          </h1>

          <Link href="/nail-exam-word-reel">
            <Card
              className={cn(
                "gap-1.5 border-2 bg-gradient-to-r py-4 transition-shadow hover:shadow-md",
                ACCENT.pink,
              )}
            >
              <CardHeader className="px-5 pb-0">
                <CardTitle className="text-lg">
                  Nail Exam Word Reel
                  {showChinese && <> | 美甲考试词汇卷轴</>}
                </CardTitle>
              </CardHeader>
              <CardContent className="px-5">
                <p className="text-sm text-slate-600 dark:text-slate-300">
                  48 vocabulary cards with test words and related forms
                  {showChinese && <> | 48 张考试词汇及相关词形卡片</>}
                </p>
              </CardContent>
            </Card>
          </Link>

          {NAIL_EXAM_BANKS.map((bank) => {
            const summary = bankSummaryLine(bank)
            return (
              <Link key={bank.id} href={bank.href}>
                <Card
                  className={cn(
                    "gap-1.5 border-2 bg-gradient-to-r py-4 transition-shadow hover:shadow-md",
                    ACCENT[bank.accent],
                  )}
                >
                  <CardHeader className="px-5 pb-0">
                    <CardTitle className="text-lg">
                      {bank.publicName.en}
                      {showChinese && <> | {bank.publicName.zh}</>}
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="px-5">
                    <p className="text-sm text-slate-600 dark:text-slate-300">
                      {summary.en}
                      {showChinese && <> | {summary.zh}</>}
                    </p>
                  </CardContent>
                </Card>
              </Link>
            )
          })}

          <Link href={MILADY_REVIEW_HREF}>
            <Card
              className={cn(
                "gap-1.5 border-2 bg-gradient-to-r py-4 transition-shadow hover:shadow-md",
                ACCENT.indigo,
              )}
            >
              <CardHeader className="px-5 pb-0">
                <CardTitle className="text-lg">
                  {MILADY_REVIEW_TITLE.en}
                  {showChinese && <> | {MILADY_REVIEW_TITLE.zh}</>}
                </CardTitle>
              </CardHeader>
              <CardContent className="px-5">
                <p className="text-sm text-slate-600 dark:text-slate-300">
                  {MILADY_REVIEW_DESCRIPTION.en}
                  {showChinese && <> | {MILADY_REVIEW_DESCRIPTION.zh}</>}
                </p>
              </CardContent>
            </Card>
          </Link>

          <Link href={MIXED_PRACTICE.href}>
            <Card
              className={cn(
                "gap-1.5 border-2 bg-gradient-to-r py-4 transition-shadow hover:shadow-md",
                ACCENT.emerald,
              )}
            >
              <CardHeader className="px-5 pb-0">
                <CardTitle className="text-lg">
                  {MIXED_PRACTICE.title.en}
                  {showChinese && <> | {MIXED_PRACTICE.title.zh}</>}
                </CardTitle>
              </CardHeader>
              <CardContent className="px-5">
                <p className="text-sm text-slate-600 dark:text-slate-300">
                  {MIXED_PRACTICE.description.en}
                  {showChinese && <> | {MIXED_PRACTICE.description.zh}</>}
                </p>
              </CardContent>
            </Card>
          </Link>
        </div>
      </div>
    </>
  )
}
