"use client"

import { NailExamBankExperience } from "@/components/nail-exam-practice/bank-experience"
import { ExamQuizChineseToggle } from "@/components/ExamQuizChineseToggle"
import { useExamQuizPreferences } from "@/contexts/ExamQuizPreferencesContext"
import type { NailExamBankId } from "@/data/nail-exam-practice/catalog"

export function ExamTopicBank({ bankId }: { bankId: NailExamBankId }) {
  const { showChinese } = useExamQuizPreferences()
  return (
    <NailExamBankExperience
      bankId={bankId}
      showChinese={showChinese}
      chineseToggleInline={<ExamQuizChineseToggle placement="inline" />}
      chineseToggleFixed={<ExamQuizChineseToggle />}
    />
  )
}
