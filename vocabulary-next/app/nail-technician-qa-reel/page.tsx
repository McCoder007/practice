"use client"

import { LegacyExamPracticeRedirect } from "@/components/nail-exam-practice/legacy-redirect"
import { getNailExamBank } from "@/data/nail-exam-practice/catalog"

export default function NailTechnicianQaReelRedirectPage() {
  return <LegacyExamPracticeRedirect href={getNailExamBank("bank-a").href} />
}
