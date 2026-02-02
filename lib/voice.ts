/**
 * Shared voice selection for browser TTS.
 * Used by both tts.ts and audio-queue.ts to avoid duplication.
 */

let cachedVoice: SpeechSynthesisVoice | null = null;
let voicesLoaded = false;

if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
  const loadVoices = () => {
    const voices = window.speechSynthesis.getVoices();
    if (voices.length > 0) {
      cachedVoice = voices.find(v => v.lang === 'en-US' && v.localService)
        || voices.find(v => v.lang.startsWith('en-') && v.localService)
        || voices.find(v => v.lang === 'en-US')
        || voices.find(v => v.lang.startsWith('en-'))
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

export function getPreferredVoice(): SpeechSynthesisVoice | null {
  if (voicesLoaded && cachedVoice) return cachedVoice;
  if (typeof window === 'undefined' || !('speechSynthesis' in window)) return null;

  const voices = window.speechSynthesis.getVoices();
  return (
    voices.find(v => v.lang === 'en-US' && v.localService) ||
    voices.find(v => v.lang.startsWith('en-') && v.localService) ||
    voices.find(v => v.lang === 'en-US') ||
    voices.find(v => v.lang.startsWith('en-')) ||
    voices[0] ||
    null
  );
}
