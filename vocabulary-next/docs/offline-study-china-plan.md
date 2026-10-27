# Offline Study Plan (China Trip)

## Status

The offline shell is built: the file list (`question-bank/scripts/build-offline-manifest.js`), the service worker (`public/sw.js`) and the `/offline` page with its menu row. The audio library is generated. "Part 2" (insights logging) is built. Still to do: the phone checklist below.

Updated 2026-10-25 with a second reviewer's refinements: a broader file list, resumable saves and safe updates, reuse of the existing audio player, exact audio inputs, and checking the actual cache.

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

Inside every word reel this includes every word in the example sentences. Each word can be tapped and spoken, not just the underlined ones. The underlined words' Chinese translation, English meaning and Chinese explanation are already part of the app's text, so they are saved with the pages.

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
| Other tappable words in sentences | 250 | 1,000 |
| Look-alike drill: words, meanings, tips | 366 | 14,200 |
| **Total** | **about 5,010** | **about 224,000** |

- Audio, as generated (2026-10-26): **4,420 clips, about 139 MB** of MP3. Google returns 64 kbps MP3, so this is more than the first estimate of 60 MB. There are fewer clips than the count above because repeated text shares one clip, and slow clips exist only for cards with a "say it" line.
- Pages, code and question data: about 8 MB, including all of `_next/static`.
- Total saved for offline: **about 147 MB**. The `/offline` page reads the exact total from `offline-manifest.json` and shows it rounded ("About 150 MB").
- Cost to generate: about 224,000 characters, inside Google's free 1 million characters a month for Neural2, so about **$0**.

## Where the learner finds it

Not on the Study page, which stays as it is.

Add an **Offline | 离线** section to the main navigation menu (`components/NavigationMenu.tsx`), under **Language | 语言**. It has one row:

- **Offline study | 离线学习**, with a small status after it: "Not saved", "Saving 45%", or "Ready ✓".

Tapping the row opens an **Offline study** page (`/offline`):

- One sentence in plain English with Chinese: "Save the Study section on this phone so it works with no internet."
- What is saved: Prov Exam Topics, Tricky Words, Practice Test.
- Size, from the file list: "About 150 MB. Use Wi-Fi."
- One button: **Save for offline | 保存离线**. While saving: a progress bar and "Keep this page open."
- If saving stops partway: **Continue | 继续**, which picks up where it stopped.
- When done: **Ready ✓**, the date saved, and a small **Remove | 删除** link.
- If the app has a newer version than the saved one: **Update | 更新**.
- If the phone did not grant persistent storage: a short note, "The phone may remove this if storage is full. Open the app now and then."
- On iPhone, if the app is open in Safari instead of from the home-screen icon: "Open Study Zone from your home screen first." This matters because the home-screen app keeps its own separate storage.

## How it works

### 1. Service worker

The app is a Next.js static export on GitHub Pages and has no service worker yet.

- Add `public/sw.js` and register it from `app/layout.tsx` (scope `/practice/`).
- **On install:** save nothing large.
- **On "Save for offline":** the page sends the service worker the file list. The service worker downloads them and reports progress (see "Saving and updating" below).
- **On every request:** serve from the cache if the file is there, otherwise use the network.
  - **Page loads (navigation requests):** match by path without the query string. If the exact page is missing offline, fall back to the saved home page rather than a browser error.
  - **Page data:** when moving between pages, Next.js fetches the page's `.txt` data with a `?_rsc=…` query string. Match these with the query string ignored (`ignoreSearch`), or nothing will be found offline.
- Call `navigator.storage.persist()` after a successful save. This is only a request; the phone decides.

### 2. The list of files to save

Keep this broad and simple. Working out exactly which code chunks each page needs is maintenance work for little benefit.

A build script (`question-bank/scripts/build-offline-manifest.js`) runs after `next build` and writes `out/offline-manifest.json` with:

