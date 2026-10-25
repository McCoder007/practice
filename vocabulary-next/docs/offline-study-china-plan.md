# Offline Study Plan (China Trip)

## Status

Planning only for the offline download work. The insights logging change in "Part 2" is built alongside this plan.

Do not push. Commit only if asked.

## Goal

A learner is traveling in mainland China for about two months. Google services (Text-to-Speech, Firebase, Firestore) are blocked there, and GitHub Pages is slow or sometimes unreachable.

Before the trip, the learner downloads the nail exam Study section once on Wi-Fi. During the trip, the Study section works with no internet: pages, questions, Chinese translations and audio.

## Scope

Only the three rows under **Study** on the Nail Exam Practice page:

| Area | What is included |
|---|---|
| Prov Exam Topics | 8 topics, 525 questions, Multiple Choice and Study Cards, each topic's word reel, the Look-alike Words drill |
| Tricky Words | Its word reel |
| Practice Test | The same 525 questions, drawn as a weighted random test |

Inside every word reel this includes the underlined hard words in example sentences. Their Chinese translation, English meaning and Chinese explanation are already part of the app's text, so they are saved with the pages. Their audio is part of the audio download.

Everything else (Previous question banks, Milady Review, other Study Zone activities) keeps working online only.

## Size

Counted from the app's own data and code on 2026-10-25:

| Audio | Clips | Characters |
|---|---|---|
| Questions: question, correct answer, explanation, memory tip | 2,096 | 170,000 |
| Word-reel words | 363 | 4,100 |
| Word-reel words, slow (turtle button) | 363 | 4,100 |
| Word-reel example sentences | 363 | 20,700 |
| Underlined words | 1,207 | 10,200 |
| Look-alike drill: words, meanings, tips | 366 | 14,200 |
| **Total** | **about 4,760** | **about 223,000** |

- Audio: about 4 hours of speech, **about 60 MB** of MP3 (estimated, not yet measured).
- Pages, code and question data: **a few MB**.
- Cost to generate: about 223,000 characters, inside Google's free 1 million characters a month for Neural2, so about **$0**.

## Where the learner finds it

Not on the Study page, which stays as it is.

Add an **Offline | 离线** section to the main navigation menu (`components/NavigationMenu.tsx`), under **Language | 语言**. It has one row:

- **Offline study | 离线学习**, with a small status after it: "Not saved", "Saving 45%", or "Ready ✓".

Tapping the row opens an **Offline study** page (`/offline`):

- One sentence in plain English with Chinese: "Save the Study section on this phone so it works with no internet."
- What is saved: Prov Exam Topics, Tricky Words, Practice Test.
- Size: "About 65 MB. Use Wi-Fi."
- One button: **Save for offline | 保存离线**. While saving: a progress bar and "Keep this page open."
- When done: **Ready ✓**, the date saved, and a small **Remove | 删除** link.
- If the app has a newer version than the saved one: **Update | 更新**.
- On iPhone, if the app is open in Safari instead of from the home-screen icon: "Open Study Zone from your home screen first." This matters because the home-screen app keeps its own separate storage.

## How it works

### 1. Service worker

The app is a Next.js static export on GitHub Pages and has no service worker yet.

- Add `public/sw.js` and register it from `app/layout.tsx` (scope `/practice/`).
- **On install:** save nothing large, just the app shell.
- **On "Save for offline":** the page sends the service worker a list of files. The service worker downloads them into a versioned cache and reports progress.
- **On every request:** if the file is in the cache, serve it; otherwise use the network.
- Call `navigator.storage.persist()` after a successful save, so the phone is less likely to delete it when space is low.

### 2. The list of files to save

A build script (`question-bank/scripts/build-offline-manifest.js`) runs after `next build` and writes `out/offline-manifest.json` with:

- The HTML and `.txt` (RSC) files for the Study routes:
  - `/nail-exam-practice`
  - `/nail-exam-practice/exam-topics` and the 8 topic pages
  - the 8 `/words` reel pages
  - `/nail-exam-practice/exam-topics/look-alike-words`
  - `/nail-exam-practice/exam-topics/practice-test`
  - `/nail-exam-practice/question-words`
