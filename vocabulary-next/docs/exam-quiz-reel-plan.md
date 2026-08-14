# Bilingual Nail Technician Exam Quiz Reel

## Context

Vocabulary Next already has a popular "Word Reel" experience and a very recent, near-identical precedent — the **Nail Technician Q&A Reel** (`app/nail-technician-qa-reel/page.tsx`, design doc `docs/nail-technician-qa-reel-plan.md`, gesture helper `lib/nail-technician-qa-reel.ts`) — a vertical swipe reel with tap-to-reveal answers, built just one commit ago (`c3f4c46`).

Separately, `vocabulary-next/question-bank/` contains **1,148 real multiple-choice exam questions**, already fully bilingual (English + Simplified Chinese, 100% QA-validated), organized into `foundations` (10 chapters, 387 questions), `nails` (13 chapters, 661 questions), and `comprehensive` (a 100-question mock exam). This data is currently **not wired into the app at all** — no route, component, or lib file imports from it.

The goal: build a new "Exam Quiz" feature that lets users pick a subject → chapter → quiz mode, then swipe vertically through real multiple-choice questions with instant bilingual correct/incorrect feedback, ending in a results screen — reusing the reel mechanics and quiz-scoring conventions this app has already established, rather than inventing new patterns.

**Decisions already made with the user** (do not revisit):
1. **Navigation**: one new entry in the existing flat menu (`components/NavigationMenu.tsx`) and home page (`app/page.tsx`), linking to a single new route that internally implements the whole subject → chapter → mode → quiz → results flow via local React state (no nested hamburger submenu, no additional Next.js routes).
2. **Explanations**: omitted entirely in v1 (the data has no explanation field, only textbook page refs) — feedback shows only correct/incorrect + the correct answer text. No UI placeholder reserved for this.
3. **Persistence**: session-only in v1, matching every existing quiz component exactly. No localStorage, no history, no mastery tracking yet — but data structures shouldn't preclude adding it later.
4. **Quiz modes**: "Quick Practice" (10 random questions) and "Full Chapter" (every question in the chapter, **shuffled**, not original order). No custom question-count picker.

## Route & Information Architecture

New route: **`app/exam-quiz/page.tsx`** — hosts the entire flow as a state machine, not multiple routes:

```ts
type ExamQuizScreen =
  | { step: "subject" }
  | { step: "chapter"; subjectId: SubjectId }
  | { step: "mode"; subjectId: SubjectId; chapterId: number }
  | { step: "quiz" }
  | { step: "results" }
```

`quiz`/`results` also read a separate `session: ExamSession | null` state (populated when leaving `mode`), so results can render after `session` is otherwise done being written to.

**Include Comprehensive as a third subject** alongside Foundations/Nails — it's a first-class `section` value in the schema (100 cross-cutting questions), not a chapter of either book. Since it has only one "chapter" (chapter 0), selecting it as a subject **skips the chapter-picker screen** and jumps straight to `mode`.

**Back navigation**: reuse the `window.history.pushState`/`popstate` pattern from `app/irregular-verb-lists/page.tsx` (lines ~28-71), generalized to push/restore the full `ExamQuizScreen` object instead of a single `stageId`. Back-button mid-quiz simply returns to `mode` and discards the in-progress session — no confirmation dialog needed given session-only persistence.

**Nav entries** (exactly one each, mirroring how the Q&A reel was added):
- `components/NavigationMenu.tsx` — add `{ title: "Exam Quiz | 考试测验", href: "/exam-quiz", icon: GraduationCap }` to `getMenuItems`.
- `app/page.tsx` — add a matching home-page card (title, href, icon, description, an unused color hue e.g. indigo).

## Data Loading Strategy

Verified: `tsconfig.json` has `resolveJsonModule: true` and the `@/*` path alias, so JSON imports work exactly like `data/nail-technician-qa/index.ts` already does. But each chapter file is an **object** `{ schemaVersion, ..., questions: [...] }`, not a bare array — any adapter must read `.questions`.

