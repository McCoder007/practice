import type React from "react"
import type { Metadata, Viewport } from "next"
import "./globals.css"
import { Inter, Outfit, Roboto_Mono } from 'next/font/google'
import Script from 'next/script'
import { ThemeProvider } from "@/components/theme-provider"
import { LanguageProvider } from "@/contexts/LanguageContext"
import { PwaUpdateChecker } from "@/components/PwaUpdateChecker"
import { NailExamActivityTracker } from "@/components/NailExamActivityTracker"
import { ServiceWorkerRegister } from "@/components/ServiceWorkerRegister"

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

export const viewport: Viewport = {
  themeColor: "#ffffff",
}

export const metadata: Metadata = {
  title: "Study Zone | 学习区",
  description: "Learn irregular verbs, vocabulary, and English grammar easily",
  manifest: "/practice/manifest.json",
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: "Study Zone",
  },
  icons: {
    icon: "/practice/icon.svg",
    apple: "/practice/apple-icon.png",
  },
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  // Read the environment variable during render
  const googleTtsApiKey = process.env.NEXT_PUBLIC_GOOGLE_TTS_API_KEY || '';
  
  // Explicitly use the repo name prefix for the TTS script
  // The build version in the URL makes browsers fetch the new voice script after
  // each deploy instead of reusing a saved copy (GitHub Pages caches for 10 min).
  const scriptVersion = encodeURIComponent(process.env.NEXT_PUBLIC_BUILD_VERSION || 'dev-local');
  const scriptPath = `${process.env.NODE_ENV === 'production' ? '/practice' : ''}/google-tts.js?v=${scriptVersion}`;
  
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <link rel="icon" href="/practice/icon.svg" type="image/svg+xml" />
        <link rel="manifest" href="/practice/manifest.json" />
        <meta name="theme-color" content="#ffffff" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="default" />
        <meta name="apple-mobile-web-app-title" content="Study Zone" />
        <link rel="apple-touch-icon" href="/practice/apple-icon.png" />
        <link rel="apple-touch-icon" sizes="180x180" href="/practice/apple-icon.png" />
      </head>
      <body className={`${outfit.variable} ${inter.variable} ${robotoMono.variable}`}>
        {/* 
          Load google-tts.js early with explicit path handling
          This ensures it works in both development and production
        */}
        <Script 
          src={scriptPath} 
          strategy="beforeInteractive" 
          id="google-tts-script"
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
          <LanguageProvider>
            <ServiceWorkerRegister />
            <PwaUpdateChecker />
            <NailExamActivityTracker />
            <div className="relative flex min-h-screen flex-col bg-background">
              {children}
            </div>
            {/* <TailwindIndicator /> */}
          </LanguageProvider>
        </ThemeProvider>
      </body>
    </html>
  )
}
