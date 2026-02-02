/**
 * Audio Queue Manager
 *
 * Manages a queue of audio playback requests to ensure sequential playback
 * without race conditions or cancellations. Designed for auto-speak functionality
 * in Word Reel where words change rapidly.
 */

import { getPreferredVoice } from './voice';

type AudioQueueItem = {
  text: string;
  resolve: () => void;
  reject: (error: Error) => void;
};

// Maximum time to wait for a single audio to complete (prevents queue from hanging)
const AUDIO_TIMEOUT_MS = 10000; // 10 seconds max per word

class AudioQueueManager {
  private queue: AudioQueueItem[] = [];
  private isProcessing = false;
  private currentAudio: HTMLAudioElement | SpeechSynthesisUtterance | null = null;
  private isCancelled = false;

  /**
   * Add text to the audio queue
   */
  enqueue(text: string): Promise<void> {
    return new Promise((resolve, reject) => {
      if (!text || text.trim() === '') {
        resolve();
        return;
      }

      this.queue.push({ text, resolve, reject });
      this.processQueue();
    });
  }

  /**
   * Clear the queue and stop current playback.
   * isCancelled stays true until the next processQueue() cycle resets it.
   */
  clear(): void {
    this.isCancelled = true;
    this.queue = [];

    // Stop current audio playback
    if (this.currentAudio) {
      if (this.currentAudio instanceof HTMLAudioElement) {
        this.currentAudio.pause();
        this.currentAudio.src = '';
      } else if (this.currentAudio instanceof SpeechSynthesisUtterance) {
        if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
          window.speechSynthesis.cancel();
        }
      }
      this.currentAudio = null;
    }

    // Also stop via Google TTS if available
    if (typeof window !== 'undefined' && window.googleTTS?.stop) {
      window.googleTTS.stop();
    }

