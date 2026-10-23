import { notFound } from "next/navigation"

import { ExamTopicBank } from "@/components/nail-exam-practice/exam-topic-bank"
import { EXAM_TOPICS } from "@/data/nail-exam-practice/catalog"

export function generateStaticParams() {
  return EXAM_TOPICS.map((topic) => ({ topic: topic.id }))
}

export default async function ExamTopicPage({ params }: { params: Promise<{ topic: string }> }) {
  const { topic } = await params
  const match = EXAM_TOPICS.find((entry) => entry.id === topic)
  if (!match) notFound()
  return <ExamTopicBank bankId={match.bankId} />
}
