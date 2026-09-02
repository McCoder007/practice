# Nail Exam Practice Navigation Plan

## Status

Planning only. This document defines the approved naming, information architecture, rollout approach, and verification expectations for consolidating the Nail Technician exam-practice experiences. It does not authorize question-data changes, completion tracking, or implementation by itself.

Do not push. Commit only if asked.

## Goal

Give Nail Technician students one clear place to choose a question bank, a study format, and a group of questions without requiring them to understand the names of the source documents.

The finished experience should:

- Replace the separate top-level Nail exam-practice entries with one main entry.
- Use neutral, learner-facing names for the four question banks.
- Offer Multiple Choice and Study Cards through a consistent structure.
- Make the reveal-answer Study Cards format available for all four banks, including banks that previously supported only Multiple Choice.
- Keep questions in the existing ordered groups of 20, including shorter final groups.
- Preserve the identity, order, correct answer, translations, teaching copy, and provenance of every question.
- Keep internal source names available to maintainers without making learners choose between unfamiliar document titles.

## Approved Learner-Facing Names

### Main section

**Nail Exam Practice**

Use this full name on the Study Zone card and as the page heading. A compact interface may use **Nail Exam** only when the full label does not fit comfortably.

### Practice banks

1. **Official Practice**
2. **Practice Bank A**
3. **Practice Bank B**
4. **Practice Bank C**

Letters are intentional. They present A, B, and C as parallel collections rather than implying a difficulty progression or a required completion order.

### Study formats

1. **Multiple Choice**
2. **Study Cards**

Use this helper text the first time Study Cards appears:

> Read the question, then reveal the answer.

Do not use **Study Mode** as the format name because both formats are methods of studying. Do not use **Flash Cards** unless the experience later gains conventional flashcard behavior such as self-rating or spaced repetition.

## Internal Source Mapping

The neutral public names must not alter the underlying datasets or erase provenance.

| Learner-facing name | Existing internal source | Approved questions | Ordered groups |
| --- | --- | ---: | ---: |
| Official Practice | Official Practice pool | 100 | 5 |
| Practice Bank A | Nail Test | 156 | 8 |
| Practice Bank B | Theory Update | 28 | 2 |
| Practice Bank C | Milady Comprehensive | 164 | 9 |

The final group in a bank may contain fewer than 20 questions:

- Practice Bank A ends with Questions 141–156.
- Practice Bank B ends with Questions 21–28.
- Practice Bank C ends with Questions 161–164.

The source names may remain in code, validation reports, administrator documentation, and an optional learner-facing **Source information** area. They should not be the primary navigation labels.

## Recommended Navigation Hierarchy

```text
Study Zone
└── Nail Exam Practice
    ├── Official Practice
    ├── Practice Bank A
    ├── Practice Bank B
    └── Practice Bank C
         ├── Multiple Choice | Study Cards
         └── Question groups
              ├── Questions 1–20
              ├── Questions 21–40
              └── …
```

### Level 1: Study Zone and slide-out navigation

Show a single **Nail Exam Practice** entry on both primary navigation surfaces:

- The Study Zone homepage card list.
- The slide-out navigation menu.

The consolidated entry replaces the current top-level entries for Official Exam Practice, Exam Practice, and Nail Technician Q&A. Existing direct routes must continue to work during migration so bookmarks and in-progress rollout links are not broken.

### Level 2: Nail Exam Practice hub

The hub presents four bank cards in this order:

1. Official Practice
2. Practice Bank A
3. Practice Bank B
4. Practice Bank C

Each card should show only information that helps the learner choose:

- Bank name.
- Total number of questions.
- Number of groups.
- Available study formats, if format availability differs during rollout.

Recommended card summaries:

- **Official Practice** — 100 questions · 5 groups
- **Practice Bank A** — 156 questions · 8 groups
- **Practice Bank B** — 28 questions · 2 groups
- **Practice Bank C** — 164 questions · 9 groups

Do not imply that A is easier than B or that students must complete the banks alphabetically.

### Level 3: Bank screen

After a learner selects a bank, show the study-format selector and question groups on the same screen.

The format selector should be a clearly labeled two-option control:

```text
[ Multiple Choice ] [ Study Cards ]
```

The selected format changes what happens when a question group is opened. It should not send the learner through a separate format-selection page.

Below the selector, show compact group buttons or cards:

