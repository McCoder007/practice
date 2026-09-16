"use client"

import { cn } from "@/lib/utils"
import type { MockExamQuestion } from "@/data/milady-mock-exam/loadQuestions"

export function MockExamQuestionPanel({
  question,
  selectedChoiceId,
  showChinese,
  onSelectChoice,
}: {
  question: MockExamQuestion
  selectedChoiceId: string | null
  showChinese: boolean
  onSelectChoice: (choiceId: string) => void
}) {
  return (
    <div data-tutorial="question" className="flex-1 overflow-y-auto bg-white px-6 py-6">
      <div className="mb-6 border-b border-neutral-200 pb-4 text-base text-neutral-900">
        <p>{question.question.en}</p>
        {showChinese ? <p className="mt-1 text-neutral-500">{question.question.zh}</p> : null}
      </div>
      <div className="flex flex-col gap-3 max-w-3xl">
        {question.choices.map((choice, index) => {
          const selected = choice.id === selectedChoiceId
          return (
            <button
              key={choice.id}
              data-tutorial={index === 0 ? "answer-choice" : undefined}
              type="button"
              onClick={() => onSelectChoice(choice.id)}
              className={cn(
                "flex items-start gap-3 rounded-sm px-4 py-3 text-left text-sm transition-colors",
                selected
                  ? "bg-red-600 text-white"
                  : "bg-neutral-200 text-neutral-900 hover:bg-neutral-300",
              )}
            >
              <span className="font-medium">{index + 1}.</span>
              <span className="flex flex-col">
                <span>{choice.en}</span>
                {showChinese ? (
                  <span className={cn("mt-0.5 text-xs", selected ? "text-white/80" : "text-neutral-500")}>
                    {choice.zh}
                  </span>
                ) : null}
              </span>
            </button>
          )
        })}
      </div>
    </div>
  )
}
