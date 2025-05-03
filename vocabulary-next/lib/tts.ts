export function playText(text: string) {
  // Use optional chaining and check window object existence
  if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
    const synth = window.speechSynthesis;

    // Function to perform the speech synthesis
    const speakNow = () => {
      // Cancel any ongoing speech first
      synth.cancel();

      const utterance = new SpeechSynthesisUtterance(text);

      // --- Voice Selection ---
      let voices = synth.getVoices();
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
        console.log('SpeechSynthesis started for:', text);
      };
      utterance.onend = () => {
        console.log('SpeechSynthesis finished for:', text);
      };

      // --- Speak ---
      console.log('Attempting to speak:', text, 'with voice:', utterance.voice?.name);
      synth.speak(utterance);
    };

    // --- Voice Loading Check ---
    // Check if voices are loaded. If not, wait for the event.
    if (synth.getVoices().length === 0) {
      console.warn('Voices not loaded yet. Waiting for onvoiceschanged...');
      synth.onvoiceschanged = () => {
        console.log('onvoiceschanged event fired. Voices loaded.');
        // Important: Remove the listener after it fires once
        synth.onvoiceschanged = null;
        speakNow();
      };
      // As a fallback timeout in case onvoiceschanged doesn't fire reliably
      setTimeout(() => {
        if (synth.getVoices().length === 0) {
          console.warn('Timeout waiting for voices. Attempting to speak anyway.');
        }
         // Make sure the listener is removed if the timeout fired first
        synth.onvoiceschanged = null;
        speakNow();
      }, 1000); // Wait up to 1 second
    } else {
      // Voices are already loaded, speak immediately
      speakNow();
    }

  } else if (typeof window !== 'undefined') {
      // Fallback if googleTTS was expected but not found AND speechSynthesis is missing
      console.error('SpeechSynthesis not supported in this browser, and googleTTS not found.');
      // Optional: Add UI feedback that TTS is not available
  }
} 