/**
 * Splits a word-reel sentence into tappable words and finds the hard ones.
 * The hard-word list lives in data/word-reel/hard-words.json; the build check
 * (question-bank/scripts/validate-reel-hard-words.js) uses the same functions.
 */

/** A word (or a short term like "nail plate") a beginner may not know. */
export interface HardWord {
  /** Base form shown in the word card, e.g. "particle". */
  word: string
  /** Every form that appears in sentences, as normalized tokens joined by one space. */
  forms: string[]
  zh: string
  /** Meaning in very simple English. */
  en: string
  /** The same meaning in Chinese. */
  enZh: string
}

export interface HardWordIndex {
  byForm: Map<string, HardWord>
  /** Longest form, in words. */
  maxWords: number
}

export type SentencePart =
  | { kind: "text"; text: string }
  | { kind: "word"; text: string; key: string; entry?: HardWord }

// Letters include accents ("pétrissage"); hyphens and apostrophes stay inside a word.
const TOKEN = /[\p{L}0-9][\p{L}0-9'’-]*[\p{L}0-9]|[\p{L}0-9]/gu

/** Lowercase, straight apostrophe, no possessive 's ("Client's" → "client"). */
export function normalizeToken(raw: string): string {
  return raw.toLowerCase().replace(/’/g, "'").replace(/'s$/, "")
}

export function sentenceTokens(sentence: string): { text: string; start: number; end: number; key: string }[] {
  return [...sentence.matchAll(TOKEN)].map((m) => ({
    text: m[0],
    start: m.index,
    end: m.index + m[0].length,
    key: normalizeToken(m[0]),
  }))
}

export function buildHardWordIndex(entries: HardWord[]): HardWordIndex {
  const byForm = new Map<string, HardWord>()
  let maxWords = 1
  for (const entry of entries) {
    for (const form of entry.forms) {
      byForm.set(form, entry)
      maxWords = Math.max(maxWords, form.split(" ").length)
    }
  }
  return { byForm, maxWords }
}

/**
 * Words and the text between them, in order. A known term of several words
 * ("free edge") becomes one part; the longest match wins. Words of a term must
 * be separated by plain spaces, so a comma or period breaks a match.
 */
export function splitSentence(sentence: string, index: HardWordIndex): SentencePart[] {
  const tokens = sentenceTokens(sentence)
  const parts: SentencePart[] = []
  let cursor = 0
  let i = 0
  while (i < tokens.length) {
    let length = 1
    let entry = index.byForm.get(tokens[i].key)
    for (let n = Math.min(index.maxWords, tokens.length - i); n >= 2; n--) {
      const run = tokens.slice(i, i + n)
      const spaced = run.every((t, j) => j === 0 || /^ +$/.test(sentence.slice(run[j - 1].end, t.start)))
      const found = spaced ? index.byForm.get(run.map((t) => t.key).join(" ")) : undefined
      if (found) {
        length = n
        entry = found
        break
      }
    }
    const first = tokens[i]
    const last = tokens[i + length - 1]
    if (first.start > cursor) parts.push({ kind: "text", text: sentence.slice(cursor, first.start) })
    const text = sentence.slice(first.start, last.end)
    parts.push({ kind: "word", text, key: tokens.slice(i, i + length).map((t) => t.key).join(" "), entry })
    cursor = last.end
    i += length
  }
  if (cursor < sentence.length) parts.push({ kind: "text", text: sentence.slice(cursor) })
  return parts
}
