export function playText(text: string) {
  // Use optional chaining and check window object existence
  if (typeof window !== 'undefined') {
    // Try Google TTS first if available
    if (window.googleTTS?.speak) {
      console.log("Attempting Google TTS for:", text);
      window.googleTTS.speak(text).catch(error => {
        console.error("Google TTS failed, falling back to browser TTS:", error);
        // Fallback to browser TTS on Google TTS error
        playBrowserTTS(text);
      });
    } 
    // Else, if browser speech synthesis is supported, use it
    else if ('speechSynthesis' in window) {
      console.log("Google TTS not available, using browser TTS for:", text);
      playBrowserTTS(text);
    } 
    // Else, TTS is not supported
    else {
      console.error('TTS not supported on this browser.');
      // Optional: Add UI feedback that TTS is not available
    }
  }
}

// Helper function for browser TTS logic (extracted from previous version)
function playBrowserTTS(text: string) {
  const synth = window.speechSynthesis;

  // Function to perform the speech synthesis
  const speakNow = () => {
    // Cancel any ongoing speech first
    synth.cancel();

    const utterance = new SpeechSynthesisUtterance(text);

    // --- Voice Selection ---
    const voices = synth.getVoices();
    let selectedVoice = voices.find(voice => voice.lang === 'en-US' && voice.localService); // Prefer local US English
    if (!selectedVoice) {
      selectedVoice = voices.find(voice => voice.lang.startsWith('en-') && voice.localService); // Fallback to any local English
    }
    if (!selectedVoice) {
      selectedVoice = voices.find(voice => voice.lang === 'en-US'); // Fallback to any US English
    }
    if (!selectedVoice) {
      selectedVoice = voices.find(voice => voice.lang.startsWith('en-')); // Fallback to any English
    }
    // If still no English voice, use the default/first available
    utterance.voice = selectedVoice || voices[0] || null;

    // --- Configuration ---
    utterance.lang = selectedVoice ? selectedVoice.lang : 'en-US'; // Set lang based on voice or default
    utterance.rate = 0.9; // Slightly slower might help
    utterance.pitch = 1;
    utterance.volume = 1;

    // --- Error Handling ---
    utterance.onerror = (event) => {
      console.error(
        'SpeechSynthesisUtterance Error:',
        event.error,
        'Text:', text,
        'Voice:', utterance.voice?.name,
        'Lang:', utterance.lang
      );
      // Optional: Add UI feedback about the error here
    };

    utterance.onstart = () => {
      console.log('Browser SpeechSynthesis started for:', text);
    };
    utterance.onend = () => {
      console.log('Browser SpeechSynthesis finished for:', text);
    };

    // --- Speak ---
    console.log('Attempting to speak via browser:', text, 'with voice:', utterance.voice?.name);
    synth.speak(utterance);
  };

  // --- Voice Loading Check ---
  // Check if voices are loaded. If not, wait for the event.
  if (synth.getVoices().length === 0 && synth.onvoiceschanged !== undefined) {
    console.warn('Browser voices not loaded yet. Waiting for onvoiceschanged...');
    synth.onvoiceschanged = () => {
      console.log('Browser onvoiceschanged event fired. Voices loaded.');
      // Important: Remove the listener after it fires once
      synth.onvoiceschanged = null;
      speakNow();
    };
    // As a fallback timeout in case onvoiceschanged doesn't fire reliably
    setTimeout(() => {
      if (synth.getVoices().length === 0) {
        console.warn('Timeout waiting for browser voices. Attempting to speak anyway.');
      }
       // Make sure the listener is removed if the timeout fired first
       if (synth.onvoiceschanged) { // Check if listener still exists
         synth.onvoiceschanged = null;
         speakNow();
       }
    }, 1000); // Wait up to 1 second
  } else {
    // Voices are already loaded (or onvoiceschanged not supported), speak immediately
    speakNow();
  }
} 