- Questions 1–20
- Questions 21–40
- Questions 41–60
- Continue through the bank's actual final question.

Selecting a group begins the session.

### Back navigation

- From a question session, Back returns to that bank's group list with the selected study format preserved.
- From a bank screen, Back returns to the Nail Exam Practice hub.
- From the hub, Back returns to Study Zone.
- Browser and iPhone PWA back behavior must follow the same hierarchy without losing the expected viewport or opening a duplicate session.

## Click-Reduction Decisions

- Do not create a standalone page that only asks the learner to choose Multiple Choice or Study Cards.
- Put the format selector and question groups on the same bank screen.
- Remember the learner's most recently used format locally and preselect it on the next bank visit. Keep the selector visible so it is always easy to change.
- A first-time visitor should default to **Multiple Choice**, matching the established exam-practice experience.
- Do not automatically start a session when a bank is selected; the learner still needs to choose a question group.
- Use compact group controls so large banks do not become long pages of oversized cards.

The normal path becomes:

1. Open Nail Exam Practice.
2. Choose a bank.
3. Confirm or change the study format and choose a question group.

## Study-Format Availability

Both formats are required for every bank in the finished experience. **Study Cards** is the learner-facing label for the flash-card-style interaction in which the learner reads a question and reveals its answer.

Current state and required work:

| Bank | Multiple Choice | Study Cards |
| --- | --- | --- |
| Official Practice | Existing | Must be added |
| Practice Bank A | Existing | Existing |
| Practice Bank B | Existing | Must be added |
| Practice Bank C | Existing | Must be added |

During an incremental rollout, do not provide an enabled Study Cards control that leads to an unfinished route. Either:

- Hide the unavailable format and state **Multiple Choice available**, or
- Keep the existing navigation until the new bank's Study Cards experience is ready.

The consolidated navigation should not be considered complete until Official Practice and Practice Banks A, B, and C all offer both formats.

## Existing Random Practice Options

The current multiple-choice experiences include random-question options in addition to ordered groups. These are not question banks and should not appear beside Official Practice and Practice Bank A–C as if they were additional sources.

Recommended treatment:

- Keep random options inside the relevant bank when they draw only from that bank.
- If an option draws across Practice Banks A–C, place it after the four bank cards as a secondary **Mixed Practice** action.
- Preserve the existing random-session sizes unless a separate product decision changes them.
- Do not allow random options to obscure the primary bank → format → group path.

## Route and Migration Strategy

Create a unified learner-facing shell while preserving the existing quiz engines and data boundaries.

Recommended public structure:

- `/nail-exam-practice` — consolidated hub.
- `/nail-exam-practice/official` — Official Practice bank screen.
- `/nail-exam-practice/bank-a` — Practice Bank A screen.
- `/nail-exam-practice/bank-b` — Practice Bank B screen.
- `/nail-exam-practice/bank-c` — Practice Bank C screen.

Exact route mechanics may be adjusted for the app's static-export constraints, but learner-facing URLs should not expose document names such as `theory-update` or `milady-comprehensive`.

Existing routes such as `/official-exam-quiz`, `/exam-quiz`, and `/nail-technician-qa-reel` should remain functional until the unified flow has been fully verified. They may become compatibility redirects only after confirming that direct links, browser history, and result/restart flows remain correct.

Do not merge the Official Practice pool with the other 348 questions. A shared navigation shell does not imply shared data, preferences, scoring, or question IDs.

## Study Cards Expansion for All Banks

Official Practice and Practice Banks B and C should reuse the established Practice Bank A Study Cards behavior:

- Show the question first.
- Reveal the answer only after an intentional tap or activation.
- Preserve vertical swipe behavior and existing gesture protections.
- Keep English and Simplified Chinese behavior consistent with the current experience.
- Use exactly the same question membership and ordered group boundaries as Multiple Choice.
- Preserve stable question and correct-choice identity across formats.
- Do not change multiple-choice answer choices, answer keys, explanations, or source order while adding Study Cards.

The Study Cards implementation must load the corresponding existing multiple-choice question object by stable ID. It must derive the revealed answer from that question's existing `correctChoice`/`correctChoiceId` and matching choice record. It must not ask a developer or content author to retype, select, or independently maintain a second answer.

