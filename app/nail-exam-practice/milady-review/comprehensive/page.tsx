"use client"

import { NailExamBankExperience } from "@/components/nail-exam-practice/bank-experience"
import { MiladyReviewChineseToggle } from "@/components/MiladyReviewChineseToggle"
import { useMiladyReviewPreferences } from "@/contexts/MiladyReviewPreferencesContext"

export default function MiladyReviewComprehensivePage() {
  const { showChinese } = useMiladyReviewPreferences()
  return (
    <NailExamBankExperience
      bankId="milady-comprehensive"
      showChinese={showChinese}
      chineseToggleInline={<MiladyReviewChineseToggle placement="inline" />}
      chineseToggleFixed={<MiladyReviewChineseToggle />}
    />
  )
}