- Every `_next/static` JS and CSS file those pages load, including the chunks loaded later (NIC questions, word reels, hard words). The simplest safe rule: include all of `_next/static`. It is about 8 MB and avoids missing a chunk.
- The fonts, `manifest.json`, icons, and `google-tts.js`.
- Every audio file listed in the audio manifest (below).
- A `version` (the build SHA), so the page can tell when the saved copy is old.

### 3. Pre-generated audio

- **Script:** `question-bank/scripts/generate-study-audio.js`. It collects the spoken text with the same app helpers the pages use (`topicReelSections`, `QUESTION_WORD_SECTIONS`, `LOOK_ALIKE_TOPICS`, `splitSentence` with the hard-word index, and the NIC question fields the quiz and study cards speak).
- **Voice:** the current Google voice (`en-US-Neural2-D`), so the saved audio sounds like the live audio. Slow clips use speaking rate 0.6, matching `playTextSlow`.
- **File names:** a hash of the text and speed, for example `public/audio/study/3f9a…-n.mp3` and `…-s.mp3`. Running the script again only creates files for new or changed text, so later runs cost almost nothing.
- **Index:** `public/audio/study/index.json` maps each hash to its file.
- **Storage:** commit the MP3s to the repo under `public/audio/study/`, about 60 MB at first and growing slowly. If the repo size becomes a problem later, move them to Cloudflare R2. Hosting location does not matter in China because the learner downloads before the trip.
- **API key:** the script reads the key from the environment and runs locally, not in CI.

### 4. Playback order

In `public/google-tts.js` and `lib/tts.ts`:

1. Look up the hash of the text and speed. If there is a saved clip, play it (from the service worker cache, or the network when online).
2. If there is no saved clip, and Google can be reached (the same check as Part 2), call Google Text-to-Speech with a **2-second limit**.
3. Otherwise use the phone's own voice.

Also skip `preloadTexts` calls to Google when Google can't be reached, so swiping cards in China doesn't start requests that hang.

### 5. Removing PWA update noise offline

`PwaUpdateChecker` already stays quiet when the network fails. Check that it does not offer an update the learner cannot download.

## Part 2: Insights logging in China (built now)

Learner activity (app opens, exam starts, progress and scores, word reel and study card sessions) is written to Firestore for the insights page. Firebase Analytics events go to Google too. In China these servers are blocked. Today the Firestore SDK keeps retrying in the background, writes wait in memory and are lost when the app closes, and Analytics loads scripts that hang.

The change:

- **Reachability check** (`lib/google-reachability.ts`): one quick request to `firestore.googleapis.com` with a 3-second limit, made only when the app first needs Firebase. A "not reachable" result is remembered for 10 minutes, including across reloads, so the app doesn't keep trying.
- **Outbox** (`lib/insights-outbox.ts`): when Google can't be reached, learner writes are saved on the phone in `localStorage` instead of being sent. Repeated writes to the same record are combined, so the outbox stays small (well under 1 MB for two months). The Firebase SDK is never started, so nothing retries in the background.
- **Sending later:** the next time Google can be reached (back home, or on a VPN), the saved writes are sent in order, then removed. Writes the server refuses (for example an older copy of a record) are dropped instead of blocking the rest.
- **Analytics:** Firebase Analytics starts only when Google can be reached. Events while in China are not saved; they are low value compared with the Firestore insights.
- **Removed** the two unused `www.gstatic.com/firebasejs` compat scripts from `app/layout.tsx`. Nothing in the app used them.

Result: in China the app makes no Google requests for logging except one quick check about every 10 minutes, and the insights page receives the learner's activity once they are back online.

## Testing

Before the trip, on the learner's phone or the same model:

1. Install Study Zone to the home screen and open it from the icon.
2. Menu → Offline study → Save for offline. Wait for Ready ✓.
3. Turn on airplane mode, close the app fully, then reopen it from the icon.
4. Check: Prov Exam Topics (a topic in Multiple Choice and Study Cards), a topic word reel (tap an underlined word, tap the turtle), Look-alike Words, Tricky Words, and a Practice Test. All audio should play.
5. Turn airplane mode off and check the insights page shows the test from step 4.

On a computer, also test with Google domains blocked (for example in the browser's request blocking) instead of airplane mode, since that is closer to China: the network works, but Google doesn't.

## Open questions

- Should "Save for offline" also include Previous question banks? This would add about 100+ MB of audio. Not planned.
- Content added during the trip will not have saved audio on the learner's phone and will use the phone's voice. That is acceptable.
