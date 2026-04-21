/**
 * Detect Google-style SSML passed as the TTS payload (used for homograph fixes).
 */
export function isSsmlTtsInput(text: string): boolean {
  return /^\s*<speak[\s>]/i.test(text.trim())
}

/**
 * Browser SpeechSynthesis cannot use SSML — strip tags and use inner text (e.g. "polish").
 */
export function spokenPlainFromTtsInput(text: string): string {
  if (!isSsmlTtsInput(text)) return text
  return text.replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ').trim()
}
