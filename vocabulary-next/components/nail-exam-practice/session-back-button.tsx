"use client"

import { ChevronLeft } from "lucide-react"

import { Button } from "@/components/ui/button"

export function NailExamSessionBackButton({ onBack }: { onBack: () => void }) {
  return (
    <Button
      type="button"
      variant="ghost"
      size="icon"
      className="fixed top-4 left-4 z-50 h-10 w-10 rounded-full border bg-background/80 shadow-lg backdrop-blur-sm hover:bg-accent"
      aria-label="Back to question groups"
      onClick={onBack}
    >
      <ChevronLeft className="h-5 w-5" />
    </Button>
  )
}

export function leaveNailExamSession(onExit: () => void) {
  if (typeof window !== "undefined" && window.history.state?.nailExamScreen) {
    window.history.replaceState(null, "", window.location.href)
  }
  onExit()
}
