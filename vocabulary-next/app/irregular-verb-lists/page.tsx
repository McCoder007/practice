"use client"

import React from 'react'
import { useState } from "react"
import { motion } from "framer-motion"
import { ChevronDown, Volume2, ChevronUp, ChevronLeft } from 'lucide-react'
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { irregularVerbs, IrregularVerb } from "@/data/irregularVerbLists"
import { playText } from '@/lib/tts'
import { useTts } from '@/context/TtsContext'
import { PlayCircleIcon } from '@heroicons/react/24/outline'

// Stage information with titles and descriptions
const stageInfo = [
  { id: 1, title: "Core Verbs", description: "Very important verbs you need every day." },
  { id: 2, title: "Everyday Verbs", description: "Verbs you hear and use often." },
  { id: 3, title: "Action Verbs", description: "Verbs for moving, doing, and playing." },
  { id: 4, title: "Less Common Verbs", description: "Verbs you use sometimes but should know." },
  { id: 5, title: "Master Level Verbs", description: "Special verbs to sound like a native speaker." },
]

export default function IrregularVerbList() {
  // Track which stage is selected; null means show picker
  const [selectedStage, setSelectedStage] = useState<number | null>(null)
  const [expandedVerb, setExpandedVerb] = useState<string>("")
  const { isTtsInitialized } = useTts()

  // Map each stage to its gradient/border color classes
  const cardColors: Record<number, string> = {
    1: 'from-amber-50 to-white border-amber-200 dark:from-amber-950/30 dark:to-slate-800 dark:border-amber-900/50',
    2: 'from-green-50 to-white border-green-200 dark:from-green-950/30 dark:to-slate-800 dark:border-green-900/50',
    3: 'from-blue-50 to-white border-blue-200 dark:from-blue-950/30 dark:to-slate-800 dark:border-blue-900/50',
    4: 'from-purple-50 to-white border-purple-200 dark:from-purple-950/30 dark:to-slate-800 dark:border-purple-900/50',
    5: 'from-pink-50 to-white border-pink-200 dark:from-pink-950/30 dark:to-slate-800 dark:border-pink-900/50',
  }

  // Speak the three forms of the verb using shared helper
  const speakVerbs = (base: string, past: string, participle: string) => {
    if (isTtsInitialized) {
      playText(`${base}, ${past}, ${participle}`)
    } else {
      console.log('TTS not ready yet...')
    }
  }

  const stageVerbs: IrregularVerb[] = selectedStage !== null
    ? irregularVerbs.filter((verb) => verb.stage === selectedStage)
    : []
  const currentStageInfo = stageInfo.find((stage) => stage.id === selectedStage!)

  const handleVerbToggle = (verb: string) => {
    setExpandedVerb(expandedVerb === verb ? "" : verb)
  }

  // If no stage chosen yet, show stage picker
  if (selectedStage === null) {
    return (
      <div className="flex flex-col items-center justify-center bg-white dark:bg-gray-900 py-4 px-2">
        <h1 className="text-3xl font-outfit font-bold mb-6 text-slate-900 dark:text-white">Choose a Stage</h1>
        <div className="space-y-2 w-full max-w-sm mx-auto">
          {stageInfo.map((stage) => {
            const colorClass = cardColors[stage.id] || cardColors[1]
            return (
              <Card
                key={stage.id}
                onClick={() => setSelectedStage(stage.id)}
                className={`cursor-pointer bg-gradient-to-r ${colorClass} rounded-lg shadow-sm hover:shadow-md transition-shadow`}
              >
                <CardContent className="p-2">
                  <h2 className="text-base font-outfit font-bold text-slate-800 dark:text-white">
                    Stage {stage.id}: {stage.title}
                  </h2>
                  <p className="mt-0.5 text-[10px] font-inter text-slate-600 dark:text-slate-300">
                    {stage.description}
                  </p>
                </CardContent>
              </Card>
            )
          })}
        </div>
      </div>
    )
  }

  // Show verbs for selected stage
  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50 to-white dark:from-slate-900 dark:to-slate-800">
      {/* Sticky header banner */}
      <div className="sticky top-0 z-20 bg-gradient-to-b from-blue-50 to-white dark:from-slate-900 dark:to-slate-800 py-4 shadow-sm">
        <div className="container max-w-md mx-auto flex items-center px-4">
          {/* Back arrow */}
          <button onClick={() => setSelectedStage(null)} className="p-2 bg-white dark:bg-slate-900 rounded-full shadow-md">
            <ChevronLeft className="h-6 w-6 text-amber-400 dark:text-amber-300" />
          </button>
          <div className="pl-4">
            <h1 className="text-2xl font-outfit font-bold text-slate-800 dark:text-white">
              Stage {selectedStage}: {currentStageInfo?.title}
            </h1>
            <p className="text-slate-600 dark:text-slate-300 mt-1 font-inter">{currentStageInfo?.description}</p>
          </div>
        </div>
      </div>
      {/* Verb list */}
      <div className="container max-w-md mx-auto px-4 py-6">
        <div className="space-y-3">
          {stageVerbs.map((verb: IrregularVerb, index: number) => (
            <motion.div
              key={verb.base}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.05 }}
            >
              <Card
                className={`overflow-hidden border ${
                  expandedVerb === verb.base
                    ? "border-blue-300 dark:border-blue-700 shadow-md"
                    : "border-gray-200 dark:border-gray-700"
                }`}
              >
                <div
                  className="flex items-center justify-between p-4 cursor-pointer"
                  onClick={() => handleVerbToggle(verb.base)}
                >
                  <div className="flex items-center gap-3">
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8 rounded-full bg-blue-100 dark:bg-blue-900 text-blue-600 dark:text-blue-300"
                      onClick={(e) => {
                        e.stopPropagation()
                        // Play the verb forms
                        speakVerbs(verb.base, verb.past, verb.participle)
                      }}
                      disabled={!isTtsInitialized}
                    >
                      <PlayCircleIcon className="h-4 w-4" />
                    </Button>
                    <div className="font-roboto-mono text-lg tracking-tight">
                      <span>{verb.base}</span>
                      <span className="text-slate-500 dark:text-slate-400"> - </span>
                      <span className="text-amber-600 dark:text-amber-400">{verb.past}</span>
                      <span className="text-slate-500 dark:text-slate-400"> - </span>
                      <span className="text-emerald-600 dark:text-emerald-400">{verb.participle}</span>
                    </div>
                  </div>
                  {expandedVerb === verb.base ? (
                    <ChevronUp className="h-5 w-5 text-slate-400" />
                  ) : (
                    <ChevronDown className="h-5 w-5 text-slate-400" />
                  )}
                </div>

                {expandedVerb === verb.base && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: "auto", opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.3 }}
                  >
                    <CardContent className="bg-blue-50 dark:bg-slate-800 p-4 border-t border-blue-100 dark:border-slate-700">
                      <ul className="space-y-3 pl-4">
                        {verb.examples.map((example: string, i: number) => (
                          <motion.li
                            key={i}
                            initial={{ opacity: 0, x: -10 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: i * 0.1 }}
                            className="text-slate-700 dark:text-slate-300 flex items-start gap-2 font-inter"
                          >
                            <span className="inline-block h-2 w-2 rounded-full bg-blue-400 dark:bg-blue-600 mt-2"></span>
                            <span>{example}</span>
                          </motion.li>
                        ))}
                      </ul>
                    </CardContent>
                  </motion.div>
                )}
              </Card>
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  )
} 