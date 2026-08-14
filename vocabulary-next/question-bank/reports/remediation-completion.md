# Practice question-bank teaching-copy remediation

Completed: 2026-08-13

## Final inventory

The full 475-record staging pool is accounted for:

- 348 records have source-supported bilingual teaching copy and remain `not-reviewed`.
- 125 disputed, unsafe, vague, or unsupported records are quarantined.
- 2 records are intentionally omitted.
- 0 records remain unauthored.
- 0 authored records have automated teaching-copy audit flags.
- 0 records are independently reviewed or approved.

The release pool therefore contains 0 questions and remains on `remediation-hold`. Authorship is not recorded as review, and no card will ship until separate answer, teaching, English, and Chinese reviewers pass the exact revision.

## Authoring batches

- Calibration: 18 authored
- Infection control and safety 01: 31 authored
- Nail structure and disorders 01: 28 authored
- Skin structure and conditions 01: 19 authored
- Manicure and pedicure 01: 19 authored
- Product chemistry 01: 28 authored
- Enhancements 01: 30 authored
- Enhancements 02: 29 authored
- Anatomy and massage 01: 37 authored
- Infection control and safety 02: 39 authored
- Remaining technical 01: 29 authored
- Professional and business 01: 41 authored

## Validation evidence

- Source transcription: 486 of 486 extracted records passed; 0 failed.
- Source audit: 475 staging records matched 475 review-ledger rows.
- Teaching-copy audit: 348 authored, 0 reviewed, 0 approved, 125 quarantined, 2 omitted, 0 flagged authored records.
- Release validation: passed with 0 shipped questions on `remediation-hold`.
- Automated tests: 22 passed, 0 failed.
- TypeScript: passed.
- ESLint: 0 errors; 11 existing React Hook warnings outside this remediation remain.
- Production build: passed.

## Responsive inspection

The generated professional/business review page and the real `/exam-quiz` hold screen were inspected at 320x568, 375x667, and 390x844.

- No horizontal page overflow occurred at any viewport.
- The 320-pixel review layout contained all 47 batch records within 280-pixel cards.
- No paragraph, list item, or heading in the inspected review page overflowed its content box.
- English and Chinese `Why` and `Lock this` content wrapped naturally.
- The hold notice and both 10- and 30-question mode summaries remained visible at all three sizes.

The live question reel cannot truthfully be tested with these authored cards yet because the release gate correctly excludes all cards until independent review. Session uniqueness and reveal behavior are covered by the passing automated tests; live reel validation must be repeated after reviewed cards enter the release pool.

## Next release step

Use the generated review index and batch pages for independent answer, teaching-value, ESL-English, and Simplified-Chinese review. Reviewer identities must differ from the author for the same content hash. Rebuild only after those passes are recorded; the existing release validator will continue to fail closed.
