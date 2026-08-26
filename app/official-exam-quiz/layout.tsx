import type { ReactNode } from "react"

import { OfficialExamQuizPreferencesProvider } from "@/contexts/OfficialExamQuizPreferencesContext"

export default function OfficialExamQuizLayout({ children }: { children: ReactNode }) {
  return (
    <OfficialExamQuizPreferencesProvider>
      {children}
    </OfficialExamQuizPreferencesProvider>
  )
}
