import type { ReactNode } from "react"

import { ExamQuizPreferencesProvider } from "@/contexts/ExamQuizPreferencesContext"
import { OfficialExamQuizPreferencesProvider } from "@/contexts/OfficialExamQuizPreferencesContext"

export default function NailExamPracticeLayout({ children }: { children: ReactNode }) {
  return (
    <ExamQuizPreferencesProvider>
      <OfficialExamQuizPreferencesProvider>{children}</OfficialExamQuizPreferencesProvider>
    </ExamQuizPreferencesProvider>
  )
}
