import type { ReactNode } from "react"

import { ExamQuizPreferencesProvider } from "@/contexts/ExamQuizPreferencesContext"
import { MiladyReviewPreferencesProvider } from "@/contexts/MiladyReviewPreferencesContext"
import { OfficialExamQuizPreferencesProvider } from "@/contexts/OfficialExamQuizPreferencesContext"

export default function NailExamPracticeLayout({ children }: { children: ReactNode }) {
  return (
    <ExamQuizPreferencesProvider>
      <OfficialExamQuizPreferencesProvider>
        <MiladyReviewPreferencesProvider>{children}</MiladyReviewPreferencesProvider>
      </OfficialExamQuizPreferencesProvider>
    </ExamQuizPreferencesProvider>
  )
}
