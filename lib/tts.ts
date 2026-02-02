import { enqueueAudio, clearAudioQueue as clearQueue, isAudioPlaying } from './audio-queue';
import { getPreferredVoice } from './voice';

/**
 * Preload audio for a given text without playing it.
 * For Google TTS: Fetches and caches audio data.
 */
export function preloadText(text: string): void {
  if (typeof window === 'undefined' || !text) return;

  if (window.googleTTS?.synthesizeSpeech) {
    if (window.googleTTS.audioCache?.[text]) {
      return;
    }
    window.googleTTS.synthesizeSpeech(text, true).catch(() => {
      // Silently ignore preload errors
    });
  }
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

/**
 * Warm the iOS audio session so that programmatic audio.play() calls succeed
 * even after a period of silence. Call this from touch/click event handlers.
 */
export function warmAudioSession(): void {
  if (typeof window !== 'undefined' && window.googleTTS?.warmAudioSession) {
    window.googleTTS.warmAudioSession();
  }
}

/**
 * Play text immediately (tap-to-speak path).
 * Stops any current playback and clears the queue first.
 */
export function playText(text: string) {
  if (typeof window !== 'undefined') {
    stopTTS();
    clearQueue();

    if (window.googleTTS?.speak) {
      window.googleTTS.speak(text).catch(error => {
        console.error("Google TTS failed, falling back to browser TTS:", error);
        playBrowserTTS(text);
      });
    } else if ('speechSynthesis' in window) {
      playBrowserTTS(text);
    }
  }
}

// Helper function for browser TTS logic
function playBrowserTTS(text: string) {
  const synth = window.speechSynthesis;

  synth.cancel();

  const utterance = new SpeechSynthesisUtterance(text);

  const voice = getPreferredVoice();
  if (voice) {
    utterance.voice = voice;
    utterance.lang = voice.lang;
  } else {
    utterance.lang = 'en-US';
  }

  utterance.rate = 0.9;
  utterance.pitch = 1;
  utterance.volume = 1;

  if (window.googleTTS) {
    window.googleTTS.browserUtterance = utterance;
  }
  synth.speak(utterance);
}

/**
 * Play text using the audio queue system (for auto-speak).
 * Ensures sequential playback without race conditions.
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
