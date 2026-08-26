# Official Exam Practice Plan

Implement this plan in a new conversation, one phase at a time (see "How the work should be split across separate conversations" below). Do not push. Commit only if asked.

## Context

The app already has a working bilingual "Exam Practice" module (`/exam-quiz`) backed by a 348-question pool built from three Word source files (see `docs/practice-question-bank-plan.md` and `docs/practice-question-bank-teaching-copy-remediation-plan.md`). There are now **100 new questions** to ship as a second, independent module — **"Official Exam Practice"** — placed in the nav between **Word Reel** and **Exam Practice**. It must be built the same way as the existing module (bilingual EN/zh-Hans, Chinese on/off toggle, quick practice, practice set, fixed question banks, answer-choice shuffling, textbook explanations) but is its own separate pool — no merging with the existing 348 questions.

The source of the 100 questions is **not** plain files sitting in `question-bank/temp` — it's two `.mhtml` browser-saved pages from a Trivie Learn results screen:

- `vocabulary-next/question-bank/Temp/NIC Nail Technology Practice Exam - Trivie Learn.mhtml` — "Scientific Concepts" quiz, **40 questions**
- `vocabulary-next/question-bank/Temp/Results - Trivie Learn Quiz 2.mhtml` — "Nail Technology Procedures" quiz, **60 questions**

