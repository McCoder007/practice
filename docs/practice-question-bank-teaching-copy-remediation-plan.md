# Practice Question Bank Teaching-Copy Remediation Plan

Implement this plan in a new conversation. Do not push. Commit only if asked.

This plan corrects the learner-facing `Why / 为什么` and `Lock this / 记重点` content in the practice question bank and repairs the review process that allowed weak or disputed material to ship. It supplements `docs/practice-question-bank-plan.md`; the original source-fidelity, custody, ID, session, and UI decisions remain in force.

## Problem statement

The current practice pool contains 473 approved questions. Of those, 437 use the fallback explanation:

> The exam answer is [answer]. Keep this wording for the test.

That sentence identifies the keyed answer but does not explain why it is correct. Many current lock points also select the first wrong choice mechanically and present it as the comparison, whether or not it is a useful learner confusion.

The current review ledger compounds the problem: generated records were marked `teachingCopyStatus: "pass"` and `answerReviewStatus: "pass"` by the same builder that authored them. Some source warnings were also converted automatically to `approved-override`. A generated status is not an educational or factual review.

The current learner-facing teaching copy and its generated approvals must therefore be treated as unreviewed.

## Goal

Reauthor every shipped question's bilingual teaching copy so that:

1. `Why` gives the learner a useful idea that is not already stated in the stem.
2. `Why` explains the answer with a simple cause, purpose, action, category, body location, sequence, or contrast.
3. `Lock this` gives one small recall aid based on a real nearby confusion; it is not required to name a distractor when no useful contrast exists.
4. English is easy for an ESL learner to understand without first learning several additional words.
5. Chinese stands alone and teaches the same idea, rather than wrapping untranslated English in a Chinese sentence.
6. No teaching copy is published until its answer, teaching value, English, and Chinese have been reviewed.
7. Disputed, unsafe, vague, or unrecoverable items remain quarantined instead of receiving automatic overrides.

## Decisions already made

1. Preserve the Word source transcription in staging. Do not silently change source stems, choices, or keys.
2. The textbook PDF is support for explanations, terminology, distractors, and dispute checking; it is not a replacement answer key.
3. Keep stable question IDs and existing `sources[]` provenance.
4. Do not regenerate acceptable teaching copy from a generic answer-restatement template.
5. Do not let a script or AI author mark its own output as reviewed.
6. Do not ship a smaller questionable pool merely to preserve the current question count. Educational quality controls pool size.
7. Keep the existing 10- and 30-question quiz modes and reveal UI unless a content change exposes a separate UI defect.

## Scope

### In scope

- All 473 currently shipped practice questions
- English and Simplified Chinese `explanation` and `lockPoint`
- The 43 records currently labeled `approved-override`
- Review-ledger integrity and reviewer attribution
- Teaching-copy authoring inputs, storage, regeneration behavior, and validators
- Review HTML needed to inspect source, answer, textbook support, teaching copy, and status together
- Regression tests and release gates

### Out of scope

- Rewriting source Word questions merely to improve their grammar
- Changing a Word answer silently to match the textbook
- Replacing the existing stable IDs
- Redesigning the quiz reel
- Reconsidering the 10- and 30-question session decisions
- Committing or publishing copyrighted Word/PDF source files

## Immediate containment

Before reauthoring:

1. Create a checksum-backed local snapshot of the current generated practice artifacts for comparison. Do not treat the snapshot as approved content.
2. Change every currently shipped ledger row to:
   - `teachingCopyStatus: "not-reviewed"`
   - `answerReviewStatus: "not-reviewed"` unless a separate, traceable factual review exists
   - blank reviewer identity and review date for invalidated generated approvals, or preserve them only in an audit-history field
3. Change every automatically created `approved-override` to `quarantined` and `answerReviewStatus: "disputed"` until a named reviewer resolves it.
4. Prevent `build_practice_bank.py` from generating review passes or approved overrides.
5. Prevent the current fallback phrases from entering release data.
6. During remediation, either keep the practice quiz unavailable or load only the subset that has completed the new review process. Do not expose mixed reviewed and unreviewed teaching copy as one approved pool.

## The educational standard

