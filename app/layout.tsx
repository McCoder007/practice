import type React from "react"
import "./globals.css"
import { Inter, Outfit, Roboto_Mono } from 'next/font/google'
import { ThemeProvider } from "@/components/theme-provider"
import Script from 'next/script'

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
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <title>Irregular Verbs</title>
        <meta name="description" content="Learn irregular verbs easily" />
      </head>
      <body className={`${outfit.variable} ${inter.variable} ${robotoMono.variable}`}>
        {/* Load Google TTS manager and set API key */}
        <Script src="/google-tts.js" strategy="beforeInteractive" />
        <Script id="set-tts-key" strategy="beforeInteractive">
          {`
            console.log("Attempting to set Google TTS API key...");
            const apiKey = "${process.env.NEXT_PUBLIC_GOOGLE_TTS_API_KEY || process.env.GOOGLE_TTS_API_KEY}";
            console.log("API Key from env var (first 5 chars):", apiKey ? apiKey.substring(0, 5) + '...' : 'Not found');
            if (window.googleTTS) {
              console.log("window.googleTTS object found.");
              try {
                window.googleTTS.setApiKey(apiKey);
                console.log("Successfully called window.googleTTS.setApiKey.");
              } catch (e) {
                console.error("Error calling window.googleTTS.setApiKey:", e);
              }
            } else {
              console.error("window.googleTTS object NOT found when trying to set key!");
            }
          `}
        </Script>
        <ThemeProvider>
          {children}
        </ThemeProvider>
      </body>
    </html>
  )
}
