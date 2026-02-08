"use client"

import React, { useState, useEffect, useCallback } from "react"
import { WordChip } from "./WordChip"
import { cn, isAnswerCorrect, shuffleArray } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Progress } from "@/components/ui/progress"
import { Card, CardContent, CardHeader } from "@/components/ui/card"
import {
    Dialog,
    DialogContent,
    DialogTitle,
} from "@/components/ui/dialog"
import { CheckCircle2, XCircle, ArrowRight, RotateCcw } from "lucide-react"
import { capitalsQuizData, CAPITALIZATION_RULES } from "@/data/capitalsQuiz"
import type { Sentence, WordState } from "@/data/types"

const QUESTIONS_PER_SESSION = 10

export function CapitalsQuiz() {
    const [hintOpen, setHintOpen] = useState(false)
    const [sessionQuestions, setSessionQuestions] = useState<Sentence[]>([])
    const [currentIndex, setCurrentIndex] = useState(0)
    const [selectedIndexes, setSelectedIndexes] = useState<number[]>([])
    const [isChecked, setIsChecked] = useState(false)
    const [words, setWords] = useState<string[]>([])
    const [score, setScore] = useState(0)
    const [questionScores, setQuestionScores] = useState<boolean[]>([])
    const [complete, setComplete] = useState(false)

    const initSession = useCallback(() => {
        const shuffled = shuffleArray([...capitalsQuizData]).slice(0, QUESTIONS_PER_SESSION)
        setSessionQuestions(shuffled)
        setCurrentIndex(0)
        setSelectedIndexes([])
        setIsChecked(false)
        setScore(0)
        setQuestionScores([])
        setComplete(false)
        if (shuffled[0]) {
            setWords(shuffled[0].textIncorrect.split(" "))
        }
    }, [])

    useEffect(() => {
        initSession()
    }, [initSession])

    const sentence = sessionQuestions[currentIndex]
    const total = sessionQuestions.length

    useEffect(() => {
        if (sentence) {
            setWords(sentence.textIncorrect.split(" "))
            setSelectedIndexes([])
            setIsChecked(false)
        }
    }, [sentence])

    const toggleWord = (index: number) => {
        if (isChecked) return

        setSelectedIndexes((prev) => {
            if (prev.includes(index)) {
                return prev.filter((i) => i !== index)
            } else {
                return [...prev, index]
            }
        })
    }

    const handleCheck = () => {
        setIsChecked(true)
    }

    const handleNext = () => {
        const correct = isAnswerCorrect(selectedIndexes, sentence.capitalWordIndexes)
        const newScores = [...questionScores]
        newScores[currentIndex] = correct
        setQuestionScores(newScores)
        setScore(newScores.filter(Boolean).length)

        if (currentIndex < total - 1) {
            setCurrentIndex((prev) => prev + 1)
        } else {
            setComplete(true)
        }
    }

    const getWordState = (index: number): WordState => {
        if (!isChecked) {
            return selectedIndexes.includes(index) ? "selected" : "default"
        }

        const isSelected = selectedIndexes.includes(index)
        const shouldBeCapital = sentence.capitalWordIndexes.includes(index)

        if (isSelected && shouldBeCapital) return "correct"
        if (isSelected && !shouldBeCapital) return "incorrect"
        if (!isSelected && shouldBeCapital) return "missed"
        return "default"
    }

    const isCorrect = isChecked && isAnswerCorrect(selectedIndexes, sentence.capitalWordIndexes)
    const progress = ((currentIndex) / total) * 100

    if (sessionQuestions.length === 0) {
        return <p className="text-center text-muted-foreground py-4">Loading quiz...</p>
    }

    if (complete) {
        return (
            <div className="flex flex-col items-center gap-4 py-8">
                <h2 className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                    Practice complete! | 练习完成！
                </h2>
                <p className="text-xl font-medium">
                    Your score: {score} / {total} | 得分：{score} / {total}
                </p>
                <Button
                    onClick={initSession}
                    className="mt-4 gap-2 px-8"
                    size="lg"
                >
                    <RotateCcw className="w-5 h-5" />
                    Restart | 重新开始
                </Button>
            </div>
        )
    }

    return (
        <div className="w-full max-w-xl mx-auto flex flex-col gap-2.5 p-4">
            {/* Rule hint pop-up */}
            <Dialog open={hintOpen} onOpenChange={setHintOpen}>
                <DialogContent className="max-w-md max-h-[90vh] overflow-y-auto p-4 sm:p-6">
                    <DialogTitle className="text-lg font-bold">Capitalization Rules | 大写规则</DialogTitle>
                    <div className="space-y-1.5 pt-3 border-t">
                        {CAPITALIZATION_RULES.map((rule, i) => (
                            <div key={i} className="flex flex-col bg-slate-50 dark:bg-slate-800/40 px-3 py-1.5 rounded-md border border-slate-100 dark:border-slate-800/60">
                                <p className="font-bold text-xs sm:text-sm text-slate-900 dark:text-slate-100 leading-tight">{rule.ruleTitle}</p>
                                <p className="text-[10px] sm:text-xs text-slate-500 dark:text-slate-400 font-medium leading-tight">{rule.ruleTitleChinese}</p>
                            </div>
                        ))}
                    </div>
                </DialogContent>
            </Dialog>

            <div className="space-y-1.5">
                <div className="flex justify-between items-end text-sm font-medium text-muted-foreground px-1">
                    <div className="flex flex-col">
                        <span className="text-xs">Question {currentIndex + 1} of {total}</span>
                    </div>
                    <Button
                        variant="outline"
                        size="sm"
                        className="shrink-0 rounded-full text-[10px] h-7 px-3 touch-manipulation border-blue-300 dark:border-blue-700 text-blue-800 dark:text-blue-200"
                        aria-label="Rule hint"
                        onClick={() => setHintOpen(true)}
                    >
                        规则提示
                    </Button>
                </div>
                <Progress value={progress} className="h-1.5" />
            </div>

            <Card className="border-2 shadow-sm overflow-hidden bg-white dark:bg-slate-900 font-sans">
                <CardContent className="p-4 sm:p-5 min-h-[140px] flex items-center justify-center">
                    <div className="flex flex-wrap gap-2.5 justify-center content-center">
                        {words.map((word, index) => (
                            <WordChip
                                key={`${sentence.id}-${index}`}
                                text={word}
                                index={index}
                                state={getWordState(index)}
                                onClick={() => toggleWord(index)}
                                disabled={isChecked}
                            />
                        ))}
                    </div>
                </CardContent>

                {isChecked && (
                    <div className={cn(
                        "p-5 sm:p-6 border-t-2 animate-in slide-in-from-bottom-2 duration-300",
                        isCorrect
                            ? "bg-emerald-50 dark:bg-emerald-950/20 border-emerald-100 dark:border-emerald-900/30"
                            : "bg-rose-50 dark:bg-rose-950/20 border-rose-100 dark:border-rose-900/30"
                    )}>
                        <div className="flex items-start gap-3 mb-3">
                            {isCorrect ? (
                                <CheckCircle2 className="w-7 h-7 text-emerald-600 shrink-0 mt-0.5" />
                            ) : (
                                <XCircle className="w-7 h-7 text-rose-600 shrink-0 mt-0.5" />
                            )}
                            <p className={cn(
                                "font-bold text-xl sm:text-2xl",
                                isCorrect ? "text-emerald-900 dark:text-emerald-300" : "text-rose-900 dark:text-rose-300"
                            )}>
                                {isCorrect ? "Correct! 正确！" : "Not quite 不太对"}
                            </p>
                        </div>
                        <div className="ml-10 space-y-1">
                            <p className="text-[10px] font-semibold text-rose-800 dark:text-rose-400 uppercase tracking-wide">
                                Correct Answer | 正确答案:
                            </p>
                            <p className="text-base sm:text-lg font-bold text-slate-900 dark:text-slate-100 leading-tight">
                                {sentence.textCorrect}
                            </p>
                        </div>
                    </div>
                )}
            </Card>

            <div className="flex gap-4">
                {!isChecked ? (
                    <Button
                        onClick={handleCheck}
                        size="lg"
                        className="flex-1 text-base font-semibold h-12 bg-blue-600 hover:bg-blue-700 text-white shadow-sm transition-colors"
                        disabled={selectedIndexes.length === 0}
                    >
                        Check Answer | 检查答案
                    </Button>
                ) : (
                    <Button
                        onClick={handleNext}
                        size="lg"
                        className="flex-1 text-base font-semibold h-12 shadow-sm transition-colors bg-slate-900 dark:bg-slate-100 dark:text-slate-900"
                    >
                        Next | 继续
                        <ArrowRight className="ml-2 w-5 h-5" />
                    </Button>
                )}
            </div>
        </div>
    )
}
