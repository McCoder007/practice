export function playText(text: string) {
  console.log(`[playText] Called with text: "${text}"`); // Log function call
  // Use optional chaining and check window object existence
  if (typeof window !== 'undefined') {
    console.log(`[playText] Checking window.googleTTS exists: ${!!window.googleTTS}`);
    console.log(`[playText] Checking window.googleTTS.speak exists: ${!!window.googleTTS?.speak}`);
    if (window.googleTTS?.speak) {
      console.log('[playText] Calling window.googleTTS.speak()');
      window.googleTTS.speak(text);
    } else if ('speechSynthesis' in window) {
      console.log('[playText] Falling back to browser speechSynthesis');
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.lang = 'en-US';
      window.speechSynthesis.speak(utterance);
    }
  }
} 