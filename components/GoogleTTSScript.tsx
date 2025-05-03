"use client"

import React, { useEffect } from 'react';

export function GoogleTTSScript() {
  useEffect(() => {
    const handleScriptLoad = () => {
      console.log("Google TTS script loaded, setting API key");
      if (typeof window !== 'undefined' && (window as any).googleTTS) {
        const apiKey = process.env.NEXT_PUBLIC_GOOGLE_TTS_API_KEY || "";
        (window as any).googleTTS.setApiKey(apiKey);
        console.log("Google TTS API key set successfully");
      } else {
        console.error("window.googleTTS object not found when setting key");
      }
    };

    const script = document.createElement('script');
    script.src = 'google-tts.js';
    script.async = true;
    script.onload = handleScriptLoad;
    document.body.appendChild(script);

    return () => {
      document.body.removeChild(script);
    };
  }, []);

  return null;
} 