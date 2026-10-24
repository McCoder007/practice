"use client"

import { Volume2 } from "lucide-react"

import { NailExamBankExperience } from "@/components/nail-exam-practice/bank-experience"
import type { BankListHeader } from "@/components/nail-exam-practice/bank-list-menu"
import {
  CleanListBadge,
  CleanListGroup,
  CleanListLinkRow,
  CleanListSection,
  topicBadgeColor,
} from "@/components/nail-exam-practice/clean-list"
import { ExamQuizChineseToggle } from "@/components/ExamQuizChineseToggle"
import { useExamQuizPreferences } from "@/contexts/ExamQuizPreferencesContext"
import { EXAM_TOPICS, getNailExamBank, type NailExamBankId } from "@/data/nail-exam-practice/catalog"
import { topicWordCount } from "@/data/nic-domain-practice/word-reels"

const START_HERE = { en: "Start here", zh: "从这里开始" } as const
const WORD_REEL_TITLE = { en: "Word Reel", zh: "词汇卷轴" } as const

/** A Prov Exam Topics screen (one topic, or the practice test), in the clean-list layout. */
export function ExamTopicBank({
  bankId,
  wordReel,
}: {
  bankId: NailExamBankId
  /** The topic's word reel, if it has one. */
  wordReel?: { topicId: string; href: string }
}) {
  const { showChinese } = useExamQuizPreferences()
  const wordCount = wordReel ? topicWordCount(wordReel.topicId) : 0
  const topic = EXAM_TOPICS.find((entry) => entry.bankId === bankId)

  const header: BankListHeader = topic
    ? {
        // Short English name; the full Chinese name gives Chinese readers the detail.
        title: { en: topic.shortTitle.en, zh: topic.title.zh },
        subtitle: `${topic.examWeightPercent}% of exam`,
        badge: (
          <span
            className={`flex size-11 shrink-0 items-center justify-center rounded-xl text-[22px] font-bold ${topicBadgeColor(topic.order)}`}
            aria-hidden
          >
            {topic.order}
          </span>
        ),
        groupBadges: topic.sets.map((set) => set.setId),
        groupBadgeColor: topicBadgeColor(topic.order),
      }
    : { title: getNailExamBank(bankId).publicName }

  return (
    <NailExamBankExperience
      bankId={bankId}
      showChinese={showChinese}
      shuffleQuestionOrder
      chineseToggleInline={<ExamQuizChineseToggle placement="inline" />}
      chineseToggleFixed={<ExamQuizChineseToggle />}
      listHeader={header}
      topSlot={
        wordReel && wordCount > 0 ? (
          <CleanListSection label={START_HERE} showChinese={showChinese}>
            <CleanListGroup>
              <CleanListLinkRow
                href={wordReel.href}
                badge={
                  <CleanListBadge className="bg-fuchsia-700 text-white">
                    <Volume2 />
                  </CleanListBadge>
                }
                title={WORD_REEL_TITLE}
                showChinese={showChinese}
                trailing={showChinese ? `${wordCount} 个词` : `${wordCount} words`}
              />
            </CleanListGroup>
          </CleanListSection>
        ) : undefined
      }
    />
  )
}