Do not duplicate or manually copy question content into a second independent dataset. If an adapter is needed, it should transform the canonical question records deterministically at runtime or build time and be covered by the parity checks below.

## Data-Preservation Requirements

Navigation work must not change question content. Before and after implementation, verify for every bank:

- The total question count is unchanged.
- Every approved question ID appears exactly once in the ordered group coverage.
- IDs remain in the same source order.
- No approved question is missing or duplicated.
- Every group contains 20 questions except the documented final partial groups.
- English and Chinese question text is unchanged.
- Multiple-choice choices and stable choice IDs are unchanged.
- `correctChoice` or equivalent correct-answer identity is unchanged.
- Every `correctChoice`/`correctChoiceId` resolves to exactly one choice in its question.
- The answer revealed by Study Cards has the same stable choice ID as the answer used to score Multiple Choice.
- The English and Chinese answer displayed by Study Cards exactly match the corresponding keyed choice text in the canonical multiple-choice question.
- Explanations, lock points, review status, and provenance are unchanged.
- Held-for-review and omitted questions do not enter the approved learner-facing banks accidentally.

These checks must cover all **448 approved questions** across the four banks, not merely a sample.

### Required cross-mode parity test

Create an automated test that iterates over every approved question in all four banks and, for each question:

1. Confirms the question has a stable, non-empty ID.
2. Confirms the question ID is unique within the complete 448-question learner-facing inventory.
3. Confirms there is exactly one keyed correct-choice ID.
4. Confirms that keyed ID resolves to exactly one of the question's choices.
5. Builds the Study Card through the same adapter or selector used by the app.
6. Confirms the Study Card question ID equals the source multiple-choice question ID.
7. Confirms the Study Card English and Chinese question text equals the canonical question text.
8. Confirms the Study Card answer ID equals the canonical correct-choice ID.
9. Confirms the revealed English and Chinese answer text equals the keyed canonical choice text.
10. Confirms no fallback, array position, display label such as A/B/C/D, or shuffled position is used as the answer key.

The test must fail closed if a question is missing a keyed choice, has duplicate choice IDs, has an empty translated answer, or cannot be converted to a Study Card without guessing.

### Required inventory and range test

Generate a deterministic inventory for both formats and compare them by stable question ID:

- Official Practice: exactly 100 IDs in Multiple Choice and the same 100 IDs in Study Cards.
- Practice Bank A: exactly 156 IDs in Multiple Choice and the same 156 IDs in Study Cards.
- Practice Bank B: exactly 28 IDs in Multiple Choice and the same 28 IDs in Study Cards.
- Practice Bank C: exactly 164 IDs in Multiple Choice and the same 164 IDs in Study Cards.
- Combined: exactly 448 unique learner-facing question IDs accounted for, with no missing or extra IDs in either format.

For each bank, compare the ordered ID list group by group. Every Study Cards group must contain the exact same IDs, in the same order, as its Multiple Choice counterpart.

## Implementation Phases

### Phase 1: Shared catalog and naming layer

- Add a learner-facing catalog that maps Official Practice and Practice Bank A–C to their existing internal pools.
- Keep source IDs and provenance intact.
- Centralize public names, counts, group counts, route targets, and format availability so the homepage, navigation menu, hub, and bank screens cannot drift apart.
- Add tests for the public-to-internal mapping and expected ordering.

### Phase 2: Consolidated hub and primary navigation

- Add the Nail Exam Practice hub.
- Replace the three current top-level Nail exam-practice entries on both primary navigation surfaces with the single consolidated entry.
- Render the four bank cards with verified totals and format availability.
- Keep all legacy routes operational.

### Phase 3: Unified bank-selection screens

- Add one consistent bank-screen pattern with the format selector and question groups together.
- Default first-time users to Multiple Choice.
- Persist only the last selected format preference at this stage.
- Wire existing Multiple Choice and Practice Bank A Study Cards experiences into the new hierarchy without altering their session logic.

### Phase 4: Official Practice Study Cards

- Extend the existing Study Cards experience to the Official Practice pool.
- Provide five full groups: Questions 1–20 through Questions 81–100.
- Derive every revealed answer from the Official Practice question's stable keyed correct choice.
- Run the complete cross-mode parity and inventory checks before enabling Study Cards for Official Practice.

### Phase 5: Practice Bank B Study Cards