Importing `all-questions.json` (1.7MB) statically would bloat the route's JS chunk badly. **Use per-chapter lazy loading instead**, in a new `data/exam-quiz/` adapter directory (following the `data/nail-technician-qa/index.ts` convention — `data/` for typed dataset adapters, `lib/` for pure logic):

- `data/exam-quiz/types.ts` — shared types (see below).
- `data/exam-quiz/catalog.ts` — a small, **hand-written, statically-imported** manifest: 24 entries (10 foundations + 13 nails + 1 comprehensive), each `{ subjectId, chapter, title: {en,zh}, questionCount }`. This powers the subject/chapter picker screens instantly, with zero chunk cost. Transcribe counts/titles once from the already-known chapter list (verified during research) — do not derive at runtime by importing every chapter file.
- `data/exam-quiz/loadChapter.ts` — `loadChapterQuestions(subjectId, chapterId): Promise<ExamQuestion[]>`, using dynamic `import()` per chapter (code-splits into its own static chunk, compatible with `output: 'export'`). Branch explicitly for `comprehensive` (single file `comprehensive-exam.json`, different naming) vs `foundations`/`nails` (template-literal `chapter-NN.json` pattern) rather than one polymorphic expression — this is the one place that reads raw `question-bank/` JSON and maps it (`toExamQuestion`) to the app's `ExamQuestion` type, renaming schema fields (`section`→`subjectId`, `correctChoice`→`correctChoiceId`) so the rest of the app never sees the raw schema shape.

## Component & File Plan

