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
  
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <title>Irregular Verbs</title>
        <meta name="description" content="Learn irregular verbs easily" />
      </head>
      <body className={`${outfit.variable} ${inter.variable} ${robotoMono.variable}`}>
        {/* 
          Load google-tts.js early
          Note: No need to use a dynamic path here - Next.js will automatically
          handle the correct path based on basePath in next.config.js
        */}
        <Script 
          src="/google-tts.js" 
          strategy="beforeInteractive" 
          id="google-tts-script"
        />

        {/* Firebase SDK scripts (for analytics) */}
        <Script
          src="https://www.gstatic.com/firebasejs/9.22.0/firebase-app-compat.js"
          strategy="afterInteractive"
          id="firebase-app-script"
        />
        <Script
          src="https://www.gstatic.com/firebasejs/9.22.0/firebase-analytics-compat.js"
          strategy="afterInteractive"
          id="firebase-analytics-script"
        />

        {/* Inject API Key directly after google-tts.js loads */}
        {googleTtsApiKey && (
          <Script
            id="tts-api-key-setter"
            strategy="beforeInteractive"
            dangerouslySetInnerHTML={{
              __html: `
                console.log('[API Key Setter] Running script to set Google TTS API key');
                if (window.googleTTS) {
                  console.log('[API Key Setter] Found window.googleTTS, setting API key');
                  window.googleTTS.setApiKey('${googleTtsApiKey}');
                  console.log('[API Key Setter] API key set successfully');
                } else {
                  console.error('[API Key Setter] window.googleTTS NOT found! API key cannot be set.');
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
