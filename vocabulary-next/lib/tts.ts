import { enqueueAudio, clearAudioQueue as clearQueue, isAudioPlaying } from './audio-queue';

// Cache for browser TTS voice configuration (to avoid repeated lookups)
let cachedVoice: SpeechSynthesisVoice | null = null;
let voicesLoaded = false;

// Initialize voices on module load
if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
  const loadVoices = () => {
    const voices = window.speechSynthesis.getVoices();
    if (voices.length > 0) {
      cachedVoice = voices.find(voice => voice.lang === 'en-US' && voice.localService)
        || voices.find(voice => voice.lang.startsWith('en-') && voice.localService)
        || voices.find(voice => voice.lang === 'en-US')
        || voices.find(voice => voice.lang.startsWith('en-'))
        || voices[0]
        || null;
      voicesLoaded = true;
    }
  };

  loadVoices();
  if (window.speechSynthesis.onvoiceschanged !== undefined) {
    window.speechSynthesis.onvoiceschanged = loadVoices;
  }
}

/**
 * Preload audio for a given text without playing it.
 * For Google TTS: Fetches and caches audio data.
 * For Browser TTS: Ensures voices are loaded.
 */
export function preloadText(text: string): void {
  if (typeof window === 'undefined' || !text) return;

  // For Google TTS: Use synthesizeSpeech with isPreInit=true to cache without playing
  if (window.googleTTS?.synthesizeSpeech) {
    // Check if already cached
    if (window.googleTTS.audioCache?.[text]) {
      return; // Already cached
    }
    // Preload in background (don't await, fire and forget)
    window.googleTTS.synthesizeSpeech(text, true).catch(() => {
      // Silently ignore preload errors
    });
  }
  // For browser TTS: Just ensure voices are loaded (nothing else to preload)
  // The actual utterance will be created when playing
}

/**
 * Preload multiple texts at once (e.g., current word, sentence, next word, prev word).
 */
export function preloadTexts(texts: string[]): void {
  texts.forEach(text => {
    if (text) preloadText(text);
  });
}

/**
 * Stop any ongoing speech.
 */
export function stopTTS(): void {
  if (typeof window !== 'undefined' && window.googleTTS?.stop) {
    window.googleTTS.stop();
  } else if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
    window.speechSynthesis.cancel();
  }
}

export function playText(text: string) {
  // Use optional chaining and check window object existence
  if (typeof window !== 'undefined') {
    // REMOVED: stopTTS(); // Aggressive stop removed to prevent stuttering

    // Try Google TTS first if available
    if (window.googleTTS?.speak) {
      // Audio is already cached by preloadText, speak() will use cached audio instantly
      window.googleTTS.speak(text).catch(error => {
        console.error("Google TTS failed, falling back to browser TTS:", error);
        // Fallback to browser TTS on Google TTS error
        playBrowserTTS(text);
      });
    }
    // Else, if browser speech synthesis is supported, use it
    else if ('speechSynthesis' in window) {
      playBrowserTTS(text);
    }
    // Else, TTS is not supported
    else {
      console.error('TTS not supported on this browser.');
    }
  }
}

// Helper function for browser TTS logic - optimized for instant playback
function playBrowserTTS(text: string) {
  const synth = window.speechSynthesis;

  // Cancel any ongoing speech first
  synth.cancel();

  const utterance = new SpeechSynthesisUtterance(text);

  // Use cached voice if available (much faster than searching every time)
  if (voicesLoaded && cachedVoice) {
    utterance.voice = cachedVoice;
    utterance.lang = cachedVoice.lang;
  } else {
    // Fallback: try to find a voice now
    const voices = synth.getVoices();
    const selectedVoice = voices.find(voice => voice.lang === 'en-US' && voice.localService)
      || voices.find(voice => voice.lang.startsWith('en-') && voice.localService)
      || voices.find(voice => voice.lang === 'en-US')
      || voices.find(voice => voice.lang.startsWith('en-'))
      || voices[0]
      || null;
    utterance.voice = selectedVoice;
    utterance.lang = selectedVoice ? selectedVoice.lang : 'en-US';
  }

  // Configuration
  utterance.rate = 0.9;
  utterance.pitch = 1;
  utterance.volume = 1;

  // Speak immediately (voices should already be loaded from module init)
  if (window.googleTTS) {
    window.googleTTS.browserUtterance = utterance;
  }
  synth.speak(utterance);
}

/**
 * Play text using the audio queue system (for auto-speak)
 * This ensures sequential playback without race conditions
 */
export function playTextQueued(text: string): Promise<void> {
  if (typeof window === 'undefined' || !text) {
    return Promise.resolve();
  }

  return enqueueAudio(text);
}

/**
 * Clear the audio queue and stop current playback
 */
export function clearAudioQueue(): void {
  if (typeof window === 'undefined') {
    return;
  }

  clearQueue();
}

/**
 * Check if audio is currently playing in the queue
 */
export function isAudioQueuePlaying(): boolean {
  if (typeof window === 'undefined') {
    return false;
  }

  return isAudioPlaying();
}