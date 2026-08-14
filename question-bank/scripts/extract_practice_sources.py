#!/usr/bin/env python3
"""Extract English-only staging records from the three local Word files."""

from __future__ import annotations

import re
from pathlib import Path

from practice_lib import (
    BOOK_COMPREHENSIVE,
    BOOK_NAIL_TEST,
    BOOK_THEORY_UPDATE,
    SOURCE_FILES,
    collapse_ws,
    extract_docx_paragraphs,
    normalize_key_letter,
    strip_trailing_choice_label,
)

QUESTION_START = re.compile(r"^(\d+)\.(.*)$")
LABELED_CHOICE = re.compile(r"^([a-dA-D])\.\s*(.*)$")
KEY_PAIR = re.compile(
    r"(\d+)\s*\.\s*([A-Da-d\u0410\u0430\u0412\u0432\u0421\u0441])",
)
THEORY_ITEM = re.compile(
    r"^(\d+)\.\s*(.+?)A\.\s*(.+?)B\.\s*(.+?)C\.\s*(.+?)D\.\s*(.+?)Answer:\s*([A-Da-d])\s*$",
    re.DOTALL,
)
NUMBERED_START = re.compile(r"^(\d+)([.:])?\s+(.*)$")


def split_open_ended(text: str) -> tuple[str, str] | None:
    stripped = collapse_ws(text)
    if "?" in stripped:
        stem, answer = stripped.rsplit("?", 1)
        stem = collapse_ws(stem + "?")
        answer = collapse_ws(answer.lstrip(":-–— "))
        if not answer:
            return stem, ""
        return stem, answer
    for separator in (" – ", " — ", " - ", ": "):
        if separator in stripped:
            stem, answer = stripped.rsplit(separator, 1)
            stem = collapse_ws(stem)
            answer = collapse_ws(answer.lstrip("-–— "))
            if stem and answer:
                return stem, answer
    return None


def extract_nail_test(paragraphs: list[str]) -> list[dict]:
    records: list[dict] = []
    open_ended: list[str] = []
    numbered: list[str] = []
    in_numbered = False
    for paragraph in paragraphs:
        numbered_match = NUMBERED_START.match(paragraph)
        looks_numbered = False
        number = None
        if numbered_match:
            number = int(numbered_match.group(1))
            # Open-ended items never start with a small integer label.
            # Numbered fill-ins are 1–60 at the end of the file.
            if in_numbered or (number <= 60 and (numbered_match.group(2) in {".", ":"} or number <= 2)):
                looks_numbered = True
        if looks_numbered and number is not None and (in_numbered or number <= 2 or (open_ended and number == 3)):
            in_numbered = True
            numbered.append(paragraph)
        elif in_numbered:
            numbered.append(paragraph)
        else:
            open_ended.append(paragraph)

    q_index = 0
    for paragraph in open_ended:
        q_index += 1
        item_ref = f"q{q_index:03d}"
        record_id = f"practice-nail-test-{item_ref}"
        split = split_open_ended(paragraph)
        if split is None:
            records.append(omitted_open(record_id, BOOK_NAIL_TEST, item_ref, paragraph, "unrecoverable: could not split stem and answer"))
            continue
        stem, answer = split
        if not answer:
            records.append(omitted_open(record_id, BOOK_NAIL_TEST, item_ref, stem, "unrecoverable: missing answer"))
            continue
        records.append(open_record(record_id, BOOK_NAIL_TEST, item_ref, stem, answer, paragraph))

    seen_numbers: set[int] = set()
    for paragraph in numbered:
        match = NUMBERED_START.match(paragraph)
        if not match:
            continue
        number = int(match.group(1))
        rest = collapse_ws(match.group(3))
        item_ref = f"n{number:03d}"
        record_id = f"practice-nail-test-{item_ref}"
        if number in seen_numbers:
            continue
        seen_numbers.add(number)
        split = split_open_ended(rest) or split_open_ended(paragraph)
        if split is None or not split[1]:
            # Statements with no distinct answer are unrecoverable.
            records.append(omitted_open(record_id, BOOK_NAIL_TEST, item_ref, rest or paragraph, "unrecoverable: numbered item has no distinct answer"))
            continue
        stem, answer = split
        records.append(open_record(record_id, BOOK_NAIL_TEST, item_ref, stem, answer, paragraph))
    return records


def omitted_open(record_id: str, book: str, item_ref: str, stem: str, reason: str) -> dict:
    return {
        "id": record_id,
        "kind": "open-ended",
        "status": "omitted",
        "omitReason": reason,
        "book": book,
        "itemRef": item_ref,
        "questionEn": collapse_ws(stem),
        "answerEn": "",
        "rawParagraph": stem,
        "choices": [],
        "rawKey": "",
        "normalizedKey": "",
        "keyedChoiceText": "",
        "choicesOrigin": "authored-distractors",
    }


