"use client"

import Link from "next/link"

import { NavigationMenu } from "@/components/NavigationMenu"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import {
  EXAM_TOPICS_DESCRIPTION,
  EXAM_TOPICS_HREF,
  EXAM_TOPICS_TITLE,
  MILADY_REVIEW_DESCRIPTION,
  MILADY_REVIEW_HREF,
  MILADY_REVIEW_TITLE,
  MIXED_PRACTICE,
  NAIL_EXAM_BANKS,
  NAIL_EXAM_PRACTICE_TITLE,
  bankSummaryLine,
} from "@/data/nail-exam-practice/catalog"
import {
  QUESTION_WORDS_DESCRIPTION,
  QUESTION_WORDS_HREF,
  QUESTION_WORDS_TITLE,
} from "@/data/nail-exam-practice/question-words"
import type { LocalizedText } from "@/data/exam-quiz/types"
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
  fuchsia: "border-fuchsia-200 from-fuchsia-50 to-white dark:border-fuchsia-900/50 dark:from-fuchsia-950/30 dark:to-slate-800",
} as const

const WORD_REEL = {
  href: "/nail-exam-word-reel",
  title: { en: "Nail Exam Word Reel", zh: "美甲考试词汇卷轴" },
  description: {
    en: "48 vocabulary cards with test words and related forms",
    zh: "48 张考试词汇及相关词形卡片",
  },
} as const

const SECTIONS = {
  start: { en: "Start here", zh: "从这里开始" },
  banks: { en: "Practice banks", zh: "练习题库" },
  more: { en: "More practice", zh: "更多练习" },
} as const

function SectionHeading({ title, showChinese }: { title: LocalizedText; showChinese: boolean }) {
  return (
    <h2 className="mt-3 text-sm font-semibold tracking-wide text-slate-500 uppercase first:mt-0 dark:text-slate-400">
      {title.en}
      {showChinese && <span className="ml-2 normal-case">{title.zh}</span>}
    </h2>
  )
}

function HubCard({
  href,
  title,
  description,
  accent,
  showChinese,
}: {
  href: string
  title: LocalizedText
  description: LocalizedText
  accent: keyof typeof ACCENT
  showChinese: boolean
}) {
  return (
    <Link href={href}>
      <Card
        className={cn(
          "gap-1.5 border-2 bg-gradient-to-r py-4 transition-shadow hover:shadow-md",
          ACCENT[accent],
        )}
      >
        <CardHeader className="px-5 pb-0">
          <CardTitle className="text-lg">
            {title.en}
            {showChinese && <> | {title.zh}</>}
          </CardTitle>
        </CardHeader>
        <CardContent className="px-5">
          <p className="text-sm text-slate-600 dark:text-slate-300">
            {description.en}
            {showChinese && <> | {description.zh}</>}
          </p>
        </CardContent>
      </Card>
    </Link>
  )
}

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

          <SectionHeading title={SECTIONS.start} showChinese={showChinese} />
          <HubCard
            href={WORD_REEL.href}
            title={WORD_REEL.title}
            description={WORD_REEL.description}
            accent="pink"
            showChinese={showChinese}
          />
          <HubCard
            href={QUESTION_WORDS_HREF}
            title={QUESTION_WORDS_TITLE}
            description={QUESTION_WORDS_DESCRIPTION}
            accent="amber"
            showChinese={showChinese}
          />
          <HubCard
            href={EXAM_TOPICS_HREF}
            title={EXAM_TOPICS_TITLE}
            description={EXAM_TOPICS_DESCRIPTION}
            accent="fuchsia"
            showChinese={showChinese}
          />

          <SectionHeading title={SECTIONS.banks} showChinese={showChinese} />
          {NAIL_EXAM_BANKS.map((bank) => (
            <HubCard
              key={bank.id}
              href={bank.href}
              title={bank.publicName}
              description={bankSummaryLine(bank)}
              accent={bank.accent}
              showChinese={showChinese}
            />
          ))}

          <SectionHeading title={SECTIONS.more} showChinese={showChinese} />
          <HubCard
            href={MILADY_REVIEW_HREF}
            title={MILADY_REVIEW_TITLE}
            description={MILADY_REVIEW_DESCRIPTION}
            accent="indigo"
            showChinese={showChinese}
          />
          <HubCard
            href={MIXED_PRACTICE.href}
            title={MIXED_PRACTICE.title}
            description={MIXED_PRACTICE.description}
            accent="emerald"
            showChinese={showChinese}
          />
        </div>
      </div>
    </>
  )
}
