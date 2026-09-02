"use client"

import { LegacyExamPracticeRedirect } from "@/components/nail-exam-practice/legacy-redirect"
import { NAIL_EXAM_PRACTICE_HREF } from "@/data/nail-exam-practice/catalog"

export default function ExamQuizRedirectPage() {
  return <LegacyExamPracticeRedirect href={NAIL_EXAM_PRACTICE_HREF} />
}
