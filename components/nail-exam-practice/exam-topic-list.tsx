"use client"

import { Shuffle } from "lucide-react"

import { ExamQuizChineseToggle } from "@/components/ExamQuizChineseToggle"
import { NavigationMenu } from "@/components/NavigationMenu"
import {
  CleanListBackLink,
  CleanListBadge,
  CleanListGroup,
  CleanListLinkRow,
  CleanListPage,
  CleanListSection,
  CleanListTitle,
  topicBadgeColor,
} from "@/components/nail-exam-practice/clean-list"
import { useExamQuizPreferences } from "@/contexts/ExamQuizPreferencesContext"
import {
  EXAM_TOPICS,
  EXAM_TOPICS_TITLE,
  LOOK_ALIKE_HREF,
  LOOK_ALIKE_TITLE,
  NAIL_EXAM_PRACTICE_HREF,
  NAIL_EXAM_PRACTICE_TITLE,
} from "@/data/nail-exam-practice/catalog"
import { LOOK_ALIKE_GROUP_COUNT } from "@/data/nic-domain-practice/word-reels"

const SECTIONS = {
  topics: { en: "Topics", zh: "主题" },
  more: { en: "More practice", zh: "更多练习" },
} as const

export function ExamTopicList() {
  const { showChinese } = useExamQuizPreferences()

  return (
    <>
      <NavigationMenu />
      <ExamQuizChineseToggle />
      <CleanListPage>
        <CleanListBackLink href={NAIL_EXAM_PRACTICE_HREF} title={NAIL_EXAM_PRACTICE_TITLE} showChinese={showChinese} />
        <CleanListTitle title={EXAM_TOPICS_TITLE} showChinese={showChinese} />

        <CleanListSection
          label={SECTIONS.topics}
          showChinese={showChinese}
          aside={<span className="text-xs font-semibold text-slate-600 dark:text-slate-300">% of exam</span>}
        >
          <CleanListGroup>
            {EXAM_TOPICS.map((topic) => (
              <CleanListLinkRow
                key={topic.id}
                href={topic.href}
                badge={<CleanListBadge className={topicBadgeColor(topic.order)}>{topic.order}</CleanListBadge>}
                title={topic.shortTitle}
                showChinese={showChinese}
                trailing={`${topic.examWeightPercent}%`}
              />
            ))}
          </CleanListGroup>
        </CleanListSection>

        {LOOK_ALIKE_GROUP_COUNT > 0 && (
          <CleanListSection label={SECTIONS.more} showChinese={showChinese}>
            <CleanListGroup>
              <CleanListLinkRow
                href={LOOK_ALIKE_HREF}
                badge={
                  <CleanListBadge className="bg-sky-700 text-white">
                    <Shuffle />
                  </CleanListBadge>
                }
                title={LOOK_ALIKE_TITLE}
                showChinese={showChinese}
              />
            </CleanListGroup>
          </CleanListSection>
        )}
      </CleanListPage>
    </>
  )
}
