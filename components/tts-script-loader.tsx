"use client"

import Script from 'next/script'

export function TtsScriptLoader() {
  return (
    <Script 
      src="/practice/google-tts.js" 
      strategy="beforeInteractive" 
      onLoad={() => {
        console.log("google-tts.js script loaded. Configuring...");
        if (window.googleTTS) {
          console.log("Configuring Google TTS Manager via onLoad...");
          // Ensure fallback to empty string if env vars are undefined
          const apiKey = process.env.NEXT_PUBLIC_GOOGLE_TTS_API_KEY || process.env.GOOGLE_TTS_API_KEY || '';
          if (apiKey) {
             window.googleTTS.setApiKey(apiKey);
          } else {
             console.warn("Google TTS API Key not found in environment variables.");
          }
          // Set the desired voice
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