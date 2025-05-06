"use client"

import React, { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Volume2 } from 'lucide-react'
import { playText } from '@/lib/tts'
import { shuffleArray } from '@/lib/utils'

export interface QuestionDataV2 {
  lineA: string
  lineB?: string // Make lineB optional
  options: string[]
  correct: string | [string, string] // Allow string or array for correct answers
}

export interface QuizV2Props {
  questions: QuestionDataV2[]
  onRestartRequest?: () => void
}

export function QuizV2({ questions, onRestartRequest }: QuizV2Props) {
  const [currentIndex, setCurrentIndex] = useState(0)
  // State for selections (potentially two)
  const [selection1, setSelection1] = useState<string | null>(null)
  const [selection2, setSelection2] = useState<string | null>(null)
  // State for correctness (potentially two)
  const [isCorrect1, setIsCorrect1] = useState<boolean | null>(null)
  const [isCorrect2, setIsCorrect2] = useState<boolean | null>(null)

  const [score, setScore] = useState(0)
  const [complete, setComplete] = useState(false)
  const [isFirstAttemptCorrect, setIsFirstAttemptCorrect] = useState<boolean | null>(null) // Reuse for single-blank scoring logic
  const [questionScores, setQuestionScores] = useState<boolean[]>([])
  const [randomizedQuestions, setRandomizedQuestions] = useState<QuestionDataV2[]>([])

  const generateRandomizedQuestions = () =>
    shuffleArray(questions)
      // .slice(0, 10) // Keep all questions for now
      .map((q) => ({
        ...q,
        options: shuffleArray(q.options),
      }))

  useEffect(() => {
    setRandomizedQuestions(generateRandomizedQuestions())
    // Reset state when questions change (e.g., on restart)
    setCurrentIndex(0)
    setSelection1(null)
    setSelection2(null)
    setIsCorrect1(null)
    setIsCorrect2(null)
    setScore(0)
    setComplete(false)
    setIsFirstAttemptCorrect(null)
    setQuestionScores([])
  }, [questions]) // Rerun if the base questions prop changes

  const question = randomizedQuestions[currentIndex]
  const total = randomizedQuestions.length

  if (!question) {
    return <div className="p-6 text-center">Loading...</div>
  }

  const isTwoBlank = Array.isArray(question.correct)
  const correct1 = isTwoBlank ? question.correct[0] : question.correct
  const correct2 = isTwoBlank ? question.correct[1] : null

  // Determine if the question is fully answered correctly
  const isFullyCorrect = isTwoBlank ? (isCorrect1 === true && isCorrect2 === true) : isCorrect1 === true

  const handleOption = (opt: string) => {
    if (isFullyCorrect) return // Don't allow changes if fully correct

    if (isTwoBlank) {
      // Two-blank logic
      if (isCorrect1 !== true) {
        // If first blank is not yet correct, apply to first blank
        setSelection1(opt)
        const correct = opt === correct1
        setIsCorrect1(correct)
        // If this makes the first blank correct, clear selection2 for the next input
        if (correct) {
          setSelection2(null)
          setIsCorrect2(null)
        }
      } else if (isCorrect2 !== true) {
        // If first is correct, but second is not, apply to second blank
        setSelection2(opt)
        setIsCorrect2(opt === correct2)
      }
    } else {
      // Single-blank logic
      setSelection1(opt)
      const correct = opt === correct1
      setIsCorrect1(correct)
      // Track first attempt for scoring single-blank questions
      if (isFirstAttemptCorrect === null) {
        setIsFirstAttemptCorrect(correct)
      }
    }
  }

  const handleNext = () => {
    // Score the current question
    // For two-blank, both must be correct. For one-blank, first attempt matters.
    const currentQuestionScore = isTwoBlank ? (isCorrect1 === true && isCorrect2 === true) : (isFirstAttemptCorrect === true)
    const newScores = [...questionScores]
    newScores[currentIndex] = currentQuestionScore
    setQuestionScores(newScores)
    setScore(newScores.filter(Boolean).length)

    // Reset for next question
    setSelection1(null)
    setSelection2(null)
    setIsCorrect1(null)
    setIsCorrect2(null)
    setIsFirstAttemptCorrect(null) // Reset first attempt tracking

    if (currentIndex < total - 1) {
      setCurrentIndex((i) => i + 1)
    } else {
      setComplete(true)
    }
  }

  if (complete) {
    return (
      <div className="flex flex-col items-center p-6 space-y-4">
        <h2 className="text-2xl font-semibold">Practice Complete!</h2>
        <p className="text-lg">Your score: {score} / {total}</p>
        <Button onClick={() => {
          if (onRestartRequest) {
            // If the prop is provided, call it to get new questions
            onRestartRequest();
          } else {
            // Fallback: Original behavior (reshuffle existing questions)
            setScore(0)
            setCurrentIndex(0)
            setComplete(false)
            setSelection1(null)
            setSelection2(null)
            setIsCorrect1(null)
            setIsCorrect2(null)
            setIsFirstAttemptCorrect(null)
            setQuestionScores([])
            setRandomizedQuestions(generateRandomizedQuestions())
          }
        }}>Restart</Button>
      </div>
    )
  }

  // Prepare text for TTS, replacing blanks with current selections or 'blank'
  let speakingA = question.lineA
  if (isTwoBlank) {
    speakingA = speakingA.replace('{{blank}}', selection1 || 'blank')
    speakingA = speakingA.replace('{{blank}}', selection2 || 'blank')
  } else {
    speakingA = speakingA.replace('{{blank}}', selection1 || 'blank')
  }
  // Assuming lineB is not used for this quiz type
  const speakingB = ''

  // Updated render function for potentially two blanks
  const renderLine = (line: string, sel1: string | null, corr1: boolean | null, sel2: string | null, corr2: boolean | null) => {
    const parts = line.split('{{blank}}')
    return (
      <React.Fragment>
        {parts.map((part, idx) => (
          <React.Fragment key={idx}>
            {part}
            {idx === 0 && parts.length > 1 && (
              <span
                className={`inline-block border-b border-gray-700 dark:border-gray-400 min-w-16 px-2 mx-1 text-center rounded-sm ${
                  sel1 !== null
                    ? corr1 === true
                      ? 'bg-green-100 dark:bg-green-900 border-green-500 dark:border-green-700 text-green-800 dark:text-green-200'
                      : 'bg-red-100 dark:bg-red-900 border-red-500 dark:border-red-700 text-red-800 dark:text-red-200'
                    : 'bg-gray-100 dark:bg-gray-700'
                }`}
              >
                {sel1 || '\u00A0'}
              </span>
            )}
            {idx === 1 && parts.length > 2 && (
              <span
                className={`inline-block border-b border-gray-700 dark:border-gray-400 min-w-16 px-2 mx-1 text-center rounded-sm ${
                  sel2 !== null
                    ? corr2 === true
                      ? 'bg-green-100 dark:bg-green-900 border-green-500 dark:border-green-700 text-green-800 dark:text-green-200'
                      : 'bg-red-100 dark:bg-red-900 border-red-500 dark:border-red-700 text-red-800 dark:text-red-200'
                    : 'bg-gray-100 dark:bg-gray-700'
                }`}
              >
                {sel2 || '\u00A0'}
              </span>
            )}
          </React.Fragment>
        ))}
      </React.Fragment>
    )
  }

  return (
    <div className="p-4 md:p-6 space-y-6 max-w-2xl mx-auto">
      {/* Question display */}
      <div className="bg-white dark:bg-slate-800 p-4 rounded-lg shadow-md space-y-3 min-h-[100px]">
        <div className="flex items-center space-x-2">
          <button
            onClick={() => playText(speakingA)}
            aria-label="Read sentence aloud"
            className="p-1.5 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white transition-colors flex-shrink-0"
          >
            <Volume2 className="w-5 h-5" />
          </button>
          <p className="text-lg md:text-xl text-gray-800 dark:text-gray-200 flex-grow">
            {renderLine(question.lineA, selection1, isCorrect1, selection2, isCorrect2)}
          </p>
        </div>
        {/* Only render Line B if it exists and has content - unlikely for this quiz */}
        {question.lineB && (
           <div className="flex items-center space-x-2">
            <button 
              onClick={() => playText(speakingB)} 
              aria-label="Read second sentence aloud"
              className="p-1.5 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white transition-colors flex-shrink-0"
            >
              <Volume2 className="w-5 h-5" />
            </button>
            {/* Assuming lineB would also use the same render logic if needed */}
            <p className="text-lg md:text-xl text-gray-800 dark:text-gray-200 flex-grow">
               {/* {renderLine(question.lineB, selection1, isCorrect1, selection2, isCorrect2)} */}
            </p>
          </div>
        )}
      </div>

      {/* Options */}
      <div className="flex flex-wrap gap-3 justify-center items-center min-h-[52px]">
        {question.options.map((opt) => {
          const isSelected = selection1 === opt || selection2 === opt // Keep track if the option was selected at all
          let isDisabled = false
          let bgClass = 'bg-white dark:bg-slate-700 hover:bg-gray-100 dark:hover:bg-slate-600' // Default neutral

          if (isTwoBlank) {
              // --- Two-Blank Styling --- 
              // Default: neutral
              bgClass = 'bg-white dark:bg-slate-700 hover:bg-gray-100 dark:hover:bg-slate-600';

              // Apply feedback for the first selection if it matches the current button
              if (selection1 === opt && isCorrect1 !== null) {
                  bgClass = isCorrect1 ? 'bg-green-200 dark:bg-green-800' : 'bg-red-200 dark:bg-red-800';
              }
              // Apply feedback for the second selection if it matches the current button (potentially overriding first)
              if (selection2 === opt && isCorrect2 !== null) {
                  bgClass = isCorrect2 ? 'bg-green-200 dark:bg-green-800' : 'bg-red-200 dark:bg-red-800';
              }
              
              // After completion, lock in styles and disable
              if (isFullyCorrect) {
                 isDisabled = true; // Disable all buttons on completion for two-blank
                 if (opt === correct1 || opt === correct2) {
                      bgClass = 'bg-green-200 dark:bg-green-800'; // Correct options stay green
                 } else {
                      bgClass = 'bg-gray-100 dark:bg-slate-700 opacity-50'; // Incorrect options faded
                 }
              }
          } else {
              // --- Single-Blank Styling --- 
              if (selection1 === opt && isCorrect1 !== null) {
                  bgClass = isCorrect1 ? 'bg-green-200 dark:bg-green-800' : 'bg-red-200 dark:bg-red-800';
              }
              // After completion, lock in styles and disable incorrect
              if (isFullyCorrect) { // isFullyCorrect === (isCorrect1 === true) here
                 isDisabled = true; // Disable all buttons on completion for single-blank too
                 if (opt === correct1) {
                     bgClass = 'bg-green-200 dark:bg-green-800';
                  } else {
                    // isDisabled = true; // Already set above
                     bgClass = 'bg-gray-100 dark:bg-slate-700 opacity-50';
                  }
              }
          }

          return (
            <Button
              key={opt}
              variant="outline"
              className={`h-auto py-3 px-4 min-w-[90px] text-base font-medium transition-colors text-gray-800 dark:text-gray-200 border-gray-300 dark:border-slate-600 ${bgClass}`}
              onClick={() => handleOption(opt)}
              disabled={isDisabled} // Use refined isDisabled logic
            >
              {opt}
            </Button>
          )
        })}
      </div>

      {/* Footer controls */}
      <div className="flex justify-between items-center pt-4">
        <span className="text-sm text-gray-600 dark:text-gray-400">Question {currentIndex + 1} of {total}</span>
        <Button 
          disabled={!isFullyCorrect} 
          onClick={handleNext}
          className="min-w-[80px]"
        >
          {currentIndex < total - 1 ? 'Next' : 'Finish'}
        </Button>
      </div>
    </div>
  )
} 