### What `Why` must do

`Why` answers the learner's real question: **What simple idea makes this answer correct?**

An acceptable `Why` must add at least one useful idea not already given in the question. It should normally use one of these teaching relationships:

- **Cause and effect:** skin cells need oxygen and nutrients; blood carries them.
- **Purpose:** primer helps product stick to the nail.
- **Action or result:** acetone breaks down soak-off product so it can be removed without force.
- **Category:** a pedicure cares for natural toenails and feet; the other choices add artificial enhancement material.
- **Body map:** the ulna is on the little-finger side; the radius is on the thumb side.
- **Sequence:** clean first to remove dirt, then disinfect the surface.
- **Safety reason:** stop the service when infection is suspected because salon work can spread it or make it worse.
- **Meaningful contrast:** monomer is liquid; polymer is powder.

The explanation should not force the learner to infer how the explanation relates to the answer. State the connection directly.

### What `Why` must not do

Reject a `Why` if it:

- says only that the exam answer is the selected choice
- says to memorize, keep, or remember the wording
- repeats or lightly paraphrases the definition already present in the stem
- turns the stem into a complete sentence without adding knowledge
- repeats the correct choice and then lists wrong choices
- introduces several new technical terms to explain one term
- gives test-taking tricks instead of teaching the subject
- uses circular reasoning, such as "pedicure is correct because it is a pedicure service"
- teaches a disputed source key as fact
- depends on a pun, acronym, rhyme, or English wordplay
- uses vague filler such as "this is important" or "this is the best answer"

### The non-restatement test

For every authored `Why`, reviewers must ask:

> If the question and answer were hidden, would this sentence still teach a useful fact or relationship?

If the answer is no, the explanation is probably a restatement and must be rewritten.

A definition question can still have a useful `Why`, but it should explain function, consequence, recognition, or contrast rather than repeat the definition.

Bad:

> A fissure is a crack that reaches the dermis.

This repeats the stem.

Potentially useful:

> A deep skin crack can be painful and can let germs enter. A surface scale does not split the skin open.

This adds consequence and a useful distinction. If the source support for that added statement is weak or the result is still not useful, omit the question from the teaching pool rather than pad it with filler.

### ESL-first English rules

- Aim for one or two sentences and about 12-30 English words. The existing 35-word ceiling remains a hard maximum, not a target.
- Prefer common words: `under`, `side`, `carry`, `stick`, `kill`, `soak`, `skin`, `powder`, `liquid`, `before`, `after`.
- Use one necessary exam term. Define it immediately through a simple action or meaning.
- Prefer active voice and concrete subjects: "Blood carries..." rather than "The transportation of... is performed..."
- Avoid idioms, phrasal ambiguity, metaphors, and cultural references.
- Avoid unnecessary synonyms. The learner should not need to learn a second difficult word to understand the first.
- Split long logic into two short sentences.
- Use consistent terminology across the full bank.
- Read the English aloud during review. It should sound natural and remain easy to follow.

### Chinese rules

- Translate the teaching idea fully and naturally; do not merely insert an English answer into a stock Chinese shell.
- Preserve the necessary English exam term beside its established Chinese meaning when that supports vocabulary learning.
- Do not preserve awkward English sentence order in Chinese.
- Use the glossary consistently, but allow a reviewer to improve a literal glossary substitution when context requires it.
- The Chinese line must be understandable without reading the English line.
- Do not add claims in Chinese that are absent from the reviewed English meaning.

## `Lock this` standard

`Lock this` is a compact recall anchor after the explanation. It is not a second explanation and it is not required to say "Not X".

Choose the smallest form that genuinely helps:

- `monomer = liquid; polymer = powder`
- `ulna = little-finger side; radius = thumb side`
- `clean first -> disinfect second`
- `pedicure = natural toenail and foot care; enhancement = product added to the nail`
- `90 degrees = shorten; 30 degrees = shape`

Reject a lock point if it:

- mechanically compares the answer with the first distractor
- restates an entire sentence-length choice as an equation
- names an unrelated trap
- repeats the `Why` without making recall easier
- becomes longer or harder than the explanation
- contains double punctuation or pasted source grammar errors

