"use client"

import { SectionWordReel } from "@/components/word-reel/section-word-reel"
import nailTechnicianData from "@/data/nailTechnicianReel"
import { sectionsFromDays } from "@/data/word-reel/types"

const TITLE = { en: "Nail Technician", zh: "美甲师", ja: "ネイルテクニシャン" }
const SECTIONS = sectionsFromDays(nailTechnicianData, "nail-technician", TITLE)

export default function NailTechnicianReelPage() {
  return (
    <SectionWordReel
      title={TITLE}
      sections={SECTIONS}
      storageKey="nail-technician-reel"
      backHref="/"
      backTitle={{ en: "Study Zone", zh: "学习区" }}
    />
  )
}
