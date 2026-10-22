# Mock exam answer-key review

Reviewed 2026-10-21. This covers the three question banks offered on the `/test` mock exam (the "Question bank" dropdown):

| Bank | File | Questions |
| --- | --- | --- |
| Milady Comprehensive Exam | `question-bank/milady-review/questions.json` (`section == "comprehensive"`) | 100 |
| Official Practice | `question-bank/official-practice/questions.json` | 100 |
| Kelly Nail School | `question-bank/kelly-nail-school/questions.json` | 89 |

No questions were changed or excluded as a result of this review. It records findings for a later fix pass. The same questions also appear in the practice section (`/nail-exam-practice/...`), so any fix applies there too.

## Method

1. **Structural check (script):** every question has four distinct choices, and every `correctChoice` matches one of them. All 289 passed.
2. **Answer provenance:** read each bank's `source` / `verification` metadata to see where the keys came from.
3. **Independent subject-matter review:** one reviewer per bank judged every keyed answer against Milady Standard Nail Technology 8th edition and NIC exam practice. The reviewers had not read the repo's existing review notes. Each answer was rated CORRECT, WRONG or QUESTIONABLE.
4. **Cross-check:** findings were compared with the repo's existing review records (`question-bank/reports/discrepancies.md`, `official-practice/phase-3-review-notes.json`, `kelly-nail-school/answer-review.json`).

The reviewers' verdicts are expert judgment, not a check against the printed textbook pages. Medium- and low-confidence items should be confirmed against the book before changing a key.

## Summary

| Bank | Clearly wrong | Questionable | Looks fine | Where the keys came from |
| --- | --- | --- | --- | --- |
| Milady Comprehensive | 1 | 9 | 90 | Printed answer key in *Exam Review for Milady Standard Nail Technology, 8th Ed.*, with page refs |
| Official Practice | 0 | 4 (+1 data error) | 95 | Trivie Learn "NIC Nail Technology Practice Exam" results; no per-question `verification` |
| Kelly Nail School | 0 | 11 | 78 | 78 of 89 keys are `answerSource: "domain-knowledge"`, inferred with no answer key |

## Milady Comprehensive

The printed answer key is the source of truth here, but the book itself contains errors. Seven of the questions below were already quarantined when the same items were reviewed for the Practice pool (`practice-comprehensive-NNN` in `reports/discrepancies.md`). The Milady bank still serves them.

### Wrong

| ID | Question | Key | Issue | Confidence |
| --- | --- | --- | --- | --- |
| `milady-review-comprehensive-075` | "Which of the following is true?" (electric file pressure) | (d) pressing down **increases** speed | Pressing the bit against the nail adds load, so the motor **slows** (choice a). That is what torque, in Q074, describes. The key is only true for a variable-speed foot pedal, which the stem never mentions. Also quarantined as `practice-comprehensive-075`. | Medium (stem is flawed either way) |

### Already quarantined in the Practice pool

| ID | Key | Practice-pool reason (summarised) |
| --- | --- | --- |
| `…-006` | "Emphasize a strong work ethic as well as good hygiene" (EXCEPT item) | The answer is unrelated to the other social-media safety steps. |
| `…-011` | "Lack of water" is the #1 cause of daytime fatigue | An unsupported universal ranking. |
| `…-034` | Report cash tips to increase Social Security benefits | U.S. tax and benefit advice with no jurisdiction or current-law context. |
| `…-050` | Eczema vs. dermatitis contrast | Eczema is a form of dermatitis, so the "difference" is not supported. |
| `…-051` | Skin allergies most likely on the "cheeks" | The textbook does not support this specific location. |
| `…-072` | Shaving within **48** hours before a pedicure | Milady advises **24** hours. |

### Questionable

| ID | Key | Issue | Confidence |
| --- | --- | --- | --- |
| `…-025` | Peroxide plus bleach "creates a potentially deadly gas" | In beauty, "bleach" usually means hair lightener, which *is* mixed with peroxide. Peroxide plus chlorine bleach mainly releases oxygen; the classic toxic gases come from bleach plus ammonia or acid. Off-scope for nails. | Medium-high |
| `…-057` | Ingrown toenail: "no services" | Too absolute. The right rule is don't treat it, and refer if it is inflamed or infected. | Low-medium |
| `…-066` | Best dust mask: "round, N-95" | P-100 filters at least as well. Shape isn't a selection criterion; fit and NIOSH approval are. | Low-medium |

Minor wording notes (keys acceptable): `…-079` (awkward stem).

## Official Practice

Keys come from Trivie Learn results. The Phase 3 review (`official-practice/phase-3-review-notes.json`) flagged 005 and 060 as conflicting with the textbook and noted "Resolve before Phase 4 approval". They were never resolved.

### Questionable

