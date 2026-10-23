import { SectionWordReel } from "@/components/word-reel/section-word-reel"
import { NAIL_EXAM_PRACTICE_HREF, NAIL_EXAM_PRACTICE_TITLE } from "@/data/nail-exam-practice/catalog"
import { QUESTION_WORD_SECTIONS, QUESTION_WORDS_TITLE } from "@/data/nail-exam-practice/question-words"

export default function QuestionWordsPage() {
  return (
    <SectionWordReel
      title={QUESTION_WORDS_TITLE}
      sections={QUESTION_WORD_SECTIONS}
      storageKey="exam-question-words"
      backHref={NAIL_EXAM_PRACTICE_HREF}
      backTitle={NAIL_EXAM_PRACTICE_TITLE}
    />
  )
}
