import type React from "react"
import "./globals.css"
import { Inter, Outfit, Roboto_Mono } from 'next/font/google'
import Script from 'next/script'
import { ThemeProvider } from "@/components/theme-provider"

// Import primary font for headings and UI
const outfit = Outfit({
  subsets: ["latin"],
  display: "swap",
  variable: "--font-outfit",
})

// Import secondary font for body text
const inter = Inter({
  subsets: ["latin"],
  display: "swap",
  variable: "--font-inter",
})

// Import monospace font for verb forms
const robotoMono = Roboto_Mono({
  subsets: ["latin"],
  display: "swap",
  variable: "--font-roboto-mono",
})

export default function RootLayout({ children }: { children: React.ReactNode }) {
  // Read the environment variable during render
  const googleTtsApiKey = process.env.NEXT_PUBLIC_GOOGLE_TTS_API_KEY || '';
  // DEBUG: Log the key read during build/render
  console.log(`[Layout] Read API Key (length ${googleTtsApiKey.length}): ${googleTtsApiKey ? googleTtsApiKey.substring(0, 4) + '...' : 'EMPTY'}`);

  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <title>Irregular Verbs</title>
        <meta name="description" content="Learn irregular verbs easily" />
      </head>
      <body className={`${outfit.variable} ${inter.variable} ${robotoMono.variable}`}>
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
                // Ensure this runs after google-tts.js has potentially created the object
                // A small timeout might be needed if race condition persists, but ideally
                // the script order with beforeInteractive handles this.
                if (window.googleTTS) {
                  console.log('[Inline Script] window.googleTTS found. Setting API key (length ${googleTtsApiKey.length}): ${googleTtsApiKey.substring(0,4)}...');
                  window.googleTTS.setApiKey('${googleTtsApiKey}');
                } else {
                  console.error('[Inline Script] window.googleTTS NOT found! API key cannot be set.');
                  // Alternative: Set a global variable and have google-tts.js check for it?
                  // window.__pendingApiKey = '${googleTtsApiKey}'; 
                }
              `,
            }}
          />
        )}

        <ThemeProvider>
          <div className="relative flex min-h-screen flex-col bg-background">
            {children}
          </div>
          {/* <TailwindIndicator /> */}
        </ThemeProvider>
      </body>
    </html>
  )
}
