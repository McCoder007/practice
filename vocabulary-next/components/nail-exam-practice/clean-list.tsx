"use client"

import type { ReactNode } from "react"

import Link from "next/link"
import { ChevronLeft, ChevronRight } from "lucide-react"

import type { LocalizedText } from "@/data/exam-quiz/types"
import { cn } from "@/lib/utils"

/**
 * Building blocks for the Nail Exam Practice menus: grouped lists with one
 * short line per row and no descriptions, so a level-2 ESL learner has less
 * to read. Chinese shows next to the English only when the ZH toggle is on.
 */

/** Badge colors for the 8 exam topics, in exam order. */
export const TOPIC_BADGE_COLORS = [
  "bg-blue-100 text-blue-700 dark:bg-blue-950 dark:text-blue-300",
  "bg-pink-100 text-pink-700 dark:bg-pink-950 dark:text-pink-300",
  "bg-violet-100 text-violet-700 dark:bg-violet-950 dark:text-violet-300",
  "bg-sky-100 text-sky-700 dark:bg-sky-950 dark:text-sky-300",
  "bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300",
  "bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300",
  "bg-rose-100 text-rose-700 dark:bg-rose-950 dark:text-rose-300",
  "bg-slate-200 text-slate-700 dark:bg-slate-700 dark:text-slate-200",
] as const

export function topicBadgeColor(order: number): string {
  return TOPIC_BADGE_COLORS[(order - 1 + TOPIC_BADGE_COLORS.length) % TOPIC_BADGE_COLORS.length]
}

export function CleanListPage({ children }: { children: ReactNode }) {
  return (
    <div className="min-h-screen bg-slate-100 px-4 pb-10 pt-20 dark:bg-slate-900">
      <div className="mx-auto flex w-full max-w-md flex-col gap-3.5">{children}</div>
    </div>
  )
}

export function CleanListBackLink({
  href,
  title,
  showChinese,
}: {
  href: string
  title: LocalizedText
  showChinese: boolean
}) {
  return (
    <Link
      href={href}
      className="-ml-1.5 flex min-h-11 items-center gap-0.5 self-start text-base font-medium text-slate-600 hover:text-slate-900 dark:text-slate-300 dark:hover:text-white"
    >
      <ChevronLeft className="size-5" aria-hidden />
      {title.en}
      {showChinese && (
        <span className="ml-1.5" lang="zh-Hans">
          {title.zh}
        </span>
      )}
    </Link>
  )
}

export function CleanListTitle({
  title,
  subtitle,
  showChinese,
  badge,
}: {
  title: LocalizedText
  /** A short line under the title, e.g. "15% of exam". */
  subtitle?: string
  showChinese: boolean
  badge?: ReactNode
}) {
  const secondLine = [showChinese ? title.zh : null, subtitle].filter(Boolean).join(" · ")
  return (
    <div className="flex items-center gap-3">
      {badge}
      <div className="min-w-0">
        <h1 className="text-3xl leading-tight font-bold text-slate-900 dark:text-white">{title.en}</h1>
        {secondLine && (
          <p className="mt-0.5 text-[15px] text-slate-600 dark:text-slate-300" lang={showChinese ? "zh-Hans" : undefined}>
            {secondLine}
          </p>
        )}
      </div>
    </div>
  )
}

export function CleanListSection({
  label,
  showChinese,
  aside,
  children,
}: {
  label: LocalizedText
  showChinese: boolean
  /** Shown at the right end of the section label (e.g. a switch, or "% of exam"). */
  aside?: ReactNode
  children: ReactNode
}) {
  return (
    <section className="mt-1 flex flex-col gap-1.5">
      <div className="flex min-h-6 items-center justify-between gap-3 px-1">
        <h2 className="text-[13px] font-semibold text-slate-600 dark:text-slate-300">
          {label.en}
          {showChinese && (
            <span className="ml-1.5" lang="zh-Hans">
              {label.zh}
            </span>
          )}
        </h2>
        {aside}
      </div>
      {children}
    </section>
  )
}

/** A white rounded box holding rows, with thin lines between them. */
export function CleanListGroup({ children }: { children: ReactNode }) {
  return (
    <div className="flex flex-col divide-y divide-slate-100 rounded-[18px] bg-white px-3.5 shadow-xs dark:divide-slate-700/70 dark:bg-slate-800">
      {children}
    </div>
  )
}

export function CleanListBadge({ className, children }: { className: string; children: ReactNode }) {
  return (
    <span
      className={cn(
        "flex size-8 shrink-0 items-center justify-center rounded-[9px] text-[15px] font-bold [&_svg]:size-5",
        className,
      )}
      aria-hidden
    >
      {children}
    </span>
  )
}

type RowContentProps = {
  badge: ReactNode
  title: LocalizedText
  showChinese: boolean
  /** Chinese on its own line under the English (for long titles). */
  chineseBelow?: boolean
  trailing?: ReactNode
}

function RowContent({ badge, title, showChinese, chineseBelow, trailing }: RowContentProps) {
  return (
    <>
      {badge}
      <span className="min-w-0 flex-1 text-base leading-snug font-semibold text-slate-900 dark:text-white">
        {title.en}
        {showChinese && (
          <span
            className={cn(
              "text-sm font-normal text-slate-500 dark:text-slate-400",
              chineseBelow ? "block" : "ml-1.5 inline-block whitespace-nowrap",
            )}
            lang="zh-Hans"
          >
            {title.zh}
          </span>
        )}
      </span>
      {trailing !== undefined && (
        <span className="shrink-0 text-sm whitespace-nowrap text-slate-500 dark:text-slate-400">{trailing}</span>
      )}
      <ChevronRight className="size-5 shrink-0 text-slate-400 dark:text-slate-500" aria-hidden />
    </>
  )
}

const ROW_CLASS =
  "flex min-h-[52px] w-full items-center gap-3 py-2 text-left transition-colors hover:text-fuchsia-700 disabled:opacity-60"

export function CleanListLinkRow({ href, ...content }: RowContentProps & { href: string }) {
  return (
    <Link href={href} className={ROW_CLASS}>
      <RowContent {...content} />
    </Link>
  )
}

export function CleanListButtonRow({
  onClick,
  disabled,
  ...content
}: RowContentProps & { onClick: () => void; disabled?: boolean }) {
  return (
    <button type="button" onClick={onClick} disabled={disabled} className={ROW_CLASS}>
      <RowContent {...content} />
    </button>
  )
}
