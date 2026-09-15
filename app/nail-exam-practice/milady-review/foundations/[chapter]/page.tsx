import { notFound } from "next/navigation"

import { MiladyReviewChapterBank } from "@/components/nail-exam-practice/milady-review-chapter-bank"

const CHAPTER_COUNT = 10

export function generateStaticParams() {
  return Array.from({ length: CHAPTER_COUNT }, (_, index) => ({ chapter: String(index + 1) }))
}

export default async function MiladyReviewFoundationsChapterPage({
  params,
}: {
  params: Promise<{ chapter: string }>
}) {
  const { chapter } = await params
  const chapterNum = Number(chapter)
  if (!Number.isInteger(chapterNum) || chapterNum < 1 || chapterNum > CHAPTER_COUNT) {
    notFound()
  }
  return <MiladyReviewChapterBank section="foundations" chapter={chapterNum} />
}
