// Firebase Analytics implementation for React app
import { initializeApp } from 'firebase/app';
import { getAnalytics, logEvent as firebaseLogEvent, isSupported } from 'firebase/analytics';

// Firebase config: API key from env (never committed), rest are project identifiers
const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY || '',
  authDomain: "esl-preposition-practice.firebaseapp.com",
  projectId: "esl-preposition-practice",
  storageBucket: "esl-preposition-practice.firebasestorage.app",
  messagingSenderId: "23182734978",
  appId: "1:23182734978:web:060de369f972ec36baa69b",
  measurementId: "G-Z3QP99QCWD"
};

// Flag to prevent initializing Firebase multiple times
let isAnalyticsInitialized = false;
let analyticsInstance: any = null;

// Analytics state tracking
export interface AnalyticsState {
  sessionStartTime: Date;
  lastInteractionTime: Date;
  totalTTSInteractions: number;
  uniqueWordsInteracted: Set<string>;
  daysViewed: Set<number>;
  dayViewSequence: number[];
  interactionGaps: number[];
  dayViewDurations: Record<number, number>;
  maxScrollPercentages: Record<number, number>;
  reachedCheckpointsByDay: Record<number, Set<number>>;
  currentDayStartTime: Date | null;
  currentDay: number | null;
}

// Initialize the analytics state
export const analyticsState: AnalyticsState = {
  sessionStartTime: new Date(),
  lastInteractionTime: new Date(),
  totalTTSInteractions: 0,
  uniqueWordsInteracted: new Set<string>(),
  daysViewed: new Set<number>(),
  dayViewSequence: [],
  interactionGaps: [],
  dayViewDurations: {},
  maxScrollPercentages: {},
  reachedCheckpointsByDay: {},
  currentDayStartTime: null,
  currentDay: null,
};

// Scroll checkpoints for tracking
export const scrollCheckpoints = [25, 50, 75, 100];

// Initialize Firebase and Analytics
export const initializeAnalytics = async () => {
  // Only initialize once and only in the browser
  if (isAnalyticsInitialized || typeof window === 'undefined') {
    return analyticsInstance;
  }

  try {
    // Only initialize when API key is set (e.g. from env at build time)
    if (!firebaseConfig.apiKey) {
      return null;
    }
    // Check if analytics is supported in this environment
    if (await isSupported()) {
      // Initialize Firebase
      const app = initializeApp(firebaseConfig);
      analyticsInstance = getAnalytics(app);
      isAnalyticsInitialized = true;
      
      // Initialize session tracking
      analyticsState.sessionStartTime = new Date();
      analyticsState.lastInteractionTime = new Date();
      
      // Set up beforeunload handler for session tracking
      window.addEventListener('beforeunload', logSessionEnd);
      
      return analyticsInstance;
    } else {
      return null;
    }
  } catch (error) {
    console.error('Failed to initialize Firebase Analytics:', error);
    return null;
  }
};

// Log an event to Firebase Analytics
export const logEvent = (eventName: string, eventParams: Record<string, any> = {}) => {
  // Add device information
  const deviceInfo = typeof window !== 'undefined' ? {
    userAgent: navigator.userAgent,
    platform: navigator.platform,
    screenWidth: window.screen.width,
    screenHeight: window.screen.height,
    devicePixelRatio: window.devicePixelRatio,
    isMobile: /iPhone|iPad|iPod|Android/i.test(navigator.userAgent)
  } : {};
  
  // Combined parameters
  const paramsWithDevice = {
    ...eventParams,
    device_info: deviceInfo
  };
  
  try {
    if (isAnalyticsInitialized && analyticsInstance) {
      firebaseLogEvent(analyticsInstance, eventName, paramsWithDevice);
    }
  } catch (error) {
    console.error('Error logging event:', error);
  }
};

// Log a word interaction event
export const logWordInteraction = (word: string, interactionType: 'word_audio_played' | 'sentence_audio_played') => {
  // Track the interaction
  analyticsState.totalTTSInteractions++;
  analyticsState.uniqueWordsInteracted.add(word);
  
  // Track time between interactions
  const now = new Date();
  if (analyticsState.lastInteractionTime) {
    const timeSinceLastInteraction = (now.getTime() - analyticsState.lastInteractionTime.getTime()) / 1000;
    
    // Only track reasonable gaps (more than 0.5s and less than 5 minutes)
    if (timeSinceLastInteraction > 0.5 && timeSinceLastInteraction < 300) {
      analyticsState.interactionGaps.push(timeSinceLastInteraction);
    }
  }
  analyticsState.lastInteractionTime = now;
  
  // Log the event
  logEvent('vocabulary_interaction', {
    word,
    interaction_type: interactionType,
    day: analyticsState.currentDay,
    total_interactions: analyticsState.totalTTSInteractions,
    unique_words_interacted: analyticsState.uniqueWordsInteracted.size,
    time_since_day_start: analyticsState.currentDayStartTime 
      ? (now.getTime() - analyticsState.currentDayStartTime.getTime()) / 1000 
      : 0
  });
};

