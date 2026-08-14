# Practice teaching-copy calibration

Status: awaiting Shawn's product-owner review

This calibration set contains 24 source cards: 18 with newly authored bilingual teaching copy and 6 previously disputed cards that demonstrate quarantine behavior. Authored content is not labeled reviewed and is not in the release pool.

## Coverage

- Infection control and terminology
- Nail structure, growth, disorders, and diseases
- Skin protection
- Natural nail services
- Product chemistry and adhesion
- Electric filing and dust safety
- Anatomy and massage
- Consultation and a long procedure scenario
- Six disputed safety, chemistry, infection-control, and source-key records

## Product-owner questions

1. Is the English voice simple enough without becoming childish?
2. Does each `Why` add a useful reason, action, function, location, or contrast?
3. Are the lock points short and genuinely useful?
4. Does the Chinese teach the same complete idea naturally?
5. Should this voice and depth be frozen as the rubric for the remaining topic batches?

## Gate

Do not scale authoring beyond this set and do not add review passes until Shawn approves the educational voice. After approval, independent review identities and dates must be recorded in `reports/review-decisions.json`; the authoring pass cannot review itself.

## Current evidence

- Calibration: 24 cards total; 18 authored teaching cards and 6 quarantine examples.
- Current pool: 430 unreviewed staging cards, 43 quarantined cards, 2 omitted cards, and 0 approved cards.
- Release state: `remediation-hold`; the quiz displays a bilingual unavailable message and cannot start a session.
- Teaching-copy audit: 18 authored, 0 reviewed, 0 approved, 0 authored-content heuristic flags.
- Source verification: 486 extracted source records checked with 0 mismatches.
- Automated checks: release validation, source audit, 19 tests, lint, typecheck, and production build pass. Lint and build retain 11 unrelated pre-existing React Hook warnings.
- Responsive review: the hold screen and longest calibration scenario were checked at 320x568, 375x667, and 390x844 with no horizontal overflow. A 320px navigation/title overlap found during review was corrected.
- The authored calibration cards have not been exercised as approved quiz content because doing so would misrepresent unreviewed work. Real-reel teaching-card interaction and TTS remain required after the calibration voice is approved and independently reviewed.
