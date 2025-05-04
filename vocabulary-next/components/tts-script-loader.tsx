"use client"

import Script from 'next/script'

// Define props for the component
interface TtsScriptLoaderProps {
  apiKey: string;
}

export function TtsScriptLoader({ apiKey }: TtsScriptLoaderProps) {
  // DEBUG: Log the received prop
  console.log(`[TtsScriptLoader] Received apiKey prop (length ${apiKey.length}): ${apiKey ? apiKey.substring(0, 4) + '...' : 'EMPTY'}`);

  return (
    <Script
      src="/practice/google-tts.js" // Assumes basePath handles the /practice prefix
      strategy="beforeInteractive"
      onLoad={() => {
        console.log("[TtsScriptLoader] google-tts.js script loaded. Configuring...");
        if (window.googleTTS) {
          console.log("[TtsScriptLoader] Configuring Google TTS Manager via onLoad...");
          // Use the apiKey passed via props
          if (apiKey) {
             // DEBUG: Enhance log before calling setApiKey
             console.log(`[TtsScriptLoader] Setting API key via prop (length ${apiKey.length}): ${apiKey.substring(0, 4)}...`); 
             window.googleTTS.setApiKey(apiKey);
          } else {
             // Log a warning if the key received via props is empty
             console.warn("Google TTS API Key was empty (received via prop). Using browser TTS fallback.");
          }
          // Set the desired voice (can also be passed via props if needed)
          window.googleTTS.setVoice('en-US-Neural2-D');
        } else {
          console.error("window.googleTTS not found even after script onLoad triggered!");
        }
      }}
      onError={(e) => {
        console.error("Error loading google-tts.js script:", e);
      }}
    />
  )
} 