export function playText(text: string) {
  console.log(`playText called with: "${text}"`);
  if (typeof window !== 'undefined' && (window as any).googleTTS?.speak) {
    console.log('Attempting to use window.googleTTS.speak');
    try {
      (window as any).googleTTS.speak(text);
      console.log('Called window.googleTTS.speak successfully.');
    } catch (e) {
      console.error('Error calling window.googleTTS.speak:', e);
    }
  } else if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
    console.log('Falling back to browser speechSynthesis');
    try {
      window.speechSynthesis.cancel(); // Cancel any previous speech
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.lang = 'en-US';
      utterance.onerror = (event) => {
        console.error('SpeechSynthesisUtterance error:', event.error);
      };
      window.speechSynthesis.speak(utterance);
      console.log('Called window.speechSynthesis.speak successfully.');
    } catch (e) {
      console.error('Error calling window.speechSynthesis.speak:', e);
    }
  } else {
    console.error('TTS Error: Neither Google TTS nor browser speechSynthesis found/supported.');
  }
} 