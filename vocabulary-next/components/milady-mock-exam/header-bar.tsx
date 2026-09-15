"use client"

import { MockExamChineseToggle } from "@/components/milady-mock-exam/chinese-toggle"
import { MOCK_EXAM_TEXT } from "@/lib/milady-mock-exam-i18n"

export function MockExamHeaderBar({
  examId,
  candidateName,
  candidateId,
  showChinese,
  onToggleChinese,
}: {
  examId: string
  candidateName: string
  candidateId: string
  showChinese: boolean
  onToggleChinese: () => void
}) {
  return (
    <div className="flex items-center justify-between border-b border-neutral-200 bg-white px-4 py-2.5">
      <div className="flex items-baseline gap-2">
        <span className="text-lg font-black italic tracking-tight text-neutral-900">
          Pro<span className="text-red-600">✓</span>
        </span>
        <span className="text-sm text-neutral-800">
          {MOCK_EXAM_TEXT.examTitle.en}
          {showChinese ? <span className="ml-1.5 text-neutral-500">{MOCK_EXAM_TEXT.examTitle.zh}</span> : null}
        </span>
        <span className="text-sm text-neutral-500">{examId}</span>
      </div>
      <div className="flex items-center gap-3">
        <MockExamChineseToggle showChinese={showChinese} onToggle={onToggleChinese} />
        <div className="text-right text-sm text-neutral-800">
          <span className="font-medium">{candidateName}</span>{" "}
          <span className="text-neutral-500">{candidateId}</span>
        </div>
      </div>
    </div>
  )
}
