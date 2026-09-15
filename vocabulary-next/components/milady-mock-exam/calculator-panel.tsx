"use client"

import { MOCK_EXAM_TEXT } from "@/lib/milady-mock-exam-i18n"

const TOP_ROW = ["MC", "MR", "M+", "M-", "MS"]
const NUMPAD_ROWS = [
  ["7", "8", "9", "÷", "DEL"],
  ["4", "5", "6", "×", "C"],
  ["1", "2", "3", "-", ""],
  [".", "0", "", "+", "="],
]

export function MockExamCalculatorPanel({ showChinese, onClose }: { showChinese: boolean; onClose: () => void }) {
  return (
    <div className="absolute right-6 top-20 z-40 w-64 rounded-md bg-white p-4 shadow-2xl">
      <div className="mb-3 flex items-center justify-between">
        <h2 className="text-base font-semibold text-neutral-900">
          {MOCK_EXAM_TEXT.calculator.en}
          {showChinese ? <span className="ml-1.5 text-sm font-normal text-neutral-500">{MOCK_EXAM_TEXT.calculator.zh}</span> : null}
        </h2>
        <button
          type="button"
          onClick={onClose}
          aria-label="Close calculator"
          className="text-lg leading-none text-neutral-500 hover:text-neutral-900"
        >
          ×
        </button>
      </div>
      <div className="mb-2 rounded-sm bg-neutral-100 px-3 py-3 text-right text-2xl text-neutral-900">0</div>
      <div className="grid grid-cols-5 gap-1 text-sm">
        {TOP_ROW.map((key) => (
          <button
            key={key}
            type="button"
            tabIndex={-1}
            className="rounded-sm bg-neutral-100 py-2 text-neutral-500"
          >
            {key}
          </button>
        ))}
      </div>
      <div className="mt-1 grid grid-cols-5 gap-1 text-sm">
        {NUMPAD_ROWS.flat().map((key, index) => (
          <button
            key={`${key || "blank"}-${index}`}
            type="button"
            tabIndex={-1}
            disabled={key === ""}
            className="rounded-sm bg-neutral-100 py-2 text-neutral-700 disabled:opacity-0"
          >
            {key}
          </button>
        ))}
      </div>
      <p className="mt-3 text-center text-xs text-neutral-400">
        {MOCK_EXAM_TEXT.displayOnlyPractice.en}
        {showChinese ? <span className="block">{MOCK_EXAM_TEXT.displayOnlyPractice.zh}</span> : null}
      </p>
    </div>
  )
}