When no useful lock point exists, author a short category, action, location, or sequence anchor. If no honest and useful anchor can be written, flag the question for content review rather than inventing one.

## Approved examples

### Example A: natural nail service

Question: Which of these is considered a natural nail service?

Answer: pedicure

Why:

> A pedicure cares for the natural toenails and the skin of the feet. The other choices add artificial enhancement products to the nail.

Chinese:

> pedicure（足部美甲护理）护理天然脚趾甲和足部皮肤。其他选项都是在指甲上添加人工增强材料。

Lock this:

> pedicure = natural toenail and foot care; nail enhancement = artificial product added to the nail.

### Example B: blood and skin

Question: Blood supplies ___ to the skin.

Answer: nutrients and oxygen

Why:

> Skin cells need oxygen and nutrients to stay alive and repair damage. Blood carries both of them to the skin.

Chinese:

> 皮肤细胞需要 oxygen（氧气）和 nutrients（营养物质）来生存和修复损伤。血液把这两样带到皮肤。

Lock this:

> blood carries oxygen + nutrients to skin cells.

These examples are patterns, not templates. Do not reproduce their sentence structure across unrelated questions.

## Source-supported authoring workflow

Work in topical batches so the agent can use the relevant textbook context instead of producing isolated guesses.

Suggested batch order:

1. Infection control and safety
2. Nail structure, growth, disorders, and diseases
3. Skin structure and conditions
4. Manicure and pedicure procedures
5. Product chemistry: monomer/polymer, resin, gel, primer, adhesion
6. Electric filing, tips, forms, wraps, maintenance, and removal
7. Anatomy, muscles, bones, nerves, and massage
8. Salon business, consultation, professional conduct, and remaining topics

For each question:

1. Read the full question, all choices, source key, warnings, and provenance.
2. Find the relevant textbook section or a documented glossary/reviewer authority.
3. Decide whether the keyed answer is educationally safe and uniquely correct.
4. If disputed, vague, unsafe, or unrecoverable, quarantine it. Do not author around the problem.
5. Identify the smallest useful fact or relationship the learner needs.
6. Draft the English `Why` without looking at the old teaching copy.
7. Apply the non-restatement test.
8. Draft a genuinely useful `Lock this` independently; do not select a trap by array position.
9. Translate both ideas into natural Simplified Chinese using the glossary.
10. Record precise authority references, preferably textbook printed page/section plus PDF page when practical.
11. Run automated lint, then route the batch to factual, ESL, Chinese, and final teaching review.

## Data and authoring architecture

### Separate authored content from extraction

Do not keep hundreds of manually authored explanations inside parser conditionals.

Create a committed authored-content file keyed by stable question ID, for example:

`question-bank/practice/teaching-copy.json`

Each entry should contain:

```json
{
  "id": "practice-comprehensive-042",
  "explanation": {
    "en": "...",
    "zh": "..."
  },
  "lockPoint": {
    "en": "...",
    "zh": "..."
  },
  "teachingRelation": "category",
  "authorityRefs": [
    {
      "source": "Milady Standard Nail Technology 8th Edition",
      "section": "Pedicuring",
      "printedPage": "191",
      "pdfPage": 215
    }
  ],
  "author": "...",
  "authoredAt": "..."
}
```

The build script may merge reviewed authored content into `questions.json`, but it must not invent generic teaching copy when an entry is missing. Missing content should keep the item out of the release pool.

### Review ledger

Keep separate decisions for separate jobs:

- `transcriptionStatus`: source text and key were extracted correctly
- `answerReviewStatus`: the answer is factually safe and uniquely defensible
- `teachingCopyStatus`: the explanation and lock point are accurate and useful
- `englishReviewStatus`: ESL clarity passed
- `chineseReviewStatus`: Chinese accuracy and naturalness passed
- `disputeStatus`: none, quarantined, or explicitly resolved

Add or require:

- named `answerReviewer`
- named `teachingReviewer`
- named `chineseReviewer`
- `reviewedAt` per review role
- precise `authorityRefs`
- `contentHash` tied to the exact released question and teaching copy
- optional `reviewNotes`

