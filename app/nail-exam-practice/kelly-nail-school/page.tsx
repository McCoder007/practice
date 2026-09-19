"use client"

import { NailExamBankExperience } from "@/components/nail-exam-practice/bank-experience"
import { ExamQuizChineseToggle } from "@/components/ExamQuizChineseToggle"
import { useExamQuizPreferences } from "@/contexts/ExamQuizPreferencesContext"

export default function KellyNailSchoolPage() {
  const { showChinese } = useExamQuizPreferences()
  return (
    <NailExamBankExperience
      bankId="kelly-nail-school"
      showChinese={showChinese}
      chineseToggleInline={<ExamQuizChineseToggle placement="inline" />}
      chineseToggleFixed={<ExamQuizChineseToggle />}
    />
  )
}