- Extend the existing Study Cards experience to the Theory Update source under the public name Practice Bank B.
- Provide Questions 1–20 and Questions 21–28.
- Derive every revealed answer from the Practice Bank B question's stable keyed correct choice.
- Run the complete cross-mode parity and inventory checks before enabling Study Cards in the hub.

### Phase 6: Practice Bank C Study Cards

- Extend the existing Study Cards experience to the Milady Comprehensive source under the public name Practice Bank C.
- Provide eight full groups and Questions 161–164 as the final group.
- Derive every revealed answer from the Practice Bank C question's stable keyed correct choice.
- Run the complete cross-mode parity and inventory checks before enabling Study Cards in the hub.

### Phase 7: Compatibility cleanup

- Verify direct links and browser/PWA Back behavior.
- Decide whether legacy routes remain as supported aliases or become redirects.
- Remove duplicate top-level navigation only after every new path is verified.
- Do not remove internal source metadata or validation tooling.

## Validation Plan

### Static and data checks

- Run the project question-bank validation appropriate to each pool.
- Run the existing exam-quiz tests.
- Add coverage for the four public bank mappings and all calculated group boundaries.
- Prove that ordered ranges cover each approved pool exactly once and in order.
- Run the required 448-question cross-mode parity test and require zero missing IDs, zero extra IDs, zero unresolved answer keys, and zero answer-text mismatches.
- Run targeted lint, type checking, production build, and `git diff --check`.

### Navigation checks

Verify from both the Study Zone homepage and the slide-out menu:

- Nail Exam Practice is the only top-level exam-practice destination.
- The hub shows Official Practice followed by Practice Bank A, B, and C.
- Counts and group totals are correct.
- Each bank opens the correct internal question pool.
- Changing formats does not change the selected bank or group numbering.
- Back navigation returns to the expected bank or hub screen.
- Direct legacy URLs remain usable during migration.

### Interaction checks

For every enabled bank/format combination:

- Start the first, a middle, and the final question group.
- Confirm the displayed first and last question IDs match the requested range.
- Confirm Multiple Choice scores against stable answer IDs after choice shuffling.
- Confirm Study Cards reveal the correct answer and do not reveal during a swipe.
- For every question, mechanically confirm that the revealed Study Cards answer is the exact choice used by Multiple Choice scoring before any answer-choice display shuffle.
- Confirm Chinese visibility and text-to-speech behavior remain consistent with the existing mode.
- Confirm restart and return-to-bank actions preserve the expected bank, format, and range.

### Mobile checks

Test at minimum 320×568, 375×667, 390×844, and 430×932:

- No horizontal overflow.
- Bank and group controls maintain usable touch targets.
- The format selector does not wrap ambiguously or clip.
- Long bank pages scroll normally.
- Fixed controls respect safe-area insets.
- Opening and closing the slide-out navigation does not disturb the bank screen.
- PWA and browser Back behavior follow the intended hierarchy.

## Explicitly Out of Scope

- Completion counts.
- Attempt history.
- Progress badges or checkmarks on banks or groups.
- Scores carried across sessions.
- Streaks, mastery, spaced repetition, or self-rating.
- Renaming or rewriting source documents.
- Reclassifying questions by subject or difficulty.
- Combining Official Practice with the other three underlying datasets.
- Changing random-session sizes.
- Correcting, translating, or otherwise editing question content as part of the navigation work.

Completion and history tracking should be designed separately after this navigation has been implemented and validated.

## Acceptance Criteria

The navigation update is ready when:

1. The Study Zone homepage and slide-out menu each expose one Nail Exam Practice entry.
2. The hub displays Official Practice and Practice Bank A–C in the approved order.
3. Each public bank maps to the correct unchanged internal pool.
4. A learner can choose a bank, select Multiple Choice or Study Cards, and start a question group without visiting a separate format-only screen.
5. All ordered groups use the same boundaries in both formats.
6. Official Practice and Practice Banks A, B, and C all have verified Study Cards experiences before the consolidated rollout is considered complete.
7. Existing links continue to work throughout migration.
8. The exhaustive 448-question parity check finds no missing, extra, duplicated, reordered, or modified approved questions and no difference between the Multiple Choice correct answer and the Study Cards revealed answer.
9. Mobile navigation, scrolling, touch targets, safe areas, and Back behavior pass the defined viewport checks.
10. No completion or history tracking is introduced.