- **App start:** `/practice/` (the home-screen icon's `start_url` in `manifest.json`) and `/offline`.
- The HTML and `.txt` files for the Study routes:
  - `/nail-exam-practice`
  - `/nail-exam-practice/exam-topics` and the 8 topic pages
  - the 8 `/words` reel pages
  - `/nail-exam-practice/exam-topics/look-alike-words`
  - `/nail-exam-practice/exam-topics/practice-test`
  - `/nail-exam-practice/question-words`
- **All of `_next/static`** (about 8 MB). This covers every chunk, including the ones loaded later (NIC questions, word reels, hard words).
- The fonts, `manifest.json`, icons, and `google-tts.js`.
- Every audio file in the audio index (below).
- A `version` (the build SHA), so the page can tell when the saved copy is old.

### 3. Saving and updating

About 4,600 files (163 app files and 4,420 clips) means an interrupted download is likely. Saving must be resumable, and an update must never break a working copy.

- **Two caches:**
  - `study-app-<version>`: pages and code for one build.
  - `study-audio`: audio clips, shared across builds. Clip file names are hashes of their text, so a clip never changes and is never downloaded again.
- **Resumable:** before downloading a file, check whether it is already in the target cache, and skip it if so. "Continue" after an interruption just runs the same loop again.
- **"Ready" means checked:** after the loop, count that every file in the manifest is present in the caches. Only then mark the version as ready, saved in a small IndexedDB record.
- **Safe updates:** an update builds `study-app-<new version>` alongside the old one. The service worker keeps serving the old version until the new one is complete and checked, then switches and deletes the old app cache. Audio clips no longer in the index are deleted at the same point.
- **Status comes from the cache, not memory:** whenever the menu or `/offline` page opens, check the saved files are still present (the phone can remove them under storage pressure). If any are missing, show "Not saved" or "Continue" instead of "Ready ✓".

### 4. Pre-generated audio

- **Script:** `question-bank/scripts/generate-study-audio.js`. It must produce exactly what the pages ask the player to speak, so it uses the same app helpers:
  - `topicReelSections`, `QUESTION_WORD_SECTIONS` and `LOOK_ALIKE_TOPICS`
  - `splitSentence` with the hard-word index, for **every** word part in a sentence (`spokenWord` lowercases all-caps exam words but keeps abbreviations), plus each underlined word's `entry.word` from the word card
  - the NIC question fields the quiz and study cards speak: question, correct answer, explanation, memory tip, source warning
  - the look-alike drill texts: the word, the meaning, "word. meaning", and the tip
- **Exact inputs:** a card's `tts` override (SSML when it starts with `<speak>`) is sent to Google as SSML, the same way `google-tts.js` does it.
- **Voice and speed:** the current Google voice (`en-US-Neural2-D`). **Normal speed is 0.9** (the default in `synthesizeSpeech`), and **slow is 0.6** (`speakSlow`).
- **File names:** a hash of the input text, whether it is SSML, and the speed, for example `public/audio/study/3f9a….mp3`. Running the script again only creates files for new or changed text, so later runs cost almost nothing.
- **Index:** `public/audio/study/index.json` maps each hash to its file.
- **Storage:** commit the MP3s to the repo under `public/audio/study/`, about 139 MB (64 kbps) and growing slowly. If the repo size becomes a problem later, move them to Cloudflare R2.
- **API key:** the script reads the key from the environment and runs locally, not in CI.

### 5. Playback

Reuse the existing audio code in `public/google-tts.js`. It already handles iPhone playback, stopping speech, and the audio queue.

1. In `synthesizeSpeech`, look up the hash of the text and speed. If there is a clip, `fetch` it (the service worker answers from the cache), read the whole file into a Blob, convert it to base64, and pass it to the existing `playAudioFromBase64`. Reading the whole file avoids pointing an `<audio>` element at a cached URL, which needs special handling for partial-file (range) requests.
2. If there is no clip, and Google can be reached (the check from Part 2), call Google Text-to-Speech with a **2-second limit**.
3. Otherwise use the phone's own voice.

Also skip `preloadTexts` calls to Google when Google can't be reached, so swiping cards in China doesn't start requests that hang.

### 6. PWA update prompt offline

`PwaUpdateChecker` already stays quiet when the network fails. Check that it does not offer an update the learner cannot download.

## Build and test order

Prove one complete path on the learner's phone before generating everything. This catches expensive mistakes early.

1. **One path first:** build the service worker, the file list and the audio player change, plus audio for one topic only. On the phone: install to the home screen, save, fully close the app, turn on airplane mode, and open it from the icon. Then go through: home → one topic → Study Cards → that topic's word reel, with normal and slow audio and a tapped sentence word.
2. **Then everything:** generate the full audio library and expand the file list.
3. **Full checklist** on the phone (or the same model):
   1. Install Study Zone to the home screen and open it from the icon.
   2. Menu → Offline study → Save for offline. Wait for Ready ✓.
   3. Turn on airplane mode, close the app fully, then reopen it from the icon.
   4. Check Prov Exam Topics (a topic in Multiple Choice and Study Cards), a topic word reel (tap an underlined word, tap a plain word, tap the turtle), Look-alike Words, Tricky Words, and a Practice Test. All audio should play.
   5. **Interrupted download:** start a save, turn on airplane mode partway, then turn it off and tap Continue. It should finish without re-downloading what was already saved.
   6. **Failed update:** with a saved copy, deploy a new build, start Update, and interrupt it. The old copy must still work offline, and Update must finish on a second try.
   7. Turn airplane mode off and check that the insights page shows the tests from step 4.

On a computer, also test with Google domains blocked (for example in the browser's request blocking) instead of airplane mode, since that is closer to China: the network works, but Google doesn't.

## Part 2: Insights logging in China (built)

Learner activity (app opens, exam starts, progress and scores, word reel and study card sessions) is written to Firestore for the insights page. Firebase Analytics events go to Google too. In China these servers are blocked.

How it works now:

- **Save first, send second** (`lib/insights-outbox.ts`, `lib/nail-exam-usage-store.ts`): every learner write is first saved on the phone in IndexedDB. It is then sent to Firestore and deleted only after Firestore confirms it. A write is never lost because the connection dropped after an earlier successful check.
- **Combining:** repeated writes to the same record are combined, so a session saved every 30 seconds stays one entry. A test's start and its score stay separate and in order, because the server rules only allow a score on an existing start.
- **Size:** two months of daily study is about 720 writes (8 visits and 2 tests a day), usually 1–2 KB each, so about 1–1.5 MB. The outbox keeps up to 3,000 writes (about 4x that) and drops the oldest past that. IndexedDB has far more room than `localStorage`'s roughly 5 MB.
- **Reachability check** (`lib/google-reachability.ts`): Firebase is only started after one quick request to `firestore.googleapis.com` answers within 3 seconds. A failed check is remembered for 10 minutes, including across reloads. If a send later times out or hits a network error, the app marks Google unreachable again and turns off Firestore's network, so the SDK does not keep retrying in the background.
- **Sending:** saved writes are sent oldest first, on every learner write and every app open. Writes the server refuses (for example an older copy of a record) are dropped. A refused score creates a completed record instead, so a score is not lost if its start record is missing.
- **Moving old writes:** writes saved in `localStorage` by the first version of this fix are moved into IndexedDB on first use.
- **Analytics:** Firebase Analytics starts only when Google can be reached. Events while in China are not saved; they are low value compared with the Firestore insights.
- **Removed** the two unused `www.gstatic.com/firebasejs` compat scripts from `app/layout.tsx`.

Result: in China the app makes no Google requests for logging except one quick check about every 10 minutes, and the insights page receives the learner's activity once they are back online.

## Open questions

- Should "Save for offline" also include Previous question banks? This would add about 100+ MB of audio. Not planned.
- Content added during the trip will not have saved audio on the learner's phone and will use the phone's voice. That is acceptable.
