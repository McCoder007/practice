# Nail Anatomy Picture Vocabulary Plan

## Status

Planning only. This document sizes a Picture Vocabulary–style section for bone names, muscle names, and nail-part names drawn from the live Nail Exam Practice Q&A. It does not authorize implementation, art commissioning, or question-bank changes.

Do not push. Commit only if asked.

## Goal

Give learners a picture-first way to learn the anatomy names that the quizzes keep asking, without turning the learner (or the app owner) into an anatomy reviewer.

The finished experience should:

- Use the same interaction as Picture Vocabulary: image first, then English + Chinese, TTS, Still learning / Got it.
- Cover every **name-identification** structure the approved quizzes actually test, plus the contrast structures those questions use as wrong answers.
- Teach **Milady Standard Nail Technology 8th Edition** terminology, matching the teaching copy already shipped in the question banks.
- Ship from a small number of expert-reviewed master diagrams, not from one-off photos that each need checking.

## Why this is separate from everyday Picture Vocabulary

`/picture-vocabulary` is general English (headphones, mango, gym equipment). Nail anatomy is exam-specific. The most important example: many public anatomy diagrams call living proximal skin “cuticle.” Our quizzes already teach the opposite — **cuticle = dead tissue on the plate; eponychium / nail fold = living skin you do not cut.** Mixing this set into Everyday/Gym would hide that distinction and teach the exam wrong.

**Decision:** this is a Nail Exam Practice study format (or a clearly labeled Picture Vocabulary group owned by that section), not a new weekly set inside the existing everyday lists.

Do not copy or nest this inside the current Picture Vocabulary word data. Reuse the flashcard UI and TTS path.

## Inventory method

Source of truth: approved questions only.

- Official Practice: `question-bank/official-practice/questions.json` (100)
- Practice Banks A/B/C: `question-bank/practice/questions.json` (348)
- Combined live pool: **448** (`LEARNER_FACING_QUESTION_COUNT`)

Held items in `question-bank/practice/questions-to-review.json` were scanned so we know which anatomy keys must **not** become cards.

Counts below are unique **structures to illustrate**, not one card per quiz stem. Duplicate stems (tibia/shin asked three times, abductors three times, free edge twice, metacarpals twice, hyponychium twice) collapse to one card.

## How many cards we need

About **35 cards in three sets**. That covers the ~30 unique name-identification stems in the live pool, plus contrast bones/parts that appear as distractors.

Massage movement names (effleurage, tapotement, petrissage, friction) appear in the same quiz chapters but are techniques, not anatomy labels. Keep them out of v1.

### Set 1 — Nail unit (~12)

| Card label (primary) | Also teach on reveal | Why it is in the set |
|---|---|---|
| nail plate | nail body | Bank A asks “nail body” on the bed; teaching copy maps this to the visible plate |
| nail bed | | Supporting layer under the plate |
| free edge | | Asked twice in Bank A; Official: plate extends from matrix to free edge |
| matrix | | Growth tissue; nail root begins here |
| nail root | | Paired with matrix; do not teach “only living part” |
| lunula | | Official distractor vs free edge; worth locking visually |
| cuticle | | Dead seal on the plate (Bank C + Official) |
| eponychium | | Living skin; Official lock contrasts it with cuticle |
| hyponychium | | Skin under the free edge (Bank A, twice) |
| proximal nail fold | | Bank C contrast vs cuticle |
| lateral nail folds | sidewall | Mentions in Bank B; textbook side structures |
| specialized ligaments | | Official: attach nail bed/matrix to bone |

### Set 2 — Bones (~16)

**Arm and hand:** humerus, radius, ulna, carpals, metacarpals, phalanges

**Leg and foot:** femur, patella, tibia, fibula, tarsals, metatarsals, talus, calcaneus, sesamoid bones

Notes:

