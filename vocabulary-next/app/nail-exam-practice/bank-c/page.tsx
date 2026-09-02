"use client"

import { NailExamBankExperience } from "@/components/nail-exam-practice/bank-experience"
import { ExamQuizChineseToggle } from "@/components/ExamQuizChineseToggle"
import { useExamQuizPreferences } from "@/contexts/ExamQuizPreferencesContext"

export default function PracticeBankCPage() {
  const { showChinese } = useExamQuizPreferences()
  return (
    <NailExamBankExperience
      bankId="bank-c"
      showChinese={showChinese}
      chineseToggleInline={<ExamQuizChineseToggle placement="inline" />}
      chineseToggleFixed={<ExamQuizChineseToggle />}
    />
  )
}
