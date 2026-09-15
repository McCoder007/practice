"use client"

import { useState } from "react"

import { cn } from "@/lib/utils"
import type { MockExamQuestion } from "@/data/milady-mock-exam/loadQuestions"
import type { MockExamAnswers } from "@/lib/milady-mock-exam"
import { MOCK_EXAM_TEXT } from "@/lib/milady-mock-exam-i18n"

function choiceText(question: MockExamQuestion, choiceId: string | null, showChinese: boolean): string {
  if (!choiceId) return "—"
  const choice = question.choices.find((c) => c.id === choiceId)
  if (!choice) return "—"
  return showChinese ? `${choice.en} · ${choice.zh}` : choice.en
}

export function MockExamScoreScreen({
  questions,
  answers,
  correct,
  total,
  showChinese,
  onRestart,
}: {
  questions: MockExamQuestion[]
  answers: MockExamAnswers
  correct: number
  total: number
  showChinese: boolean
  onRestart: () => void
}) {
  const [reviewIndex, setReviewIndex] = useState<number | null>(null)
  const percent = total === 0 ? 0 : Math.round((correct / total) * 100)

  return (
    <div className="flex h-full flex-col items-center overflow-y-auto bg-neutral-100 px-4 py-10">
      <div className="w-full max-w-3xl rounded-md bg-white p-8 text-center shadow-sm">
        <p className="text-sm font-medium text-neutral-500">
          {MOCK_EXAM_TEXT.examComplete.en}
          {showChinese ? <span className="ml-1.5">{MOCK_EXAM_TEXT.examComplete.zh}</span> : null}
        </p>
        <p className="mt-2 text-5xl font-bold text-red-600">
          {correct}/{total}
        </p>
        <p className="mt-1 text-neutral-600">
          {percent}% {MOCK_EXAM_TEXT.correctSuffix.en}
          {showChinese ? <span className="ml-1.5">{percent}% {MOCK_EXAM_TEXT.correctSuffix.zh}</span> : null}
        </p>
        <button
          type="button"
          onClick={onRestart}
          className="mt-6 rounded-sm bg-red-600 px-6 py-2.5 text-sm font-medium text-white hover:bg-red-700"
        >
          {MOCK_EXAM_TEXT.restartTest.en}
          {showChinese ? <span className="ml-1.5">{MOCK_EXAM_TEXT.restartTest.zh}</span> : null}
        </button>
      </div>

      <div className="mt-6 w-full max-w-3xl rounded-md bg-white shadow-sm">
        <div className="border-b border-neutral-200 px-5 py-4">
          <h2 className="text-lg font-semibold text-neutral-900">
            {MOCK_EXAM_TEXT.reviewAnswers.en}
            {showChinese ? <span className="ml-2 text-sm font-normal text-neutral-500">{MOCK_EXAM_TEXT.reviewAnswers.zh}</span> : null}
          </h2>
        </div>
        <ul className="divide-y divide-neutral-100">
          {questions.map((question, index) => {
            const state = answers[question.id]
            const isCorrect = state?.selectedChoiceId === question.correctChoiceId
            const expanded = reviewIndex === index
            return (
              <li key={question.id}>
                <button
                  type="button"
                  onClick={() => setReviewIndex(expanded ? null : index)}
                  className="flex w-full items-center justify-between gap-3 px-5 py-3 text-left hover:bg-neutral-50"
                >
                  <span className="flex items-center gap-3">
                    <span
                      className={cn(
                        "flex h-6 w-6 shrink-0 items-center justify-center rounded-full text-xs font-semibold text-white",
                        isCorrect ? "bg-emerald-500" : "bg-red-500",
                      )}
                    >
                      {isCorrect ? "✓" : "✕"}
                    </span>
                    <span className="text-sm text-neutral-800">
                      <span className="block">
                        {index + 1}. {question.question.en}
                      </span>
                      {showChinese ? (
                        <span className="block text-neutral-500">{question.question.zh}</span>
                      ) : null}
                    </span>
                  </span>
                  <span className="text-neutral-400">{expanded ? "▲" : "▼"}</span>
                </button>
                {expanded ? (
                  <div className="bg-neutral-50 px-5 py-3 text-sm">
                    <p className="text-neutral-700">
                      {MOCK_EXAM_TEXT.yourAnswer.en}
                      {showChinese ? ` ${MOCK_EXAM_TEXT.yourAnswer.zh}` : ""}{" "}
                      <span className={isCorrect ? "text-emerald-600" : "text-red-600"}>
                        {choiceText(question, state?.selectedChoiceId ?? null, showChinese)}
                      </span>
                    </p>
                    {!isCorrect ? (
                      <p className="mt-1 text-neutral-700">
                        {MOCK_EXAM_TEXT.correctAnswer.en}
                        {showChinese ? ` ${MOCK_EXAM_TEXT.correctAnswer.zh}` : ""}{" "}
                        <span className="text-emerald-600">
                          {choiceText(question, question.correctChoiceId, showChinese)}
                        </span>
                      </p>
                    ) : null}
                  </div>
                ) : null}
              </li>
            )
          })}
        </ul>
      </div>
    </div>
  )
}
