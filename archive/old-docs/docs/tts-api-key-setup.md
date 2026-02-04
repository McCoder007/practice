# TTS API Key Configuration for GitHub Pages Deployment

This document summarizes the troubleshooting process for configuring the Google Text-to-Speech (TTS) API key in the Next.js application deployed to GitHub Pages.

## Problem Description

The application uses a client-side script (`public/google-tts.js`) to interact with the Google Cloud TTS API, which requires an API key. For the production deployment on GitHub Pages, the API key was correctly stored as a GitHub Actions secret (`GOOGLE_TTS_API_KEY`) and made available to the Next.js build process as an environment variable (`NEXT_PUBLIC_GOOGLE_TTS_API_KEY`).

However, the application consistently failed to use the Google TTS service on the deployed site, falling back to the browser's built-in TTS. The console showed errors indicating the API key was "not set" when the `googleTTS.synthesizeSpeech` function was called.

Initial attempts to fix this involved:

1.  **Redundant Build Script (`build.js`):** An early attempt used a separate Node.js script in the workflow to inject the key. This was removed as it targeted the wrong files and conflicted with the Next.js build process.
2.  **`TtsScriptLoader` Component:** A client component (`TtsScriptLoader.tsx`) was created to load `google-tts.js` using the Next.js `<Script>` component. This component attempted to read the `NEXT_PUBLIC_GOOGLE_TTS_API_KEY` environment variable and call `window.googleTTS.setApiKey()` within the `<Script>`'s `onLoad` callback.
3.  **Passing Key via Props:** The `TtsScriptLoader` was modified to receive the API key as a prop from the `RootLayout`, where the environment variable was read during the build/render phase.

These attempts failed due to a **race condition**. Application code that initiated speech synthesis was executing *before* the `onLoad` callback of the `<Script>` component (responsible for loading `google-tts.js` and setting the key) had completed. As a result, the internal `apiKey` within the `googleTTS` object was still empty when `synthesizeSpeech` was first called.

## Solution

The race condition was resolved by ensuring the API key was set synchronously immediately after the `google-tts.js` script was loaded, before other application logic could attempt to use it.

1.  **Removed `TtsScriptLoader.tsx`:** The component abstracting the script loading and key setting was removed.
2.  **Direct Injection in `RootLayout`:** The `app/layout.tsx` file was modified:
    *   It continues to read `process.env.NEXT_PUBLIC_GOOGLE_TTS_API_KEY`.
    *   It uses `<Script src="/practice/google-tts.js" strategy="beforeInteractive" />` to load the main TTS script.
    *   **Crucially**, immediately following the above, another `<Script strategy="beforeInteractive">` tag is used. This tag contains **inline JavaScript** that directly calls `window.googleTTS.setApiKey()` using the key read from the environment variable in the layout.

```typescript
// Relevant part of vocabulary-next/app/layout.tsx

import Script from 'next/script'

// ... other imports

export default function RootLayout({ children }: { children: React.ReactNode }) {
  const googleTtsApiKey = process.env.NEXT_PUBLIC_GOOGLE_TTS_API_KEY || '';

  return (
    <html lang="en" suppressHydrationWarning>
      {/* ... head ... */}
      <body>
        {/* Load google-tts.js early */}
        <Script src="/practice/google-tts.js" strategy="beforeInteractive" id="google-tts-script" />

        {/* Inject API Key directly after google-tts.js loads */}
        {googleTtsApiKey && (
          <Script
            id="tts-api-key-setter"
            strategy="beforeInteractive"
            dangerouslySetInnerHTML={{
              __html: `
                console.log('[Inline Script] Running: Attempting to set API key...');
                if (window.googleTTS) {
                  console.log('[Inline Script] window.googleTTS found. Setting API key...');
                  window.googleTTS.setApiKey('${googleTtsApiKey}');
                } else {
                  console.error('[Inline Script] window.googleTTS NOT found! API key cannot be set.');
                }
              `,
            }}
          />
        )}

        <ThemeProvider>
          {/* ... rest of layout ... */}
        </ThemeProvider>
      </body>
    </html>
  )
}
```

By using the `beforeInteractive` strategy for both the external script load and the inline key-setting script, and placing the inline script immediately after, we ensure that `setApiKey` is called reliably before any other scripts attempt to use the `googleTTS` object's methods. 