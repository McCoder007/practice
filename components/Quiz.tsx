"use client"

import React, { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Volume2 } from 'lucide-react'

export interface QuestionData {
  lineA: string
  lineB: string
  options: string[]
  correct: string
}

export interface QuizProps {
  questions: QuestionData[]
}

export function Quiz({ questions }: QuizProps) {
  const [currentIndex, setCurrentIndex] = useState(0)
  const [selectedOption, setSelectedOption] = useState<string | null>(null)
  const [score, setScore] = useState(0)
  const [complete, setComplete] = useState(false)
  const [hasAnsweredCorrectly, setHasAnsweredCorrectly] = useState(false)
  const [isFirstAttemptCorrect, setIsFirstAttemptCorrect] = useState<boolean | null>(null)
  const [questionScores, setQuestionScores] = useState<boolean[]>([])
  const [randomizedQuestions, setRandomizedQuestions] = useState<QuestionData[]>([])

  // Shuffle questions on component mount
  useEffect(() => {
    const shuffled = [...questions]
    for (let i = shuffled.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1))
      ;[shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]]
    }
    setRandomizedQuestions(shuffled.slice(0, 10))
  }, [questions])

  const question = randomizedQuestions[currentIndex]
  const total = randomizedQuestions.length

  // Show loading state while questions are being randomized
  if (!question) {
    return <div className="p-6 text-center">Loading...</div>
  }

  const handleOption = (opt: string) => {
    if (hasAnsweredCorrectly) return // Don't allow changes if correct answer is already selected
    
    setSelectedOption(opt)
    const correct = opt === question.correct

    // Track if the first attempt was correct
    if (isFirstAttemptCorrect === null) {
      setIsFirstAttemptCorrect(correct)
    }

    if (correct) {
      setHasAnsweredCorrectly(true)
    }
  }

  const handleNext = () => {
    // Determine score for the current question based on the first attempt
    const currentQuestionScore = isFirstAttemptCorrect === true
    const newScores = [...questionScores]
    newScores[currentIndex] = currentQuestionScore
    setQuestionScores(newScores)
    setScore(newScores.filter(Boolean).length)

    // Reset for next question
    setSelectedOption(null)
    setHasAnsweredCorrectly(false)
    setIsFirstAttemptCorrect(null)

    if (currentIndex < total - 1) {
      setCurrentIndex((i) => i + 1)
    } else {
      setComplete(true)
    }
  }

  const playText = (text: string) => {
    // Prefer Google TTS when available, else fallback to browser speech
    if (typeof window !== 'undefined' && (window as any).googleTTS?.speak) {
      (window as any).googleTTS.speak(text)
    } else if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      const utterance = new SpeechSynthesisUtterance(text)
      utterance.lang = 'en-US'
      window.speechSynthesis.speak(utterance)
    }
  }

  if (complete) {
    return (
      <div className="flex flex-col items-center p-6 space-y-4">
        <h2 className="text-2xl font-semibold">Practice Complete!</h2>
        <p className="text-lg">Your score: {score} / {total}</p>
        <Button onClick={() => {
          setScore(0)
          setCurrentIndex(0)
          setComplete(false)
          setSelectedOption(null)
          setHasAnsweredCorrectly(false)
          setIsFirstAttemptCorrect(null)
          setQuestionScores([])
          // Reshuffle questions on restart
          const shuffled = [...questions]
          for (let i = shuffled.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1))
            ;[shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]]
          }
          setRandomizedQuestions(shuffled.slice(0, 10))
        }}>Restart</Button>
      </div>
    )
  }

  // Determine if the current selection is correct for styling
  const isCurrentSelectionCorrect = selectedOption === question.correct

  // display lineA and lineB with blank placeholder
  const partsA = question.lineA.split(/\{\{blank\}\}/)
  const partsB = question.lineB.split(/\{\{blank\}\}/)
  const speakingA = question.lineA.replace(/\{\{blank\}\}/, selectedOption || 'blank')
  const speakingB = question.lineB.replace(/\{\{blank\}\}/, selectedOption || 'blank')

  const renderLine = (parts: string[], selected: string | null, isCorrect: boolean | null) => (
    <React.Fragment>
      {parts.map((part, idx) => (
        <React.Fragment key={idx}>
          {part}
          {idx < parts.length - 1 && (
            <span 
              className={`inline-block border-b border-gray-700 min-w-16 px-2 text-center ${
                selected 
                  ? isCorrect 
                    ? 'bg-green-100 border-green-500' 
                    : 'bg-red-100 border-red-500'
                  : ''
              }`}
            >
              {selected || '\u00A0'}
            </span>
          )}
        </React.Fragment>
      ))}
    </React.Fragment>
  )

  return (
    <div className="p-6 space-y-6 max-w-xl mx-auto">
      {/* Question header */}
      <div className="bg-white p-4 rounded shadow space-y-3">
        <div className="flex items-center space-x-2">
          <button 
            onClick={() => playText(speakingA)} 
            className="p-1.5 rounded-full hover:bg-gray-100 text-gray-600 hover:text-gray-900 transition-colors"
          >
            <Volume2 className="w-5 h-5" />
          </button>
          <p className="text-lg">
            {renderLine(partsA, selectedOption, isCurrentSelectionCorrect)}
          </p>
        </div>
        {/* Only render Line B if it exists */}
        {question.lineB && (
          <div className="flex items-center space-x-2">
            <button 
              onClick={() => playText(speakingB)} 
              className="p-1.5 rounded-full hover:bg-gray-100 text-gray-600 hover:text-gray-900 transition-colors"
            >
              <Volume2 className="w-5 h-5" />
            </button>
            <p className="text-lg">
              {renderLine(partsB, selectedOption, isCurrentSelectionCorrect)}
            </p>
          </div>
        )}
      </div>

      {/* Options */}
      <div className="flex flex-wrap gap-3 justify-center items-center min-h-[48px]">
        {question.options.map((opt) => {
          const isSelected = selectedOption === opt
          const isCorrect = opt === question.correct
          const bgClass = isSelected
            ? (isCorrect ? 'bg-green-200' : 'bg-red-200')
            : 'bg-white hover:bg-gray-100'
          return (
            <button
              key={opt}
              className={`${bgClass} border border-gray-300 rounded-lg px-4 py-3 text-center min-w-[80px] text-base font-medium transition-colors`}
              onClick={() => handleOption(opt)}
              disabled={hasAnsweredCorrectly && !isCorrect}
            >
              {opt}
            </button>
          )
        })}
      </div>

      {/* Footer controls */}
      <div className="flex justify-between items-center">
        <span className="text-sm">Question {currentIndex + 1} of {total}</span>
        <Button disabled={!hasAnsweredCorrectly} onClick={handleNext}>
          {currentIndex < total - 1 ? 'Next' : 'Finish'}
        </Button>
      </div>
    </div>
  )
} 