"use client"

import { useCallback, useEffect, useState, type ReactNode } from "react"

import Link from "next/link"

import { NailExamMultipleChoiceSession } from "@/components/nail-exam-practice/multiple-choice-session"
import { NailExamStudyCardsSession } from "@/components/nail-exam-practice/study-cards-session"
import { NavigationMenu } from "@/components/NavigationMenu"
import { Button } from "@/components/ui/button"
import { OMITTED_PRACTICE_IDS } from "@/data/exam-quiz/catalog"
import { loadPracticeQuestions, loadQuestionsToReview } from "@/data/exam-quiz/loadChapter"
import type { ExamQuestion, LocalizedText } from "@/data/exam-quiz/types"
import {
  NAIL_EXAM_PRACTICE_HREF,
  NAIL_EXAM_PRACTICE_TITLE,
  STUDY_FORMATS,
  bankGroupCards,
  bankSummaryLine,
  getNailExamBank,
  groupLabel,
  sessionGroupLabel,
  sliceBankGroup,
  type NailExamBank,
  type NailExamBankId,
  type StudyFormatId,
} from "@/data/nail-exam-practice/catalog"
import { loadPracticeQuestions as loadOfficialQuestions } from "@/data/official-exam-quiz/loadChapter"
import { assertPlayablePool, drawPracticeSession, shuffleQuestionChoices } from "@/lib/exam-quiz-reel"
import {
  clearNailExamBankHistory,
  nailExamGroupHistoryId,
  nextNailExamGroupHistoryEntry,
  readNailExamGroupHistory,
  writeNailExamGroupHistory,
  type NailExamGroupHistory,
} from "@/lib/nail-exam-practice-history"
import { sliceStudyCardsRange, type QaCard } from "@/lib/nail-technician-qa-reel"
import { cn } from "@/lib/utils"

const ACCENT = {
  violet: "border-violet-200 bg-violet-50 text-violet-950 dark:border-violet-900/50 dark:bg-violet-950/30 dark:text-violet-50",
  rose: "border-rose-200 bg-rose-50 text-rose-950 dark:border-rose-900/50 dark:bg-rose-950/30 dark:text-rose-50",
  cyan: "border-cyan-200 bg-cyan-50 text-cyan-950 dark:border-cyan-900/50 dark:bg-cyan-950/30 dark:text-cyan-50",
  amber: "border-amber-200 bg-amber-50 text-amber-950 dark:border-amber-900/50 dark:bg-amber-950/30 dark:text-amber-50",
} as const

async function loadBankPool(bank: NailExamBank): Promise<ExamQuestion[]> {
  if (bank.pool === "official") {
    return loadOfficialQuestions()
  }
  const [questions, held] = await Promise.all([loadPracticeQuestions(), loadQuestionsToReview()])
  assertPlayablePool(questions, [
    ...held.questions.map((question) => question.id),
    ...OMITTED_PRACTICE_IDS,
  ])
  return questions
}

type ActiveSession =
  | {
      format: "multiple-choice"
      title: LocalizedText
      questions: ExamQuestion[]
      isRandom: boolean
      groupHistoryId?: string
      restart: () => Promise<void>
    }
  | {
      format: "study-cards"
      title: LocalizedText
      cards: QaCard[]
      restart: () => Promise<void>
    }