- **Radius** is not a standalone keyed answer, but Bank A’s ulna lock is `ulna = little-finger side; radius = thumb side.` It needs a card.
- **Fibula** is an Official distractor on “largest leg bone” (femur). Include it so the trap is visible.
- **Carpals** and **tarsals** are the contrast groups next to metacarpals/metatarsals.
- **Phalanges** are one card: finger **and** toe bones (Official + Bank A).
- **Tibia / shinbone** is one card with both names (three Bank A stems).
- **Patella / kneecap** is one card. Do not revive the quarantined “largest bone in the knee area” stem.

### Set 3 — Muscles (~7, optional +1 nerve)

| Card label | Action to show |
|---|---|
| abductors | fingers spread apart (three Bank A stems) |
| adductors | fingers brought together |
| flexors | fingers/wrist bend |
| extensors | forearm muscles straighten the fingers |
| pronator | palm turns inward / down |
| supinator | palm turns upward |
| extensor digitorum longus | foot up, toes extend (Official; see accuracy note below) |

Optional: **ulnar nerve** (Bank A: nerve to the little-finger side). Useful, not required for v1.

Muscle cards must show **action** (arrows or before/after), not a photo of an unlabeled forearm. Cosmetology exams use group names (abductors), not atlas names (dorsal interossei).

### Official “extensor digitorum” accuracy note

Official Practice keys `Extensor digitorum` for “moves the foot up and extends the toes.” The shipped lock point is `extensor digitorum longus = foot up, toes extend.` The picture **must** be the foot muscle with the longus name on the reveal. A hand extensor digitorum drawing would teach the wrong structure.

## Do not make cards from these

About **20** held/quarantined items mention anatomy. They stay out because the source key conflicts with Milady 8th:

- **nail mantle** — current term is proximal nail fold / matrix-area structures
- **perionychium** — textbook uses specific folds, eponychium, hyponychium
- **scarf skin** as another name for cuticle
- **nail bed** as the bacterial barrier (textbook assigns that seal at the free edge to hyponychium)
- **nail root** as the only living part (matrix is growth tissue; other tissues are also living)
- **patella** as “largest bone in the knee area” (stem too imprecise)
- metal pusher used on the **nail bed** (procedure uses the plate)

Diseases and procedures (onycholysis, psoriasis, soaking to soften cuticle) are also out of scope. Those are not “what is this structure called?” cards.

## Authority and aliases

**Authority:** Milady Standard Nail Technology 8th Edition — the same source already cited on approved explanations (`authorityRefs`). The original Word-file keys are not the picture spec.

**Aliases on reveal only** (primary label stays current):

- nail body → nail plate
- shinbone → tibia
- kneecap → patella
- sidewall → lateral nail folds

**Chinese:** reuse glossary + existing `lockPoint.zh` / `explanation.zh`. Do not invent new translations in the art pass.

Milady printed-page ranges already used in teaching copy (inspiration for what each plate must include, not a license to copy art):

- Nail anatomy: printed ~99–102 (PDF ~123–126)
- Bones of arm/hand/leg/foot: printed ~25–31 (PDF ~49–53)
- Muscles of forearm and hand: printed ~32–34 (PDF ~55–56)

## Picture sourcing (how we stay correct without reviewing every image)

### Use the book as layout inspiration, not as clip art

Milady’s figures are the right *kind* of drawing: simplified sagittal nail unit, labeled arm/hand/foot bones, muscle groups shown by action. They are copyrighted. Do not screenshot, crop, or trace them.

### Five master plates, not 35 photos

1. Nail unit, side / cross-section
2. Nail unit, top view
3. Bones of the arm and hand
4. Bones of the leg and foot
5. Muscle actions of the hand and forearm, plus one foot panel for extensor digitorum longus

Flashcards are **highlights of one label on a shared plate**. If plate 1 is anatomically right, all ~12 nail cards are right. The human review surface is five drawings, not thirty-five files.

### Who reviews what

| Person | Reviews | Does not review |
|---|---|---|
| App owner | Term sheet (names, aliases, bans) if desired | Individual flashcard crops |
| Paid nail instructor or medical illustrator | The five plates against the term sheet | App UI, TTS, progress |

