"use client"

import Link from "next/link"

import { NavigationMenu } from "@/components/NavigationMenu"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import {
  MIXED_PRACTICE,
  NAIL_EXAM_BANKS,
  NAIL_EXAM_PRACTICE_TITLE,
  bankSummaryLine,
} from "@/data/nail-exam-practice/catalog"
import { useExamQuizPreferences } from "@/contexts/ExamQuizPreferencesContext"
import { ExamQuizChineseToggle } from "@/components/ExamQuizChineseToggle"
import { cn } from "@/lib/utils"

const ACCENT = {
  violet: "border-violet-200 from-violet-50 to-white dark:border-violet-900/50 dark:from-violet-950/30 dark:to-slate-800",
  rose: "border-rose-200 from-rose-50 to-white dark:border-rose-900/50 dark:from-rose-950/30 dark:to-slate-800",
  cyan: "border-cyan-200 from-cyan-50 to-white dark:border-cyan-900/50 dark:from-cyan-950/30 dark:to-slate-800",
  amber: "border-amber-200 from-amber-50 to-white dark:border-amber-900/50 dark:from-amber-950/30 dark:to-slate-800",
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
            className="text-sm font-medium text-slate-600 underline-offset-2 hover:underline dark:text-slate-300"
          >
            ← Study Zone
          </Link>
          <h1 className="text-center text-2xl font-bold text-slate-900 dark:text-white">
            {NAIL_EXAM_PRACTICE_TITLE.en}
            {showChinese && <> | {NAIL_EXAM_PRACTICE_TITLE.zh}</>}
          </h1>
          <p className="text-center text-sm text-slate-600 dark:text-slate-300">
            Choose a question bank, then a study format and group.
            {showChinese && " | 选择题库，再选学习方式和题目分组。"}
          </p>

          {NAIL_EXAM_BANKS.map((bank) => {
            const summary = bankSummaryLine(bank)
            return (
              <Link key={bank.id} href={bank.href}>
                <Card
                  className={cn(
                    "border-2 bg-gradient-to-r transition-shadow hover:shadow-md",
                    ACCENT[bank.accent],
                  )}
                >
                  <CardHeader className="px-5 pb-1">
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
                    <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
                      Multiple Choice · Study Cards
                      {showChinese && " | 选择题 · 学习卡"}
                    </p>
                  </CardContent>
                </Card>
              </Link>
            )
          })}

          <section className="mt-4 rounded-xl border border-dashed border-slate-300 p-4 dark:border-slate-600">
            <h2 className="text-sm font-semibold uppercase tracking-wide text-slate-500">
              {MIXED_PRACTICE.title.en}
              {showChinese && <> | {MIXED_PRACTICE.title.zh}</>}
            </h2>
            <p className="mt-1 text-sm text-slate-600 dark:text-slate-300">
              {MIXED_PRACTICE.description.en}
              {showChinese && <> | {MIXED_PRACTICE.description.zh}</>}
            </p>
            <Link
              href={MIXED_PRACTICE.href}
              className="mt-3 inline-flex min-h-11 items-center text-sm font-semibold text-slate-800 underline underline-offset-2 dark:text-slate-100"
            >
              Open Mixed Practice{showChinese && " | 打开混合练习"}
            </Link>
          </section>
        </div>
      </div>
    </>
  )
}
