/**
 * Audio Queue Manager
 * 
 * Manages a queue of audio playback requests to ensure sequential playback
 * without race conditions or cancellations. Designed for auto-speak functionality
 * in Word Reel where words change rapidly.
 */

type AudioQueueItem = {
  text: string;
  resolve: () => void;
  reject: (error: Error) => void;
};

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
   * Clear the queue and stop current playback
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
        // Browser TTS - cancel all (we can't cancel specific utterance)
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
    this.isCancelled = false;
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

    while (this.queue.length > 0 && !this.isCancelled) {
      const item = this.queue.shift();
      if (!item) break;

      try {
        await this.playAudio(item.text);
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
   * Play audio using Google TTS
   */
  private async playGoogleTTS(text: string): Promise<void> {
    if (!window.googleTTS?.speak) {
      throw new Error('Google TTS not available');
    }

    // Google TTS speak() returns a promise that resolves when audio finishes
    const audioPromise = window.googleTTS.speak(text);

    // Store reference to current audio for potential cancellation
    // The audio is created synchronously in playAudioFromBase64, so we can check after a microtask
    await Promise.resolve(); // Allow currentAudio to be set
    if (window.googleTTS.currentAudio) {
      this.currentAudio = window.googleTTS.currentAudio;
    }

    await audioPromise;
    this.currentAudio = null;
  }

  /**
   * Play audio using Browser TTS
   */
  private async playBrowserTTS(text: string): Promise<void> {
    if (!('speechSynthesis' in window)) {
      throw new Error('Browser TTS not available');
    }

    const synth = window.speechSynthesis;

    // Create utterance
    const utterance = new SpeechSynthesisUtterance(text);

    // Use cached voice if available
    const cachedVoice = this.getCachedVoice();
    if (cachedVoice) {
      utterance.voice = cachedVoice;
      utterance.lang = cachedVoice.lang;
    } else {
      utterance.lang = 'en-US';
    }

    // Configuration
    utterance.rate = 0.9;
    utterance.pitch = 1;
    utterance.volume = 1;

    // Store reference for cancellation
    this.currentAudio = utterance;

    // Track utterance for potential cancellation
    if (window.googleTTS) {
      window.googleTTS.browserUtterance = utterance;
    }

    // Return a promise that resolves when utterance finishes
    return new Promise((resolve, reject) => {
      utterance.onend = () => {
        this.currentAudio = null;
        resolve();
      };

      utterance.onerror = (event) => {
        this.currentAudio = null;
        console.error('SpeechSynthesisUtterance error:', event.error);
        reject(new Error(`Speech synthesis error: ${event.error}`));
      };

      synth.speak(utterance);
    });
  }

  /**
   * Get cached voice for browser TTS
   */
  private getCachedVoice(): SpeechSynthesisVoice | null {
    if (typeof window === 'undefined' || !('speechSynthesis' in window)) {
      return null;
    }

    const voices = window.speechSynthesis.getVoices();
    return (
      voices.find(voice => voice.lang === 'en-US' && voice.localService) ||
      voices.find(voice => voice.lang.startsWith('en-') && voice.localService) ||
      voices.find(voice => voice.lang === 'en-US') ||
      voices.find(voice => voice.lang.startsWith('en-')) ||
      voices[0] ||
      null
    );
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
