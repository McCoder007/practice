import { ExamTopicBank } from "@/components/nail-exam-practice/exam-topic-bank"
import { EXAM_TOPICS_PRACTICE_TEST_BANK } from "@/data/nail-exam-practice/catalog"

export default function ExamTopicsPracticeTestPage() {
  return <ExamTopicBank bankId={EXAM_TOPICS_PRACTICE_TEST_BANK.id} />
}
