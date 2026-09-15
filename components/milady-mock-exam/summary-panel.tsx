"use client"

import type { MockExamQuestion } from "@/data/milady-mock-exam/loadQuestions"
import type { MockExamAnswers } from "@/lib/milady-mock-exam"
import { MOCK_EXAM_TEXT } from "@/lib/milady-mock-exam-i18n"

export function MockExamSummaryPanel({
  questions,
  answers,
  showChinese,
  onJumpTo,
  onClose,
}: {
  questions: MockExamQuestion[]
  answers: MockExamAnswers
  showChinese: boolean
  onJumpTo: (index: number) => void
  onClose: () => void
}) {
  return (
    <div className="absolute inset-0 z-40 flex items-start justify-center bg-black/40 p-6">
      <div className="flex max-h-full w-full max-w-2xl flex-col overflow-hidden rounded-md bg-white shadow-xl">
        <div className="flex items-center justify-between border-b border-neutral-200 px-5 py-4">
          <h2 className="text-lg font-semibold text-red-600">
            {MOCK_EXAM_TEXT.questionSummary.en}
            {showChinese ? <span className="ml-2 text-sm font-normal text-neutral-500">{MOCK_EXAM_TEXT.questionSummary.zh}</span> : null}
          </h2>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close summary"
            className="text-xl leading-none text-neutral-500 hover:text-neutral-900"
          >
            ×
          </button>
        </div>
        <div className="overflow-y-auto">
          <table className="w-full table-fixed text-left text-sm">
            <colgroup>
              <col className="w-14" />
              <col />
              <col className="w-28" />
              <col className="w-24" />
              <col className="w-24" />
            </colgroup>
            <thead className="sticky top-0 bg-white text-neutral-500">
              <tr className="border-b border-neutral-200">
                <th className="px-4 py-2.5 font-normal">
                  {MOCK_EXAM_TEXT.no.en}
                  {showChinese ? <span className="block text-xs">{MOCK_EXAM_TEXT.no.zh}</span> : null}
                </th>
                <th className="px-4 py-2.5 font-normal">
                  {MOCK_EXAM_TEXT.questionCol.en}
                  {showChinese ? <span className="block text-xs">{MOCK_EXAM_TEXT.questionCol.zh}</span> : null}
                </th>
                <th className="px-4 py-2.5 font-normal">
                  {MOCK_EXAM_TEXT.answeredCol.en}
                  {showChinese ? <span className="block text-xs">{MOCK_EXAM_TEXT.answeredCol.zh}</span> : null}
                </th>
                <th className="px-4 py-2.5 font-normal">
                  {MOCK_EXAM_TEXT.flaggedCol.en}
                  {showChinese ? <span className="block text-xs">{MOCK_EXAM_TEXT.flaggedCol.zh}</span> : null}
                </th>
                <th className="px-4 py-2.5 font-normal">
                  {MOCK_EXAM_TEXT.comment.en}
                  {showChinese ? <span className="block text-xs">{MOCK_EXAM_TEXT.comment.zh}</span> : null}
                </th>
              </tr>
            </thead>
            <tbody>
              {questions.map((question, index) => {
                const state = answers[question.id]
                return (
                  <tr
                    key={question.id}
                    onClick={() => onJumpTo(index)}
                    className="cursor-pointer border-b border-neutral-100 hover:bg-neutral-50"
                  >
                    <td className="px-4 py-3 align-middle text-neutral-700">{index + 1}</td>
                    <td className="max-w-0 px-4 py-3 align-middle text-neutral-700">
                      <span className="block truncate">{question.question.en}</span>
                      {showChinese ? (
                        <span className="block truncate text-xs text-neutral-500">{question.question.zh}</span>
                      ) : null}
                    </td>
                    <td className="px-4 py-3 align-middle">
                      <span
                        className={
                          state?.selectedChoiceId
                            ? "flex h-9 w-16 items-center justify-center rounded-md bg-green-500 text-base font-semibold text-white"
                            : "flex h-9 w-16 items-center justify-center rounded-md bg-cyan-400 text-base font-semibold text-white"
                        }
                      >
                        {state?.selectedChoiceId ? "✓" : "–"}
                      </span>
                    </td>
                    <td className="px-4 py-3 align-middle text-2xl leading-none text-red-600">{state?.flagged ? "⚑" : ""}</td>
                    <td className="px-4 py-3 align-middle text-2xl leading-none text-red-600">{state?.comment ? "🗩" : ""}</td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
