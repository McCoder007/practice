"use client"; // Mark this as a Client Component

import Script from 'next/script';
import { useEffect } from 'react';
import { useTts } from '@/context/TtsContext'; // Import the hook

// Types should be available globally from types/global.d.ts
// No need to redeclare Window interface here if global.d.ts is included in tsconfig

export function TtsLoader() {
  console.log('[TtsLoader] Rendering component (v2 - API Route)');
  const { setIsTtsInitialized } = useTts(); // Get the setter from context

  // Optional: useEffect could still check if window.googleTTS is set and update context
  // This acts as a backup if onLoad doesn't fire or if the script is cached.
  useEffect(() => {
    // Check periodically or after a delay if the instance exists
    const checkInterval = setInterval(() => {
      if (window.googleTTS) {
        console.log('[TtsLoader] googleTTS instance found via interval check. Setting initialized.');
        // Use the correct type from global.d.ts implicitly
        setIsTtsInitialized(true);
        clearInterval(checkInterval); // Stop checking once found
      }
    }, 500); // Check every 500ms

    // Set a timeout to stop checking after a few seconds
    const checkTimeout = setTimeout(() => {
        clearInterval(checkInterval);
        if (!window.googleTTS) {
            console.warn('[TtsLoader] googleTTS instance not found after timeout. Assuming fallback needed.');
            // We might set initialized true anyway to allow browser fallback to work
            setIsTtsInitialized(true);
        }
    }, 5000); // Stop checking after 5 seconds

    // Cleanup function
    return () => {
      clearInterval(checkInterval);
      clearTimeout(checkTimeout);
    };
  }, [setIsTtsInitialized]); // Re-run if the setter changes (shouldn't happen often)

  return (
    <Script
      src="/google-tts.js" // The refactored script
      strategy="lazyOnload"
      onLoad={() => {
        console.log('[TtsLoader] Script /google-tts.js loaded (onLoad)');
        // Initialize the TTS manager instance
        // Check window.GoogleTTSManager exists before calling `new`
        if (typeof window !== 'undefined' && window.GoogleTTSManager && !window.googleTTS) {
          console.log('Instantiating GoogleTTSManager (onLoad)...');
          // TypeScript should infer the type from global.d.ts
          window.googleTTS = new window.GoogleTTSManager();
          // Now that the manager is instantiated, mark TTS as initialized
          // The manager itself will determine if Google API or browser fallback is used.
          setIsTtsInitialized(true);
          console.log('[TtsLoader] TTS system initialized (onLoad).');
        } else if (window.googleTTS) {
            console.log('[TtsLoader] GoogleTTSManager already instantiated (onLoad), ensuring state is set.');
            setIsTtsInitialized(true); // Ensure state is true if instance exists
        }
      }}
      onError={(e) => {
        console.error('Error loading google-tts.js:', e);
        // If the script fails to load, we should still allow potential browser fallback
        // by marking TTS as "initialized" (meaning the loader has finished attempting setup).
        setIsTtsInitialized(true);
        console.warn('[TtsLoader] TTS system initialized (onError - script load failed). Assuming fallback.');
      }}
    />
  );
} 