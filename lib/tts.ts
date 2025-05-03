export function playText(text: string) {
  if (typeof window !== 'undefined' && (window as any).googleTTS?.speak) {
    (window as any).googleTTS.speak(text);
  } else if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = 'en-US';
    window.speechSynthesis.speak(utterance);
  }
} 