// Track day change
export const trackDayChange = (newDay: number, previousDay: number | null = null) => {
  const now = new Date();
  
  // If we have a current day and time, calculate time spent on it
  if (analyticsState.currentDayStartTime && analyticsState.currentDay !== null && previousDay !== null) {
    const timeSpent = (now.getTime() - analyticsState.currentDayStartTime.getTime()) / 1000;
    analyticsState.dayViewDurations[previousDay] = (analyticsState.dayViewDurations[previousDay] || 0) + timeSpent;
    
    // Log metrics about the day we're leaving
    logEvent('final_day_metrics', {
      day: previousDay,
      view_duration_seconds: analyticsState.dayViewDurations[previousDay].toFixed(2),
      max_scroll_percentage: analyticsState.maxScrollPercentages[previousDay] || 0,
      scroll_checkpoints_reached: Array.from(analyticsState.reachedCheckpointsByDay[previousDay] || [])
    });
  }
  
  // Update tracking for the new day
  analyticsState.currentDay = newDay;
  analyticsState.currentDayStartTime = now;
  analyticsState.daysViewed.add(newDay);
  analyticsState.dayViewSequence.push(newDay);
  
  // Initialize tracking objects for this day if needed
  if (!analyticsState.maxScrollPercentages[newDay]) {
    analyticsState.maxScrollPercentages[newDay] = 0;
  }
  if (!analyticsState.reachedCheckpointsByDay[newDay]) {
    analyticsState.reachedCheckpointsByDay[newDay] = new Set();
  }
  
  // Log the day change event
  logEvent('vocabulary_day_changed', {
    from_day: previousDay,
    to_day: newDay,
    days_viewed_count: analyticsState.daysViewed.size,
    day_sequence_position: analyticsState.dayViewSequence.length
  });
};

// Track scroll depth
export const trackScrollDepth = (scrollPercentage: number) => {
  if (!analyticsState.currentDay) return;
  
  // Update max scroll depth if deeper
  if (scrollPercentage > (analyticsState.maxScrollPercentages[analyticsState.currentDay] || 0)) {
    analyticsState.maxScrollPercentages[analyticsState.currentDay] = scrollPercentage;
    
    // Ensure we have a Set for the current day's checkpoints
    if (!analyticsState.reachedCheckpointsByDay[analyticsState.currentDay]) {
      analyticsState.reachedCheckpointsByDay[analyticsState.currentDay] = new Set();
    }
    
    // Check for checkpoints
    scrollCheckpoints.forEach(checkpoint => {
      if (scrollPercentage >= checkpoint && 
          analyticsState.currentDay !== null && 
          !analyticsState.reachedCheckpointsByDay[analyticsState.currentDay].has(checkpoint)) {
        
        analyticsState.reachedCheckpointsByDay[analyticsState.currentDay].add(checkpoint);
        
        // Log the checkpoint event
        logEvent('scroll_depth_reached', {
          day: analyticsState.currentDay,
          depth_percentage: checkpoint,
          max_scroll_percentage: scrollPercentage,
          time_since_day_load: analyticsState.currentDayStartTime 
            ? (new Date().getTime() - analyticsState.currentDayStartTime.getTime()) / 1000 
            : 0
        });
      }
    });
  }
};

// Force log a 100% scroll depth event (for when users reach the bottom)
export const logFullScrollReached = () => {
  const currentDay = analyticsState.currentDay;
  if (currentDay === null) return;
  
  // Mark that user has scrolled 100%
  const scrollPercentage = 100;
  
  // Don't update if we've already tracked a higher value
  if (scrollPercentage <= (analyticsState.maxScrollPercentages[currentDay] || 0)) {
    return;
  }
  
  // Update the max scroll percentage
  analyticsState.maxScrollPercentages[currentDay] = scrollPercentage;
  
  // Ensure we have a Set for checkpoints
  if (!analyticsState.reachedCheckpointsByDay[currentDay]) {
    analyticsState.reachedCheckpointsByDay[currentDay] = new Set();
  }
  
  // Log all checkpoints that weren't previously recorded
  scrollCheckpoints.forEach(checkpoint => {
    if (!analyticsState.reachedCheckpointsByDay[currentDay].has(checkpoint)) {
      analyticsState.reachedCheckpointsByDay[currentDay].add(checkpoint);
      
      // Log each checkpoint
      logEvent('scroll_depth_reached', {
        day: currentDay,
        depth_percentage: checkpoint,
        max_scroll_percentage: scrollPercentage,
        time_since_day_load: analyticsState.currentDayStartTime 
          ? (new Date().getTime() - analyticsState.currentDayStartTime.getTime()) / 1000 
          : 0,
        was_forced: true
      });
    }
  });
};

// Log session metrics when the user exits
export const logSessionEnd = () => {
  const now = new Date();
  const sessionDuration = (now.getTime() - analyticsState.sessionStartTime.getTime()) / 1000;
  
  // Calculate word interaction metrics
  const uniqueWordsCount = analyticsState.uniqueWordsInteracted.size;
  
  // Calculate average interaction gap
  const avgInteractionGap = analyticsState.interactionGaps.length > 0
    ? analyticsState.interactionGaps.reduce((a, b) => a + b, 0) / analyticsState.interactionGaps.length
    : 0;
  
  // Log the session end event
  logEvent('session_ended', {
    session_duration_seconds: sessionDuration.toFixed(2),
    days_viewed: Array.from(analyticsState.daysViewed),
    days_viewed_count: analyticsState.daysViewed.size,
    day_navigation_sequence: analyticsState.dayViewSequence,
    tts_interaction_count: analyticsState.totalTTSInteractions,
    unique_words_interacted: uniqueWordsCount,
    day_view_durations: analyticsState.dayViewDurations,
    max_scroll_percentages: analyticsState.maxScrollPercentages,
    avg_interaction_gap_seconds: avgInteractionGap.toFixed(2)
  });
}; 