| ID | Question | Key | Issue | Confidence |
| --- | --- | --- | --- | --- |
| `official-practice-005` | "An example of a tubercle is" | (c) a cyst | Milady treats cysts and tubercles as distinct primary lesions. Milady's own example of a cyst is severe acne, so (a) is arguably as defensible. Needs rewording. | Medium |
| `official-practice-060` | Minimum hand-washing time after a pedicure | (d) 30 seconds | CDC and Milady say a minimum of **20** seconds, which isn't offered. 30 is only the least-wrong choice. | Medium |
| `official-practice-044` | Relaxation movement pressing tissue on top of the foot | (b) Petrissage | "Relaxation movement" points to effleurage, and Milady's pedicure massage has "effleurage on top of foot". The stem mixes the two definitions. | Medium |
| `official-practice-082` | Lights used to cure artificial nail products | (d) Ultraviolet | LED (c) is also defensible, because LED lamps cure gel and emit UV wavelengths. | Medium |

### Data and wording issues (keys acceptable)

- `official-practice-033`: choice (d) reads "TRUE", which looks like corrupted text.
- `official-practice-046`: the key "Tell the client about the disease" edges toward diagnosis. "Explain the concern and refer to a physician" would be safer.
- `official-practice-100`: "UV gels require primer" overstates it, since some systems don't need primer.

## Kelly Nail School

This is the highest-risk bank: 78 of 89 keys were inferred from domain knowledge, with no answer key. Two were already found wrong and corrected (`kelly-031`, `kelly-036`, see `kelly-nail-school/answer-review.json`).

### Questionable (likely problems)

| ID | Question | Key | Issue | Confidence |
| --- | --- | --- | --- | --- |
| `kelly-028` | Gel not cured long enough may cause | (b) Cracking or breaking | Undercured gel stays soft or gummy and lifts or peels, so (a) "Softer nails" fits at least as well. Cracking is more typical of a gel layer that is too thin or over-cured. | Medium (closest to wrong) |
| `kelly-020` | "The cuticle is:" | (a) Dead tissue attached to the nail plate / the thin skin around the nail | The second half describes the eponychium and folds, which are living tissue. Drop it. | Medium |
| `kelly-057` | Ingrown hair is commonly associated with | (b) Bacteria | An ingrown hair is mechanical; infection is a later complication. Possibly meant "ingrown nail". Off-topic. | Medium |
| `kelly-017` | Monomer "known for its mild odor" | (b) EMA | EMA is right, but it has a strong odor. The stem's description is wrong. | Medium |
| `kelly-077` | Hardener applied when nails are weak | (a) Before the primer or base coat | Milady says before the **base coat**. Primer is for enhancements, not hardener. | Medium |
| `kelly-022` | What should be added to a hand-soaking solution? | (b) Softening oil | Milady's soak is warm water plus liquid soap or cleanser; oil is only for an oil manicure. | Medium |

### Questionable (minor)

| ID | Issue | Confidence |
| --- | --- | --- |
| `kelly-040` | Arthritis massage: "Hand and finger muscles". "Skeletal muscles" is also technically true, and "nail/skin muscles" don't exist. | Medium |
| `kelly-002` | "Massage is usually performed after applying treatment products" is vague. The Milady order is after cuticle care and before polish. | Low |
| `kelly-027` | Calls a soaking bowl a "tool/implement", but Milady classifies a finger bowl as equipment. | Low |
| `kelly-059` | Blood-contaminated metal tools "must be sterilized". The national baseline is clean plus EPA hospital disinfectant; sterilization depends on the state. | Low |
| `kelly-068` | "Plastic beads" as an exfoliant example is outdated; microbeads have been banned in the US since 2015. | Low |

### Giveaway items (key is correct but easy to guess)

These have a keyed choice noticeably longer or more detailed than the others, or nonsense distractors:

`kelly-001`, `010`, `014`, `015`, `019`, `020`, `021`, `022`, `025`, `032`, `033`, `037`, `038`, `040`, `042`, `045`, `047`, `050`, `052`, `056`, `065`, `069`, `073`, `074`, `075`, `079`, `080`, `083` (key "Onyx / Natural nail" repeats the stem), `088`.

### Near-duplicate pairs

`kelly-003`/`089` (nail brush), `030`/`073` (polymerization), `084`/`085` (sanitation), `004`/`075` (fungus signs), `018`/`087` (monomer and polymer), `070`/`080` (nail bed), `068`/`078` (exfoliants).

## Suggested next steps

1. Re-key or reword the clear problems first: Milady 075 and the six Milady items already quarantined in the Practice pool, Official 005 and 060, and Kelly 028.
2. Confirm the medium-confidence items against the textbook pages before changing keys, and update the `zh` text alongside the `en` text.
3. Fix `official-practice-033`'s corrupted "TRUE" choice.
4. Rewrite the Kelly giveaway distractors so the bank tests knowledge instead of choice length.
