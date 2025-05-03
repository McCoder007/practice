export function playText(text: string) {
  // Use optional chaining and check window object existence
  if (typeof window !== 'undefined') {
    if (window.googleTTS?.speak) {
      window.googleTTS.speak(text);
    } else if ('speechSynthesis' in window) {
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.lang = 'en-US';
      window.speechSynthesis.speak(utterance);
    }
  }
} 