"use client"

import React, { useState, useEffect } from 'react'
import { Quiz, QuestionData } from '@/components/Quiz'
import stages, { Stage } from '@/data/irregularVerbs'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'

// Shared stage info
const stageInfo = [
  { id: 1, title: 'Core Verbs', titleChinese: '核心动词', description: 'Very important verbs you need every day.', descriptionChinese: '每天都需要的重要动词。' },
  { id: 2, title: 'Everyday Verbs', titleChinese: '日常动词', description: 'Verbs you hear and use often.', descriptionChinese: '经常听到和使用的动词。' },
  { id: 3, title: 'Action Verbs', titleChinese: '动作动词', description: 'Verbs for moving, doing, and playing.', descriptionChinese: '用于移动、做和玩的动词。' },
  { id: 4, title: 'Less Common Verbs', titleChinese: '不常用动词', description: 'Verbs you use sometimes but should know.', descriptionChinese: '有时使用但应该知道的动词。' },
  { id: 5, title: 'Master Level Verbs', titleChinese: '大师级动词', description: 'Special verbs to sound like a native speaker.', descriptionChinese: '像母语者一样说话的特殊动词。' },
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
  // Flag to prevent duplicated history entries
  const [isNavigatingProgrammatically, setIsNavigatingProgrammatically] = useState(false)

  // Handle browser history
  useEffect(() => {
    // Handler for browser navigation events (back/forward buttons)
    const handlePopState = (event: PopStateEvent) => {
      // Set flag to prevent duplicate history entries
      setIsNavigatingProgrammatically(true)
      
      // If state exists and has a stageId, update the selected stage
      if (event.state && typeof event.state.stageId !== 'undefined') {
        const stageId = event.state.stageId;
        setSelectedStage(stageId ? stages.find((s) => s.id === stageId) || null : null);
      } else {
        // If no state or no stageId, go back to the stage selection
        setSelectedStage(null);
      }
      
      // Reset flag after navigation is complete
      setTimeout(() => setIsNavigatingProgrammatically(false), 0);
    };

    // Add event listener for popstate
    window.addEventListener('popstate', handlePopState);
    
    // Clean up
    return () => {
      window.removeEventListener('popstate', handlePopState);
    };
  }, []);

  // Update history when stage selection changes
  useEffect(() => {
    // Skip if we're already handling programmatic navigation
    if (isNavigatingProgrammatically) return;
    
    // If a stage is selected, update history state and URL
    if (selectedStage !== null) {
      const currentStageInfo = stageInfo.find(stage => stage.id === selectedStage.id);
      // Push new state to history
      window.history.pushState(
        { stageId: selectedStage.id }, // State object with stageId
        `${currentStageInfo?.title || 'Irregular Verbs'} | Quiz`, // Title
        `#stage-${selectedStage.id}` // URL hash
      );
    }
  }, [selectedStage, isNavigatingProgrammatically]);

  if (!selectedStage) {
    return (
      <div className="flex flex-col items-center min-h-screen bg-white dark:bg-gray-900 p-6">
        <h1 className="text-3xl font-outfit font-bold mb-6 text-slate-900 dark:text-white">Please choose</h1>
        <div className="flex flex-col items-center space-y-4 w-full max-w-md mx-auto">
          {stageInfo.map(({ id, title, titleChinese, description, descriptionChinese }) => {
            const colorClass = cardColors[id] || cardColors[1]
            return (
              <Card
                key={id}
                onClick={() => setSelectedStage(stages.find((s) => s.id === id) || null)}
                className={`w-full cursor-pointer bg-gradient-to-r ${colorClass} border rounded-lg shadow-sm hover:shadow-md transition-shadow p-2 py-0`}
              >
                <CardContent className="p-2">
                  <h2 className="text-lg font-outfit font-bold text-slate-800 dark:text-white">
                    {title} | {titleChinese}
                  </h2>
                  <p className="mt-0.5 text-xs font-inter text-slate-600 dark:text-slate-300">
                    {description}
                  </p>
                  <p className="mt-0.5 text-xs font-inter text-slate-500 dark:text-slate-400">
                    {descriptionChinese}
                  </p>
                </CardContent>
              </Card>
            )
          })}
        </div>
      </div>
    )
  }

  const currentStageInfo = stageInfo.find((stage) => stage.id === selectedStage?.id)

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-slate-900">
      <header className="bg-white dark:bg-slate-800 p-4 shadow sticky top-0 z-10">
        <div className="flex items-center justify-center max-w-3xl mx-auto">
          <div className="text-center">
            <h2 className="text-lg font-semibold text-slate-900 dark:text-white">
              {currentStageInfo?.title} | {currentStageInfo?.titleChinese}
            </h2>
            <p className="text-xs text-slate-600 dark:text-slate-400 mt-0.5">{currentStageInfo?.description}</p>
            <p className="text-xs text-slate-500 dark:text-slate-500">{currentStageInfo?.descriptionChinese}</p>
          </div>
        </div>
      </header>
      <main className="max-w-3xl mx-auto p-4">
        <Quiz questions={selectedStage.questions as QuestionData[]} />
      </main>
    </div>
  )
} 