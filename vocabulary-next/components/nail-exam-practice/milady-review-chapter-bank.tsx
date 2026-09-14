"use client"

import { NailExamBankExperience } from "@/components/nail-exam-practice/bank-experience"
import { MiladyReviewChineseToggle } from "@/components/MiladyReviewChineseToggle"
import { useMiladyReviewPreferences } from "@/contexts/MiladyReviewPreferencesContext"
import { getMiladyReviewChapterBankId } from "@/data/nail-exam-practice/catalog"

export function MiladyReviewChapterBank({
  section,
  chapter,
}: {
  section: "foundations" | "nails"
  chapter: number
}) {
  const { showChinese } = useMiladyReviewPreferences()
  return (
    <NailExamBankExperience
      bankId={getMiladyReviewChapterBankId(section, chapter)}
      showChinese={showChinese}
      chineseToggleInline={<MiladyReviewChineseToggle placement="inline" />}
      chineseToggleFixed={<MiladyReviewChineseToggle />}
    />
  )
}
