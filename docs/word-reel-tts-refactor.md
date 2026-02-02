# Word Reel TTS Refactor

## Date: 2026-02-01

## Problem

The Word Reel's auto-speak feature (automatically reading each vocabulary word aloud as the user swipes through cards) had multiple reliability bugs:

- Audio from previous words would overlap with the current word
- Stale callbacks would speak the wrong word after rapid navigation
- Cancellation was unreliable due to a race condition in the audio queue
- Tapping a word while auto-speak was active caused overlapping audio
- Voice selection logic was duplicated across three files
- ~30 debug `console.log` calls ran in production

## Architecture

The TTS system has three layers:

```
google-tts.js (global script, loaded via <script>)
  └─ Manages Google Cloud TTS API calls, audio caching, base64 Audio playback
  └─ Fallback: browser Web Speech API (SpeechSynthesisUtterance)

audio-queue.ts (AudioQueueManager singleton)
  └─ Sequential queue for auto-speak: enqueue → processQueue → playAudio
  └─ Cancellation via isCancelled flag + direct audio pause/cancel
  └─ 10s timeout per word to prevent hanging

tts.ts (public API used by components)
  └─ playText(text)        — immediate tap-to-speak (stops queue + current audio)
  └─ playTextQueued(text)  — enqueues for auto-speak
  └─ preloadText(text)     — background cache warming
  └─ clearAudioQueue()     — stop everything
  └─ stopTTS()             — stop current playback only

voice.ts (shared voice selection)
  └─ getPreferredVoice()   — cached en-US voice lookup for browser TTS
```

### How auto-speak works in page.tsx

1. User enables auto-speak toggle → persisted to localStorage
2. On each `currentIndex` change, a `useEffect` fires with a short delay
3. It captures the current `audioGenerationRef` value and calls `speakCurrentWord(generation)`
4. `speakCurrentWord` checks the generation hasn't changed (no day/mode switch occurred), reads `wordsRef.current[currentIndexRef.current]`, and enqueues the word
5. When the day or viewMode changes, `clearAudioQueue()` runs first, then `audioGenerationRef` increments — invalidating any pending callbacks

## Bugs Fixed

### 1. `isCancelled` flag reset race (CRITICAL)

**File:** `lib/audio-queue.ts`

`clear()` set `isCancelled = true`, did cleanup, then immediately reset `isCancelled = false`. The async `processQueue()` while-loop could miss the flag entirely if it hadn't reached its check yet.

**Fix:** Removed `isCancelled = false` from `clear()`. It now resets at the top of `processQueue()` when a new cycle starts via `enqueue()`. The flag stays true indefinitely after `clear()` until fresh work arrives.

### 2. 50ms polling intervals (unnecessary complexity)

**File:** `lib/audio-queue.ts`

Both `playGoogleTTS()` and `playBrowserTTS()` used `setInterval` every 50ms to check `isCancelled`. This was a workaround for bug #1.

**Fix:** Removed the polling. `clear()` directly pauses HTMLAudioElement / calls `speechSynthesis.cancel()`, which fires the audio's `onended`/`onerror` handlers and resolves the promise naturally.

### 3. Overlapping audio in `playAudioFromBase64`

**File:** `public/google-tts.js`

Creating a new Audio element without stopping the previous one. An earlier "aggressive stop" had been removed to fix stuttering, but that caused simultaneous playback.

**Fix:** Restored stopping `this.currentAudio` *before* creating the new Audio element. This is safe because we're stopping a different, older element — the stuttering was caused by higher-level stop-then-replay patterns, not by this.

### 4. Browser TTS overlap in fallback path

**File:** `public/google-tts.js`

`browserTTS.speak()` no longer called `speechSynthesis.cancel()` before speaking, so rapid calls would stack utterances.

**Fix:** Restored `window.speechSynthesis.cancel()` at the top of `browserTTS.speak()`. This method is only used from `synthesizeSpeech()` fallback paths, not from the queue's own `playBrowserTTS()`, so it doesn't interfere with sequential queue processing.

### 5. `playText()` didn't stop previous audio

**File:** `lib/tts.ts`

`stopTTS()` had been removed from `playText()` to prevent stuttering. But `playText()` is the tap-to-speak path — tapping rapidly or tapping during auto-speak caused overlapping audio.

**Fix:** Restored `stopTTS()` and added `clearQueue()` at the top of `playText()`. Since `playText()` is never called by the queue (the queue uses its own `playGoogleTTS`/`playBrowserTTS`), this is safe.

### 6. Stale closure in `speakCurrentWord()`

**File:** `app/word-reel/page.tsx`

The function rebuilt the entire `words` array (~30 lines duplicated from the `useMemo`) because the memoized value could be stale inside callbacks. This was fragile and inefficient.

**Fix:** Added a `wordsRef` that stays in sync with the memoized `words` via a `useEffect`. `speakCurrentWord` now reads `wordsRef.current` — reduced from ~60 lines to ~15, and removed `viewMode`/`currentDay` from its dependency array.

### 7. Effect ordering for generation counter

**File:** `app/word-reel/page.tsx`

In the `[currentDay, viewMode]` effect, `audioGenerationRef` was incremented *before* `clearAudioQueue()`, creating a timing window where a pending callback could enqueue audio with the new generation before the queue was cleared.

**Fix:** Swapped the order: `clearAudioQueue()` first, then increment the generation.

### 8. Retry-with-modified-text hack

**File:** `public/google-tts.js`

Failed Google TTS requests were retried with `text + ' '` (appended space), creating cache key mismatches.

**Fix:** Removed the retry block entirely. Browser TTS fallback already handles failures.

### 9. Duplicated voice selection

**Files:** `lib/tts.ts`, `lib/audio-queue.ts`

Voice caching/selection was implemented independently in both files with slightly different logic.

**Fix:** Extracted into `lib/voice.ts` with a single `getPreferredVoice()` function. Both files import from it. This also avoids a circular dependency (tts → audio-queue → tts).

### 10. Production console noise

**File:** `public/google-tts.js`

~30+ `console.log` calls for routine operations (caching, playback status, API requests).

**Fix:** Removed routine logs. Kept `console.error` for genuine errors and `console.warn` for API key diagnostics.

## Files Modified

| File | Change |
|------|--------|
| `lib/audio-queue.ts` | Fixed `isCancelled` race, removed polling intervals, uses shared voice module |
| `public/google-tts.js` | Fixed audio overlap, restored browser TTS cancel, removed retry hack, cleaned logs |
| `lib/tts.ts` | Restored `stopTTS()`/`clearQueue()` in `playText()`, uses shared voice module |
| `lib/voice.ts` | **New** — shared voice selection/caching (~40 lines) |
| `app/word-reel/page.tsx` | Added `wordsRef`, simplified `speakCurrentWord`, fixed effect ordering |

## Testing Checklist

- [ ] Enable auto-speak, swipe rapidly through cards — each word speaks once, no overlap, no stale words
- [ ] Tap a word during auto-speak — immediately speaks tapped word, stops auto-speak audio
- [ ] Change days during auto-speak — old audio stops, new day's first word speaks
- [ ] Toggle auto-speak off — immediately silences all audio
- [ ] Quiz and Vocabulary pages — tap-to-speak still works (non-regression)
- [ ] iOS Safari and Android Chrome — test for speechSynthesis quirks
