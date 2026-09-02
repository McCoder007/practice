"use client"

import { NailExamBankExperience } from "@/components/nail-exam-practice/bank-experience"
import { OfficialExamQuizChineseToggle } from "@/components/OfficialExamQuizChineseToggle"
import { useOfficialExamQuizPreferences } from "@/contexts/OfficialExamQuizPreferencesContext"

export default function OfficialPracticeBankPage() {
  const { showChinese } = useOfficialExamQuizPreferences()
  return (
    <NailExamBankExperience
      bankId="official"
      showChinese={showChinese}
      chineseToggleInline={<OfficialExamQuizChineseToggle placement="inline" />}
      chineseToggleFixed={<OfficialExamQuizChineseToggle />}
    />
  )
}
