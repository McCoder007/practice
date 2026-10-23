"use client"

import { SectionWordReel } from "@/components/word-reel/section-word-reel"
import { NAIL_EXAM_PRACTICE_HREF, NAIL_EXAM_PRACTICE_TITLE } from "@/data/nail-exam-practice/catalog"
import nailExamWordData from "@/data/nailExamWordReel"
import { sectionsFromDays } from "@/data/word-reel/types"

const TITLE = { en: "Nail Exam Word Reel", zh: "美甲考试词汇卷轴" }
const SECTIONS = sectionsFromDays(nailExamWordData, "nail-exam-word", TITLE)

export default function NailExamWordReelPage() {
  return (
    <SectionWordReel
      title={TITLE}
      sections={SECTIONS}
      storageKey="nail-exam-word-reel"
      backHref={NAIL_EXAM_PRACTICE_HREF}
      backTitle={NAIL_EXAM_PRACTICE_TITLE}
    />
  )
}
