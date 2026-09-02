"use client"

import { useCallback, useState } from "react"

import Link from "next/link"

import { NailExamMultipleChoiceSession } from "@/components/nail-exam-practice/multiple-choice-session"
import { ExamQuizChineseToggle } from "@/components/ExamQuizChineseToggle"
import { NavigationMenu } from "@/components/NavigationMenu"
import { useExamQuizPreferences } from "@/contexts/ExamQuizPreferencesContext"
import { OMITTED_PRACTICE_IDS } from "@/data/exam-quiz/catalog"
import { loadPracticeQuestions, loadQuestionsToReview } from "@/data/exam-quiz/loadChapter"
import type { ExamQuestion } from "@/data/exam-quiz/types"
import {
  MIXED_PRACTICE,
  NAIL_EXAM_PRACTICE_HREF,
  NAIL_EXAM_PRACTICE_TITLE,
} from "@/data/nail-exam-practice/catalog"
import { assertPlayablePool, drawPracticeSession, shuffleQuestionChoices } from "@/lib/exam-quiz-reel"

export function NailExamMixedPractice() {
  const { showChinese } = useExamQuizPreferences()
  const [loading, setLoading] = useState(false)
  const [session, setSession] = useState<{
    title: (typeof MIXED_PRACTICE.randomOptions)[number]["title"]
    questions: ExamQuestion[]
    restart: () => Promise<void>
  } | null>(null)

  const startRandom = useCallback(async (option: (typeof MIXED_PRACTICE.randomOptions)[number]) => {
    setLoading(true)
    try {
      const load = async () => {
        const [questions, held] = await Promise.all([loadPracticeQuestions(), loadQuestionsToReview()])
        assertPlayablePool(questions, [
          ...held.questions.map((question) => question.id),
          ...OMITTED_PRACTICE_IDS,
        ])
        return shuffleQuestionChoices(drawPracticeSession(questions, option.count))
      }
      const restart = async () => {
        setSession({
          title: option.title,
          questions: await load(),
          restart,
        })
      }
      setSession({
        title: option.title,
        questions: await load(),
        restart,
      })
    } finally {
      setLoading(false)
    }
  }, [])

  if (session) {
    return (
      <NailExamMultipleChoiceSession
        title={session.title}
        questions={session.questions}
        showChinese={showChinese}
        chineseToggle={<ExamQuizChineseToggle placement="inline" />}
        chineseToggleFixed={<ExamQuizChineseToggle />}
        isRandom
        onRestart={() => {
          void session.restart()
        }}
        onExit={() => setSession(null)}
      />
    )
  }

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
          <h1 className="text-4xl font-bold text-slate-900 dark:text-white">
            {MIXED_PRACTICE.title.en}
            {showChinese && <> | {MIXED_PRACTICE.title.zh}</>}
          </h1>
          <p className="text-lg text-slate-600 dark:text-slate-300">
            {MIXED_PRACTICE.description.en}
            {showChinese && <> | {MIXED_PRACTICE.description.zh}</>}
          </p>
          {MIXED_PRACTICE.randomOptions.map((option) => (
            <button
              key={option.id}
              type="button"
              disabled={loading}
              onClick={() => {
                void startRandom(option)
              }}
              className="min-h-12 rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-left disabled:opacity-60 dark:border-emerald-900/50 dark:bg-emerald-950/30"
            >
              <span className="block text-lg font-semibold text-slate-900 dark:text-white">
                {option.title.en}
                {showChinese && <> | {option.title.zh}</>}
              </span>
              <span className="text-base text-slate-600 dark:text-slate-300">
                {option.count} random questions
                {showChinese && ` | ${option.count} 道随机题目`}
              </span>
            </button>
          ))}
        </div>
      </div>
    </>
  )
}
