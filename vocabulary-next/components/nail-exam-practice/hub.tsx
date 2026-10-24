"use client"

import { ClipboardCheck, Layers, Shuffle, TriangleAlert } from "lucide-react"

import { NavigationMenu } from "@/components/NavigationMenu"
import { ExamQuizChineseToggle } from "@/components/ExamQuizChineseToggle"
import {
  CleanListBackLink,
  CleanListBadge,
  CleanListGroup,
  CleanListLinkRow,
  CleanListPage,
  CleanListSection,
  CleanListTitle,
} from "@/components/nail-exam-practice/clean-list"
import {
  EXAM_TOPICS,
  EXAM_TOPICS_HREF,
  EXAM_TOPICS_PRACTICE_TEST_BANK,
  EXAM_TOPICS_TITLE,
  MILADY_REVIEW_CHAPTER_COUNT,
  MILADY_REVIEW_HREF,
  MIXED_PRACTICE,
  NAIL_EXAM_BANKS,
  NAIL_EXAM_PRACTICE_TITLE,
  type NailExamBankId,
} from "@/data/nail-exam-practice/catalog"
import { QUESTION_WORDS_HREF, QUESTION_WORDS_TITLE } from "@/data/nail-exam-practice/question-words"
import type { LocalizedText } from "@/data/exam-quiz/types"
import { useExamQuizPreferences } from "@/contexts/ExamQuizPreferencesContext"

const SECTIONS = {
  study: { en: "Study", zh: "学习" },
  banks: { en: "Previous question banks", zh: "以往题库" },
} as const

/** Short menu names and letter badges for the question banks. */
const BANK_ROWS: Partial<Record<NailExamBankId, { name: LocalizedText; badge: string; color: string }>> = {
  official: {
    name: { en: "Official", zh: "官方" },
    badge: "O",
    color: "bg-violet-100 text-violet-800 dark:bg-violet-950 dark:text-violet-300",
  },
  "bank-a": {
    name: { en: "Bank A", zh: "题库 A" },
    badge: "A",
    color: "bg-rose-100 text-rose-800 dark:bg-rose-950 dark:text-rose-300",
  },
  "bank-b": {
    name: { en: "Bank B", zh: "题库 B" },
    badge: "B",
    color: "bg-cyan-100 text-cyan-800 dark:bg-cyan-950 dark:text-cyan-300",
  },
  "bank-c": {
    name: { en: "Bank C", zh: "题库 C" },
    badge: "C",
    color: "bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300",
  },
  "kelly-nail-school": {
    name: { en: "Kelly Nail School", zh: "Kelly 美甲学校" },
    badge: "K",
    color: "bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300",
  },
}

const MILADY_ROW = {
  name: { en: "Milady Review", zh: "Milady 复习" },
  badge: "M",
  color: "bg-indigo-100 text-indigo-800 dark:bg-indigo-950 dark:text-indigo-300",
} as const

export function NailExamPracticeHub() {
  const { showChinese } = useExamQuizPreferences()
  const practiceTest = EXAM_TOPICS_PRACTICE_TEST_BANK

  return (
    <>
      <NavigationMenu />
      <ExamQuizChineseToggle />
      <CleanListPage>
        <CleanListBackLink href="/" title={{ en: "Study Zone", zh: "学习区" }} showChinese={false} />
        <CleanListTitle title={NAIL_EXAM_PRACTICE_TITLE} showChinese={showChinese} />

        <CleanListSection label={SECTIONS.study} showChinese={showChinese}>
          <CleanListGroup>
            <CleanListLinkRow
              href={EXAM_TOPICS_HREF}
              badge={
                <CleanListBadge className="bg-fuchsia-700 text-white">
                  <Layers />
                </CleanListBadge>
              }
              title={EXAM_TOPICS_TITLE}
              showChinese={showChinese}
              trailing={EXAM_TOPICS.length}
            />
            <CleanListLinkRow
              href={QUESTION_WORDS_HREF}
              badge={
                <CleanListBadge className="bg-orange-700 text-white">
                  <TriangleAlert />
                </CleanListBadge>
              }
              title={QUESTION_WORDS_TITLE}
              showChinese={showChinese}
            />
            <CleanListLinkRow
              href={practiceTest.href}
              badge={
                <CleanListBadge className="bg-violet-700 text-white">
                  <ClipboardCheck />
                </CleanListBadge>
              }
              title={practiceTest.publicName}
              showChinese={showChinese}
              trailing={practiceTest.randomOptions[0]?.count}
            />
          </CleanListGroup>
        </CleanListSection>

        <CleanListSection label={SECTIONS.banks} showChinese={showChinese}>
          <CleanListGroup>
            {NAIL_EXAM_BANKS.map((bank) => {
              const row = BANK_ROWS[bank.id]
              return (
                <CleanListLinkRow
                  key={bank.id}
                  href={bank.href}
                  badge={
                    <CleanListBadge className={row?.color ?? "bg-slate-200 text-slate-700 dark:bg-slate-700 dark:text-slate-200"}>
                      {row?.badge ?? bank.publicName.en.charAt(0)}
                    </CleanListBadge>
                  }
                  title={row?.name ?? bank.publicName}
                  showChinese={showChinese}
                  trailing={bank.approvedCount}
                />
              )
            })}
            <CleanListLinkRow
              href={MILADY_REVIEW_HREF}
              badge={<CleanListBadge className={MILADY_ROW.color}>{MILADY_ROW.badge}</CleanListBadge>}
              title={MILADY_ROW.name}
              showChinese={showChinese}
              trailing={showChinese ? `${MILADY_REVIEW_CHAPTER_COUNT} 章` : `${MILADY_REVIEW_CHAPTER_COUNT} chapters`}
            />
          </CleanListGroup>
        </CleanListSection>

        <CleanListGroup>
          <CleanListLinkRow
            href={MIXED_PRACTICE.href}
            badge={
              <CleanListBadge className="bg-emerald-700 text-white">
                <Shuffle />
              </CleanListBadge>
            }
            title={MIXED_PRACTICE.title}
            showChinese={showChinese}
          />
        </CleanListGroup>
      </CleanListPage>
    </>
  )
}
