import { notFound } from "next/navigation"

import { OriginalSourceViewer } from "@/components/OriginalSourceViewer"
import { PRACTICE_SOURCES } from "@/data/exam-quiz/catalog"

export function generateStaticParams() {
  return PRACTICE_SOURCES.map((source) => ({ sourceId: source.id }))
}

export default async function OriginalSourcePage({
  params,
}: {
  params: Promise<{ sourceId: string }>
}) {
  const { sourceId } = await params
  const source = PRACTICE_SOURCES.find((entry) => entry.id === sourceId)
  if (!source) notFound()
  return <OriginalSourceViewer source={source} />
}