An author may not fill the reviewer fields for the same revision. Scripts may calculate hashes and report statuses, but may not create human/agent review passes.

If an AI agent performs a review role, record the agent/run identity and require it to review the completed card independently from the authoring pass. Do not label a generation step as review.

### Dispute resolution

`approved-override` must never be derived automatically from `sourceWarning`.

A disputed item can return to the approved pool only when a named reviewer records one of these explicit outcomes:

- `source-key-confirmed`: evidence supports the original key
- `learner-answer-corrected`: product owner explicitly approves shipping a corrected educational answer while retaining the raw source key in staging
- `omitted`: the item is not safe or useful enough to ship

Every resolution must include a specific explanation and authority reference. A note that says the source is false or unsafe cannot coexist with a pass that teaches the same source answer.

## Automated quality gates

Automation cannot prove teaching quality, but it can reject known failure patterns.

Update `validate-release.js` and add focused tests to fail when:

- `explanation.en` contains `The exam answer is`, `Keep this wording`, `remember this wording`, or equivalent stock phrases
- `explanation.zh` contains the equivalent stock shell, such as `这道题的考试答案是...请记住这个说法`
- a `Why` is identical or nearly identical to the question plus answer after normalization
- a `Why` only repeats the correct choice without a supported relation
- a lock point is generated from choice order or blindly names choice A/first incorrect choice
- a sentence-length choice is pasted into `[answer] = [translation]. Not [choice]`
- English exceeds 35 words or lock point exceeds 20 words without a documented exception
- double punctuation appears (`..`, `。。`, `?.`, and similar generation artifacts)
- reviewer identities are missing, generic builder names, or equal to the author for the same revision
- a generated process attempts to write `pass` or `approved-override`
- an item has a source warning but lacks a complete explicit resolution
- authority references are generic claims such as "Original Word answer; glossary and textbook" without a usable section, page, rule, or reviewer note
- English and Chinese omit the required exam term when it is a vocabulary-bearing question

Add a teaching-copy audit report containing:

- total authored, reviewed, approved, quarantined, and omitted
- counts by teaching relation
- restatement-similarity flags
- banned-phrase hits
- length violations
- repeated explanation openings and duplicate sentence patterns
- untranslated-English concentration in Chinese
- missing or weak authority references
- author/reviewer separation failures

Heuristics should produce review flags in staging. They must not automatically approve content.

## Human/independent review rubric

Each card must receive an explicit pass for all questions below:

### Answer review

- Is the keyed answer factually correct?
- Is it the only defensible answer as written?
- Does the source warning, if any, have an explicit resolution?
- Would teaching this answer create a safety or licensing risk?

### Why review

- Does it add useful knowledge beyond the stem?
- Does it directly explain why the answer is correct?
- Is the added claim supported?
- Is it simple enough for an ESL learner?
- Does it avoid unnecessary technical vocabulary?

### Lock-point review

- Is this a real and useful memory distinction?
- Is it shorter and simpler than the `Why`?
- Was the comparison chosen for meaning rather than choice position?

### Chinese review

- Does the Chinese teach the complete same idea?
- Is it natural and understandable on its own?
- Are glossary terms consistent and contextually correct?
- Does it avoid unnecessary untranslated English?

Any `no` means the card does not ship.

## Review sampling and calibration

Before full-bank authoring:

1. Select a 24-question calibration set spanning all major topics and question types, including short definitions, procedures, safety, anatomy, chemistry, negative stems, and long scenario questions.
2. Include at least six previously disputed records and several examples where restating the stem would be tempting.
3. Author and review the set using the complete workflow.
4. Render it in the review HTML and the real phone reel.
5. Obtain Shawn's approval of the educational voice and depth before scaling to all questions.
6. Freeze the approved rubric and use the calibration set as regression fixtures.

During full authoring, work in batches of no more than 25-40 cards. Review and validate each batch before beginning the next. Do not generate all 473 cards and review them in one pass.

## UI verification

Content changes can create layout regressions even without UI code changes.

For the calibration set and final pool, verify:

- 320x568, 375x667, and 390x844 viewports
- longest English and Chinese `Why` and `Lock this`
- TTS reads the English teaching copy cleanly
- Chinese punctuation and mixed English terms wrap naturally
- collapsed choices leave enough space for teaching copy
- Next remains reachable without overlapping content
- missed-question review repeats the exact reviewed teaching copy

Do not call UI validation complete from static data checks alone.

## Implementation sequence

### Phase 1: contain and invalidate

- Remove automatic fallback authoring and automatic review passes.
- Return generated overrides to quarantine.
- Mark current teaching copy unreviewed.
- Add banned-template release failures.
- Decide whether to hide the quiz temporarily or ship only a reviewed subset.

### Phase 2: restructure content and review data

- Add `teaching-copy.json` or an equivalent ID-keyed authoring source.
- Extend ledger fields for independent factual, ESL, teaching, and Chinese review.
- Make build output deterministic and fail closed when reviewed authored content is missing.
- Generate a review HTML view that shows source, correct answer, authority, warnings, old copy for comparison, new copy, and review status.

### Phase 3: calibration

- Build the 24-question representative set.
- Review it independently.
- Validate against the textbook and glossary.
- Test it in the real mobile reel.
- Get product-owner approval before scaling.

### Phase 4: full reauthoring

- Work topic by topic in small batches.
- Quarantine questionable items immediately.
- Run automated lint and independent reviews on every batch.
- Merge only fully reviewed records into the approved pool.

### Phase 5: final validation

- Run source verification for the Word-derived fields.
- Run source audit, teaching-copy audit, release validation, tests, lint, typecheck, and production build.
- Render and inspect review HTML.
- Test representative and worst-case cards in the browser at all required phone sizes.
- Confirm 10- and 30-question sessions draw only fully approved IDs with no duplicates.
- Report the final approved, quarantined, and omitted counts honestly.

## Required commands

Keep the exact script names aligned with `package.json`, but the completed implementation must provide commands equivalent to:

```bash
npm run verify:sources
npm run validate:source-audit
npm run audit:teaching-copy
npm run validate:release
npm test
npm run lint
npm run typecheck
npm run build
```

Source verification remains local and must not be required on Vercel. Release validation must work from committed release artifacts without opening the Word or PDF sources.

## Acceptance criteria

The remediation is complete only when all of the following are true:

- Zero shipped explanations contain the old answer-restatement template or equivalent wording.
- Zero shipped lock points are selected mechanically from the first wrong choice.
- Every shipped `Why` passes the non-restatement test and adds a supported teaching relationship.
- Every shipped English line passes the ESL rubric.
- Every shipped Chinese line is complete, natural, and independently understandable.
- Every shipped answer has a traceable factual review and usable authority reference.
- Every shipped teaching copy has an independent review distinct from its authoring pass.
- No builder or generator identity appears as the reviewer of its own generated content.
- No automatic `approved-override` path remains.
- Every unresolved disputed, unsafe, vague, or unrecoverable item is excluded from `practice/questions.json`.
- All content hashes match the exact reviewed release records.
- Teaching-copy audit, source audit, release validation, tests, lint, typecheck, and build pass.
- Review HTML and real mobile reel have been visually checked at the required viewport sizes.
- Shawn has approved the calibration set and the final educational voice.
- Final reporting distinguishes authored, reviewed, approved, quarantined, and omitted; it does not call generated content reviewed.

## Deliverables

- Revised `build_practice_bank.py` with no generic teaching fallback, automatic pass, or automatic override
- ID-keyed authored teaching-copy source
- Corrected practice staging and approved release JSON
- Corrected review ledger with independent reviewer roles
- Reworked bilingual `Why` and `Lock this` for every approved item
- Quarantine/resolution records for all disputed items
- Strengthened release validator and teaching-copy audit
- Focused validator and regression tests
- Updated review HTML
- Calibration review report
- Final remediation report with exact counts and validation evidence

## Final principle

The learner should not have to learn how to decode the explanation. The explanation should do that work for them.

Every `Why` must give one small, clear reason that makes the answer easier to understand or recover later. If the available source material does not support such a reason, the correct action is review, quarantine, or omission—not filler.