    this.isProcessing = false;
  }

  /**
   * Check if audio is currently playing
   */
  isPlaying(): boolean {
    return this.isProcessing || this.queue.length > 0;
  }

  /**
   * Get the current queue length
   */
  getQueueLength(): number {
    return this.queue.length;
  }

  /**
   * Process the queue sequentially
   */
  private async processQueue(): Promise<void> {
    // If already processing or queue is empty, return
    if (this.isProcessing || this.queue.length === 0) {
      return;
    }

    this.isProcessing = true;
    // Reset cancellation flag at the start of a new processing cycle
    this.isCancelled = false;

    while (this.queue.length > 0 && !this.isCancelled) {
      const item = this.queue.shift();
      if (!item) break;

      try {
        // Wrap playAudio with a timeout to prevent hanging
        await this.playAudioWithTimeout(item.text);
        item.resolve();
      } catch (error) {
        console.error('Audio playback error:', error);
        // Continue with next item even if current fails
        item.reject(error instanceof Error ? error : new Error('Audio playback failed'));
      }
    }

    this.isProcessing = false;
    this.currentAudio = null;
  }

  /**
   * Play audio with a timeout to prevent the queue from hanging
   */
  private async playAudioWithTimeout(text: string): Promise<void> {
    return new Promise((resolve, reject) => {
      let timeoutId: ReturnType<typeof setTimeout> | null = null;
      let resolved = false;

      // Set up timeout
      timeoutId = setTimeout(() => {
        if (!resolved) {
          resolved = true;
          console.warn(`Audio playback timed out for: "${text}"`);
          // Stop current playback to prevent overlap
          this.stopCurrentAudio();
          resolve(); // Resolve instead of reject to continue queue processing
        }
      }, AUDIO_TIMEOUT_MS);

      // Attempt to play
      this.playAudio(text)
        .then(() => {
          if (!resolved) {
            resolved = true;
            if (timeoutId) clearTimeout(timeoutId);
            resolve();
          }
        })
        .catch((error) => {
          if (!resolved) {
            resolved = true;
            if (timeoutId) clearTimeout(timeoutId);
            reject(error);
          }
        });
    });
  }

  /**
   * Stop the current audio playback
   */
  private stopCurrentAudio(): void {
    if (this.currentAudio) {
      if (this.currentAudio instanceof HTMLAudioElement) {
        this.currentAudio.pause();
        this.currentAudio.src = '';
      } else if (this.currentAudio instanceof SpeechSynthesisUtterance) {
        if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
          window.speechSynthesis.cancel();
        }
      }
      this.currentAudio = null;
    }
  }

  /**
   * Play audio using the appropriate TTS system
   */
  private async playAudio(text: string): Promise<void> {
    if (typeof window === 'undefined') {
      throw new Error('Window is not available');
    }

    // Try Google TTS first if available
    if (window.googleTTS?.speak) {
      try {
        await this.playGoogleTTS(text);
        return;
      } catch (error) {
        if (this.isCancelled) return; // Intentional cancellation, don't fall through
        console.warn('Google TTS failed, falling back to browser TTS:', error);
        // Fall through to browser TTS
      }
    }

    // Fallback to browser TTS
    if ('speechSynthesis' in window) {
      await this.playBrowserTTS(text);
      return;
    }

    throw new Error('TTS not supported on this browser');
  }

  /**
   * Play audio using Google TTS.
   * Cancellation works because clear() pauses the HTMLAudioElement and calls
   * googleTTS.stop(), which fires onended/onerror handlers and resolves the promise.
   */
  private async playGoogleTTS(text: string): Promise<void> {
    if (!window.googleTTS?.speak) {
      throw new Error('Google TTS not available');
    }

    if (this.isCancelled) {
      return;
    }

    // Google TTS speak() returns a promise that resolves when audio finishes.
    // If clear() is called during playback, it pauses the audio element and
    // calls googleTTS.stop(), which causes onended/onerror to fire and resolve this promise.
    const audioPromise = window.googleTTS.speak(text);

    // Allow currentAudio to be set on the googleTTS instance
    await Promise.resolve();

    if (this.isCancelled) {
      if (window.googleTTS.currentAudio) {
        window.googleTTS.currentAudio.pause();
        window.googleTTS.currentAudio.src = '';
        window.googleTTS.currentAudio = null;
      }
      if (window.googleTTS.stop) {
        window.googleTTS.stop();
      }
      return;
    }

    if (window.googleTTS.currentAudio) {
      this.currentAudio = window.googleTTS.currentAudio;
    }

    try {
      await audioPromise;
    } catch (error) {
      if (!this.isCancelled) {
        console.error(`Error playing audio for "${text}":`, error);
      }
      if (this.currentAudio instanceof HTMLAudioElement) {
        this.currentAudio.pause();
        this.currentAudio.src = '';
      }
      if (window.googleTTS?.stop) {
        window.googleTTS.stop();
      }
    } finally {
      this.currentAudio = null;
    }
  }

  /**
   * Play audio using Browser TTS.
   * Cancellation works because clear() calls speechSynthesis.cancel(),
   * which fires the utterance's onend or onerror event, resolving the promise.
   */
  private async playBrowserTTS(text: string): Promise<void> {
    if (!('speechSynthesis' in window)) {
      throw new Error('Browser TTS not available');
    }

    if (this.isCancelled) {
      return;
    }

    const synth = window.speechSynthesis;

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

    this.currentAudio = utterance;

    if (window.googleTTS) {
      window.googleTTS.browserUtterance = utterance;
    }

    return new Promise((resolve, reject) => {
      if (this.isCancelled) {
        synth.cancel();
        this.currentAudio = null;
        resolve();
        return;
      }

      utterance.onend = () => {
        this.currentAudio = null;
        resolve();
      };

      utterance.onerror = (event) => {
        this.currentAudio = null;
        // Don't reject if cancelled - just resolve to continue queue
        if (this.isCancelled) {
          resolve();
        } else {
          reject(new Error(`Speech synthesis error: ${event.error}`));
        }
      };

      synth.speak(utterance);
    });
  }
}

// Create singleton instance
let audioQueueInstance: AudioQueueManager | null = null;

/**
 * Get the audio queue instance (singleton)
 */
export function getAudioQueue(): AudioQueueManager {
  if (!audioQueueInstance) {
    audioQueueInstance = new AudioQueueManager();
  }
  return audioQueueInstance;
}

/**
 * Enqueue text for audio playback
 */
export function enqueueAudio(text: string): Promise<void> {
  return getAudioQueue().enqueue(text);
}

/**
 * Clear the audio queue and stop current playback
 */
export function clearAudioQueue(): void {
  getAudioQueue().clear();
}

/**
 * Check if audio is currently playing
 */
export function isAudioPlaying(): boolean {
  return getAudioQueue().isPlaying();
}

/**
 * Get the current queue length
 */
export function getAudioQueueLength(): number {
  return getAudioQueue().getQueueLength();
}