export function NailExamBankExperience({
  bankId,
  showChinese,
  chineseToggleInline,
  chineseToggleFixed,
}: {
  bankId: NailExamBankId
  showChinese: boolean
  chineseToggleInline: ReactNode
  chineseToggleFixed: ReactNode
}) {
  const bank = getNailExamBank(bankId)
  const groups = bankGroupCards(bank)
  const summary = bankSummaryLine(bank)
  const [format, setFormat] = useState<StudyFormatId>("multiple-choice")
  const [loading, setLoading] = useState(false)
  const [session, setSession] = useState<ActiveSession | null>(null)
  const [groupHistory, setGroupHistory] = useState<NailExamGroupHistory>({})

  useEffect(() => {
    setGroupHistory(readNailExamGroupHistory(window.localStorage))
  }, [])

  const changeFormat = useCallback((next: StudyFormatId) => {
    setFormat(next)
  }, [])

  const beginMultipleChoice = useCallback(
    async (
      title: LocalizedText,
      select: (pool: ExamQuestion[]) => ExamQuestion[],
      isRandom: boolean,
      groupHistoryId?: string,
    ) => {
      setLoading(true)
      try {
        const pool = await loadBankPool(bank)
        const selected = shuffleQuestionChoices(select(pool))
        if (selected.length === 0) return
        const start = async () => {
          const nextPool = await loadBankPool(bank)
          const nextSelected = shuffleQuestionChoices(select(nextPool))
          setSession({
            format: "multiple-choice",
            title,
            questions: nextSelected,
            isRandom,
            groupHistoryId,
            restart: start,
          })
        }
        setSession({
          format: "multiple-choice",
          title,
          questions: selected,
          isRandom,
          groupHistoryId,
          restart: start,
        })
      } finally {
        setLoading(false)
      }
    },
    [bank],
  )

  const beginStudyCards = useCallback(
    async (title: LocalizedText, offset: number) => {
      setLoading(true)
      try {
        const pool = await loadBankPool(bank)
        const cards = sliceStudyCardsRange(pool, bank.idPrefix, offset)
        if (cards.length === 0) return
        const start = async () => {
          const nextPool = await loadBankPool(bank)
          setSession({
            format: "study-cards",
            title,
            cards: sliceStudyCardsRange(nextPool, bank.idPrefix, offset),
            restart: start,
          })
        }
        setSession({
          format: "study-cards",
          title,
          cards,
          restart: start,
        })
      } finally {
        setLoading(false)
      }
    },
    [bank],
  )

  const startGroup = useCallback(
    (offset: number, start: number, end: number) => {
      const title = sessionGroupLabel(bank, start, end)
      if (format === "study-cards") {
        void beginStudyCards(title, offset)
        return
      }
      void beginMultipleChoice(
        title,
        (pool) => sliceBankGroup(pool, bank, offset),
        false,
        nailExamGroupHistoryId(bank.id, start, end),
      )
    },
    [bank, beginMultipleChoice, beginStudyCards, format],
  )

  if (session?.format === "multiple-choice") {
    return (
      <NailExamMultipleChoiceSession
        title={session.title}
        questions={session.questions}
        showChinese={showChinese}
        chineseToggle={chineseToggleInline}
        chineseToggleFixed={chineseToggleFixed}
        isRandom={session.isRandom}
        onComplete={
          session.groupHistoryId
            ? ({ correct, total }) => {
                const nextEntry = nextNailExamGroupHistoryEntry(
                  groupHistory[session.groupHistoryId!],
                  correct,
                  total,
                )
                const nextHistory = { ...groupHistory, [session.groupHistoryId!]: nextEntry }
                setGroupHistory(nextHistory)
                writeNailExamGroupHistory(window.localStorage, nextHistory)
                return nextEntry
              }
            : undefined
        }
        onRestart={() => {
          void session.restart()
        }}
        onExit={() => setSession(null)}
      />
    )
  }

  if (session?.format === "study-cards") {
    return (
      <NailExamStudyCardsSession
        title={session.title}
        cards={session.cards}
        showChinese={showChinese}
        chineseToggle={chineseToggleInline}
        chineseToggleFixed={chineseToggleFixed}
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
      {chineseToggleFixed}
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
            <h1 className="text-4xl font-bold text-slate-900 dark:text-white">
              {bank.publicName.en}
              {showChinese && <> | {bank.publicName.zh}</>}
            </h1>
            <p className="mt-1 text-lg text-slate-600 dark:text-slate-300">
              {summary.en}
              {showChinese && <> | {summary.zh}</>}
            </p>
          </div>

          <div>
            <p className="mb-2 text-lg font-semibold text-slate-700 dark:text-slate-200">
              Study format{showChinese && " | 学习方式"}
            </p>
            <div className="grid grid-cols-2 gap-2">
              {STUDY_FORMATS.map((option) => {
                const selected = format === option.id
                return (
                  <Button
                    key={option.id}
                    type="button"
                    variant={selected ? "default" : "outline"}
                    className="min-h-11 h-auto whitespace-normal px-2 py-2 !text-lg"
                    aria-pressed={selected}
                    onClick={() => changeFormat(option.id)}
                  >
                    {option.title.en}
                    {showChinese && (
                      <>
                        <br />
                        {option.title.zh}
                      </>
                    )}
                  </Button>
                )
              })}
            </div>
          </div>

          <div>
            <p className="mb-2 text-lg font-semibold text-slate-700 dark:text-slate-200">
              Question groups{showChinese && " | 题目分组"}
            </p>
            <div className="grid grid-cols-2 gap-2">
              {groups.map((range) => {
                const label = groupLabel(range.start, range.end)
                const historyEntry = groupHistory[nailExamGroupHistoryId(bank.id, range.start, range.end)]
                return (
                  <button
                    key={range.offset}
                    type="button"
                    disabled={loading}
                    onClick={() => startGroup(range.offset, range.start, range.end)}
                    className={cn(
                      "min-h-[7.75rem] rounded-xl border px-3 py-2 text-left text-lg font-semibold shadow-sm transition-shadow hover:shadow-md disabled:opacity-60",
                      ACCENT[bank.accent],
                    )}
                  >
                    {label.en}
                    <span className="mt-1 block min-h-12 text-xs leading-4 font-medium opacity-80">
                      {format === "multiple-choice" && (
                        historyEntry ? (
                          <>
                            <span className="block">
                              Attempts: {historyEntry.attempts} · Perfect: {historyEntry.perfect}
                            </span>
                            {showChinese && (
                              <span className="block" lang="zh-Hans">
                                尝试：{historyEntry.attempts} · 满分：{historyEntry.perfect}
                              </span>
                            )}
                            <span className="block text-[11px]">
                              Highest score: {historyEntry.bestScore}/{historyEntry.total}
                            </span>
                            {showChinese && (
                              <span className="block text-[11px]" lang="zh-Hans">
                                最高分：{historyEntry.bestScore}/{historyEntry.total}
                              </span>
                            )}
                          </>
                        ) : (
                          <>
                            <span className="block">Not attempted yet</span>
                            {showChinese && (
                              <span className="block" lang="zh-Hans">尚未尝试</span>
                            )}
                          </>
                        )
                      )}
                    </span>
                  </button>
                )
              })}
            </div>
          </div>

          {format === "multiple-choice" && bank.randomOptions.length > 0 && (
            <div>
              <p className="mb-2 text-lg font-semibold text-slate-700 dark:text-slate-200">
                Random practice{showChinese && " | 随机练习"}
              </p>
              <div className="flex flex-col gap-2">
                {bank.randomOptions.map((option) => (
                  <button
                    key={option.id}
                    type="button"
                    disabled={loading}
                    onClick={() =>
                      void beginMultipleChoice(
                        option.title,
                        (pool) =>
                          drawPracticeSession(sliceBankGroup(pool, bank, 0, bank.approvedCount), option.count),
                        true,
                      )
                    }
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
          )}

          <details className="rounded-xl border border-slate-200 bg-white/80 px-4 py-3 text-lg dark:border-slate-700 dark:bg-slate-900/40">
            <summary className="cursor-pointer font-medium text-slate-700 dark:text-slate-200">
              Source information{showChinese && " | 来源说明"}
            </summary>
            <p className="mt-2 text-slate-600 dark:text-slate-300">{bank.internalSourceName}</p>
            {bank.originalViewerHref && (
              <Link
                href={bank.originalViewerHref}
                className="mt-1 inline-block font-medium text-slate-800 underline dark:text-slate-100"
              >
                Original / 原文
              </Link>
            )}
            {Object.keys(groupHistory).some((key) => key.startsWith(`${bank.id}:`)) && (
              <div className="mt-3 border-t border-slate-200 pt-3 dark:border-slate-700">
                <p className="text-sm text-slate-600 dark:text-slate-300">
                  Practice history stays in this browser only.
                  {showChinese && <> | 练习记录仅保存在此浏览器中。</>}
                </p>
                <button
                  type="button"
                  className="mt-2 min-h-11 text-sm font-medium text-rose-700 underline underline-offset-2 dark:text-rose-300"
                  onClick={() => {
                    const confirmed = window.confirm(
                      "Clear the Multiple Choice history for this bank?\n清除此题库的选择题练习记录吗？",
                    )
                    if (!confirmed) return
                    setGroupHistory(clearNailExamBankHistory(window.localStorage, groupHistory, bank.id))
                  }}
                >
                  Clear this bank’s history{showChinese && " | 清除此题库记录"}
                </button>
              </div>
            )}
          </details>
        </div>
      </div>
    </>
  )
}
