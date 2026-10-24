"use client"

import type { ReactNode } from "react"

import { Check, ClipboardCheck, Shuffle, Trash2 } from "lucide-react"

import {
  CleanListBackLink,
  CleanListBadge,
  CleanListButtonRow,
  CleanListGroup,
  CleanListPage,
  CleanListSection,
  CleanListTitle,
} from "@/components/nail-exam-practice/clean-list"
import type { LocalizedText } from "@/data/exam-quiz/types"
import {
  groupLabel,
  type NailExamBank,
  type NailExamGroupRange,
  type NailExamRandomOption,
  type StudyFormatId,
} from "@/data/nail-exam-practice/catalog"
import { nailExamGroupHistoryId, type NailExamGroupHistory } from "@/lib/nail-exam-practice-history"
import { cn } from "@/lib/utils"

/** Short names for the switch, so it fits next to the section label. */
const FORMAT_SWITCH: readonly { id: StudyFormatId; title: LocalizedText }[] = [
  { id: "multiple-choice", title: { en: "Quiz", zh: "选择题" } },
  { id: "study-cards", title: { en: "Cards", zh: "学习卡" } },
]

const SECTIONS = {
  sets: { en: "Practice sets", zh: "练习" },
  tests: { en: "Choose a test", zh: "选择测试" },
} as const

export type BankListHeader = {
  title: LocalizedText
  /** A short line under the title, e.g. "15% of exam". */
  subtitle?: string
  badge?: ReactNode
  /** One short code per question group, e.g. "2A", shown in the row badge. */
  groupBadges?: readonly string[]
  /** Badge colors for the group rows. */
  groupBadgeColor?: string
}

/**
 * The clean-list version of a bank screen: one row per question group with
 * the best score, one Quiz / Cards switch for all groups, and random tests
 * as rows. Used by the Prov Exam Topics pages.
 */
export function NailExamBankListMenu({
  bank,
  header,
  backHref,
  backTitle,
  groups,
  groupHistory,
  format,
  onFormatChange,
  loading,
  showChinese,
  topSlot,
  onStartGroup,
  onStartRandom,
  onClearHistory,
}: {
  bank: NailExamBank
  header: BankListHeader
  backHref: string
  backTitle: LocalizedText
  groups: readonly NailExamGroupRange[]
  groupHistory: NailExamGroupHistory
  format: StudyFormatId
  onFormatChange: (format: StudyFormatId) => void
  loading: boolean
  showChinese: boolean
  topSlot?: ReactNode
  onStartGroup: (range: NailExamGroupRange) => void
  onStartRandom: (option: NailExamRandomOption) => void
  onClearHistory: () => void
}) {
  const hasGroups = groups.length > 0
  const showRandom = format === "multiple-choice" && bank.randomOptions.length > 0
  const hasHistory = Object.keys(groupHistory).some((key) => key.startsWith(`${bank.id}:`))

  const randomRows = bank.randomOptions.map((option) => (
    <CleanListButtonRow
      key={option.id}
      onClick={() => onStartRandom(option)}
      disabled={loading}
      badge={
        <CleanListBadge
          className={hasGroups ? "bg-emerald-700 text-white" : "bg-violet-700 text-white"}
        >
          {hasGroups ? <Shuffle /> : <ClipboardCheck />}
        </CleanListBadge>
      }
      title={option.title}
      showChinese={showChinese}
      trailing={option.count}
    />
  ))

  return (
    <CleanListPage>
      <CleanListBackLink href={backHref} title={backTitle} showChinese={showChinese} />
      <CleanListTitle title={header.title} subtitle={header.subtitle} badge={header.badge} showChinese={showChinese} />

      {topSlot}

      {hasGroups && (
        <CleanListSection
          label={SECTIONS.sets}
          showChinese={showChinese}
        >
          <div
            role="group"
            aria-label="How to practice"
            className="grid grid-cols-2 gap-1 rounded-xl bg-slate-200 p-1 dark:bg-slate-800"
          >
            {FORMAT_SWITCH.map((option) => {
              const selected = format === option.id
              return (
                <button
                  key={option.id}
                  type="button"
                  aria-pressed={selected}
                  onClick={() => onFormatChange(option.id)}
                  className={cn(
                    "min-h-11 rounded-[9px] px-3 text-[15px] font-bold whitespace-nowrap transition-colors",
                    selected
                      ? "bg-white text-slate-900 shadow-sm dark:bg-slate-600 dark:text-white"
                      : "text-slate-600 hover:text-slate-900 dark:text-slate-300 dark:hover:text-white",
                  )}
                >
                  {option.title.en}
                  {showChinese && (
                    <span className="ml-1.5 font-normal text-slate-500 dark:text-slate-300" lang="zh-Hans">
                      {option.title.zh}
                    </span>
                  )}
                </button>
              )
            })}
          </div>
          <CleanListGroup>
            {groups.map((range, index) => {
              const label = range.label ?? groupLabel(range.start, range.end)
              const entry =
                format === "multiple-choice"
                  ? groupHistory[nailExamGroupHistoryId(bank.id, range.start, range.end)]
                  : undefined
              const perfect = (entry?.perfect ?? 0) > 0
              return (
                <CleanListButtonRow
                  key={range.offset}
                  onClick={() => onStartGroup(range)}
                  disabled={loading}
                  badge={
                    <CleanListBadge
                      className={cn(
                        "text-sm",
                        header.groupBadgeColor ?? "bg-slate-200 text-slate-700 dark:bg-slate-700 dark:text-slate-200",
                      )}
                    >
                      {header.groupBadges?.[index] ?? index + 1}
                    </CleanListBadge>
                  }
                  title={label}
                  showChinese={showChinese}
                  chineseBelow
                  trailing={
                    entry ? (
                      <span
                        className={cn(
                          "flex items-center gap-1 font-semibold",
                          perfect ? "text-emerald-700 dark:text-emerald-400" : "text-slate-600 dark:text-slate-300",
                        )}
                      >
                        {perfect && <Check className="size-4" strokeWidth={3} aria-hidden />}
                        Best {entry.bestScore}/{entry.total}
                      </span>
                    ) : (
                      range.count
                    )
                  }
                />
              )
            })}
          </CleanListGroup>
          {showRandom && <CleanListGroup>{randomRows}</CleanListGroup>}
        </CleanListSection>
      )}

      {!hasGroups && showRandom && (
        <CleanListSection label={SECTIONS.tests} showChinese={showChinese}>
          <CleanListGroup>{randomRows}</CleanListGroup>
        </CleanListSection>
      )}

      {hasHistory && (
        <button
          type="button"
          onClick={onClearHistory}
          className="mt-4 inline-flex min-h-11 items-center gap-1.5 self-center px-3 text-sm font-medium text-slate-600 underline-offset-2 hover:text-rose-700 hover:underline dark:text-slate-300"
        >
          <Trash2 className="size-3.5" aria-hidden />
          Clear my scores
          {showChinese && (
            <span className="ml-1" lang="zh-Hans">
              清除成绩
            </span>
          )}
        </button>
      )}
    </CleanListPage>
  )
}
