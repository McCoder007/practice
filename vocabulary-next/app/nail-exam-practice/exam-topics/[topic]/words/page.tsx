import { notFound } from "next/navigation"

import { SectionWordReel } from "@/components/word-reel/section-word-reel"
import { EXAM_TOPICS } from "@/data/nail-exam-practice/catalog"
import { topicReelSections } from "@/data/nic-domain-practice/word-reels"

export function generateStaticParams() {
  return EXAM_TOPICS.map((topic) => ({ topic: topic.id }))
}

export default async function ExamTopicWordsPage({ params }: { params: Promise<{ topic: string }> }) {
  const { topic: topicId } = await params
  const topic = EXAM_TOPICS.find((entry) => entry.id === topicId)
  const sections = topic ? topicReelSections(topic.id) : []
  if (!topic || sections.length === 0) notFound()
  return (
    <SectionWordReel
      // Short form of the topic name, e.g. "Nail Enhancements" (the part before a colon).
      title={{ en: topic.title.en.split(":")[0], zh: `词汇：${topic.title.zh.split("：")[0]}` }}
      sections={sections}
      storageKey={`exam-topic-words-${topic.id}`}
      backHref={topic.href}
      backTitle={topic.title}
    />
  )
}