def open_record(record_id: str, book: str, item_ref: str, stem: str, answer: str, raw: str) -> dict:
    return {
        "id": record_id,
        "kind": "open-ended",
        "status": "staging",
        "book": book,
        "itemRef": item_ref,
        "questionEn": collapse_ws(stem),
        "answerEn": collapse_ws(answer),
        "rawParagraph": raw,
        "choices": [],
        "rawKey": "",
        "normalizedKey": "",
        "keyedChoiceText": collapse_ws(answer),
        "choicesOrigin": "authored-distractors",
    }


def extract_theory_update(paragraphs: list[str]) -> list[dict]:
    records: list[dict] = []
    for paragraph in paragraphs:
        match = THEORY_ITEM.match(collapse_ws(paragraph))
        if not match:
            continue
        number = int(match.group(1))
        stem = collapse_ws(match.group(2))
        choices = [collapse_ws(match.group(i)) for i in range(3, 7)]
        raw_key = match.group(7)
        normalized, warning = normalize_key_letter(raw_key)
        item_ref = f"{number:03d}"
        record_id = f"practice-theory-update-{item_ref}"
        if normalized is None:
            records.append({
                "id": record_id,
                "kind": "source-mcq",
                "status": "omitted",
                "omitReason": f"unrecoverable: could not normalize key {raw_key!r}",
                "book": BOOK_THEORY_UPDATE,
                "itemRef": item_ref,
                "questionEn": stem,
                "answerEn": "",
                "rawParagraph": paragraph,
                "choices": [{"id": chr(ord("a") + i), "en": text} for i, text in enumerate(choices)],
                "rawKey": raw_key,
                "normalizedKey": "",
                "keyedChoiceText": "",
                "choicesOrigin": "source",
            })
            continue
        keyed = choices[ord(normalized) - ord("A")]
        records.append({
            "id": record_id,
            "kind": "source-mcq",
            "status": "staging",
            "book": BOOK_THEORY_UPDATE,
            "itemRef": item_ref,
            "questionEn": stem,
            "answerEn": keyed,
            "rawParagraph": paragraph,
            "choices": [{"id": chr(ord("a") + i), "en": text} for i, text in enumerate(choices)],
            "rawKey": raw_key,
            "normalizedKey": normalized.lower(),
            "keyedChoiceText": keyed,
            "choicesOrigin": "source",
            "verificationWarning": "OCR key letter normalized" if warning else "",
        })
    return records


def extract_comprehensive(paragraphs: list[str]) -> list[dict]:
    body: list[str] = []
    key_paras: list[str] = []
    seen_title = 0
    for paragraph in paragraphs:
        if paragraph.strip().upper() == "COMPREHENSIVE EXAM":
            seen_title += 1
            continue
        if seen_title >= 2:
            key_paras.append(paragraph)
        elif seen_title == 1:
            body.append(paragraph)

    keys = parse_answer_key("\n".join(key_paras))
    questions = parse_comprehensive_questions(body)
    records: list[dict] = []
    for number, question in questions.items():
        item_ref = f"{number:03d}"
        record_id = f"practice-comprehensive-{item_ref}"
        raw_key = keys.get(number, "")
        normalized, warning = normalize_key_letter(raw_key) if raw_key else (None, False)
        choices = question["choices"]
        if len(choices) != 4:
            records.append({
                "id": record_id,
                "kind": "source-mcq",
                "status": "omitted",
                "omitReason": f"unrecoverable: expected 4 choices, got {len(choices)}",
                "book": BOOK_COMPREHENSIVE,
                "itemRef": item_ref,
                "questionEn": question["stem"],
                "answerEn": "",
                "rawParagraph": question["raw"],
                "choices": [{"id": chr(ord("a") + i), "en": text} for i, text in enumerate(choices)],
                "rawKey": raw_key,
                "normalizedKey": "",
                "keyedChoiceText": "",
                "choicesOrigin": "source",
            })
            continue
        if not raw_key or normalized is None:
            records.append({
                "id": record_id,
                "kind": "source-mcq",
                "status": "omitted",
                "omitReason": "unrecoverable: missing or ambiguous answer key",
                "book": BOOK_COMPREHENSIVE,
                "itemRef": item_ref,
                "questionEn": question["stem"],
                "answerEn": "",
                "rawParagraph": question["raw"],
                "choices": [{"id": chr(ord("a") + i), "en": text} for i, text in enumerate(choices)],
                "rawKey": raw_key,
                "normalizedKey": "",
                "keyedChoiceText": "",
                "choicesOrigin": "source",
            })
            continue
        keyed = choices[ord(normalized) - ord("A")]
        records.append({
            "id": record_id,
            "kind": "source-mcq",
            "status": "staging",
            "book": BOOK_COMPREHENSIVE,
            "itemRef": item_ref,
            "questionEn": question["stem"],
            "answerEn": keyed,
            "rawParagraph": question["raw"],
            "choices": [{"id": chr(ord("a") + i), "en": text} for i, text in enumerate(choices)],
            "rawKey": raw_key,
            "normalizedKey": normalized.lower(),
            "keyedChoiceText": keyed,
            "choicesOrigin": "source",
            "verificationWarning": "OCR key letter normalized" if warning else "",
        })
    return records