**New files:**
- `app/exam-quiz/page.tsx` — route, owns `screen`/`session` state, renders the current screen.
- `data/exam-quiz/types.ts`, `catalog.ts`, `loadChapter.ts` — as above.
- `lib/exam-quiz-reel.ts` — a **sibling** to `lib/nail-technician-qa-reel.ts`, not an extension of it (the interaction model is different enough — see below). Exports:
  - `classifyExamReelGesture({ deltaX, deltaY, swipeThresholdPx }) => "swipeNext" | "swipePrevious" | "cancel"` — simpler than the Q&A reel's classifier since there's no tap-reveal outcome; whether a swipe is allowed before answering is a caller-side decision, not baked into the classifier.
  - `scoreSession`/`summarizeSession(session: ExamSession): ExamResultsSummary` — pure scoring/grouping reducer.
  - Re-import `fisherYatesShuffle` from `lib/nail-technician-qa-reel.ts` rather than redefining it a third time (it's already generic and unit-tested). Do not touch `lib/utils.ts`'s separate `shuffleArray` — other components depend on it, out of scope.

**Reused as-is:** `components/ui/progress.tsx`, `button.tsx`, `card.tsx` (subject/chapter picker screens, following the `irregular-verb-lists` tap-to-select card pattern); `lib/word-reel-backgrounds.ts` (per-card gradient cycling); `lib/tts.ts` (`playText`/`preloadTexts`/`clearAudioQueue`, question-text-only TTS, same scope as the Q&A reel); `lib/utils.ts`'s `cn`; the existing `.qa-answer-reveal` keyframe + `prefers-reduced-motion` override already in `app/globals.css`.

**Patterns to follow, not import:** `components/CapitalsQuiz.tsx` is bordered-card/centered-column, not full-bleed reel — borrow its color tokens, copy ("Correct! 正确！" / "Not quite 不太对"), icons (`CheckCircle2`/`XCircle`), and results-screen conventions, but rebuild the layout for the reel's full-bleed format.

## Reel + Answer Interaction Design

This is the core departure from the Q&A reel, which has one concealed-answer region; here there are 2-6 real, individually-tappable choice buttons per card.

1. **Choice buttons are fully isolated interactive elements**: each is a real `<button>` with `onPointerDown={(e) => e.stopPropagation()}` (identical technique to the Q&A reel's TTS-button isolation), so a tap on a button never reaches the card's drag tracker — no `startedInAnswerRegion` disambiguation needed at release time, since the event simply never starts a drag for that pointer.
2. **Auto-submit on tap** — selecting a choice immediately shows feedback (no separate "Check Answer" button); this matches `Quiz.tsx`/`QuizV2.tsx`'s existing auto-check idiom and suits the reel's instant-gratification feel better than `CapitalsQuiz`'s explicit-Check flow (which exists there to support multi-select toggling, not needed here).
3. **Swipe/skip is always allowed**, before or after answering — matches every other reel in the app and avoids fighting the gesture users already expect. An unanswered card that's swiped past records `skipped: true` (distinct from `correct: false` on a wrong answer) for the results screen to distinguish.
4. **An explicit "Next" button appears after answering**, in addition to swipe (accessibility/non-touch affordance, mirroring `CapitalsQuiz`), routed through the same single `commitNavigation` path as swipe and keyboard nav.
5. **Keyboard**: `ArrowUp`/`ArrowDown` navigate cards (always available, same rule as swipe); choice selection needs no bespoke handling since native `Tab`+`Enter`/`Space` already works on real `<button>` elements. Do not port the Q&A reel's global `Enter`/`Space`-reveals-answer binding — there's no single concealed region here.

## Bilingual Card Layout

Full-bleed card (same gradient/overlay shell as the Q&A reel), three stacked sections (`flex flex-col`, not the Q&A reel's `grid-rows-2`):

- **Question** (top ~35-40%): English bold/white/drop-shadow, tappable for TTS; Chinese below in gold `#FFD700` — the app-wide bilingual convention.
- **Choices** (middle ~45-50%, `overflow-y-auto` as a safety valve for 5-6-choice questions on short viewports — an intentional, justified deviation from the Q&A reel's "no nested scrolling" rule, since a multi-choice list is a genuinely different content shape than a single reveal region): each choice is a compact button, `{id}.` + English (top line) + Chinese (smaller, gold, second line).
- **Feedback** (appears only after answering, reusing the existing `.qa-answer-reveal` animation): a compact translucent banner (emerald/rose per correct/incorrect, `CheckCircle2`/`XCircle`, "Correct! 正确！" / "Not quite 不太对"), showing the correct choice's EN/ZH text when wrong. The selected-wrong and actually-correct choice buttons also get emerald/rose outline treatment in place. The explicit "Next" button sits below this banner.

## Progress & Results

**Progress**: fixed header (like the Q&A reel's header bar) showing `Question {i+1} of {total}` + `<Progress value={...} className="h-1.5" />` (the exact `CapitalsQuiz` idiom, the only existing usage of the progress bar), plus the current chapter title for context.

**Results screen** (full replacement of the reel, not another card): gradient heading "Practice complete! | 练习完成！", bilingual score line "Your score: {correct} / {total} | 得分：{correct} / {total}" (copy borrowed directly from `CapitalsQuiz`), a per-chapter breakdown when a session spanned multiple chapters (relevant for subject-level Quick Practice), a **missed-questions review list** (wrong + skipped, visually distinguished, each showing the question and correct answer bilingually), and three buttons: `Restart` (same params, fresh shuffle), `Try Another Chapter`, `Home`. All computed from in-memory `session` state — nothing persisted.

## Data Structures (`data/exam-quiz/types.ts`)

```ts
export type SubjectId = "foundations" | "nails" | "comprehensive"
export type LocalizedText = { en: string; zh: string }
export type ExamChoice = { id: string; en: string; zh: string }

export type ExamQuestion = {
  id: string
  subjectId: SubjectId
  chapter: number               // 0 for comprehensive
  chapterTitle: LocalizedText
  question: LocalizedText
  choices: ExamChoice[]
  correctChoiceId: string
}

export type CatalogEntry = { subjectId: SubjectId; chapter: number; title: LocalizedText; questionCount: number }
export type QuizMode = "quick" | "full"

export type ExamAnswerRecord = {
  questionId: string
  selectedChoiceId: string | null   // null = skipped
  correct: boolean                   // false for both wrong and skipped
  skipped: boolean
}

export type ExamSession = {
  subjectId: SubjectId
  chapter: number | "all"        // "all" for subject-level Quick Practice
  mode: QuizMode
  questions: ExamQuestion[]      // shuffled, fixed for session lifetime
  answers: Record<string, ExamAnswerRecord>
}

export type ExamResultsSummary = {
  correct: number
  total: number
  byChapter: Array<{ chapter: number; chapterTitle: LocalizedText; correct: number; total: number }>
  missed: ExamAnswerRecord[]
}
```

Keying `ExamAnswerRecord` by stable `questionId` means a future phase-2 localStorage mastery layer could read/write the same shape without reworking this — intentionally not built now.

## Testing & Verification

- New `lib/exam-quiz-reel.test.mjs` (mirrors `lib/nail-technician-qa-reel.test.mjs`, run via a new `npm run test:exam-quiz` script): boundary tests for `classifyExamReelGesture` (below/at/above threshold), and `summarizeSession`/`scoreSession` tests (all-correct, all-wrong, mixed, all-skipped, empty session, `byChapter` grouping).
- Manually cross-check `data/exam-quiz/catalog.ts` question counts against each chapter file's `statistics.totalQuestions` before shipping (hand-transcription typo risk).
- `npm run typecheck` (the static-export build has `ignoreBuildErrors: true`, so this is the only thing that gates type errors).
- `npm run build` — confirm the exam-quiz route's First Load JS stays lean (lazy chapter chunks split out, not inlined) by comparing against `/nail-technician-qa-reel`'s reported size in Next's build output.
- Manual gesture testing (iOS Safari, Android Chrome, desktop mouse): swipe next/previous before and after answering; confirm choice-button taps never trigger card navigation — this is the highest-risk regression given multiple real tap targets inside a drag-tracked container.
- Keyboard nav (Arrow Up/Down, Tab+Enter/Space) and focus behavior when a new card becomes current.
- `prefers-reduced-motion` respected for the feedback-reveal animation.
- Spot-check a long-content chapter (e.g. `foundations/chapter-05.json`, Infection Control) at a narrow mobile viewport to confirm the choices-section scroll-if-needed behavior doesn't clip or look broken.
- Click through the new nav entry from both the hamburger drawer and home page.

## MVP Scope

**Ships now**: subject → chapter (skipped for Comprehensive) → mode (Quick 10 / Full-shuffled) → swipeable quiz reel with auto-submit choice buttons, correct/incorrect feedback (no explanations), skip-allowed swipe navigation, explicit Next button, Arrow-key nav, question-only TTS, in-memory results with missed-question review and per-chapter breakdown, one new nav entry + home card. No localStorage.

**Explicitly deferred**: localStorage-based mastery/attempt history (structurally easy to add later per the data structures above), custom question-count picker, per-question explanations, a timed/proctored Comprehensive mock-exam mode, a standalone "review missed only" re-quiz mode, choice-level TTS, a mid-session "jump to chapter" bottom sheet, and consolidating the app's three near-duplicate Fisher-Yates shuffle implementations (flagged as pre-existing tech debt, not part of this feature).

## Critical Files

- `app/exam-quiz/page.tsx` (new) — route, state machine, reel
- `data/exam-quiz/loadChapter.ts` (new) — lazy per-chapter loader, only place touching raw `question-bank/` JSON
- `data/exam-quiz/catalog.ts` (new) — static picker manifest
- `data/exam-quiz/types.ts` (new)
- `lib/exam-quiz-reel.ts` (new) — gesture classifier + scoring, unit-tested
- `app/nail-technician-qa-reel/page.tsx` — reference for reel mechanics, Pointer Events, interactive-element isolation
- `components/CapitalsQuiz.tsx` — reference for feedback panel, progress bar, results copy
- `components/NavigationMenu.tsx` and `app/page.tsx` — one new entry each
