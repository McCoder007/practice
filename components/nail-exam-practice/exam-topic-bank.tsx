"use client"

import Link from "next/link"
import { GalleryVerticalEnd } from "lucide-react"

import { NailExamBankExperience } from "@/components/nail-exam-practice/bank-experience"
import { ExamQuizChineseToggle } from "@/components/ExamQuizChineseToggle"
import { useExamQuizPreferences } from "@/contexts/ExamQuizPreferencesContext"
import type { NailExamBankId } from "@/data/nail-exam-practice/catalog"
import { topicWordCount } from "@/data/nic-domain-practice/word-reels"

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
  return (
    <NailExamBankExperience
      bankId={bankId}
      showChinese={showChinese}
      shuffleQuestionOrder
      chineseToggleInline={<ExamQuizChineseToggle placement="inline" />}
      chineseToggleFixed={<ExamQuizChineseToggle />}
      topSlot={
        wordReel && wordCount > 0 ? (
          <Link
            href={wordReel.href}
            className="flex items-center gap-4 rounded-3xl bg-gradient-to-br from-fuchsia-500 via-pink-500 to-orange-400 px-5 py-5 text-white shadow-md transition-shadow hover:shadow-lg"
          >
            <span className="flex size-14 shrink-0 items-center justify-center rounded-2xl bg-white/20">
              <GalleryVerticalEnd className="size-8" aria-hidden />
            </span>
            <span className="min-w-0">
              <span className="block text-sm font-semibold tracking-wide uppercase opacity-90">
                Start here{showChinese && " | 从这里开始"}
              </span>
              <span className="block text-2xl leading-tight font-bold">
                Word Reel{showChinese && " | 词汇卷轴"}
              </span>
              <span className="mt-0.5 block text-base opacity-95">
                Learn the {wordCount} key words first, with sound
                {showChinese && <span className="block text-sm">先学 {wordCount} 个关键词（有发音）</span>}
              </span>
            </span>
          </Link>
        ) : undefined
      }
    />
  )
}
