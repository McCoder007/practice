import { LegacyExamPracticeRedirect } from "@/components/nail-exam-practice/legacy-redirect"
import { QUESTION_WORDS_HREF } from "@/data/nail-exam-practice/question-words"

// The old Nail Exam Word Reel's words now live in "How Exam Questions Ask"
// (Words in many questions) and the topic word reels.
export default function NailExamWordReelPage() {
  return <LegacyExamPracticeRedirect href={`${QUESTION_WORDS_HREF}?section=common-words`} />
}
