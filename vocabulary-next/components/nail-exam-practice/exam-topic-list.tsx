"use client"

import Link from "next/link"

import { ClipboardCheck } from "lucide-react"

import { ExamQuizChineseToggle } from "@/components/ExamQuizChineseToggle"
import { NavigationMenu } from "@/components/NavigationMenu"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { useExamQuizPreferences } from "@/contexts/ExamQuizPreferencesContext"
import {
  EXAM_TOPICS,
  EXAM_TOPICS_DESCRIPTION,
  EXAM_TOPICS_PRACTICE_TEST_BANK,
  EXAM_TOPICS_TITLE,
  NAIL_EXAM_PRACTICE_HREF,
  NAIL_EXAM_PRACTICE_TITLE,
  examTopicSummary,
} from "@/data/nail-exam-practice/catalog"

export function ExamTopicList() {
  const { showChinese } = useExamQuizPreferences()
  const practiceTest = EXAM_TOPICS_PRACTICE_TEST_BANK

  return (
    <>
      <NavigationMenu />
      <ExamQuizChineseToggle />
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
              {EXAM_TOPICS_TITLE.en}
              {showChinese && (
                <span className="ml-2 text-lg font-semibold text-slate-400 dark:text-slate-500">
                  {EXAM_TOPICS_TITLE.zh}
                </span>
              )}
            </h1>
            <p className="mt-1 text-sm text-slate-600 dark:text-slate-300">
              {EXAM_TOPICS_DESCRIPTION.en}
              {showChinese && <> | {EXAM_TOPICS_DESCRIPTION.zh}</>}
            </p>
          </div>

          <Link href={practiceTest.href}>
            <Card className="gap-1.5 border-2 border-violet-300 bg-gradient-to-r from-violet-100 to-white py-4 transition-shadow hover:shadow-md dark:border-violet-800 dark:from-violet-950/50 dark:to-slate-800">
              <CardHeader className="px-5 pb-0">
                <CardTitle className="flex items-center gap-2 text-lg">
                  <ClipboardCheck className="size-5 shrink-0 text-violet-700 dark:text-violet-300" aria-hidden />
                  <span>
                    {practiceTest.publicName.en}
                    {showChinese && <> | {practiceTest.publicName.zh}</>}
                  </span>
                </CardTitle>
              </CardHeader>
              <CardContent className="px-5">
                <p className="text-sm text-slate-600 dark:text-slate-300">
                  {practiceTest.summary?.en}
                  {showChinese && <> | {practiceTest.summary?.zh}</>}
                </p>
              </CardContent>
            </Card>
          </Link>

          <h2 className="mt-2 text-sm font-semibold tracking-wide text-slate-500 uppercase dark:text-slate-400">
            Topics{showChinese && " | 主题"}
          </h2>

          {EXAM_TOPICS.map((topic) => {
            const summary = examTopicSummary(topic)
            return (
              <Link key={topic.id} href={topic.href}>
                <Card className="gap-1 border-2 border-slate-200 bg-white py-3 transition-shadow hover:shadow-md dark:border-slate-700 dark:bg-slate-900/60">
                  <CardHeader className="px-5 pb-0">
                    <CardTitle className="text-base">
                      {topic.order}. {topic.title.en}
                      {showChinese && (
                        <span className="block text-sm font-medium text-slate-400 dark:text-slate-500">
                          {topic.title.zh}
                        </span>
                      )}
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="px-5">
                    <p className="text-xs font-semibold text-slate-600 dark:text-slate-300">
                      {summary.en}
                      {showChinese && <> | {summary.zh}</>}
                    </p>
                    <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
                      {topic.sets.map((set) => set.title.en).join(" · ")}
                    </p>
                  </CardContent>
                </Card>
              </Link>
            )
          })}
        </div>
      </div>
    </>
  )
}
