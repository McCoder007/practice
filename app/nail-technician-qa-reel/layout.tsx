import type { ReactNode } from "react"

import { ExamQuizPreferencesProvider } from "@/contexts/ExamQuizPreferencesContext"

export default function NailTechnicianQaReelLayout({ children }: { children: ReactNode }) {
  return <ExamQuizPreferencesProvider>{children}</ExamQuizPreferencesProvider>
}
