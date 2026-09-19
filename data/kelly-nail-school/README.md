# Kelly Nail School question bank source work

Extracted from salon PC screenshots of **ĐỀ THI: ( NAILS (EN) 2026 )** in `Temp/IMG_4345.JPG`–`IMG_4506.JPG`.

## Status

The 89-question bilingual release is wired into Nail Exam Practice as **Kelly Nail School**, with Multiple Choice and Study Cards. This folder retains the source extraction and photo audit; the learner-facing release lives in `question-bank/kelly-nail-school/`.

## Files

| Path | Purpose |
|------|---------|
| `source-work/extracted.md` | Human-readable Q/A (primary deliverable this phase) |
| `source-work/extracted.jsonl` | Same data, machine-readable |
| `source-work/duplicates.md` | Extra photos + shuffle notes |
| `source-work/answer_gaps.md` | Items still needing human review |
| `source-work/verification.md` | Vision spot-check log |
| `source-work/ocr_raw/` | Per-photo Vision OCR dumps |
| `source-work/parse_ocr.py` | OCR → stem clusters |
| `source-work/finalize_bank.py` | Fixes + domain keys |

## How extraction worked

1. Local Vision OCR on oriented/cropped monitor photos (not 160× model vision).
2. Parse stem / A–D / scores / wrong-answer banner.
3. Merge by stem (exam shuffles session Q numbers between two passes).
4. Keys from on-screen selection, wrong-banner elimination, score sequence, or labeled domain knowledge when the photo was taken before answering.

## Release workflow

From `vocabulary-next/`:

```sh
npm run assemble:kelly-nail-school
npm run validate:kelly-nail-school
```

The assembly step preserves the source extraction, applies only the documented corrections in `question-bank/kelly-nail-school/answer-review.json`, and combines it with the checked-in Simplified Chinese translations.