def parse_answer_key(blob: str) -> dict[int, str]:
    keys: dict[int, str] = {}
    for match in KEY_PAIR.finditer(blob):
        number = int(match.group(1))
        keys[number] = match.group(2)
    return keys


CONTINUATION_STARTERS = {
    "of", "the", "and", "or", "to", "in", "for", "with", "which", "that",
    "whereas", "however", "if", "as", "when", "because", "while", "than",
}


def looks_like_choice_continuation(previous: str, nxt: str) -> bool:
    if not previous:
        return True
    first = nxt.split()[0].lower() if nxt.split() else ""
    if first in CONTINUATION_STARTERS:
        return True
    if nxt[:1].islower() and len(previous) > 50:
        return True
    return False


def parse_choice_block(stem_parts: list[str], rest: list[str]) -> tuple[str, list[str]]:
    prefix: list[str] = []
    segments: list[tuple[str | None, str]] = []
    for paragraph in rest:
        labeled = LABELED_CHOICE.match(paragraph)
        if labeled:
            segments.append((labeled.group(1).lower(), labeled.group(2).strip()))
            continue
        if not segments:
            prefix.append(paragraph)
            continue
        letter, previous = segments[-1]
        if looks_like_choice_continuation(previous, paragraph):
            segments[-1] = (letter, collapse_ws(f"{previous} {paragraph}"))
        else:
            segments.append((None, paragraph))

    labeled_count = sum(1 for letter, _text in segments if letter)
    first_letter = next((letter for letter, _text in segments if letter), None)
    stem_extra: list[str] = []
    leading_choices: list[str] = []

    if labeled_count == 0:
        if len(prefix) >= 4:
            stem_extra = prefix[:-4]
            leading_choices = prefix[-4:]
        else:
            leading_choices = prefix
    elif labeled_count == 4:
        stem_extra = prefix
    elif first_letter and first_letter != "a":
        leading_choices = prefix
    else:
        for paragraph in prefix:
            if paragraph[:1].islower() and not leading_choices:
                stem_extra.append(paragraph)
            else:
                leading_choices.append(paragraph)

    choice_texts = [text for _letter, text in segments]
    choices = [
        strip_trailing_choice_label(collapse_ws(item))
        for item in [*leading_choices, *choice_texts]
        if collapse_ws(item)
    ]
    stem = collapse_ws(" ".join([*stem_parts, *stem_extra]))
    return stem, choices


def parse_comprehensive_questions(paragraphs: list[str]) -> dict[int, dict]:
    questions: dict[int, dict] = {}
    expected = 1
    current_number: int | None = None
    stem_parts: list[str] = []
    rest: list[str] = []
    raw: list[str] = []

    def flush():
        if current_number is None:
            return
        stem, choices = parse_choice_block(stem_parts, rest)
        questions[current_number] = {
            "stem": stem,
            "choices": choices,
            "raw": "\n".join(raw),
        }

    for paragraph in paragraphs:
        start = QUESTION_START.match(paragraph)
        if start and int(start.group(1)) == expected:
            flush()
            current_number = expected
            expected += 1
            stem_parts = []
            rest = []
            raw = [paragraph]
            first = collapse_ws(start.group(2))
            if first:
                stem_parts.append(first)
            continue
        if current_number is None:
            continue
        raw.append(paragraph)
        rest.append(paragraph)
    flush()
    return questions


def extract_all() -> list[dict]:
    records: list[dict] = []
    records.extend(extract_nail_test(extract_docx_paragraphs(SOURCE_FILES[BOOK_NAIL_TEST])))
    records.extend(extract_theory_update(extract_docx_paragraphs(SOURCE_FILES[BOOK_THEORY_UPDATE])))
    records.extend(extract_comprehensive(extract_docx_paragraphs(SOURCE_FILES[BOOK_COMPREHENSIVE])))
    return records


if __name__ == "__main__":
    items = extract_all()
    by_book: dict[str, list[dict]] = {}
    for item in items:
        by_book.setdefault(item["book"], []).append(item)
    for book, group in by_book.items():
        statuses = {}
        for item in group:
            statuses[item["status"]] = statuses.get(item["status"], 0) + 1
        print(f"{book}: {len(group)} {statuses}")
        omitted = [item for item in group if item["status"] == "omitted"]
        for item in omitted:
            print(f"  OMIT {item['id']} {item['omitReason']}: {item['questionEn'][:80]!r}")
    print(f"total {len(items)}")
