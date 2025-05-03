"use client"

import { useState } from "react"
import { ChevronLeft, ChevronRight, Volume2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { ScrollArea } from "@/components/ui/scroll-area"
import { motion } from "framer-motion"
import vocabularyData from "@/data/vocabulary"
import { playText } from '@/lib/tts'

export default function VocabularyPracticePage() {
  const [currentDay, setCurrentDay] = useState(1)

  const currentDayData = vocabularyData.find((data) => data.day === currentDay) || vocabularyData[0]

  const handlePreviousDay = () => {
    if (currentDay > 1) {
      setCurrentDay(currentDay - 1)
    } else {
      setCurrentDay(vocabularyData.length)
    }
  }

  const handleNextDay = () => {
    if (currentDay < vocabularyData.length) {
      setCurrentDay(currentDay + 1)
    } else {
      setCurrentDay(1)
    }
  }

  const playAudio = (text: string) => playText(text)

  return (
    <div className="flex flex-col min-h-screen bg-gray-50">
      <header className="bg-gradient-to-r from-violet-500 to-purple-600 text-white p-4 sticky top-0 z-10">
        <div className="flex items-center justify-between mb-2">
          <Button
            variant="ghost"
            size="icon"
            className="text-white hover:bg-white/20"
            onClick={handlePreviousDay}
          >
            <ChevronLeft className="h-6 w-6" />
            <span className="sr-only">Previous Day</span>
          </Button>
          <h1 className="text-xl font-semibold">New Words</h1>
          <Button
            variant="ghost"
            size="icon"
            className="text-white hover:bg-white/20"
            onClick={handleNextDay}
          >
            <ChevronRight className="h-6 w-6" />
            <span className="sr-only">Next Day</span>
          </Button>
        </div>
        <div className="flex justify-center">
          <div className="bg-white/20 text-white px-4 py-1 rounded-full text-sm font-medium">
            Day {currentDay}
          </div>
        </div>
      </header>

      <ScrollArea className="flex-1 p-4">
        <div className="space-y-6 pb-6">
          {currentDayData.words.map((word, index) => (
            <motion.div
              key={word.word}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
            >
              <Card className="overflow-hidden shadow-lg hover:shadow-xl transition-shadow">
                <div className="p-6 bg-white border-b border-gray-100">
                  <div className="flex justify-between items-start">
                    <div className="flex items-start gap-4">
                      <Button
                        variant="ghost"
                        size="icon"
                        className="rounded-full bg-violet-100 hover:bg-violet-200 text-violet-600 mt-1 shadow-sm"
                        onClick={() => playAudio(word.word)}
                      >
                        <Volume2 className="h-5 w-5" />
                        <span className="sr-only">Play pronunciation</span>
                      </Button>
                      <div>
                        <h3 className="text-xl font-bold text-gray-900">{word.word}</h3>
                        <div className="text-violet-600 text-lg mt-2 font-medium">{word.translation}</div>
                      </div>
                    </div>
                    <span className="text-gray-600 bg-gray-100 px-3 py-1 rounded-full text-sm font-medium shadow-sm">
                      {word.partOfSpeech}
                    </span>
                  </div>
                </div>

                <div className="p-6 bg-gray-50">
                  <div className="flex items-start gap-4">
                    <Button
                      variant="ghost"
                      size="icon"
                      className="rounded-full bg-violet-100 hover:bg-violet-200 text-violet-600 mt-1 shadow-sm"
                      onClick={() => playAudio(word.example)}
                    >
                      <Volume2 className="h-4 w-4" />
                      <span className="sr-only">Play example</span>
                    </Button>
                    <div>
                      <p className="text-gray-800 text-base leading-relaxed font-medium">{word.example}</p>
                      <p className="text-violet-600 mt-3 font-medium">{word.exampleTranslation}</p>
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