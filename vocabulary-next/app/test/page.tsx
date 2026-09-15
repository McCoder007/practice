"use client"

import { MockExamConsole } from "@/components/milady-mock-exam/exam-console"

export default function MiladyMockExamPage() {
  return (
    <div className="h-screen w-screen overflow-hidden bg-neutral-100">
      <MockExamConsole />
    </div>
  )
}
