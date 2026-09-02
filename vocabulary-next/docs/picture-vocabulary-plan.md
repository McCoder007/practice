# Picture Vocabulary Integration Plan

## Status

Implemented. `/picture-vocabulary` is live in Study Zone with both weekly
sets, live TTS, per-word progress, and the two nav hookups — built per the
plan below without touching Nail Exam Practice or any other existing
feature. `typecheck`, `build`, and a manual dev-server pass (set picker →
flashcard reveal → TTS → Got it/Still learning → Known/Learning tabs →
reload persistence) all pass. `lint` has pre-existing, unrelated failures
from `public/pdfjs/pdf.worker.min.mjs` being linted; no new files introduce
lint errors.

**Deviation from the original plan:** VocabV3's `audio/w1–w9.mp3` "what's
this?" teaser clips (played the moment each picture appears, before the
countdown/reveal) were initially dropped per "What we will deliberately NOT
port" below. The user asked for them back, explicitly choosing to copy the
9 mp3s in as-is (`public/picture-vocabulary/audio/w1–w9.mp3`, ~450KB) rather
than reproduce the prompt via TTS, plus a genuine no-immediate-repeat picker
(the original tracked `lastPlayedAudioIndex` but never used it, so
back-to-back repeats were possible by chance — the rebuild fixes that).
Playback is handled in `FlashcardView.tsx`, resolved through the same
`/practice` basePath prefix helper pattern used in
`OriginalSourceViewer.tsx` (needed since Next's `basePath` doesn't rewrite
plain string `src` paths).

Do not push. Commit only if asked.

## Placement decision

VocabV3's word list (headphones, basketball, duck, mango, windmill, etc.) is
general everyday vocabulary — it has no connection to the nail technician
exam. Nail Exam Practice is a tightly scoped section (see
`docs/nail-exam-practice-navigation-plan.md`): exactly four exam question
banks, strict question-parity rules, and an explicit "no extra tracking
features" scope.

**Decision: this becomes its own new top-level Study Zone entry**, a sibling
of "New Words" and "Word Reel" — not nested inside Nail Exam Practice.

## What VocabV3 actually is

A standalone static (HTML/CSS/vanilla JS) flashcard app:

- Weekly word sets (`vocabularySets` in `vocabulary-data.js`), each word has
  `{ image, english, chinese, status }`.
- Flow: show the picture → after a countdown (or the learner can act early) →
  reveal English + Chinese text and a "what is this?" moment → speaker button
  plays pronunciation via Google TTS → learner taps **🤔 Still learning** or
  **🎉 Got it**.
- Per-word progress (`learning` / `known`) stored in `localStorage` under
  `vocabProgressV3`, with an overall progress bar and three tab views
  (Flashcards / Learning / Known).
- Its own Google Cloud TTS build pipeline: `build.js`, `api-key.js`,
  `update-api-key.js`, `config.js`, `set-dev-env.sh`, plus pre-baked
  `audio/w1.mp3`–`w9.mp3`.
- ~50 words, `images/` folder is **27MB**; the entire feature is otherwise
  small (a few hundred lines of JS/CSS).

## What already exists in `vocabulary-next` and should be reused

- **TTS is already solved.** `lib/tts.ts` + `public/google-tts.js` +
  `NEXT_PUBLIC_GOOGLE_TTS_API_KEY` (injected at build time by
  `.github/workflows/deploy.yml`) already provide Google Cloud TTS with a
  browser `speechSynthesis` fallback, used by every existing vocab page. We
  call `playText()` — we do **not** port VocabV3's own key/build scripts or
  its pre-baked mp3s.
- **Static export.** `next.config.ts` sets `output: 'export'` for GitHub
  Pages. Data lives in plain TS modules under `data/`, static assets under
  `public/`. No server/API route is needed.
- **UI kit and conventions.** Existing pages (`app/vocabulary/page.tsx`,
  `app/word-reel/page.tsx`) already show the pattern to follow: `"use client"`
  page, `components/ui` (Card, Button, Progress), `framer-motion` for
  transitions, Tailwind for styling, `NavigationMenu` at the top of the page.
  VocabV3's own `styles.css`/vanilla DOM code is not portable as-is and
  shouldn't be — rebuild the same interaction with these primitives.
- **No existing duplicate.** Word Reel swipes through the same *text*
  vocabulary dataset (`data/vocabulary.ts`) using generated color-gradient
  backgrounds, not photos. There is no current picture-flashcard experience,
  so this is additive, not a rebuild of something that already exists.
- **Two navigation hookup points**, which currently duplicate the same list
  and both need the new entry:
  - `app/page.tsx` — `getMenuItems()` (Study Zone homepage cards).
  - `components/NavigationMenu.tsx` — its own `menuItems` (slide-out menu).

## What we will deliberately NOT port

- VocabV3's API-key build/injection tooling (`build.js`, `api-key.js`,
  `update-api-key.js`, `config.js`, `set-dev-env.sh`, `serve.js`) — this repo
  already has a working equivalent.
- The `vocabProgressV3` localStorage key name — use a new, namespaced key so
  there's no collision risk if VocabV3 is ever referenced again.
- Anything under `app/nail-exam-practice`, `components/nail-exam-practice`,
  `data/nail-exam-practice`, or `lib/nail-exam-practice-*`.

