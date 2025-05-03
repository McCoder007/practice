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
        <Script id="set-tts-config" strategy="beforeInteractive">
          {`
            if (window.googleTTS) {
              console.log("Configuring Google TTS Manager...");
              const apiKey = "${process.env.NEXT_PUBLIC_GOOGLE_TTS_API_KEY || process.env.GOOGLE_TTS_API_KEY}";
              if (apiKey) {
                 window.googleTTS.setApiKey(apiKey);
              } else {
                 console.warn("Google TTS API Key not found in environment variables.");
              }
              // Set the desired voice
              window.googleTTS.setVoice('en-US-Neural2-D');
            } else {
              console.warn("window.googleTTS not found when trying to configure.");
            }
          `}
        </Script>
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
