"use client"

import React, { useState, Fragment, useLayoutEffect, useRef, useEffect, useCallback } from "react"
import { ChevronLeft, ChevronRight, Volume2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { ScrollArea } from "@/components/ui/scroll-area"
import { motion } from "framer-motion"
import vocabularyData from "@/data/vocabulary"
import { playText } from '@/lib/tts'
import { 
  initializeAnalytics, 
  logWordInteraction, 
  trackDayChange, 
  trackScrollDepth 
} from '@/lib/analytics'

export default function VocabularyPracticePage() {
  const [currentDay, setCurrentDay] = useState(vocabularyData.length)
  const [analyticsInitialized, setAnalyticsInitialized] = useState(false)

  const currentDayData = vocabularyData.find((data) => data.day === currentDay) || vocabularyData[0]

  // Initialize Firebase Analytics
  useEffect(() => {
    const initAnalytics = async () => {
      await initializeAnalytics()
      setAnalyticsInitialized(true)
    }
    
    initAnalytics()
    
    // Initialize the first day tracking
    trackDayChange(currentDay)
  }, [])

  // Improved scroll tracking with throttling
  const lastScrollTime = useRef(0)
  const scrollTimeoutRef = useRef<NodeJS.Timeout | null>(null)
  
  // Throttled scroll handler to prevent excessive event firing
  const handleScroll = useCallback(() => {
    if (!viewportRef.current || !analyticsInitialized) return
    
    const now = Date.now()
    // Only process scroll events every 200ms
    if (now - lastScrollTime.current < 200) {
      // If already scheduled, don't schedule again
      if (scrollTimeoutRef.current) return
      
      // Schedule a check after the throttle period
      scrollTimeoutRef.current = setTimeout(() => {
        processScrollPosition()
        scrollTimeoutRef.current = null
      }, 200)
      
      return
    }
    
    // Update last scroll time
    lastScrollTime.current = now
    // Process scroll immediately
    processScrollPosition()
  }, [analyticsInitialized])
  
  // Function to calculate and process scroll position
  const processScrollPosition = () => {
    if (!viewportRef.current) {
      console.log("⚠️ Cannot process scroll: viewportRef is null")
      return
    }
    
    const scrollElement = viewportRef.current
    const scrollTop = scrollElement.scrollTop
    const scrollHeight = scrollElement.scrollHeight
    const clientHeight = scrollElement.clientHeight
    
    console.log("📊 Scroll measurements:", {
      scrollTop,
      scrollHeight,
      clientHeight,
      "scrollable space": scrollHeight - clientHeight
    })
    
    // Only track if there's actually scrollable content
    if (scrollHeight <= clientHeight) {
      console.log("ℹ️ Content doesn't require scrolling")
      return
    }
    
    // Calculate scroll percentage
    const scrollPercentage = Math.floor((scrollTop / (scrollHeight - clientHeight)) * 100)
    
    // Log scroll percentage for debugging
    console.log(`📏 Scroll position tracked: ${scrollPercentage}%`)
    
    // Track the scroll depth
    if (analyticsInitialized) {
      trackScrollDepth(scrollPercentage)
    } else {
      console.log("⚠️ Analytics not initialized, skipping tracking")
    }
  }
  
  // Set up scroll monitoring
  useEffect(() => {
    const viewport = viewportRef.current
    if (!viewport) return
    
    console.log("🔍 Setting up scroll tracking on viewport element:", viewport)
    
    // Test scroll processing immediately
    setTimeout(() => {
      console.log("🧪 Performing initial scroll position test")
      processScrollPosition()
    }, 1000)
    
    // Create a stable scroll handler reference for removal
    const scrollHandler = (e: Event) => {
      console.log("📜 Scroll event detected")
      handleScroll()
    }
    
    // Add direct scroll event listener
    viewport.addEventListener('scroll', scrollHandler, { passive: true })
    
    // Clean up
    return () => {
      console.log("🧹 Cleaning up scroll event listener")
      viewport.removeEventListener('scroll', scrollHandler)
      if (scrollTimeoutRef.current) {
        clearTimeout(scrollTimeoutRef.current)
        scrollTimeoutRef.current = null
      }
    }
  }, [handleScroll])
  
  const handlePreviousDay = () => {
    const prevDay = currentDay
    const newDay = currentDay > 1 ? currentDay - 1 : vocabularyData.length
    setCurrentDay(newDay)
    
    // Track day change in analytics
    trackDayChange(newDay, prevDay)
    
    // reset scroll positions
    if (typeof window !== 'undefined') {
      window.scrollTo(0, 0)
    }
    if (viewportRef.current) {
      viewportRef.current.scrollTo(0, 0)
    }
  }

  const handleNextDay = () => {
    const prevDay = currentDay
    const newDay = currentDay < vocabularyData.length ? currentDay + 1 : 1
    setCurrentDay(newDay)
    
    // Track day change in analytics
    trackDayChange(newDay, prevDay)
    
    // reset scroll positions
    if (typeof window !== 'undefined') {
      window.scrollTo(0, 0)
    }
    if (viewportRef.current) {
      viewportRef.current.scrollTo(0, 0)
    }
  }

  const playAudio = (text: string, type: 'word_audio_played' | 'sentence_audio_played' = 'word_audio_played') => {
    playText(text)
    // Track word interaction
    if (analyticsInitialized) {
      logWordInteraction(text, type)
    }
  }

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
  const renderClickableWords = (text: string, isExample: boolean = false) =>
    text.split(/(\s+)/).map((token, idx) =>
      token.match(/\s+/)
        ? <Fragment key={idx}>{token}</Fragment>
        : (
            <span
              key={idx}
              onClick={() => playAudio(token, isExample ? 'sentence_audio_played' : 'word_audio_played')}
              className="cursor-pointer hover:underline"
            >
              {token}
            </span>
          )
    )

  return (
    <div className="flex flex-col min-h-screen bg-blue-50">
      <header className="bg-gradient-to-r from-blue-50 via-blue-100 to-blue-50 p-2 border-b border-blue-200 sticky top-0 z-10">
        <div className="flex items-center justify-center relative mb-1">
          <div className="flex flex-col items-center flex-grow">
            <h1 className="text-lg font-semibold text-gray-800">New Words</h1>
          </div>
        </div>

        <div className="flex items-center justify-center">
           <Button
              variant="ghost"
              size="icon"
              className="text-gray-500 hover:bg-gray-200 rounded-full p-3 h-12 w-16"
              onClick={handlePreviousDay}
              disabled={vocabularyData.length <= 1}
            >
              <ChevronLeft className="h-10 w-10" />
              <span className="sr-only">Previous Day</span>
            </Button>
            <div className="bg-white text-blue-600 px-6 py-0.5 rounded-full text-sm font-medium shadow-sm mx-4 border border-gray-200 min-w-[120px] text-center">
              Day {currentDay}
            </div>
            <Button
              variant="ghost"
              size="icon"
              className="text-gray-500 hover:bg-gray-200 rounded-full p-3 h-12 w-16"
              onClick={handleNextDay}
              disabled={vocabularyData.length <= 1}
            >
              <ChevronRight className="h-10 w-10" />
              <span className="sr-only">Next Day</span>
            </Button>
        </div>
      </header>

      <ScrollArea 
        key={currentDay} 
        className="flex-1 p-4" 
        viewportRef={viewportRef}
      >
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
                      onClick={() => playAudio(word.example, 'sentence_audio_played')}
                    >
                      <Volume2 className="h-4 w-4" />
                      <span className="sr-only">Play example</span>
                    </Button>
                    <div className="flex-grow">
                      <p className="text-gray-800 text-sm mb-2">
                        {renderClickableWords(word.example, true)}
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