## Proposed implementation

### Data

- New module `data/picture-vocabulary.ts`: port the weekly-set structure
  (`{ id, name, words: [{ image, english, chinese }] }`) from
  `vocabulary-data.js` into typed TS, mirroring the shape/conventions of
  `data/vocabulary.ts`.
- New static assets under `public/picture-vocabulary/<word>.webp`.
  - **Decision (confirmed with user): compress and resize for the iPhone PWA
    before committing.** Source images are all 800×800 PNG at 340–520KB each
    (~27MB across ~50 images) — far larger than needed. The flashcard's
    `.image-container` is full-card-width with a ~200px min-height on small
    phones (see VocabV3 `styles.css`), and the art itself is simple flat
    illustration, not photographic detail.
  - **Target spec:** resize to **640×640** and encode as **WebP, quality
    ~82**, capped at 640px on the long edge. That comfortably covers a
    3x-retina iPhone at a ~210 CSS px display size, which is larger than this
    UI needs. iOS Safari (and therefore this PWA's `WKWebView`/home-screen
    context) has supported WebP since iOS 14, so no PNG fallback is needed.
  - **Verified locally:** `cwebp -q 82 -resize 640 640 <src>.png -o
    <word>.webp` on a couple of sample images (`duck.png`, `headphones.png`)
    produced ~7–8KB WebP files versus 340–520KB PNGs — roughly a **98%**
    size reduction. At that rate the full ~50-image set lands around
    **300–500KB total**, instead of 27MB, against a `public/` folder that is
    currently ~1.9MB.
  - Conversion is a one-time scripted batch step (loop `cwebp` over
    `Temp/VocabV3/images/*.png`), not something the app does at runtime.

### Route & UI

- New route `app/picture-vocabulary/page.tsx` (name is a placeholder —
  "Picture Vocabulary" reads clearly on a card; open to bikeshedding).
- New `components/picture-vocabulary/` containing:
  - A set picker (reuse the Card-grid pattern already used on the homepage).
  - The card view itself: image → reveal (tap or short countdown) → English +
    Chinese text + speaker button (`playText` from `lib/tts`) → Still
    learning / Got it buttons → progress bar.
  - Learning / Known list views, matching VocabV3's three-tab structure but
    built with the existing UI kit instead of ported CSS.
- Progress state: React state, persisted to `localStorage` under a new key
  (e.g. `pictureVocabProgress`), following the same read-on-mount/write-on-
  change pattern already used elsewhere in the app (e.g. Word Reel's
  auto-speak preference).

### Navigation hookups

1. Add an entry to `getMenuItems()` in `app/page.tsx` (title, href
   `/picture-vocabulary`, icon, description, color classes — same shape as
   the existing entries).
2. Add the matching entry to `components/NavigationMenu.tsx`'s own list (it
   currently duplicates `app/page.tsx`'s list independently — keep both in
   sync; deduplicating that duplication is a separate, optional cleanup and
   out of scope here).

## Steps

1. Confirm the feature's public name/route/icon (or use the placeholders
   above and adjust after a first look).
2. Convert `vocabulary-data.js` → `data/picture-vocabulary.ts`.
3. Batch-convert `Temp/VocabV3/images/*.png` to WebP (640×640, quality ~82)
   with `cwebp` and copy the output into `public/picture-vocabulary/`. Spot-
   check a few converted images on an actual iPhone-sized viewport for
   visible quality loss before committing the full set.
4. Build the page/components recreating the flashcard flow with existing UI
   primitives and `lib/tts.ts`.
5. Add the two navigation entries.
6. Manually test via the dev server: set picker → reveal → TTS playback →
   Still learning/Got it → Learning/Known tabs → progress bar → progress
   persists across reload. Check mobile widths (320–430px) for overflow and
   safe-area handling, matching the standard already used for Nail Exam
   Practice.
7. Run `npm run typecheck`, `npm run lint`, and `npm run build` (static
   export) to confirm nothing regresses and images land correctly in `out/`.
8. Do not run or touch any `nail-exam-practice` validation scripts —
   unrelated to this change.

## Risks / things to watch

- **Repo size:** resolved by the WebP conversion above (~27MB → ~300–500KB).
  Still worth a final size check post-conversion before committing, in case
  actual source content compresses less well than the two samples tested.
- **Content mismatch is intentional:** the word list is generic everyday
  vocabulary, not nail-technician terms — noted here so a future maintainer
  doesn't "fix" this by merging it into Nail Exam Practice.
- Keep the new localStorage key distinct from `vocabProgressV3`.

## Explicitly out of scope

- Anything inside Nail Exam Practice (routes, data, components, tests).
- Spaced repetition, streaks, or scoring beyond the existing binary
  Still-learning/Got-it toggle VocabV3 already has.
- New Firebase config or API keys — TTS is already wired.
- Deduplicating `app/page.tsx` vs. `NavigationMenu.tsx`'s menu-item lists.

## Acceptance criteria

- A new Study Zone card and slide-out nav entry work end to end without
  touching Nail Exam Practice, Word Reel, or New Words.
- No leftover VocabV3 build/key/serve tooling in the repo.
- Progress persists per-browser via `localStorage` under a new key.
- `npm run typecheck`, `npm run lint`, and `npm run build` all pass.
