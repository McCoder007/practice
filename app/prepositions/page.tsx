"use client"

import React, { useState } from 'react'
import { Quiz, QuestionData } from '@/components/Quiz'
import levels, { Level } from '@/data/levels'
import { Button } from '@/components/ui/button'

export default function PrepositionsPage() {
  const [selectedLevel, setSelectedLevel] = useState<Level | null>(null)

  if (!selectedLevel) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen p-6 space-y-6">
        <h1 className="text-2xl font-semibold">Choose a Level</h1>
        <div className="flex space-x-4">
          {levels.map((lvl) => (
            <Button key={lvl.id} onClick={() => setSelectedLevel(lvl)}>
              Level {lvl.id}
            </Button>
          ))}
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white p-4 shadow">
        <Button variant="ghost" onClick={() => setSelectedLevel(null)}>
          ← Back to Levels
        </Button>
        <h2 className="text-xl font-medium text-center">Prepositions Level {selectedLevel.id}</h2>
      </header>
      <Quiz questions={selectedLevel.questions as QuestionData[]} />
    </div>
  )
} 