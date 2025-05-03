"use client"

import React, { useEffect } from 'react';
import Script from 'next/script';
import { useRouter } from 'next/router';

export function GoogleTTSScript() {
  const router = useRouter();
  // Handle script load in a useEffect
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

  return (
    <Script 
      src={`${router.basePath}/google-tts.js`} 
      strategy="lazyOnload"
      onLoad={handleScriptLoad}
    />
  );
} 