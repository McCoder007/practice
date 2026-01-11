'use client'

import React, { useState, useEffect, useCallback } from 'react'
import { QuizV2, QuestionDataV2 } from '@/components/QuizV2'
import tooEnoughQuizData from '@/data/tooEnoughQuizData'
import { NavigationMenu } from "@/components/NavigationMenu"

// Helper function to shuffle an array (Fisher-Yates/Knuth shuffle)
function shuffleArray<T>(array: T[]): T[] {
  let currentIndex = array.length, randomIndex;

  // While there remain elements to shuffle.
  while (currentIndex !== 0) {

    // Pick a remaining element.
    randomIndex = Math.floor(Math.random() * currentIndex);
    currentIndex--;

    // And swap it with the current element.
    [array[currentIndex], array[randomIndex]] = [
      array[randomIndex], array[currentIndex]];
  }

  return array;
}

export default function TooEnoughQuizPage() {
  const [questions, setQuestions] = useState<QuestionDataV2[]>([]);

  // Function to generate a new set of 5 random questions
  const generateQuizQuestions = useCallback(() => {
    const shuffledData = shuffleArray([...tooEnoughQuizData]);
    setQuestions(shuffledData.slice(0, 5));
  }, []); // useCallback dependency array is empty as it doesn't depend on props or state

  useEffect(() => {
    // Generate questions on initial mount
    generateQuizQuestions();
  }, [generateQuizQuestions]); // useEffect depends on the stable generateQuizQuestions function

  return (
    <>
      <NavigationMenu />
      <div className="min-h-screen bg-gray-50 dark:bg-slate-900">
      {/* Optional: Add a header similar to other quiz pages if desired */}
      <header className="bg-white dark:bg-slate-800 p-4 shadow sticky top-0 z-10">
        <div className="flex items-center justify-center max-w-3xl mx-auto">
          <div className="text-center">
            <h2 className="text-lg font-semibold text-slate-900 dark:text-white">
              Too & Enough Quiz | 太/足够 测验
            </h2>
            <p className="text-xs text-slate-600 dark:text-slate-400 mt-0.5">Practice using too, too much, too many, and enough.</p>
            {/* <p className="text-xs text-slate-500 dark:text-slate-500">练习使用 too, too much, too many, 和 enough。</p> */}
          </div>
        </div>
      </header>
      
      <main className="max-w-3xl mx-auto p-2 sm:p-4">
        {questions.length > 0 ? (
          <QuizV2 questions={questions} onRestartRequest={generateQuizQuestions} />
        ) : (
          <p>Loading quiz...</p>
        )}
      </main>
    </div>
    </>
  )
} 