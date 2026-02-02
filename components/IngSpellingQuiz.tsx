"use client"

import React, { useState, useEffect, useCallback } from "react"
import {
  quizWords,
  getOptionsForWord,
  ING_SPELLING_RULES,
  type QuizWord,
} from "@/data/ingSpellingQuiz"
import { shuffleArray } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogTitle,
} from "@/components/ui/dialog"
import { cn } from "@/lib/utils"

const QUESTIONS_PER_SESSION = 10

export function IngSpellingQuiz() {
  const [hintOpen, setHintOpen] = useState(false)
  const [sessionQuestions, setSessionQuestions] = useState<QuizWord[]>([])
  const [currentIndex, setCurrentIndex] = useState(0)
  const [currentOptions, setCurrentOptions] = useState<string[]>([])
  const [selectedAnswer, setSelectedAnswer] = useState<string | null>(null)
  const [hasSelected, setHasSelected] = useState(false)
  const [score, setScore] = useState(0)
  const [questionScores, setQuestionScores] = useState<boolean[]>([])

  const initSession = useCallback(() => {
    const shuffled = shuffleArray([...quizWords]).slice(0, QUESTIONS_PER_SESSION)
    setSessionQuestions(shuffled)
    setCurrentIndex(0)
    setCurrentOptions(shuffled[0] ? getOptionsForWord(shuffled[0]) : [])
    setSelectedAnswer(null)
    setHasSelected(false)
    setScore(0)
    setQuestionScores([])
  }, [])

  useEffect(() => {
    if (sessionQuestions.length === 0) {
      initSession()
    }
  }, [sessionQuestions.length, initSession])

  useEffect(() => {
    if (sessionQuestions.length > 0 && currentIndex < sessionQuestions.length) {
      setCurrentOptions(
        getOptionsForWord(sessionQuestions[currentIndex])
      )
    }
  }, [sessionQuestions, currentIndex])

  const question = sessionQuestions[currentIndex]
  const total = sessionQuestions.length
  const isCorrect = question
    ? selectedAnswer === question.correctAnswer
    : false
  const showCompletion = total > 0 && currentIndex >= total

  const handleOption = (opt: string) => {
    if (hasSelected) return
    setSelectedAnswer(opt)
    setHasSelected(true)
  }

  const handleContinue = () => {
    if (question) {
      const correct = selectedAnswer === question.correctAnswer
      const newScores = [...questionScores]
      newScores[currentIndex] = correct
      setQuestionScores(newScores)
      setScore(newScores.filter(Boolean).length)
    }
    setSelectedAnswer(null)
    setHasSelected(false)
    setCurrentIndex((i) => (i < total - 1 ? i + 1 : total))
  }

  if (sessionQuestions.length === 0) {
    return <p className="text-center text-muted-foreground py-4">Loading quiz...</p>
  }

  return (
    <div className="space-y-6">
      {/* Rule hint pop-up (only pop-up) */}
      <Dialog open={hintOpen} onOpenChange={setHintOpen}>
        <DialogContent className="max-w-md max-h-[85vh] overflow-y-auto">
          <DialogTitle>Spelling rules | 拼写规则</DialogTitle>
          <div className="space-y-4 pt-2">
            {ING_SPELLING_RULES.map((rule, i) => (
              <div key={i} className="space-y-1 text-sm">
                <p className="font-medium text-foreground">{rule.ruleTitle}</p>
                <p className="text-muted-foreground">{rule.ruleTitleChinese}</p>
                <p className="text-foreground">{rule.ruleExplanation}</p>
                <p className="text-muted-foreground">{rule.ruleExplanationChinese}</p>
              </div>
            ))}
          </div>
        </DialogContent>
      </Dialog>

      {showCompletion ? (
        <div className="flex flex-col items-center gap-4 py-4">
          <h2 className="text-xl font-semibold">
            Practice complete! | 练习完成！
          </h2>
          <p className="text-lg">
            Your score: {score} / {total} | 得分：{score} / {total}
          </p>
          <Button
            onClick={initSession}
            className="touch-manipulation"
            variant="outline"
          >
            Restart | 重新开始
          </Button>
        </div>
      ) : question ? (
        <>
          {/* Header: progress + rule hint button */}
          <div className="space-y-2">
            <div className="flex items-start justify-between gap-2">
              <p className="text-sm text-muted-foreground">
                Question {currentIndex + 1} of {total}
              </p>
              <Button
                variant="outline"
                size="sm"
                className="shrink-0 rounded-full text-xs touch-manipulation border-green-300 dark:border-green-700 text-green-800 dark:text-green-200"
                aria-label="Rule hint"
                onClick={() => setHintOpen(true)}
              >
                规则提示
              </Button>
            </div>
            <div
              className="h-2 w-full rounded-full bg-muted overflow-hidden"
              role="progressbar"
              aria-valuenow={currentIndex + 1}
              aria-valuemin={0}
              aria-valuemax={total}
            >
              <div
                className="h-full bg-green-500 transition-[width] duration-300 ease-out rounded-full"
                style={{
                  width: `${total ? ((currentIndex + 1) / total) * 100 : 0}%`,
                }}
              />
            </div>
          </div>

          {/* Question card */}
          <div
            className={cn(
              "rounded-xl border p-4 sm:p-5 space-y-3",
              "bg-green-50 dark:bg-green-950/30 border-green-200 dark:border-green-800"
            )}
          >
            <p className="text-sm text-muted-foreground">
              Write the -ing form: | 写出-ing形式:
            </p>
            <p className="text-2xl sm:text-3xl font-bold text-foreground">
              {question.baseForm}
            </p>
            <p className="text-lg text-muted-foreground">
              {question.chineseTranslation}
            </p>
          </div>

          {/* Answer buttons */}
          <div className="flex flex-col gap-2">
            {currentOptions.map((opt) => {
              const selected = selectedAnswer === opt
              const correct = opt === question.correctAnswer
              const showCorrect = hasSelected && correct
              const showWrong = hasSelected && selected && !correct
              const showNeutral = hasSelected && !selected && !correct
              return (
                <Button
                  key={opt}
                  variant="outline"
                  disabled={hasSelected}
                  onClick={() => handleOption(opt)}
                  className={cn(
                    "w-full justify-center py-3 text-base font-medium touch-manipulation rounded-lg",
                    showWrong &&
                      "bg-red-200 dark:bg-red-900/50 border-red-400 dark:border-red-700 text-red-900 dark:text-red-100",
                    showCorrect &&
                      "bg-green-200 dark:bg-green-900/50 border-green-500 dark:border-green-600 text-green-900 dark:text-green-100",
                    showNeutral &&
                      "bg-muted/60 border-muted-foreground/20 text-muted-foreground opacity-80"
                  )}
                >
                  {opt}
                </Button>
              )
            })}
          </div>

          {/* Feedback card - slide down when hasSelected */}
          {hasSelected && (
            <div
              className={cn(
                "rounded-xl border p-4 space-y-3 animate-in slide-in-from-top-2 duration-300",
                isCorrect
                  ? "border-green-500 dark:border-green-600 bg-green-50/80 dark:bg-green-950/20"
                  : "border-red-500 dark:border-red-600 bg-red-50/80 dark:bg-red-950/20"
              )}
            >
              <p
                className={cn(
                  "font-medium",
                  isCorrect
                    ? "text-green-800 dark:text-green-200"
                    : "text-red-800 dark:text-red-200"
                )}
              >
                {isCorrect ? (
                  <>✓ Correct! 正确！</>
                ) : (
                  <>× Not quite! 再试试!</>
                )}
              </p>
              <div className="space-y-1 text-sm">
                <p className="font-medium text-foreground">
                  {question.ruleTitle}
                </p>
                <p className="text-muted-foreground">
                  {question.ruleTitleChinese}
                </p>
                <p className="text-foreground">
                  {question.ruleExplanation}
                </p>
                <p className="text-muted-foreground">
                  {question.ruleExplanationChinese}
                </p>
              </div>
              <span className="inline-block px-3 py-1 rounded-md bg-green-100 dark:bg-green-900/40 text-green-800 dark:text-green-200 text-sm font-medium">
                {question.baseForm} → {question.correctAnswer}
              </span>
              <Button
                onClick={handleContinue}
                className="w-full touch-manipulation bg-green-600 hover:bg-green-700 text-white"
              >
                继续 Continue
              </Button>
            </div>
          )}
        </>
      ) : null}
    </div>
  )
}
