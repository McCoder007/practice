"use client"

import { useState } from "react"

import { COMMENT_REASONS, MOCK_EXAM_TEXT } from "@/lib/milady-mock-exam-i18n"

export function MockExamCommentPanel({
  initialReason,
  initialText,
  showChinese,
  onSave,
  onClose,
}: {
  initialReason: string | null
  initialText: string | null
  showChinese: boolean
  onSave: (reason: string, text: string) => void
  onClose: () => void
}) {
  const [reason, setReason] = useState(initialReason ?? COMMENT_REASONS[0].en)
  const [text, setText] = useState(initialText ?? "")

  return (
    <div className="absolute inset-0 z-40 flex items-start justify-end bg-black/40 p-6">
      <div className="flex w-full max-w-sm flex-col rounded-md bg-white p-5 shadow-xl">
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-lg font-semibold text-red-600">
            {MOCK_EXAM_TEXT.comment.en}
            {showChinese ? <span className="ml-2 text-sm font-normal text-neutral-500">{MOCK_EXAM_TEXT.comment.zh}</span> : null}
          </h2>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close comment"
            className="text-xl leading-none text-neutral-500 hover:text-neutral-900"
          >
            ×
          </button>
        </div>
        <p className="mb-3 text-sm text-neutral-700">
          {MOCK_EXAM_TEXT.selectReasonForComment.en}
          {showChinese ? <span className="block text-neutral-500">{MOCK_EXAM_TEXT.selectReasonForComment.zh}</span> : null}
        </p>
        <label className="mb-1 text-xs font-medium text-neutral-500">
          {MOCK_EXAM_TEXT.selectCommentType.en}
          {showChinese ? <span className="ml-1">{MOCK_EXAM_TEXT.selectCommentType.zh}</span> : null}
        </label>
        <select
          value={reason}
          onChange={(event) => setReason(event.target.value)}
          className="mb-4 rounded-sm border border-neutral-300 px-3 py-2 text-sm text-neutral-900"
        >
          {COMMENT_REASONS.map((option) => (
            <option key={option.en} value={option.en}>
              {showChinese ? `${option.en} · ${option.zh}` : option.en}
            </option>
          ))}
        </select>
        <textarea
          value={text}
          onChange={(event) => setText(event.target.value)}
          rows={6}
          placeholder={showChinese ? `${MOCK_EXAM_TEXT.addDescription.en} ${MOCK_EXAM_TEXT.addDescription.zh}` : MOCK_EXAM_TEXT.addDescription.en}
          className="mb-4 resize-none rounded-sm border border-neutral-300 px-3 py-2 text-sm text-neutral-900"
        />
        <button
          type="button"
          onClick={() => {
            onSave(reason, text)
            onClose()
          }}
          disabled={reason === COMMENT_REASONS[0].en}
          className="ml-auto rounded-sm bg-red-600 px-4 py-2 text-sm font-medium text-white hover:bg-red-700 disabled:opacity-40"
        >
          {MOCK_EXAM_TEXT.saveComment.en}
          {showChinese ? <span className="ml-1">{MOCK_EXAM_TEXT.saveComment.zh}</span> : null}
        </button>
      </div>
    </div>
  )
}
