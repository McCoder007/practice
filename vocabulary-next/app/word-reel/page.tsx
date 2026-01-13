"use client"

import React, { useState, useEffect, useCallback, useRef, Fragment, useMemo, useLayoutEffect } from "react"
import { ChevronLeft, ChevronRight, Layers, Calendar, Volume2, VolumeX } from "lucide-react"
import { Button } from "@/components/ui/button"
import vocabularyData from "@/data/vocabulary"
import { playText, preloadTexts } from '@/lib/tts'
import { 
  initializeAnalytics, 
  logWordInteraction, 
  trackDayChange
} from '@/lib/analytics'
import { 
  getBackgroundForWord,
  getBackgroundIndexForWord
} from '@/lib/word-reel-backgrounds'
import { NavigationMenu } from "@/components/NavigationMenu"
import { useLanguage } from "@/contexts/LanguageContext"
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet"

interface WordCard {
  english: string
  chinese: string
  japanese: string
  englishSentence: string
  chineseSentence: string
  japaneseSentence: string
  partOfSpeech: string
  day: number
  wordIndex: number
}

// Helper function to calculate starting index for a specific day in 'all' mode
const getDayStartingIndex = (day: number): number => {
  let index = 0
  for (let i = 0; i < day - 1; i++) {
    index += vocabularyData[i].words.length
  }
  return index
}

// Helper function to calculate starting index for latest day in 'all' mode
const getLatestDayStartingIndex = (): number => {
  return getDayStartingIndex(vocabularyData.length)
}

