"use client"

import React, { useState, useEffect, useCallback, useRef, Fragment } from "react"
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
  getBackgroundForWord, 
  getBackgroundIndexForWord 
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
  const [isDragging, setIsDragging] = useState(false)
  const [animating, setAnimating] = useState(false)
  const [analyticsInitialized, setAnalyticsInitialized] = useState(false)
  const [backgroundIndices, setBackgroundIndices] = useState<number[]>([])
  
  const startY = useRef(0)
  const containerRef = useRef<HTMLDivElement>(null)
  const cardsRef = useRef<HTMLDivElement[]>([])

  // Flatten all words or get current day words
  const getAllWords = useCallback((): WordCard[] => {
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

  const words = getAllWords()

  // Initialize background indices
  useEffect(() => {
    const indices: number[] = []
    words.forEach((word, index) => {
      const prevIndex = index > 0 ? indices[index - 1] : -1
      indices.push(getBackgroundIndexForWord(word.wordIndex, word.day - 1, prevIndex))
    })
    setBackgroundIndices(indices)
    // Reset to first word when words change
    setCurrentIndex(0)
  }, [words.length, viewMode, currentDay])

  // Initialize Firebase Analytics
  useEffect(() => {
    const initAnalytics = async () => {
      await initializeAnalytics()
      setAnalyticsInitialized(true)
    }
    
    initAnalytics()
    trackDayChange(currentDay)
  }, [])

  // Prevent body scroll
  useEffect(() => {
    document.body.style.touchAction = 'none'
    document.body.style.overflow = 'hidden'
    return () => {
      document.body.style.touchAction = 'unset'
      document.body.style.overflow = 'unset'
    }
  }, [])

  // Set card positions
  const setPosition = useCallback(() => {
    cardsRef.current.forEach((card, index) => {
      if (!card) return
      
      if (index === currentIndex) {
        // Current card at top (0%)
        card.style.transition = 'none'
        card.style.transform = 'translateY(0)'
        card.classList.remove('hidden')
      } else if (index === (currentIndex + 1) % words.length) {
        // Next card below screen (100%)
        card.style.transition = 'none'
        card.style.transform = 'translateY(100%)'
        card.classList.remove('hidden')
      } else {
        // All other cards hidden
        card.classList.add('hidden')
      }
    })
  }, [currentIndex, words.length])

  // Initialize positions when words or index changes
  useEffect(() => {
    // Small delay to ensure DOM is ready
    setTimeout(() => {
      setPosition()
    }, 0)
  }, [setPosition, words.length])

  // Handle touch/mouse start
  const handleStart = useCallback((clientY: number) => {
    if (animating) return
    startY.current = clientY
    setIsDragging(true)
    
    // Remove transitions for instant response
    cardsRef.current.forEach(card => {
      if (card) {
        card.style.transition = 'none'
      }
    })
  }, [animating])

  // Handle touch/mouse move
  const handleMove = useCallback((clientY: number) => {
    if (!isDragging || animating) return
    
    const deltaY = startY.current - clientY
    
    // Only allow upward swipes
    if (deltaY < 0) return
    
    // Convert pixels to percentage
    const movePercent = (deltaY / window.innerHeight) * 100
    
    const currentCard = cardsRef.current[currentIndex]
    const nextIndex = (currentIndex + 1) % words.length
    const nextCard = cardsRef.current[nextIndex]
    
    if (currentCard && nextCard) {
      currentCard.style.transform = `translateY(-${movePercent}%)`
      nextCard.style.transform = `translateY(${100 - movePercent}%)`
    }
  }, [isDragging, animating, currentIndex, words.length])

  // Handle touch/mouse end
  const handleEnd = useCallback((clientY: number) => {
    if (!isDragging || animating) return
    setIsDragging(false)
    
    const deltaY = startY.current - clientY
    const threshold = window.innerHeight * 0.15 // 15% of screen
    
    const currentCard = cardsRef.current[currentIndex]
    const nextIndex = (currentIndex + 1) % words.length
    const nextCard = cardsRef.current[nextIndex]
    
    if (!currentCard || !nextCard) return
    
    // Add transitions for smooth completion
    cardsRef.current.forEach(card => {
      if (card) {
        card.style.transition = 'transform 0.3s ease-out'
      }
    })
    
    if (deltaY > threshold) {
      // Complete the swipe
      setAnimating(true)
      currentCard.style.transform = 'translateY(-100%)'
      nextCard.style.transform = 'translateY(0)'
      
      // Update state after animation
      setTimeout(() => {
        setCurrentIndex(nextIndex)
        setPosition()
        setAnimating(false)
      }, 300)
    } else {
      // Snap back
      setPosition()
    }
  }, [isDragging, animating, currentIndex, words.length, setPosition])

  // Touch event handlers
  const handleTouchStart = useCallback((e: TouchEvent) => {
    e.preventDefault()
    handleStart(e.touches[0].clientY)
  }, [handleStart])

  const handleTouchMove = useCallback((e: TouchEvent) => {
    e.preventDefault()
    handleMove(e.touches[0].clientY)
  }, [handleMove])

  const handleTouchEnd = useCallback((e: TouchEvent) => {
    e.preventDefault()
    handleEnd(e.changedTouches[0].clientY)
  }, [handleEnd])

  // Mouse event handlers (for desktop testing)
  const handleMouseDown = useCallback((e: React.MouseEvent) => {
    handleStart(e.clientY)
  }, [handleStart])

  const handleMouseMove = useCallback((e: React.MouseEvent) => {
    if (isDragging) {
      handleMove(e.clientY)
    }
  }, [isDragging, handleMove])

  const handleMouseUp = useCallback((e: React.MouseEvent) => {
    if (isDragging) {
      handleEnd(e.clientY)
    }
  }, [isDragging, handleEnd])

  // Set up event listeners
  useEffect(() => {
    const container = containerRef.current
    if (!container) return

    container.addEventListener('touchstart', handleTouchStart, { passive: false })
    container.addEventListener('touchmove', handleTouchMove, { passive: false })
    container.addEventListener('touchend', handleTouchEnd, { passive: false })

    return () => {
      container.removeEventListener('touchstart', handleTouchStart)
      container.removeEventListener('touchmove', handleTouchMove)
      container.removeEventListener('touchend', handleTouchEnd)
    }
  }, [handleTouchStart, handleTouchMove, handleTouchEnd])

  // Handle mode toggle
  const handleModeToggle = useCallback(() => {
    const newMode = viewMode === 'all' ? 'day' : 'all'
    setViewMode(newMode)
    setCurrentIndex(0)
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
    setCurrentIndex(0)
    trackDayChange(newDay, prevDay)
  }, [currentDay, animating, viewMode])

  const handleNextDay = useCallback(() => {
    if (animating || viewMode === 'all') return
    const prevDay = currentDay
    const newDay = currentDay < vocabularyData.length ? currentDay + 1 : 1
    setCurrentDay(newDay)
    setCurrentIndex(0)
    trackDayChange(newDay, prevDay)
  }, [currentDay, animating, viewMode])

  // Audio playback
  const playAudio = useCallback((text: string, type: 'word_audio_played' | 'sentence_audio_played' = 'word_audio_played') => {
    playText(text)
    if (analyticsInitialized) {
      logWordInteraction(text, type)
    }
  }, [analyticsInitialized])

  // Render clickable words
  const renderClickableWords = useCallback((text: string, isExample: boolean = false) =>
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
    ), [playAudio])

  const currentWord = words[currentIndex]
  if (!currentWord) {
    return (
      <div className="flex items-center justify-center h-screen">
        <p className="text-gray-500">No words available</p>
      </div>
    )
  }

  const currentBackground = backgroundIndices[currentIndex] !== undefined
    ? getBackgroundForWord(currentWord.wordIndex, currentWord.day - 1, backgroundIndices[currentIndex - 1] || -1)
    : getBackgroundForWord(0, 0, -1)

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
        onMouseLeave={handleMouseUp}
      >
        {words.map((word, index) => {
          const prevBgIndex = index > 0 ? (backgroundIndices[index - 1] !== undefined ? backgroundIndices[index - 1] : -1) : -1
          const background = backgroundIndices[index] !== undefined
            ? getBackgroundForWord(word.wordIndex, word.day - 1, prevBgIndex)
            : getBackgroundForWord(word.wordIndex, word.day - 1, -1)
          
          return (
            <div
              key={`${word.day}-${word.wordIndex}-${index}`}
              ref={(el) => {
                if (el) cardsRef.current[index] = el
              }}
              className="word-reel-card absolute inset-0 flex flex-col justify-center items-center p-8 text-center will-change-transform"
              style={{
                background: background,
                transform: index === currentIndex ? 'translateY(0)' : index === (currentIndex + 1) % words.length ? 'translateY(100%)' : 'translateY(0)',
              }}
            >
              {/* Overlay for text readability */}
              <div className="absolute inset-0 bg-black/25 pointer-events-none" />
              
              {/* Content */}
              <div className="relative z-10 w-full max-w-2xl space-y-6">
                {/* Word */}
                <div className="space-y-5">
                  <h2 
                    onClick={() => playAudio(word.english)}
                    className="text-[64px] font-bold text-white cursor-pointer hover:scale-105 transition-transform drop-shadow-2xl"
                    style={{ textShadow: '0 4px 12px rgba(0,0,0,0.5)' }}
                  >
                    {renderClickableWords(word.english)}
                  </h2>
                  <p 
                    className="text-[48px] text-[#FFD700] font-medium drop-shadow-lg"
                    style={{ textShadow: '0 2px 8px rgba(0,0,0,0.5)' }}
                  >
                    {word.chinese}
                  </p>
                </div>
                
                {/* Divider */}
                <div className="h-px bg-white/30 w-full max-w-md mx-auto my-[60px]" />
                
                {/* Sentence */}
                <div className="space-y-4">
                  <p 
                    onClick={() => playAudio(word.englishSentence, 'sentence_audio_played')}
                    className="text-[28px] text-white cursor-pointer hover:scale-105 transition-transform drop-shadow-lg leading-relaxed"
                    style={{ textShadow: '0 2px 8px rgba(0,0,0,0.5)' }}
                  >
                    {renderClickableWords(word.englishSentence, true)}
                  </p>
                  <p 
                    className="text-[24px] text-[#B0B0B0] drop-shadow-lg"
                    style={{ textShadow: '0 2px 8px rgba(0,0,0,0.5)' }}
                  >
                    {word.chineseSentence}
                  </p>
                </div>
                
                {/* Part of Speech Badge */}
                <div className="pt-4">
                  <span className="inline-block bg-white/20 backdrop-blur-sm text-white px-4 py-2 rounded-full text-sm font-medium border border-white/30">
                    {word.partOfSpeech}
                  </span>
                </div>
              </div>
              
              {/* Swipe Indicator - only show on current card */}
              {index === currentIndex && (
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
          )
        })}
      </div>
    </div>
  )
}
