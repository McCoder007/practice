"use client"

import React from 'react'
import { Quiz } from '@/components/Quiz'
import verbTensesData from '@/data/verbTenses'

export default function VerbTensesPage() {
  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white p-4 shadow">
        <h1 className="text-2xl font-semibold text-center">Verb Tenses Practice</h1>
      </header>
      <Quiz questions={verbTensesData} />
    </div>
  )
} 