export default function WordReelPage() {
  const { language } = useLanguage()
  const [viewMode, setViewMode] = useState<'all' | 'day'>('all')
  const [currentDay, setCurrentDay] = useState(vocabularyData.length)
  const [sheetOpen, setSheetOpen] = useState(false)
  const initialIndex = getLatestDayStartingIndex()
  const [currentIndex, setCurrentIndex] = useState(initialIndex)
  const [animating, setAnimating] = useState(false)
  const [analyticsInitialized, setAnalyticsInitialized] = useState(false)
  const [windowWidth, setWindowWidth] = useState(typeof window !== 'undefined' ? window.innerWidth : 0)
  // Force re-render after index change to update card content
  const [, forceUpdate] = useState(0)
  // Auto-speak state with localStorage persistence
  const [autoSpeak, setAutoSpeak] = useState(false)
  const hasUserNavigated = useRef(false) // Track if user has navigated (for auto-speak)
  
  // Refs for direct DOM manipulation (smooth performance)
  const startY = useRef(0)
  const containerRef = useRef<HTMLDivElement>(null)
  const currentCardRef = useRef<HTMLDivElement>(null)
  const nextCardRef = useRef<HTMLDivElement>(null)
  const prevCardRef = useRef<HTMLDivElement>(null)
  const isDraggingRef = useRef(false)
  const currentIndexRef = useRef(initialIndex)

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
            japanese: word.japanese,
            englishSentence: word.example,
            chineseSentence: word.exampleTranslation,
            japaneseSentence: word.japaneseSentence,
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
        japanese: word.japanese,
        englishSentence: word.example,
        chineseSentence: word.exampleTranslation,
        japaneseSentence: word.japaneseSentence,
        partOfSpeech: word.partOfSpeech,
        day: currentDay,
        wordIndex: wordIndex
      }))
    }
  }, [viewMode, currentDay, language])

  // Calculate starting index based on current mode
  const startingIndex = useMemo(() => {
    if (viewMode === 'all') {
      return getDayStartingIndex(currentDay)
    } else {
      return 0
    }
  }, [viewMode, currentDay])

  // Reset current index when words change
  useEffect(() => {
    if (viewMode === 'all') {
      // When switching to 'all' mode, start at the current day's words
      const dayIndex = getDayStartingIndex(currentDay)
      setCurrentIndex(dayIndex)
      currentIndexRef.current = dayIndex
    } else {
      setCurrentIndex(0)
      currentIndexRef.current = 0
    }
  }, [viewMode, currentDay])

  // Initialize card positions after index changes
  useLayoutEffect(() => {
    const currentCard = currentCardRef.current
    const nextCard = nextCardRef.current
    const prevCard = prevCardRef.current
    
    if (currentCard) {
      currentCard.style.transition = 'none'
      currentCard.style.transform = 'translateY(0)'
    }
    if (nextCard) {
      nextCard.style.transition = 'none'
      nextCard.style.transform = 'translateY(100%)'
    }
    if (prevCard) {
      prevCard.style.transition = 'none'
      prevCard.style.transform = 'translateY(-100%)'
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

  // Load auto-speak preference from localStorage
  useEffect(() => {
    try {
      const stored = localStorage.getItem('word-reel-auto-speak')
      if (stored === 'true') {
        setAutoSpeak(true)
      }
    } catch (error) {
      // localStorage might not be available
    }
  }, [])

  // Toggle auto-speak and persist to localStorage
  const handleAutoSpeakToggle = useCallback(() => {
    setAutoSpeak(prev => {
      const newValue = !prev
      try {
        localStorage.setItem('word-reel-auto-speak', String(newValue))
      } catch (error) {
        // localStorage might not be available
      }
      // Removed immediate playback - let the effect handle it
      return newValue
    })
  }, [words, currentIndex, analyticsInitialized])

  // Track window width for responsive font sizing
  useEffect(() => {
    const updateWindowWidth = () => {
      setWindowWidth(window.innerWidth)
    }
    
    // Set initial width
    updateWindowWidth()
    
    window.addEventListener('resize', updateWindowWidth)
    return () => window.removeEventListener('resize', updateWindowWidth)
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

  // Preload audio for current, next, and previous words for instant playback
  useEffect(() => {
    if (words.length === 0) return

    const currentWord = words[currentIndex]
    const prevIndex = (currentIndex - 1 + words.length) % words.length
    const nextIndex = (currentIndex + 1) % words.length
    const prevWord = words[prevIndex]
    const nextWord = words[nextIndex]

    // Collect all texts to preload (words and sentences)
    const textsToPreload: string[] = []
    
    if (currentWord) {
      textsToPreload.push(currentWord.english, currentWord.englishSentence)
    }
    if (nextWord && nextIndex !== currentIndex) {
      textsToPreload.push(nextWord.english, nextWord.englishSentence)
    }
    if (prevWord && prevIndex !== currentIndex) {
      textsToPreload.push(prevWord.english, prevWord.englishSentence)
    }

    // Preload all texts
    preloadTexts(textsToPreload.filter(Boolean))
  }, [currentIndex, words])

  // Auto-speak when card changes (if enabled)
  useEffect(() => {
    if (!autoSpeak || words.length === 0) return
    if (!hasUserNavigated.current) return // Don't auto-speak on initial mount
    if (sheetOpen) return // Don't auto-speak when sheet menu is open

    const currentWord = words[currentIndex]
    if (!currentWord) return

    // Wait for animation to complete, then play audio
    const timeoutId = setTimeout(() => {
      playText(currentWord.english)
      if (analyticsInitialized) {
        logWordInteraction(currentWord.english, 'word_audio_played')
      }
    }, 50) // Small delay to let the animation settle

    return () => clearTimeout(timeoutId)
  }, [currentIndex, autoSpeak, words, analyticsInitialized, sheetOpen])

  // Handle touch/mouse start
  const handleStart = useCallback((clientY: number) => {
    if (animating) return
    
    startY.current = clientY
    isDraggingRef.current = true
    
    // Remove transitions for instant finger-following
    const currentCard = currentCardRef.current
    const nextCard = nextCardRef.current
    const prevCard = prevCardRef.current
    
    if (currentCard) {
      currentCard.style.transition = 'none'
    }
    if (nextCard) {
      nextCard.style.transition = 'none'
    }
    if (prevCard) {
      prevCard.style.transition = 'none'
    }
  }, [animating])

  // Handle touch/mouse move - directly manipulate DOM for smooth performance
  const handleMove = useCallback((clientY: number) => {
    if (!isDraggingRef.current || animating) return
    
    const deltaY = startY.current - clientY
    
    // Convert pixels to percentage of screen height
    const movePercent = Math.min(Math.abs(deltaY) / window.innerHeight * 100, 100)
    
    // Directly update DOM for smooth performance
    const currentCard = currentCardRef.current
    const nextCard = nextCardRef.current
    const prevCard = prevCardRef.current
    
    if (deltaY > 0) {
      // Upward swipe - show next card
      if (currentCard) {
        // Current card moves UP (negative translateY)
        currentCard.style.transform = `translateY(-${movePercent}%)`
      }
      if (nextCard) {
        // Next card moves UP from below (100% to 0%)
        nextCard.style.transform = `translateY(${100 - movePercent}%)`
      }
      if (prevCard) {
        // Reset previous card position
        prevCard.style.transform = 'translateY(-100%)'
      }
    } else if (deltaY < 0) {
      // Downward swipe - show previous card
      if (currentCard) {
        // Current card moves DOWN (positive translateY)
        currentCard.style.transform = `translateY(${movePercent}%)`
      }
      if (prevCard) {
        // Previous card moves DOWN from above (-100% to 0%)
        prevCard.style.transform = `translateY(${-100 + movePercent}%)`
      }
      if (nextCard) {
        // Reset next card position
        nextCard.style.transform = 'translateY(100%)'
      }
    } else {
      // No movement - reset all cards
      if (currentCard) currentCard.style.transform = 'translateY(0)'
      if (nextCard) nextCard.style.transform = 'translateY(100%)'
      if (prevCard) prevCard.style.transform = 'translateY(-100%)'
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
    const prevCard = prevCardRef.current
    
    if (!currentCard) return
    
    // Add smooth transitions for completion animation
    currentCard.style.transition = 'transform 0.3s ease-out'
    if (nextCard) nextCard.style.transition = 'transform 0.3s ease-out'
    if (prevCard) prevCard.style.transition = 'transform 0.3s ease-out'
    
    if (deltaY > threshold && words.length > 0) {
      // Upward swipe - go to next word
      if (nextCard) {
        currentCard.style.transform = 'translateY(-100%)'
        nextCard.style.transform = 'translateY(0)'
      }
      
      setAnimating(true)
      
      // After animation completes, update state
      setTimeout(() => {
        const nextIdx = (currentIndexRef.current + 1) % words.length
        
        // Remove transitions BEFORE state update to prevent flash
        if (currentCard) currentCard.style.transition = 'none'
        if (nextCard) nextCard.style.transition = 'none'
        if (prevCard) prevCard.style.transition = 'none'
        
        // Mark that user has navigated (for auto-speak)
        hasUserNavigated.current = true
        
        // Update state - this triggers useLayoutEffect to reposition cards
        setCurrentIndex(nextIdx)
        currentIndexRef.current = nextIdx
        forceUpdate(n => n + 1)
        setAnimating(false)
      }, 300)
    } else if (deltaY < -threshold && words.length > 0) {
      // Downward swipe - go to previous word
      if (prevCard) {
        currentCard.style.transform = 'translateY(100%)'
        prevCard.style.transform = 'translateY(0)'
      }
      
      setAnimating(true)
      
      // After animation completes, update state
      setTimeout(() => {
        const prevIdx = (currentIndexRef.current - 1 + words.length) % words.length
        
        // Remove transitions BEFORE state update to prevent flash
        if (currentCard) currentCard.style.transition = 'none'
        if (nextCard) nextCard.style.transition = 'none'
        if (prevCard) prevCard.style.transition = 'none'
        
        // Mark that user has navigated (for auto-speak)
        hasUserNavigated.current = true
        
        // Update state - this triggers useLayoutEffect to reposition cards
        setCurrentIndex(prevIdx)
        currentIndexRef.current = prevIdx
        forceUpdate(n => n + 1)
        setAnimating(false)
      }, 300)
    } else {
      // Didn't meet threshold - snap back to original positions
      currentCard.style.transform = 'translateY(0)'
      if (nextCard) nextCard.style.transform = 'translateY(100%)'
      if (prevCard) prevCard.style.transform = 'translateY(-100%)'
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
      const prevCard = prevCardRef.current
      if (currentCard) {
        currentCard.style.transition = 'transform 0.3s ease-out'
        currentCard.style.transform = 'translateY(0)'
      }
      if (nextCard) {
        nextCard.style.transition = 'transform 0.3s ease-out'
        nextCard.style.transform = 'translateY(100%)'
      }
      if (prevCard) {
        prevCard.style.transition = 'transform 0.3s ease-out'
        prevCard.style.transform = 'translateY(-100%)'
      }
    }
  }, [])

  // Handle mode toggle
  const handleModeToggle = useCallback(() => {
    const newMode = viewMode === 'all' ? 'day' : 'all'
    
    // When switching from 'all' to 'day' mode, preserve the day of the currently displayed word
    if (newMode === 'day' && viewMode === 'all') {
      // Build the allWords array to get the current word's day
      // (we can't use the memoized words here because it will change after setViewMode)
      const allWords: WordCard[] = []
      vocabularyData.forEach((dayData) => {
        dayData.words.forEach((word, wordIndex) => {
          allWords.push({
            english: word.word,
            chinese: word.translation,
            japanese: word.japanese,
            englishSentence: word.example,
            chineseSentence: word.exampleTranslation,
            japaneseSentence: word.japaneseSentence,
            partOfSpeech: word.partOfSpeech,
            day: dayData.day,
            wordIndex: wordIndex
          })
        })
      })
      
      // Find the current word and set currentDay to its day
      const currentWordIndex = currentIndexRef.current
      if (allWords[currentWordIndex]) {
        const dayOfCurrentWord = allWords[currentWordIndex].day
        setCurrentDay(dayOfCurrentWord)
      }
    }
    
    setViewMode(newMode)
  }, [viewMode])

  // Handle day navigation
  const handlePreviousDay = useCallback(() => {
    if (animating || viewMode === 'all') return
    hasUserNavigated.current = true
    const prevDay = currentDay
    const newDay = currentDay > 1 ? currentDay - 1 : vocabularyData.length
    setCurrentDay(newDay)
    trackDayChange(newDay, prevDay)
  }, [currentDay, animating, viewMode])

  const handleNextDay = useCallback(() => {
    if (animating || viewMode === 'all') return
    hasUserNavigated.current = true
    const prevDay = currentDay
    const newDay = currentDay < vocabularyData.length ? currentDay + 1 : 1
    setCurrentDay(newDay)
    trackDayChange(newDay, prevDay)
  }, [currentDay, animating, viewMode])

  // Handle day selection from dropdown
  const handleDaySelect = useCallback((selectedDay: number) => {
    if (animating || viewMode === 'all') return
    hasUserNavigated.current = true
    const prevDay = currentDay
    setCurrentDay(selectedDay)
    trackDayChange(selectedDay, prevDay)
    setSheetOpen(false)
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

  // Helper function to get font size based on word length and screen width
  const getWordFontSize = useCallback((word: string): string => {
    // Responsive base font size based on screen width
    // Mobile (< 640px): 48px base, tablet (640-1024px): 56px, desktop (> 1024px): 64px
    let baseSize = 64
    if (windowWidth > 0) {
      if (windowWidth < 640) {
        baseSize = 48 // Mobile
      } else if (windowWidth < 1024) {
        baseSize = 56 // Tablet
      }
    } else {
      // Fallback: assume mobile if width not yet measured
      baseSize = 48
    }
    
    // For words longer than 10 characters, scale down more aggressively
    if (word.length > 10) {
      const charsOver = word.length - 10
      const minSize = Math.max(20, baseSize * 0.44) // Minimum 44% of base size
      const scale = Math.max(0.44, 1 - charsOver * 0.07)
      return `${Math.max(minSize, Math.round(baseSize * scale))}px`
    }
    return `${baseSize}px`
  }, [windowWidth])

  // Helper function to get translation font size based on word length and screen width
  const getTranslationFontSize = useCallback((word: string): string => {
    // Responsive base font size based on screen width
    // Mobile (< 640px): 36px base, tablet (640-1024px): 42px, desktop (> 1024px): 48px
    let baseSize = 48
    if (windowWidth > 0) {
      if (windowWidth < 640) {
        baseSize = 36 // Mobile
      } else if (windowWidth < 1024) {
        baseSize = 42 // Tablet
      }
    } else {
      // Fallback: assume mobile if width not yet measured
      baseSize = 36
    }
    
    // Translation characters are typically shorter, but scale similarly
    if (word.length > 6) {
      const charsOver = word.length - 6
      const minSize = Math.max(18, baseSize * 0.5) // Minimum 50% of base size
      const scale = Math.max(0.5, 1 - charsOver * 0.08)
      return `${Math.max(minSize, Math.round(baseSize * scale))}px`
    }
    return `${baseSize}px`
  }, [windowWidth])

  // Render clickable words
  const renderClickableWords = useCallback((text: string, isExample: boolean = false) => {
    if (!text) return null
    // Check if text is a phrase (contains spaces)
    const isPhrase = text.trim().includes(' ')
    return text.split(/(\s+)/).map((token, idx) =>
      token.match(/\s+/)
        ? <Fragment key={idx}>{token}</Fragment>
        : (
            <span
              key={idx}
              onClick={(e) => {
                e.stopPropagation() // Prevent parent onClick from firing
                // If it's a phrase, play the full phrase; otherwise play just the word
                const textToPlay = isPhrase ? text : token
                playAudio(textToPlay, isExample ? 'sentence_audio_played' : 'word_audio_played')
              }}
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

  // Calculate visible indices (previous, current, and next)
  const prevIndex = (currentIndex - 1 + words.length) % words.length
  const nextIndex = (currentIndex + 1) % words.length
  const currentWord = words[currentIndex]
  const prevWord = words[prevIndex]
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
  // First calculate the current background index to ensure adjacent cards differ
  const currentBackgroundIndex = getBackgroundIndexForWord(currentWord.wordIndex, currentWord.day - 1, -1)
  const currentBackground = getBackgroundForWord(currentWord.wordIndex, currentWord.day - 1, -1)
  const prevBackground = prevWord ? getBackgroundForWord(prevWord.wordIndex, prevWord.day - 1, currentBackgroundIndex) : currentBackground
  const nextBackground = nextWord ? getBackgroundForWord(nextWord.wordIndex, nextWord.day - 1, currentBackgroundIndex) : currentBackground

  return (
    <>
      <NavigationMenu />
      <div className="flex flex-col h-screen w-screen overflow-hidden bg-black">
        {/* Header */}
      <header className="bg-black/60 backdrop-blur-md p-2 border-b border-white/10 sticky top-0 z-20">
        <div className="flex items-center justify-center relative mb-1">
          <div className="flex flex-col items-center flex-grow">
            <h1 className="text-lg font-semibold text-white">
              {language === "japanese" ? "Word Reel | 単語リール" : "Word Reel | 单词卷轴"}
            </h1>
          </div>
          <div className="absolute right-2 flex items-center gap-1">
            <Button
              variant="ghost"
              size="icon"
              className={`text-white hover:bg-white/20 rounded-full ${autoSpeak ? 'bg-white/20' : ''}`}
              onClick={handleAutoSpeakToggle}
              title={autoSpeak ? 'Disable Auto-Speak' : 'Enable Auto-Speak'}
            >
              {autoSpeak ? <Volume2 className="h-5 w-5" /> : <VolumeX className="h-5 w-5" />}
            </Button>
            <Button
              variant="ghost"
              size="icon"
              className="text-white hover:bg-white/20 rounded-full"
              onClick={handleModeToggle}
              title={viewMode === 'all' ? 'Switch to Day Mode' : 'Switch to All Days Mode'}
            >
              {viewMode === 'all' ? <Calendar className="h-5 w-5" /> : <Layers className="h-5 w-5" />}
            </Button>
          </div>
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
            <Sheet open={sheetOpen} onOpenChange={setSheetOpen}>
              <SheetTrigger asChild>
                <button
                  className="bg-white/20 backdrop-blur-sm text-white px-6 py-0.5 rounded-full text-sm font-medium shadow-sm mx-4 border border-white/20 min-w-[120px] text-center hover:bg-white/30 transition-colors cursor-pointer"
                  disabled={animating}
                >
                  Day {currentDay}
                </button>
              </SheetTrigger>
              <SheetContent side="bottom" className="bg-black/95 border-white/20">
                <SheetHeader>
                  <SheetTitle className="text-white text-center">Select Day</SheetTitle>
                </SheetHeader>
                <div className="grid grid-cols-4 sm:grid-cols-6 md:grid-cols-8 gap-3 mt-6 max-h-[60vh] overflow-y-auto">
                  {vocabularyData.map((dayData) => (
                    <button
                      key={dayData.day}
                      onClick={() => handleDaySelect(dayData.day)}
                      className={`px-4 py-3 rounded-lg text-sm font-medium transition-colors ${
                        currentDay === dayData.day
                          ? 'bg-white text-black'
                          : 'bg-white/20 text-white hover:bg-white/30'
                      }`}
                    >
                      Day {dayData.day}
                    </button>
                  ))}
                </div>
              </SheetContent>
            </Sheet>
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
          
          <div className="relative z-10 w-full max-w-2xl space-y-6 overflow-hidden px-4">
            <div className="space-y-5">
              <h2 
                className="font-bold text-white drop-shadow-2xl"
                style={{ 
                  fontSize: getWordFontSize(currentWord.english),
                  textShadow: '0 4px 12px rgba(0,0,0,0.5)',
                  wordBreak: 'keep-all',
                  overflowWrap: 'normal'
                }}
              >
                {renderClickableWords(currentWord.english)}
              </h2>
              <p 
                className="text-[#FFD700] font-medium drop-shadow-lg"
                style={{ 
                  fontSize: getTranslationFontSize(language === 'japanese' ? currentWord.japanese : currentWord.chinese),
                  textShadow: '0 2px 8px rgba(0,0,0,0.5)',
                  wordBreak: 'keep-all',
                  overflowWrap: 'normal'
                }}
              >
                {language === 'japanese' ? currentWord.japanese : currentWord.chinese}
              </p>
            </div>
            
            <div className="h-px bg-white/30 w-full max-w-md mx-auto my-[60px]" />
            
            <div className="space-y-4">
              <p 
                onClick={() => playAudio(currentWord.englishSentence, 'sentence_audio_played')}
                className="text-[28px] text-white cursor-pointer hover:scale-105 transition-transform drop-shadow-lg leading-relaxed"
                style={{ textShadow: '0 2px 8px rgba(0,0,0,0.5)' }}
              >
                {currentWord.englishSentence}
              </p>
              <p 
                className="text-[24px] text-[#B0B0B0] drop-shadow-lg"
                style={{ textShadow: '0 2px 8px rgba(0,0,0,0.5)' }}
              >
                {language === 'japanese' ? currentWord.japaneseSentence : currentWord.chineseSentence}
              </p>
            </div>
            
            <div className="pt-4">
              <span className="inline-block bg-white/20 backdrop-blur-sm text-white px-4 py-2 rounded-full text-sm font-medium border border-white/30">
                {currentWord.partOfSpeech}
              </span>
            </div>
          </div>
          
          {/* Swipe Indicator - only show on first slide */}
          {currentIndex === startingIndex && (
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
          )}
        </div>

        {/* Previous Card - starts at translateY(-100%) above screen */}
        {prevWord && (
          <div
            ref={prevCardRef}
            className="absolute inset-0 flex flex-col justify-center items-center p-8 text-center will-change-transform"
            style={{
              background: prevBackground,
              transform: 'translateY(-100%)',
            }}
          >
            <div className="absolute inset-0 bg-black/25 pointer-events-none" />
            
            <div className="relative z-10 w-full max-w-2xl space-y-6 overflow-hidden px-4">
              <div className="space-y-5">
                <h2 
                  className="font-bold text-white drop-shadow-2xl"
                  style={{ 
                    fontSize: getWordFontSize(prevWord.english),
                    textShadow: '0 4px 12px rgba(0,0,0,0.5)',
                    wordBreak: 'keep-all',
                    overflowWrap: 'normal'
                  }}
                >
                  {renderClickableWords(prevWord.english)}
                </h2>
                <p 
                  className="text-[#FFD700] font-medium drop-shadow-lg"
                  style={{ 
                    fontSize: getTranslationFontSize(language === 'japanese' ? prevWord.japanese : prevWord.chinese),
                    textShadow: '0 2px 8px rgba(0,0,0,0.5)',
                    wordBreak: 'keep-all',
                    overflowWrap: 'normal'
                  }}
                >
                  {language === 'japanese' ? prevWord.japanese : prevWord.chinese}
                </p>
              </div>
              
              <div className="h-px bg-white/30 w-full max-w-md mx-auto my-[60px]" />
              
              <div className="space-y-4">
                <p 
                  onClick={() => playAudio(prevWord.englishSentence, 'sentence_audio_played')}
                  className="text-[28px] text-white cursor-pointer hover:scale-105 transition-transform drop-shadow-lg leading-relaxed"
                  style={{ textShadow: '0 2px 8px rgba(0,0,0,0.5)' }}
                >
                  {prevWord.englishSentence}
                </p>
                <p 
                  className="text-[24px] text-[#B0B0B0] drop-shadow-lg"
                  style={{ textShadow: '0 2px 8px rgba(0,0,0,0.5)' }}
                >
                  {language === 'japanese' ? prevWord.japaneseSentence : prevWord.chineseSentence}
                </p>
              </div>
              
              <div className="pt-4">
                <span className="inline-block bg-white/20 backdrop-blur-sm text-white px-4 py-2 rounded-full text-sm font-medium border border-white/30">
                  {prevWord.partOfSpeech}
                </span>
              </div>
            </div>
          </div>
        )}

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
            
            <div className="relative z-10 w-full max-w-2xl space-y-6 overflow-hidden px-4">
              <div className="space-y-5">
                <h2 
                  className="font-bold text-white drop-shadow-2xl"
                  style={{ 
                    fontSize: getWordFontSize(nextWord.english),
                    textShadow: '0 4px 12px rgba(0,0,0,0.5)',
                    wordBreak: 'keep-all',
                    overflowWrap: 'normal'
                  }}
                >
                  {renderClickableWords(nextWord.english)}
                </h2>
                <p 
                  className="text-[#FFD700] font-medium drop-shadow-lg"
                  style={{ 
                    fontSize: getTranslationFontSize(language === 'japanese' ? nextWord.japanese : nextWord.chinese),
                    textShadow: '0 2px 8px rgba(0,0,0,0.5)',
                    wordBreak: 'keep-all',
                    overflowWrap: 'normal'
                  }}
                >
                  {language === 'japanese' ? nextWord.japanese : nextWord.chinese}
                </p>
              </div>
              
              <div className="h-px bg-white/30 w-full max-w-md mx-auto my-[60px]" />
              
              <div className="space-y-4">
                <p 
                  onClick={() => playAudio(nextWord.englishSentence, 'sentence_audio_played')}
                  className="text-[28px] text-white cursor-pointer hover:scale-105 transition-transform drop-shadow-lg leading-relaxed"
                  style={{ textShadow: '0 2px 8px rgba(0,0,0,0.5)' }}
                >
                  {nextWord.englishSentence}
                </p>
                <p 
                  className="text-[24px] text-[#B0B0B0] drop-shadow-lg"
                  style={{ textShadow: '0 2px 8px rgba(0,0,0,0.5)' }}
                >
                  {language === 'japanese' ? nextWord.japaneseSentence : nextWord.chineseSentence}
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
    </>
  )
}
