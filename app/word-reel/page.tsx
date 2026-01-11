"use client"

import React, { useState, useEffect, useCallback, useRef, Fragment, useMemo, useLayoutEffect } from "react"
import { ChevronLeft, ChevronRight, Layers, Calendar } from "lucide-react"
import { Button } from "@/components/ui/button"
import vocabularyData from "@/data/vocabulary"
import { playText } from '@/lib/tts'
import { 
  initializeAnalytics, 
  logWordInteraction, 
  trackDayChange
} from '@/lib/analytics'
import { 
  getBackgroundForWord
} from '@/lib/word-reel-backgrounds'

interface WordCard {
  english: string
  chinese: string
  englishSentence: string
  chineseSentence: string
  partOfSpeech: string
  day: number
  wordIndex: number
}

export default function WordReelPage() {
  const [viewMode, setViewMode] = useState<'all' | 'day'>('all')
  const [currentDay, setCurrentDay] = useState(vocabularyData.length)
  const [currentIndex, setCurrentIndex] = useState(0)
  const [animating, setAnimating] = useState(false)
  const [analyticsInitialized, setAnalyticsInitialized] = useState(false)
  // Force re-render after index change to update card content
  const [, forceUpdate] = useState(0)
  
  // Refs for direct DOM manipulation (smooth performance)
  const startY = useRef(0)
  const containerRef = useRef<HTMLDivElement>(null)
  const currentCardRef = useRef<HTMLDivElement>(null)
  const nextCardRef = useRef<HTMLDivElement>(null)
  const isDraggingRef = useRef(false)
  const currentIndexRef = useRef(currentIndex)

  // Keep ref in sync with state
  useEffect(() => {
    currentIndexRef.current = currentIndex
  }, [currentIndex])

  // Memoize words array to prevent recalculation on every render
  const words = useMemo((): WordCard[] => {
    if (viewMode === 'all') {
      const allWords: WordCard[] = []
      vocabularyData.forEach((dayData) => {
        dayData.words.forEach((word, wordIndex) => {
          allWords.push({
            english: word.word,
            chinese: word.translation,
            englishSentence: word.example,
            chineseSentence: word.exampleTranslation,
            partOfSpeech: word.partOfSpeech,
            day: dayData.day,
            wordIndex: wordIndex
          })
        })
      })
      return allWords
    } else {
      const dayData = vocabularyData.find((data) => data.day === currentDay) || vocabularyData[0]
      return dayData.words.map((word, wordIndex) => ({
        english: word.word,
        chinese: word.translation,
        englishSentence: word.example,
        chineseSentence: word.exampleTranslation,
        partOfSpeech: word.partOfSpeech,
        day: currentDay,
        wordIndex: wordIndex
      }))
    }
  }, [viewMode, currentDay])

  // Reset current index when words change
  useEffect(() => {
    setCurrentIndex(0)
    currentIndexRef.current = 0
  }, [viewMode, currentDay])

  // Initialize card positions after index changes
  useLayoutEffect(() => {
    const currentCard = currentCardRef.current
    const nextCard = nextCardRef.current
    
    if (currentCard) {
      currentCard.style.transition = 'none'
      currentCard.style.transform = 'translateY(0)'
    }
    if (nextCard) {
      nextCard.style.transition = 'none'
      nextCard.style.transform = 'translateY(100%)'
    }
  }, [currentIndex])

  // Initialize Firebase Analytics
  useEffect(() => {
    const initAnalytics = async () => {
      try {
        await initializeAnalytics()
        setAnalyticsInitialized(true)
      } catch (error) {
        console.error('Failed to initialize analytics:', error)
      }
    }
    
    initAnalytics()
    trackDayChange(currentDay)
  }, [])

  // Prevent body scroll
  useEffect(() => {
    const originalTouchAction = document.body.style.touchAction
    const originalOverflow = document.body.style.overflow
    
    document.body.style.touchAction = 'none'
    document.body.style.overflow = 'hidden'
    
    return () => {
      document.body.style.touchAction = originalTouchAction
      document.body.style.overflow = originalOverflow
    }
  }, [])

  // Handle touch/mouse start
  const handleStart = useCallback((clientY: number) => {
    if (animating) return
    
    startY.current = clientY
    isDraggingRef.current = true
    
    // Remove transitions for instant finger-following
    const currentCard = currentCardRef.current
    const nextCard = nextCardRef.current
    
    if (currentCard) {
      currentCard.style.transition = 'none'
    }
    if (nextCard) {
      nextCard.style.transition = 'none'
    }
  }, [animating])

  // Handle touch/mouse move - directly manipulate DOM for smooth performance
  const handleMove = useCallback((clientY: number) => {
    if (!isDraggingRef.current || animating) return
    
    const deltaY = startY.current - clientY
    
    // Only allow upward swipes (positive deltaY = finger moved up)
    if (deltaY <= 0) {
      // Reset to initial positions if trying to swipe down
      const currentCard = currentCardRef.current
      const nextCard = nextCardRef.current
      if (currentCard) currentCard.style.transform = 'translateY(0)'
      if (nextCard) nextCard.style.transform = 'translateY(100%)'
      return
    }
    
    // Convert pixels to percentage of screen height
    const movePercent = Math.min((deltaY / window.innerHeight) * 100, 100)
    
    // Directly update DOM for smooth performance
    const currentCard = currentCardRef.current
    const nextCard = nextCardRef.current
    
    if (currentCard) {
      // Current card moves UP (negative translateY)
      currentCard.style.transform = `translateY(-${movePercent}%)`
    }
    if (nextCard) {
      // Next card moves UP from below (100% to 0%)
      nextCard.style.transform = `translateY(${100 - movePercent}%)`
    }
  }, [animating])

  // Handle touch/mouse end
  const handleEnd = useCallback((clientY: number) => {
    if (!isDraggingRef.current || animating) return
    
    isDraggingRef.current = false
    
    const deltaY = startY.current - clientY
    const threshold = window.innerHeight * 0.15 // 15% of screen height
    
    const currentCard = currentCardRef.current
    const nextCard = nextCardRef.current
    
    if (!currentCard || !nextCard) return
    
    // Add smooth transitions for completion animation
    currentCard.style.transition = 'transform 0.3s ease-out'
    nextCard.style.transition = 'transform 0.3s ease-out'
    
    if (deltaY > threshold && words.length > 0) {
      // Complete the swipe - animate cards to final positions
      currentCard.style.transform = 'translateY(-100%)'
      nextCard.style.transform = 'translateY(0)'
      
      setAnimating(true)
      
      // After animation completes, update state
      setTimeout(() => {
        const nextIdx = (currentIndexRef.current + 1) % words.length
        
        // Remove transitions BEFORE state update to prevent flash
        if (currentCard) currentCard.style.transition = 'none'
        if (nextCard) nextCard.style.transition = 'none'
        
        // Update state - this triggers useLayoutEffect to reposition cards
        setCurrentIndex(nextIdx)
        currentIndexRef.current = nextIdx
        forceUpdate(n => n + 1)
        setAnimating(false)
      }, 300)
    } else {
      // Didn't meet threshold - snap back to original positions
      currentCard.style.transform = 'translateY(0)'
      nextCard.style.transform = 'translateY(100%)'
    }
  }, [animating, words.length])

  // Touch event handlers
  const handleTouchStart = useCallback((e: TouchEvent) => {
    if (e.touches.length > 0) {
      handleStart(e.touches[0].clientY)
    }
  }, [handleStart])

  const handleTouchMove = useCallback((e: TouchEvent) => {
    if (isDraggingRef.current && e.touches.length > 0) {
      e.preventDefault()
      handleMove(e.touches[0].clientY)
    }
  }, [handleMove])

  const handleTouchEnd = useCallback((e: TouchEvent) => {
    if (e.changedTouches.length > 0) {
      handleEnd(e.changedTouches[0].clientY)
    }
  }, [handleEnd])

  // Set up event listeners
  useEffect(() => {
    const container = containerRef.current
    if (!container) return

    container.addEventListener('touchstart', handleTouchStart, { passive: true })
    container.addEventListener('touchmove', handleTouchMove, { passive: false })
    container.addEventListener('touchend', handleTouchEnd, { passive: true })

    return () => {
      container.removeEventListener('touchstart', handleTouchStart)
      container.removeEventListener('touchmove', handleTouchMove)
      container.removeEventListener('touchend', handleTouchEnd)
    }
  }, [handleTouchStart, handleTouchMove, handleTouchEnd])

  // Mouse event handlers (for desktop testing)
  const handleMouseDown = useCallback((e: React.MouseEvent) => {
    handleStart(e.clientY)
  }, [handleStart])

  const handleMouseMove = useCallback((e: React.MouseEvent) => {
    if (isDraggingRef.current) {
      handleMove(e.clientY)
    }
  }, [handleMove])

  const handleMouseUp = useCallback((e: React.MouseEvent) => {
    if (isDraggingRef.current) {
      handleEnd(e.clientY)
    }
  }, [handleEnd])

  const handleMouseLeave = useCallback(() => {
    if (isDraggingRef.current) {
      // Snap back if mouse leaves while dragging
      isDraggingRef.current = false
      const currentCard = currentCardRef.current
      const nextCard = nextCardRef.current
      if (currentCard) {
        currentCard.style.transition = 'transform 0.3s ease-out'
        currentCard.style.transform = 'translateY(0)'
      }
      if (nextCard) {
        nextCard.style.transition = 'transform 0.3s ease-out'
        nextCard.style.transform = 'translateY(100%)'
      }
    }
  }, [])

  // Handle mode toggle
  const handleModeToggle = useCallback(() => {
    const newMode = viewMode === 'all' ? 'day' : 'all'
    setViewMode(newMode)
    if (newMode === 'day') {
      setCurrentDay(vocabularyData.length)
    }
  }, [viewMode])

  // Handle day navigation
  const handlePreviousDay = useCallback(() => {
    if (animating || viewMode === 'all') return
    const prevDay = currentDay
    const newDay = currentDay > 1 ? currentDay - 1 : vocabularyData.length
    setCurrentDay(newDay)
    trackDayChange(newDay, prevDay)
  }, [currentDay, animating, viewMode])

  const handleNextDay = useCallback(() => {
    if (animating || viewMode === 'all') return
    const prevDay = currentDay
    const newDay = currentDay < vocabularyData.length ? currentDay + 1 : 1
    setCurrentDay(newDay)
    trackDayChange(newDay, prevDay)
  }, [currentDay, animating, viewMode])

  // Audio playback
  const playAudio = useCallback((text: string, type: 'word_audio_played' | 'sentence_audio_played' = 'word_audio_played') => {
    try {
      playText(text)
      if (analyticsInitialized) {
        logWordInteraction(text, type)
      }
    } catch (error) {
      console.error('Failed to play audio:', error)
    }
  }, [analyticsInitialized])

  // Render clickable words
  const renderClickableWords = useCallback((text: string, isExample: boolean = false) => {
    if (!text) return null
    return text.split(/(\s+)/).map((token, idx) =>
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
  }, [playAudio])

  // Early return if no words
  if (!words || words.length === 0) {
    return (
      <div className="flex items-center justify-center h-screen bg-black">
        <p className="text-gray-500">No words available</p>
      </div>
    )
  }

  // Calculate visible indices (only current and next)
  const nextIndex = (currentIndex + 1) % words.length
  const currentWord = words[currentIndex]
  const nextWord = words[nextIndex]
  
  // Safety check
  if (!currentWord) {
    return (
      <div className="flex items-center justify-center h-screen bg-black">
        <p className="text-gray-500">Loading...</p>
      </div>
    )
  }

  // Get backgrounds
  const currentBackground = getBackgroundForWord(currentWord.wordIndex, currentWord.day - 1, -1)
  const nextBackground = nextWord ? getBackgroundForWord(nextWord.wordIndex, nextWord.day - 1, 0) : currentBackground

  return (
    <div className="flex flex-col h-screen w-screen overflow-hidden bg-black">
      {/* Header */}
      <header className="bg-black/60 backdrop-blur-md p-2 border-b border-white/10 sticky top-0 z-20">
        <div className="flex items-center justify-center relative mb-1">
          <div className="flex flex-col items-center flex-grow">
            <h1 className="text-lg font-semibold text-white">Word Reel</h1>
          </div>
          <Button
            variant="ghost"
            size="icon"
            className="absolute right-2 text-white hover:bg-white/20 rounded-full"
            onClick={handleModeToggle}
            title={viewMode === 'all' ? 'Switch to Day Mode' : 'Switch to All Days Mode'}
          >
            {viewMode === 'all' ? <Calendar className="h-5 w-5" /> : <Layers className="h-5 w-5" />}
          </Button>
        </div>
        
        {viewMode === 'day' && (
          <div className="flex items-center justify-center">
            <Button
              variant="ghost"
              size="icon"
              className="text-white hover:bg-white/20 rounded-full p-3 h-12 w-16"
              onClick={handlePreviousDay}
              disabled={vocabularyData.length <= 1 || animating}
            >
              <ChevronLeft className="h-10 w-10" />
              <span className="sr-only">Previous Day</span>
            </Button>
            <div className="bg-white/20 backdrop-blur-sm text-white px-6 py-0.5 rounded-full text-sm font-medium shadow-sm mx-4 border border-white/20 min-w-[120px] text-center">
              Day {currentDay}
            </div>
            <Button
              variant="ghost"
              size="icon"
              className="text-white hover:bg-white/20 rounded-full p-3 h-12 w-16"
              onClick={handleNextDay}
              disabled={vocabularyData.length <= 1 || animating}
            >
              <ChevronRight className="h-10 w-10" />
              <span className="sr-only">Next Day</span>
            </Button>
          </div>
        )}
      </header>
      
      {/* Word Card Container */}
      <div 
        ref={containerRef}
        className="flex-1 relative overflow-hidden"
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseLeave}
      >
        {/* Current Card - starts at translateY(0) */}
        <div
          ref={currentCardRef}
          className="absolute inset-0 flex flex-col justify-center items-center p-8 text-center will-change-transform"
          style={{
            background: currentBackground,
            transform: 'translateY(0)',
          }}
        >
          <div className="absolute inset-0 bg-black/25 pointer-events-none" />
          
          <div className="relative z-10 w-full max-w-2xl space-y-6">
            <div className="space-y-5">
              <h2 
                onClick={() => playAudio(currentWord.english)}
                className="text-[64px] font-bold text-white cursor-pointer hover:scale-105 transition-transform drop-shadow-2xl"
                style={{ textShadow: '0 4px 12px rgba(0,0,0,0.5)' }}
              >
                {renderClickableWords(currentWord.english)}
              </h2>
              <p 
                className="text-[48px] text-[#FFD700] font-medium drop-shadow-lg"
                style={{ textShadow: '0 2px 8px rgba(0,0,0,0.5)' }}
              >
                {currentWord.chinese}
              </p>
            </div>
            
            <div className="h-px bg-white/30 w-full max-w-md mx-auto my-[60px]" />
            
            <div className="space-y-4">
              <p 
                onClick={() => playAudio(currentWord.englishSentence, 'sentence_audio_played')}
                className="text-[28px] text-white cursor-pointer hover:scale-105 transition-transform drop-shadow-lg leading-relaxed"
                style={{ textShadow: '0 2px 8px rgba(0,0,0,0.5)' }}
              >
                {renderClickableWords(currentWord.englishSentence, true)}
              </p>
              <p 
                className="text-[24px] text-[#B0B0B0] drop-shadow-lg"
                style={{ textShadow: '0 2px 8px rgba(0,0,0,0.5)' }}
              >
                {currentWord.chineseSentence}
              </p>
            </div>
            
            <div className="pt-4">
              <span className="inline-block bg-white/20 backdrop-blur-sm text-white px-4 py-2 rounded-full text-sm font-medium border border-white/30">
                {currentWord.partOfSpeech}
              </span>
            </div>
          </div>
          
          {/* Swipe Indicator */}
          <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2 text-white/50 text-sm flex flex-col items-center gap-1">
            <svg 
              width="24" 
              height="24" 
              viewBox="0 0 24 24" 
              fill="none" 
              stroke="currentColor" 
              strokeWidth="2" 
              strokeLinecap="round" 
              strokeLinejoin="round"
              className="animate-bounce"
            >
              <path d="M18 15l-6-6-6 6"/>
            </svg>
            <span>Swipe to continue</span>
          </div>
        </div>

        {/* Next Card - starts at translateY(100%) below screen */}
        {nextWord && (
          <div
            ref={nextCardRef}
            className="absolute inset-0 flex flex-col justify-center items-center p-8 text-center will-change-transform"
            style={{
              background: nextBackground,
              transform: 'translateY(100%)',
            }}
          >
            <div className="absolute inset-0 bg-black/25 pointer-events-none" />
            
            <div className="relative z-10 w-full max-w-2xl space-y-6">
              <div className="space-y-5">
                <h2 
                  className="text-[64px] font-bold text-white drop-shadow-2xl"
                  style={{ textShadow: '0 4px 12px rgba(0,0,0,0.5)' }}
                >
                  {nextWord.english}
                </h2>
                <p 
                  className="text-[48px] text-[#FFD700] font-medium drop-shadow-lg"
                  style={{ textShadow: '0 2px 8px rgba(0,0,0,0.5)' }}
                >
                  {nextWord.chinese}
                </p>
              </div>
              
              <div className="h-px bg-white/30 w-full max-w-md mx-auto my-[60px]" />
              
              <div className="space-y-4">
                <p 
                  className="text-[28px] text-white drop-shadow-lg leading-relaxed"
                  style={{ textShadow: '0 2px 8px rgba(0,0,0,0.5)' }}
                >
                  {nextWord.englishSentence}
                </p>
                <p 
                  className="text-[24px] text-[#B0B0B0] drop-shadow-lg"
                  style={{ textShadow: '0 2px 8px rgba(0,0,0,0.5)' }}
                >
                  {nextWord.chineseSentence}
                </p>
              </div>
              
              <div className="pt-4">
                <span className="inline-block bg-white/20 backdrop-blur-sm text-white px-4 py-2 rounded-full text-sm font-medium border border-white/30">
                  {nextWord.partOfSpeech}
                </span>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
