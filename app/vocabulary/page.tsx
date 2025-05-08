"use client"

import React, { useState, Fragment, useLayoutEffect, useRef } from "react"
import Link from 'next/link'
import { ChevronLeft, ChevronRight, Volume2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { ScrollArea } from "@/components/ui/scroll-area"
import { motion } from "framer-motion"
import vocabularyData from "@/data/vocabulary"
import { playText } from '@/lib/tts'

export default function VocabularyPracticePage() {
  const [currentDay, setCurrentDay] = useState(vocabularyData.length)

  const currentDayData = vocabularyData.find((data) => data.day === currentDay) || vocabularyData[0]

  const handlePreviousDay = () => {
    const newDay = currentDay > 1 ? currentDay - 1 : vocabularyData.length
    setCurrentDay(newDay)
    // reset scroll positions
    if (typeof window !== 'undefined') {
      window.scrollTo(0, 0)
    }
    if (viewportRef.current) {
      viewportRef.current.scrollTo(0, 0)
    }
  }

  const handleNextDay = () => {
    const newDay = currentDay < vocabularyData.length ? currentDay + 1 : 1
    setCurrentDay(newDay)
    // reset scroll positions
    if (typeof window !== 'undefined') {
      window.scrollTo(0, 0)
    }
    if (viewportRef.current) {
      viewportRef.current.scrollTo(0, 0)
    }
  }

  const playAudio = (text: string) => playText(text)

  // ref to the ScrollArea viewport for scrolling
  const viewportRef = useRef<HTMLDivElement>(null)

  // Scroll to top before painting when switching days
  useLayoutEffect(() => {
    if (typeof window !== 'undefined') {
      window.scrollTo({ top: 0, left: 0 })
    }
    if (viewportRef.current) {
      viewportRef.current.scrollTo({ top: 0, left: 0 })
    }
  }, [currentDay])

  // Helper to render each word as clickable, preserving original spaces
  const renderClickableWords = (text: string) =>
    text.split(/(\s+)/).map((token, idx) =>
      token.match(/\s+/)
        ? <Fragment key={idx}>{token}</Fragment>
        : (
            <span
              key={idx}
              onClick={() => playAudio(token)}
              className="cursor-pointer hover:underline"
            >
              {token}
            </span>
          )
    )

  return (
    <div className="flex flex-col min-h-screen bg-blue-50">
      <header className="bg-gradient-to-r from-blue-50 via-blue-100 to-blue-50 p-4 border-b border-blue-200 sticky top-0 z-10">
        <div className="flex items-center justify-center relative mb-3">
          <div className="flex flex-col items-center flex-grow">
            <h1 className="text-xl font-semibold text-gray-800">New Words</h1>
          </div>
        </div>

        <div className="flex items-center justify-center">
           <Button
              variant="ghost"
              size="icon"
              className="text-gray-500 hover:bg-gray-200 rounded-full p-3 h-12 w-12"
              onClick={handlePreviousDay}
              disabled={vocabularyData.length <= 1}
            >
              <ChevronLeft className="h-7 w-7" />
              <span className="sr-only">Previous Day</span>
            </Button>
            <div className="bg-white text-blue-600 px-6 py-1 rounded-full text-sm font-medium shadow-sm mx-4 border border-gray-200">
              Day {currentDay}
            </div>
            <Button
              variant="ghost"
              size="icon"
              className="text-gray-500 hover:bg-gray-200 rounded-full p-3 h-12 w-12"
              onClick={handleNextDay}
              disabled={vocabularyData.length <= 1}
            >
              <ChevronRight className="h-7 w-7" />
              <span className="sr-only">Next Day</span>
            </Button>
        </div>
      </header>

      <ScrollArea key={currentDay} className="flex-1 p-4" viewportRef={viewportRef}>
        <div className="space-y-4 pb-6">
          {currentDayData.words.map((word, index) => (
            <motion.div
              key={word.word}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.05 }}
              layout 
            >
              <Card className="overflow-hidden shadow-sm hover:shadow-md transition-shadow bg-white rounded-lg border border-gray-200">
                <div className="p-4">
                  <div className="flex justify-between items-start mb-3">
                    <div className="flex items-center gap-3">
                      <Button
                        variant="outline"
                        size="icon"
                        className="rounded-full bg-blue-100 hover:bg-blue-200 text-blue-600 border-blue-200 h-9 w-9"
                        onClick={() => playAudio(word.word)}
                      >
                        <Volume2 className="h-4 w-4" />
                        <span className="sr-only">Play pronunciation</span>
                      </Button>
                      <div>
                        <h3 className="text-lg font-semibold text-gray-900">
                          {renderClickableWords(word.word)}
                        </h3>
                        <div className="text-blue-600 text-base mt-1">{word.translation}</div>
                      </div>
                    </div>
                    <span className="text-gray-500 bg-gray-100 px-2.5 py-0.5 rounded-full text-xs font-medium">
                      {word.partOfSpeech}
                    </span>
                  </div>

                  <hr className="border-gray-100 my-3" />

                  <div className="flex items-start gap-3">
                    <Button
                      variant="outline"
                      size="icon"
                      className="rounded-full bg-blue-100 hover:bg-blue-200 text-blue-600 border-blue-200 h-8 w-8 flex-shrink-0 mt-1"
                      onClick={() => playAudio(word.example)}
                    >
                      <Volume2 className="h-4 w-4" />
                      <span className="sr-only">Play example</span>
                    </Button>
                    <div className="flex-grow">
                      <p className="text-gray-800 text-sm mb-2">
                        {renderClickableWords(word.example)}
                      </p>
                      <p className="text-blue-600 text-sm">{word.exampleTranslation}</p>
                    </div>
                  </div>
                </div>
              </Card>
            </motion.div>
          ))}
        </div>
      </ScrollArea>
    </div>
  )
} 