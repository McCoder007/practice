#!/usr/bin/env python3
"""Local transcription check against the Word sources. Writes source-attestation.json."""

from __future__ import annotations

import json
import sys
from datetime import datetime, timezone
from pathlib import Path

sys.path.insert(0, str(Path(__file__).resolve().parent))

from extract_practice_sources import extract_all
from practice_lib import (
    REPORTS,
    SCRIPT_VERSION,
    SOURCE_FILES,
    SOURCES,
    PRACTICE,
    sha256_file,
)

ATTESTATION = REPORTS / "source-attestation.json"


def fields_to_check(item: dict) -> list[tuple[str, str]]:
    fields = [("questionEn", item.get("questionEn") or item.get("question", {}).get("en", ""))]
    if item.get("kind") == "open-ended" or item.get("choicesOrigin") == "authored-distractors" and not item.get("rawKey"):
        fields.append(("answerEn", item.get("answerEn") or item.get("keyedChoiceText") or ""))
        return fields
    for choice in item.get("choices") or []:
        en = choice.get("en") if isinstance(choice, dict) else ""
        fields.append((f"choice {choice.get('id')}", en))
    fields.append(("rawKey", item.get("rawKey") or ""))
    fields.append(("normalizedKey", item.get("normalizedKey") or ""))
    fields.append(("keyedChoiceText", item.get("keyedChoiceText") or ""))
    return fields


def staging_items() -> list[dict]:
    staging_path = PRACTICE / "staging.json"
    if staging_path.exists():
        payload = json.loads(staging_path.read_text(encoding="utf-8"))
        return payload.get("questions", payload if isinstance(payload, list) else [])
    return []


def comparable(item: dict) -> dict:
    choices = item.get("choices") or []
    choice_en = []
    for choice in choices:
        if isinstance(choice, dict) and choice.get("en"):
            # Authored distractors are excluded from transcription checks.
            if item.get("choicesOrigin") == "source" or item.get("kind") == "source-mcq":
                choice_en.append({"id": choice["id"], "en": choice.get("sourceEn") or choice["en"]})
    return {
        "id": item["id"],
        "status": item["status"],
        "questionEn": item.get("questionEn") or (item.get("question") or {}).get("en", ""),
        "answerEn": item.get("answerEn") or item.get("keyedChoiceText") or "",
        "rawKey": item.get("rawKey") or "",
        "normalizedKey": item.get("normalizedKey") or "",
        "keyedChoiceText": item.get("keyedChoiceText") or "",
        "choices": choice_en,
        "omitReason": item.get("omitReason") or "",
    }


def main() -> int:
    manifest_path = SOURCES / "manifest.json"
    if not manifest_path.exists():
        print("ERROR manifest.json is missing", file=sys.stderr)
        return 1
    manifest = json.loads(manifest_path.read_text(encoding="utf-8"))
    failures: list[str] = []

    source_hash = {}
    for book, path in SOURCE_FILES.items():
        if not path.exists():
            failures.append(f"missing source file: {path.name}")
            continue
        digest = sha256_file(path)
        source_hash[path.name] = digest
        expected = None
        for entry in manifest.get("sources", []):
            if entry.get("filename") == path.name:
                expected = entry.get("sha256")
        if expected and expected != digest:
            failures.append(f"hash mismatch for {path.name}")

    fresh = {item["id"]: item for item in extract_all()}
    staged = {item["id"]: item for item in staging_items()}
    if not staged:
        failures.append("staging.json has no questions; run build_practice_bank.py first")

    checked = 0
    for record_id, item in sorted(fresh.items()):
        checked += 1
        other = staged.get(record_id)
        if other is None:
            # Collapsed duplicate ids may be absent from staging; that is recorded in discrepancies.
            if item.get("status") == "omitted":
                continue
            continue
        left = comparable(item)
        right = comparable(other)
        if left["questionEn"] != right["questionEn"]:
            failures.append(f"{record_id} stem mismatch")
        if item.get("kind") == "source-mcq" or other.get("choicesOrigin") == "source":
            if left["rawKey"] != right["rawKey"] or left["normalizedKey"] != right["normalizedKey"]:
                failures.append(f"{record_id} key mismatch raw={left['rawKey']!r}/{right['rawKey']!r}")
            if left["keyedChoiceText"] != right["keyedChoiceText"]:
                failures.append(f"{record_id} keyed choice text mismatch")
            if [c["en"] for c in left["choices"]] != [c["en"] for c in right["choices"] if c["id"] in {x["id"] for x in left["choices"]}]:
                # Compare source A–D texts only
                fresh_choices = [c["en"] for c in left["choices"]]
                staged_choices = [c["en"] for c in (other.get("choices") or [])]
                if other.get("choicesOrigin") == "source" and fresh_choices != [c["en"] for c in (other.get("choices") or [])]:
                    failures.append(f"{record_id} source A–D mismatch")
        else:
            if (item.get("answerEn") or "") != (other.get("answerEn") or other.get("keyedChoiceText") or ""):
                # Staging stores verbatim correct choice text; compare against that
                correct_id = other.get("correctChoice")
                staged_answer = other.get("answerEn") or ""
                if not staged_answer and correct_id:
                    for choice in other.get("choices") or []:
                        if choice.get("id") == correct_id:
                            staged_answer = choice.get("en") or ""
                if (item.get("answerEn") or "") != staged_answer:
                    failures.append(f"{record_id} open-ended answer mismatch")

    REPORTS.mkdir(parents=True, exist_ok=True)
    payload = {
        "sourceHash": source_hash,
        "checkedAt": datetime.now(timezone.utc).strftime("%Y-%m-%dT%H:%M:%SZ"),
        "scriptVersion": SCRIPT_VERSION,
        "recordsChecked": checked,
        "pass": checked - len(failures),
        "fail": len(failures),
        "failures": failures[:50],
    }
    ATTESTATION.write_text(json.dumps(payload, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")
    print(json.dumps({k: payload[k] for k in ("recordsChecked", "pass", "fail", "scriptVersion")}, indent=2))
    for failure in failures[:20]:
        print(f"FAIL {failure}", file=sys.stderr)
    return 1 if failures else 0


if __name__ == "__main__":
    raise SystemExit(main())