The owner should not have to verify every picture. The gate is: term sheet signed, five plates signed.

### Term sheet (write this before any art)

One row per card:

- Primary English name (Milady 8th)
- Chinese (from existing teaching copy)
- Allowed aliases
- Banned labels
- One-line function from the shipped lock point
- Which master plate and region
- Quiz IDs that this card covers

The illustrator works from this sheet, not from browsing the quiz JSON.

### Allowed vs banned image sources

**Allowed**

- Newly commissioned diagrams that follow the term sheet
- For **bones only**, peer-reviewed CC BY plates such as OpenStax *Anatomy & Physiology*, with our highlight layer. Bone names agree with Milady.

**Banned**

- Copying or tracing Milady figures
- OpenStax / Wikipedia / stock “nail anatomy” for **nail parts** (they often merge cuticle and eponychium)
- Google Image search results
- AI-generated unlabeled anatomy shipped to learners
- Photos of real hands with arrows added later and hoped to be correct

AI mockups may be used only as a layout sketch for the illustrator. They must not ship.

### Asset spec (match Picture Vocabulary)

Same as `docs/picture-vocabulary-plan.md`: **640×640 WebP**, quality ~82, under `public/` with a dedicated prefix (for example `public/nail-anatomy-vocabulary/`). Highlight cards can share one base image plus a small overlay, or export one flattened WebP per term; flattening is simpler for the existing `FlashcardView`.

## Product shape

### Placement

Preferred: a study format on Nail Exam Practice (alongside Multiple Choice and Study Cards), named something like **Picture Names / 看图记名**. Alternate: a Picture Vocabulary set picker group titled for the exam, linked from the Nail Exam hub, not from the everyday vocab card.

Do not add this to the four question banks’ parity counts. It is a new study surface, not extra MCQs.

### Interaction

Reuse Picture Vocabulary:

- Picture (highlighted structure, other labels hidden or dimmed)
- Countdown or tap to reveal
- English + Chinese + speaker (`playText` / existing TTS)
- Still learning / Got it
- Progress in `localStorage` under a **new** key (do not share `pictureVocabProgress`)

Required delta: optional short lock-line under the name (`hyponychium = skin under the free edge`). Picture Vocabulary today is name-only; anatomy needs the location/action line the quizzes test.

Muscle cards: the “picture” is the action diagram with one group highlighted.

### Data shape (sketch)

Extend or parallel `PictureVocabularyWord`:

- `image`, `english`, `chinese` (same as today)
- `lock` `{ en, zh }` from teaching copy
- `aliases` for reveal
- `set` (`nail-unit` | `bones` | `muscles`)
- `plateId` (for debugging and regenerating crops)
- `coversQuestionIds` (maintainer-only; not shown to learners)

## What we will deliberately not do in v1

- One card per quiz question
- Disease photo sets
- Massage-technique photo sets
- Nerves and vessels beyond optional ulnar nerve
- Changing any approved quiz item, translation, or lock point
- Nesting inside everyday Picture Vocabulary sets
- Shipping unlabeled AI anatomy

## Build order (when implementation is approved)

1. Freeze the term sheet from this document + lock points in the JSON banks.
2. Commission or adapt the five master plates; one expert sign-off against the term sheet.
3. Export ~35 highlight WebPs.
4. Add data module, route or hub format, reuse flashcard UI + new localStorage key.
5. Verify in the browser: set picker → reveal → TTS → progress persists; confirm cuticle vs eponychium cards cannot be swapped.
6. Optional later: massage-movement set as a separate project.

## Success criteria

- About 35 cards, three sets, covering every live name-identification structure listed above.
- Primary labels match Milady 8th / shipped teaching copy; banned terms never appear.
- Cuticle and eponychium are visually distinct and match the Official lock point.
- Extensor digitorum longus is a foot action, not a hand muscle.
- Owner is not asked to approve 35 photos; sign-off is the term sheet and five plates.
- Nail Exam Practice question identity, order, and parity are unchanged.
