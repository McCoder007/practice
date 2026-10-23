#!/usr/bin/env python3
"""Local-only check: every NIC Domain Practice quote must appear on the cited
textbook page, and every printedPage must match that page's printed label.

The textbook is copyrighted and not in git. Make the page dump first:

  swift question-bank/scripts/dump-pdf-pages.swift \
    "question-bank/Temp/Milady Standard Nail Technology 8th Edition.pdf" <out-dir>

then run:

  python3 -B question-bank/scripts/verify-nic-domain-evidence.py <out-dir>/pages.jsonl [set ids...]

A ready dump lives at question-bank/Temp/milady-8th-pages/ in the main checkout.
"""

import json
import re
import sys
from pathlib import Path

SETS_DIR = Path(__file__).resolve().parent.parent / "nic-domain-practice" / "sets"


def squash(text: str) -> str:
    # Ignore spacing, punctuation, soft hyphens, and line-break hyphenation.
    return re.sub(r"[^a-z0-9]", "", text.lower())


def main() -> int:
    if len(sys.argv) < 2:
        print(__doc__)
        return 2
    only = sys.argv[2:]  # optional set ids, e.g. 1B 1C
    pages = {}
    for line in Path(sys.argv[1]).read_text(encoding="utf-8").splitlines():
        record = json.loads(line)
        pages[record["pdfPage"]] = record
    errors = []
    checked = 0
    for set_file in sorted(SETS_DIR.glob("*.json")):
        if only and not any(set_file.name.startswith(f"{s}-") for s in only):
            continue
        data = json.loads(set_file.read_text(encoding="utf-8"))
        for q in data["questions"]:
            for ev in q.get("evidence", []):
                page = pages.get(ev["pdfPage"])
                if page is None:
                    errors.append(f"{q['id']}: pdf page {ev['pdfPage']} not in dump")
                    continue
                # Allow a quote to run onto the next page.
                nxt = pages.get(ev["pdfPage"] + 1, {"text": ""})
                if squash(ev["quote"]) not in squash(page["text"] + nxt["text"]):
                    errors.append(f"{q['id']}: quote not found on pdf page {ev['pdfPage']}: {ev['quote'][:60]}...")
                checked += 1
            for ref in q.get("authorityRefs", []):
                page = pages.get(ref["pdfPage"])
                if page and str(ref.get("printedPage")) != page["label"]:
                    errors.append(f"{q['id']}: printedPage {ref.get('printedPage')} != book label {page['label']} (pdf {ref['pdfPage']})")
    for e in errors:
        print(f"error: {e}")
    print(f"Checked {checked} quotes: {len(errors)} problem(s).")
    return 1 if errors else 0


if __name__ == "__main__":
    sys.exit(main())
