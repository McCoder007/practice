"use client"

import React, { useState } from 'react'
import { Quiz, QuestionData } from '@/components/Quiz'
import stages, { Stage } from '@/data/irregularVerbs'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'

// Shared stage info
const stageInfo = [
  { id: 1, title: 'Core Verbs', description: 'Very important verbs you need every day.' },
  { id: 2, title: 'Everyday Verbs', description: 'Verbs you hear and use often.' },
  { id: 3, title: 'Action Verbs', description: 'Verbs for moving, doing, and playing.' },
  { id: 4, title: 'Less Common Verbs', description: 'Verbs you use sometimes but should know.' },
  { id: 5, title: 'Master Level Verbs', description: 'Special verbs to sound like a native speaker.' },
]
// Color map per stage
const cardColors: Record<number, string> = {
  1: 'from-amber-50 to-white border-amber-200 dark:from-amber-950/30 dark:to-slate-800 dark:border-amber-900/50',
  2: 'from-green-50 to-white border-green-200 dark:from-green-950/30 dark:to-slate-800 dark:border-green-900/50',
  3: 'from-blue-50 to-white border-blue-200 dark:from-blue-950/30 dark:to-slate-800 dark:border-blue-900/50',
  4: 'from-purple-50 to-white border-purple-200 dark:from-purple-950/30 dark:to-slate-800 dark:border-purple-900/50',
  5: 'from-pink-50 to-white border-pink-200 dark:from-pink-950/30 dark:to-slate-800 dark:border-pink-900/50',
}

export default function IrregularVerbsPage() {
  const [selectedStage, setSelectedStage] = useState<Stage | null>(null)

  if (!selectedStage) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-white dark:bg-gray-900 p-6">
        <h1 className="text-3xl font-outfit font-bold mb-6 text-slate-900 dark:text-white">Choose a Stage</h1>
        <div className="flex flex-col items-center space-y-4 w-full max-w-md mx-auto">
          {stageInfo.map(({ id, title, description }) => {
            const colorClass = cardColors[id] || cardColors[1]
            return (
              <Card
                key={id}
                onClick={() => setSelectedStage(stages.find((s) => s.id === id) || null)}
                className={`w-full cursor-pointer bg-gradient-to-r ${colorClass} border rounded-lg shadow-sm hover:shadow-md transition-shadow p-2`}
              >
                <CardContent className="p-2">
                  <h2 className="text-base font-outfit font-bold text-slate-800 dark:text-white">
                    Stage {id}{title ? `: ${title}` : ''}
                  </h2>
                  <p className="mt-0.5 text-[10px] font-inter text-slate-600 dark:text-slate-300">
                    {description}
                  </p>
                </CardContent>
              </Card>
            )
          })}
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white p-4 shadow">
        <Button variant="ghost" onClick={() => setSelectedStage(null)}>
          ← Back to Stages
        </Button>
        <h2 className="text-xl font-medium text-center">Irregular Verbs Stage {selectedStage.id}</h2>
      </header>
      <Quiz questions={selectedStage.questions as QuestionData[]} />
    </div>
  )
} 