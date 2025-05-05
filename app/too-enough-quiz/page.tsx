'use client'

import React from 'react'
import { QuizV2, QuestionDataV2 } from '@/components/QuizV2'
import tooEnoughQuizData from '@/data/tooEnoughQuizData'

export default function TooEnoughQuizPage() {
  // Add a unique ID to each question if the component needs it (optional, depending on QuizV2 needs)
  // const questionsWithIds = tooEnoughQuizData.map((q, index) => ({ ...q, id: index + 1 }));

  // Use the raw data directly if IDs aren't needed by the component
  const questions = tooEnoughQuizData as QuestionDataV2[]; 

  return (
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
        <QuizV2 questions={questions} />
      </main>
    </div>
  )
} 