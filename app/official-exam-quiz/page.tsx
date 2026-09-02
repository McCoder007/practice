"use client"

import { LegacyExamPracticeRedirect } from "@/components/nail-exam-practice/legacy-redirect"
import { getNailExamBank } from "@/data/nail-exam-practice/catalog"

export default function OfficialExamQuizRedirectPage() {
  return <LegacyExamPracticeRedirect href={getNailExamBank("official").href} />
}
