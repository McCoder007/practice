import type React from "react"
import "./globals.css"
import { Inter, Outfit, Roboto_Mono } from 'next/font/google'
import { ThemeProvider } from "@/components/theme-provider"
import { TtsScriptLoader } from "@/components/tts-script-loader"

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
        {/* Load and configure TTS using the client component, passing the key as a prop */}
        <TtsScriptLoader apiKey={googleTtsApiKey} />
        
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
