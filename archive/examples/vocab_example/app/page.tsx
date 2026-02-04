"use client"

import { useState } from "react"
import { ChevronLeft, ChevronRight, Volume2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { ScrollArea } from "@/components/ui/scroll-area"
import { motion } from "framer-motion"

export default function VocabularyPractice() {
  const [currentDay, setCurrentDay] = useState(1)

  const vocabularyData = [
    {
      day: 1,
      words: [
        {
          word: "attend",
          translation: "参加",
          partOfSpeech: "verb",
          example: "Will you attend the meeting tomorrow?",
          exampleTranslation: "你明天会参加会议吗?",
        },
        {
          word: "automatically",
          translation: "自动地",
          partOfSpeech: "adverb",
          example: "The lights turn on automatically when someone enters the room.",
          exampleTranslation: "当有人进入房间时，灯会自动打开。",
        },
        {
          word: "balance",
          translation: "平衡",
          partOfSpeech: "noun",
          example: "It's important to maintain a good work-life balance.",
          exampleTranslation: "保持良好的工作与生活平衡很重要。",
        },
        {
          word: "consider",
          translation: "考虑",
          partOfSpeech: "verb",
          example: "Please consider my proposal carefully.",
          exampleTranslation: "请仔细考虑我的提议。",
        },
        {
          word: "develop",
          translation: "发展",
          partOfSpeech: "verb",
          example: "They plan to develop a new app next year.",
          exampleTranslation: "他们计划明年开发一个新应用。",
        },
      ],
    },
    {
      day: 2,
      words: [
        {
          word: "efficient",
          translation: "高效的",
          partOfSpeech: "adjective",
          example: "This is a very efficient way to learn vocabulary.",
          exampleTranslation: "这是一种非常高效的词汇学习方式。",
        },
        {
          word: "focus",
          translation: "专注",
          partOfSpeech: "noun",
          example: "You need to maintain your focus while studying.",
          exampleTranslation: "学习时你需要保持专注。",
        },
      ],
    },
  ]

  const currentDayData = vocabularyData.find((data) => data.day === currentDay) || vocabularyData[0]

  const handlePreviousDay = () => {
    if (currentDay > 1) {
      setCurrentDay(currentDay - 1)
    }
  }

  const handleNextDay = () => {
    if (currentDay < vocabularyData.length) {
      setCurrentDay(currentDay + 1)
    }
  }

  const playAudio = (text: string) => {
    // In a real app, this would play the audio for the word
    console.log(`Playing audio for: ${text}`)
  }

  return (
    <div className="flex flex-col min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-gradient-to-r from-violet-500 to-purple-600 text-white p-4 flex items-center sticky top-0 z-10">
        <Button
          variant="ghost"
          size="icon"
          className="text-white hover:bg-white/20"
          onClick={() => console.log("Back button clicked")}
        >
          <ChevronLeft className="h-6 w-6" />
          <span className="sr-only">Back</span>
        </Button>
        <h1 className="text-xl font-semibold text-center flex-1">Vocabulary Practice</h1>
      </header>

      {/* Day Navigation */}
      <div className="flex items-center justify-between p-4 border-b bg-white sticky top-16 z-10">
        <Button
          variant="ghost"
          size="icon"
          onClick={handlePreviousDay}
          disabled={currentDay <= 1}
          className="rounded-full hover:bg-gray-100"
        >
          <ChevronLeft className="h-6 w-6" />
          <span className="sr-only">Previous Day</span>
        </Button>
        <h2 className="text-xl font-medium">Day {currentDay}</h2>
        <Button
          variant="ghost"
          size="icon"
          onClick={handleNextDay}
          disabled={currentDay >= vocabularyData.length}
          className="rounded-full hover:bg-gray-100"
        >
          <ChevronRight className="h-6 w-6" />
          <span className="sr-only">Next Day</span>
        </Button>
      </div>

      {/* Scrollable Word List */}
      <ScrollArea className="flex-1 p-4">
        <div className="space-y-4 pb-6">
          {currentDayData.words.map((word, index) => (
            <motion.div
              key={word.word}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
            >
              <Card className="overflow-hidden">
                <div className="p-5 border-b bg-white">
                  <div className="flex justify-between items-start">
                    <div className="flex items-start gap-3">
                      <Button
                        variant="ghost"
                        size="icon"
                        className="rounded-full bg-violet-100 hover:bg-violet-200 text-violet-600 mt-1"
                        onClick={() => playAudio(word.word)}
                      >
                        <Volume2 className="h-5 w-5" />
                        <span className="sr-only">Play pronunciation</span>
                      </Button>
                      <div>
                        <h3 className="text-xl font-bold">{word.word}</h3>
                        <div className="text-violet-600 text-lg mt-1">{word.translation}</div>
                      </div>
                    </div>
                    <span className="text-gray-500 bg-gray-100 px-3 py-1 rounded-full text-sm">
                      {word.partOfSpeech}
                    </span>
                  </div>
                </div>

                <div className="p-5 bg-gray-50">
                  <div className="flex items-start gap-3 mb-3">
                    <Button
                      variant="ghost"
                      size="icon"
                      className="rounded-full bg-violet-100 hover:bg-violet-200 text-violet-600 mt-1"
                      onClick={() => playAudio(word.example)}
                    >
                      <Volume2 className="h-4 w-4" />
                      <span className="sr-only">Play example</span>
                    </Button>
                    <div>
                      <p className="text-gray-800 text-base leading-relaxed">{word.example}</p>
                      <p className="text-violet-600 mt-2">{word.exampleTranslation}</p>
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
