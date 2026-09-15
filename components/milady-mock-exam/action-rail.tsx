"use client"

import type { ReactNode } from "react"

import { cn } from "@/lib/utils"
import { MOCK_EXAM_TEXT } from "@/lib/milady-mock-exam-i18n"

type RailButtonProps = {
  labelEn: string
  labelZh: string
  showChinese: boolean
  icon: ReactNode
  active?: boolean
  onClick: () => void
}

function RailButton({ labelEn, labelZh, showChinese, icon, active, onClick }: RailButtonProps) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        "flex flex-col items-center gap-1 border-b border-red-500/40 px-2 py-3 text-center text-xs font-medium text-white transition-colors",
        active ? "bg-black/20" : "hover:bg-black/10",
      )}
    >
      <span className="text-lg leading-none" aria-hidden="true">
        {icon}
      </span>
      <span>
        {labelEn}
        {showChinese ? <span className="block">{labelZh}</span> : null}
      </span>
    </button>
  )
}

export function MockExamActionRail({
  flagged,
  activePanel,
  showChinese,
  onToggleFlag,
  onOpenComment,
  onOpenSummary,
  onOpenCalculator,
  onOpenUnitConverter,
  onBack,
  onNext,
  onEndTest,
  canGoBack,
  canGoNext,
}: {
  flagged: boolean
  activePanel: "none" | "summary" | "comment" | "calculator" | "converter"
  showChinese: boolean
  onToggleFlag: () => void
  onOpenComment: () => void
  onOpenSummary: () => void
  onOpenCalculator: () => void
  onOpenUnitConverter: () => void
  onBack: () => void
  onNext: () => void
  onEndTest: () => void
  canGoBack: boolean
  canGoNext: boolean
}) {
  return (
    <div className="flex w-[170px] shrink-0 flex-col bg-red-600">
      <RailButton
        labelEn={flagged ? MOCK_EXAM_TEXT.unflag.en : MOCK_EXAM_TEXT.flagged.en}
        labelZh={flagged ? MOCK_EXAM_TEXT.unflag.zh : MOCK_EXAM_TEXT.flagged.zh}
        showChinese={showChinese}
        icon="⚑"
        active={flagged}
        onClick={onToggleFlag}
      />
      <RailButton
        labelEn={MOCK_EXAM_TEXT.comment.en}
        labelZh={MOCK_EXAM_TEXT.comment.zh}
        showChinese={showChinese}
        icon="🗩"
        active={activePanel === "comment"}
        onClick={onOpenComment}
      />
      <RailButton
        labelEn={MOCK_EXAM_TEXT.summary.en}
        labelZh={MOCK_EXAM_TEXT.summary.zh}
        showChinese={showChinese}
        icon="🗎"
        active={activePanel === "summary"}
        onClick={onOpenSummary}
      />
      <RailButton
        labelEn={MOCK_EXAM_TEXT.calculator.en}
        labelZh={MOCK_EXAM_TEXT.calculator.zh}
        showChinese={showChinese}
        icon="🖩"
        active={activePanel === "calculator"}
        onClick={onOpenCalculator}
      />
      <RailButton
        labelEn={MOCK_EXAM_TEXT.unitConverter.en}
        labelZh={MOCK_EXAM_TEXT.unitConverter.zh}
        showChinese={showChinese}
        icon="📏"
        active={activePanel === "converter"}
        onClick={onOpenUnitConverter}
      />

      <div className="mt-auto flex flex-col bg-black">
        <div className="grid grid-cols-2 gap-1.5 p-3">
          <button
            type="button"
            onClick={onBack}
            disabled={!canGoBack}
            className="flex flex-col items-center gap-1 rounded-sm bg-neutral-700 py-2 text-center text-sm text-white disabled:opacity-40"
          >
            <span aria-hidden="true">←</span>
            <span>
              {MOCK_EXAM_TEXT.back.en}
              {showChinese ? <span className="block text-xs">{MOCK_EXAM_TEXT.back.zh}</span> : null}
            </span>
          </button>
          <button
            type="button"
            onClick={onNext}
            disabled={!canGoNext}
            className="flex flex-col items-center gap-1 rounded-sm bg-neutral-700 py-2 text-center text-sm text-white disabled:opacity-40"
          >
            <span aria-hidden="true">→</span>
            <span>
              {MOCK_EXAM_TEXT.next.en}
              {showChinese ? <span className="block text-xs">{MOCK_EXAM_TEXT.next.zh}</span> : null}
            </span>
          </button>
        </div>
        <button
          type="button"
          onClick={onEndTest}
          className="mx-3 mb-3 flex items-center justify-center gap-2 rounded-sm bg-neutral-300 py-2.5 text-sm font-medium text-neutral-900 hover:bg-neutral-200"
        >
          <span aria-hidden="true">■</span>
          <span>
            {MOCK_EXAM_TEXT.endTest.en}
            {showChinese ? <span className="ml-1">{MOCK_EXAM_TEXT.endTest.zh}</span> : null}
          </span>
        </button>
      </div>
    </div>
  )
}