40 + 60 = **100**, matching exactly. A decode/parse prototype (quoted-printable → HTML → regex over Trivie's result markup) cleanly extracted **all 100** stems, all 4 answer choices each, and the correct answer for every single one — **with zero ambiguity**, because Trivie color-codes the correct choice green (`rgb(0, 203, 118)`) directly in the results HTML. This is a mechanical, verifiable extraction, not a guess: the prototype script confirmed exactly 4 choices and exactly one green (correct) choice per question, 100/100, no exceptions. Phase 1 below should re-derive the extraction from the source files (rebuild the script), not retype the questions by hand.

## Decisions already made (do not revisit)

1. Explanations are sourced from the same **Milady Standard Nail Technology 8th Edition** PDF already used for the existing pool (`question-bank/Temp/Milady Standard Nail Technology 8th Edition.pdf`) — not a separate "NAEA" book.
2. Match the existing module's two-field answer reveal exactly: bilingual `explanation` ("Why") + bilingual `lockPoint` ("Lock this"), same as `ExamQuestion` today.
3. No dedup check against the existing 348-question pool — this is a fully independent pool.
4. The Chinese-toggle on/off preference is **independent** per module (its own `localStorage` key), not shared with the existing Exam Practice toggle.
5. Quick practice = **10 random**. Practice set = **25 random** (not 30, which is what the existing module currently uses — that's an intentional difference for this new module, not a bug). Fixed question banks = **20 questions each** (5 banks of 20, vs. the existing module's 25-per-bank), covering questions 1–20, 21–40, 41–60, 61–80, 81–100. Bonus: bank 1–20 and 21–40 fall entirely within the 40-question "Scientific Concepts" quiz, and 41–60/61–80/81–100 fall entirely within the 60-question "Nail Technology Procedures" quiz — no bank straddles the two source quizzes.
6. Multiple-choice answers keep their original text/correctness from the Trivie source (source-faithful), and are shuffled into random on-screen order per attempt — identical mechanism to the existing pool (shuffle by stable choice `id`, not array position).
7. Accuracy is non-negotiable: the correct answer must never be altered from what Trivie recorded. Every phase below includes a mechanical or human verification step specifically to protect this.

## Existing code/patterns to reuse

- `vocabulary-next/components/NavigationMenu.tsx` — nav items array (`getMenuItems`); "Word Reel" and "Exam Practice | 考试练习" entries live here — add the new entry between them.
- `vocabulary-next/lib/exam-quiz-reel.ts` — **fully generic, reuse unmodified**: `drawPracticeSession()` (dedupe + Fisher-Yates + slice to size), `shuffleQuestionChoices()` (per-question choice shuffle keyed by stable `id`), `sliceSourceRange()` (bank slicing by id-prefix + offset/chunk size), `choicePositionLabel()`. None of these are hardcoded to the existing pool — they take the pool and sizes as arguments.
- `vocabulary-next/lib/nail-technician-qa-reel.ts` — source of the shared `fisherYatesShuffle` primitive (re-exported by the file above).
- `vocabulary-next/data/exam-quiz/types.ts` — `ExamQuestion`/`LocalizedText`/`ExamChoice` types; the new module's loader can import these as-is (same shape).
- `vocabulary-next/data/exam-quiz/catalog.ts` and `loadChapter.ts` — **do not edit**; clone into a new `data/official-exam-quiz/catalog.ts` + `loadChapter.ts` pointing at the new JSON path, with `QUICK_COUNT = 10`, `PRACTICE_COUNT = 25`, chunk size `20`, and a single source entry (id-prefix `official-practice-`, count 100) instead of the existing three-source `PRACTICE_SOURCES`.
- `vocabulary-next/contexts/ExamQuizPreferencesContext.tsx` + `components/ExamQuizChineseToggle.tsx` — clone to a parallel context/toggle pair with a different `localStorage` key (e.g. `official-exam-quiz-show-chinese`) per decision #4 above.
- `vocabulary-next/app/exam-quiz/layout.tsx` + `page.tsx` — clone into `app/official-exam-quiz/layout.tsx` + `page.tsx`, swapping in the new preferences context and loader. The quiz-card UI, reveal panel (Why/Lock this/source warning), results screen, and swipe-reel mechanics should be reused near-verbatim — this module needs the same UX, not a redesign.
- `vocabulary-next/question-bank/schema/question-bank.schema.json` — clone to an analogous schema for the new bank (`id` pattern `^official-practice-`, `collection` const e.g. `"official-practice-pool"`); keep `localizedText`/`choice` defs identical.
- `vocabulary-next/question-bank/scripts/validate-question-bank.js` — reuse/adapt for the new JSON file and schema.
- `vocabulary-next/docs/practice-question-bank-plan.md` and `vocabulary-next/docs/practice-question-bank-teaching-copy-remediation-plan.md` — these are the **style guide** for how the existing pool's translation/explanation/lockPoint authoring, review-ledger discipline, and ESL-first rules were done. Reuse the same standards (non-restatement test, ESL word-count ceilings, no puns, `Why`/`Lock this` patterns, ban on stock filler phrases) for this new pool's teaching copy, rather than re-deriving a new style.

## How the work should be split across separate conversations

Do each phase as its own conversation, in order, each starting from this plan file plus the output of the prior phase. Do not batch English extraction and Chinese translation/explanation authoring into one pass — keep the accuracy-critical steps isolated and independently checkable, matching how the existing pool was built.

### Phase 1 — Extract and stage (English only, source-faithful)

- Rebuild the mhtml → JSON extraction (decode quoted-printable, regex the Trivie results markup for stem text, the 4 choice texts, and the green-colored correct choice).
- Produce a staging JSON: 100 records, each with `id` (`official-practice-001` … `official-practice-100`, in source order: 1–40 from the Scientific Concepts quiz, 41–100 from the Nail Technology Procedures quiz), `question.en`, `choices[].en` (assign stable `a/b/c/d` ids in original on-page order), `correctChoice`, and `sources: [{ "book": "NIC Nail Technology Practice Exam - Trivie Learn", "itemRef": "..." }]` (or the second file's name for 41–100).
- No translation, no explanation, no distractor changes at this stage — English extraction only.
- Verify mechanically: exactly 100 records, each with exactly 4 choices, each with exactly one `correctChoice`, no empty stem/choice text, no duplicate ids. Also spot-check ~10 records by eye against the decoded HTML (or the original Trivie page if still accessible) to catch any regex mis-capture the automated checks wouldn't reveal (e.g. truncated stem, HTML entity left undecoded).
- Deliverable: `vocabulary-next/question-bank/official-practice/staging.json` (or equivalent) + the extraction script committed under `question-bank/scripts/`.

### Phase 2 — Translate to Chinese (zh-Hans)

- Translate `question.en` and all 4 `choices[].en` for all 100 records into natural Simplified Chinese, reusing `question-bank/glossary/nail-technology-en-zh.json` for consistent terminology with the existing pool (same English exam terms should get the same Chinese, e.g. 甲床, 单体液, 消毒).
- **Never touch `correctChoice` or the English text in this phase** — translation only adds `question.zh` and `choices[].zh`.
- Verification: every record has non-empty `zh` for the stem and all 4 choices; a second read-through (ideally by a fluent reader, human-in-the-loop) confirming the Chinese choice marked as correct in translation still matches the English `correctChoice` id (i.e., translation didn't accidentally reorder or mistranslate the keyed choice).

### Phase 3 — Author bilingual explanations

- For each of the 100 questions, using the Milady PDF as support, author `explanation: {en, zh}` ("Why") and `lockPoint: {en, zh}` ("Lock this"), following the standards already written up in `docs/practice-question-bank-teaching-copy-remediation-plan.md` (non-restatement test, ESL word-count ceilings ~12–30 words for Why / ≤20 for Lock this, no puns/mnemonics, Chinese must stand alone, banned stock-filler phrases like "The exam answer is...").
- Work in small batches (e.g. 20–25 at a time, matching one bank) rather than all 100 at once, and spot-check each batch against the textbook before moving to the next.
- Verification: no banned filler phrases, no explanation that just restates the stem, both languages present, lengths within the documented ceilings.

### Phase 4 — Assemble the release JSON

- Merge Phases 1–3 into `vocabulary-next/question-bank/official-practice/questions.json` matching the existing schema shape (`schemaVersion`, `language`, `sourceTitle`, `generatedAt`, `statistics`, `questions[]`), with every record `status: "approved"`.
- Clone/adapt `question-bank.schema.json` and `validate-question-bank.js` for this file (see naming above) and run it — must pass with 0 errors.
- Confirm bank boundaries: questions 1–20, 21–40, 41–60, 61–80, 81–100 by `id` order line up with the intended 5 banks of 20.

### Phase 5 — Build the app module

- Add the nav entry in `NavigationMenu.tsx` between Word Reel and Exam Practice, with an accurate Chinese label for "Official Exam Practice" (verify this translation with the same rigor as the questions — it's user-facing text too).
- Clone `app/exam-quiz/` → `app/official-exam-quiz/` (route, layout, page) and `data/exam-quiz/` → `data/official-exam-quiz/` (catalog, loadChapter), wiring constants per the decisions above (10 / 25 / 20-per-bank, 5 banks, single source pointing at the new JSON).
- Clone the Chinese-toggle context/component with the new independent `localStorage` key.
- Reuse `lib/exam-quiz-reel.ts` and `lib/nail-technician-qa-reel.ts` as-is (no changes needed there).

### Phase 6 — QA and verification

- `npm run lint`, typecheck, and `npm run build` clean.
- In-browser testing at the same required viewports as the existing module (320×568, 375×667, 390×844): quick practice (10), practice set (25), and each of the 5 fixed banks; Chinese toggle on/off independently from the existing Exam Practice module; explanation/Lock this reveal after answering; results screen with missed-question review; no duplicate questions within a single session draw; answer-choice shuffling still scores correctly against the stable `correctChoice` id after shuffle.
- Final accuracy re-check: re-diff the shipped `correctChoice` values against the original Phase 1 staging extraction to prove nothing drifted during translation/explanation authoring/assembly.

## Verification summary (how we know this is done right)

- Phase 1's extraction is mechanical/reproducible from the source `.mhtml` files, not hand-typed — re-running the script should reproduce identical output.
- Every later phase explicitly forbids touching `correctChoice`/English source text, and Phase 6 re-diffs against the original extraction as a final backstop.
- Same schema validator pattern as the existing pool catches structural mistakes (missing choice, wrong id pattern, missing bilingual field) before shipping.
- Real in-browser testing of every mode (quick/practice/5 banks) plus the Chinese toggle and explanation reveal, at multiple viewport sizes, before calling it done.

## How to start the next conversation

Point the new agent at this file:

`vocabulary-next/docs/official-exam-practice-plan.md`

Ask it to implement **Phase 1 only** (or whichever phase is next). Do not push. Commit only if asked.
