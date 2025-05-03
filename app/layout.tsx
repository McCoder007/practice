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
        <Script src="/practice/google-tts.js" strategy="beforeInteractive" />
        <Script id="set-tts-key" strategy="beforeInteractive">
          {`
            console.log("Waiting to set Google TTS API key...");
            const apiKey = "${process.env.NEXT_PUBLIC_GOOGLE_TTS_API_KEY || process.env.GOOGLE_TTS_API_KEY}";
            let attempts = 0;
            const maxAttempts = 10; // Try for ~1 second
            const intervalId = setInterval(() => {
              attempts++;
              if (window.googleTTS) {
                clearInterval(intervalId);
                console.log("window.googleTTS object found after " + attempts + " attempts. Setting key...");
                console.log("API Key from env var (first 5 chars):", apiKey ? apiKey.substring(0, 5) + '...' : 'Not found');
                try {
                  window.googleTTS.setApiKey(apiKey);
                  console.log("Successfully called window.googleTTS.setApiKey.");
                } catch (e) {
                  console.error("Error calling window.googleTTS.setApiKey:", e);
                }
              } else if (attempts >= maxAttempts) {
                clearInterval(intervalId);
                console.error("window.googleTTS object NOT found after " + maxAttempts + " attempts!");
              }
            }, 100); // Check every 100ms
          `}
        </Script>
        <ThemeProvider>
          {children}
        </ThemeProvider>
      </body>
    </html>
  )
}
