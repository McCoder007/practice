#!/usr/bin/env python3
"""Shared helpers for the practice question-bank pipeline."""

from __future__ import annotations

import hashlib
import json
import re
import unicodedata
import zipfile
import xml.etree.ElementTree as ET
from pathlib import Path

NS = {"w": "http://schemas.openxmlformats.org/wordprocessingml/2006/main"}

SCRIPT_VERSION = "1.0.0"
SOURCE_TITLE = "Practice pool from local Word sources"

BOOK_NAIL_TEST = "NAIL TEST (EN)"
BOOK_THEORY_UPDATE = "NEW UPDATE NAILS THEORY"
BOOK_COMPREHENSIVE = "Theory Nail-Milady Comprehensive - English"

ROOT = Path(__file__).resolve().parent.parent
TEMP = ROOT / "Temp"
PRACTICE = ROOT / "practice"
SOURCES = ROOT / "sources"
REPORTS = ROOT / "reports"
REVIEW = ROOT / "review"
GLOSSARY_PATH = ROOT / "glossary" / "nail-technology-en-zh.json"
SCHEMA_PATH = ROOT / "schema" / "question-bank.schema.json"
ARCHIVE_BANK = ROOT / "archive" / "milady-exam-review-8th"

SOURCE_FILES = {
    BOOK_NAIL_TEST: TEMP / "NAIL TEST (EN) .docx",
    BOOK_THEORY_UPDATE: TEMP / "NEW UPDATE NAILS THEORY.docx",
    BOOK_COMPREHENSIVE: TEMP / "Theory Nail-Milady Comprehensive - English.docx",
}

# Cyrillic / lookalike Latin used in the comprehensive answer key.
KEY_LETTER_MAP = {
    "A": "A",
    "B": "B",
    "C": "C",
    "D": "D",
    "a": "A",
    "b": "B",
    "c": "C",
    "d": "D",
    "\u0410": "A",  # Cyrillic А
    "\u0430": "A",
    "\u0412": "B",  # Cyrillic В
    "\u0432": "B",
    "\u0421": "C",  # Cyrillic С
    "\u0441": "C",
}


def sha256_file(path: Path) -> str:
    digest = hashlib.sha256()
    with path.open("rb") as handle:
        for chunk in iter(lambda: handle.read(1024 * 1024), b""):
            digest.update(chunk)
    return digest.hexdigest()


def sha256_text(value: str) -> str:
    return hashlib.sha256(value.encode("utf-8")).hexdigest()


def nfc(value: str) -> str:
    return unicodedata.normalize("NFC", value)


def nfc_obj(value):
    if isinstance(value, str):
        return nfc(value)
    if isinstance(value, list):
        return [nfc_obj(item) for item in value]
    if isinstance(value, dict):
        return {key: nfc_obj(item) for key, item in value.items()}
    return value


def canonical_dumps(value) -> str:
    return json.dumps(nfc_obj(value), ensure_ascii=False, sort_keys=True, separators=(",", ":"))


def content_hash(record: dict) -> str:
    payload = {
        "id": record["id"],
        "status": record["status"],
        "question": record["question"],
        "choices": [{"id": choice["id"], "en": choice["en"], "zh": choice["zh"]} for choice in record["choices"]],
        "correctChoice": record["correctChoice"],
        "explanation": record.get("explanation") or {"en": "", "zh": ""},
        "lockPoint": record.get("lockPoint") or {"en": "", "zh": ""},
        "sources": record.get("sources") or [],
        "choicesOrigin": record.get("choicesOrigin") or "",
        "sourceWarning": record.get("sourceWarning") or "",
    }
    return hashlib.sha256(canonical_dumps(payload).encode("utf-8")).hexdigest()


def normalize_identity(value: str) -> str:
    text = unicodedata.normalize("NFKC", value).lower()
    text = text.replace("&", "and")
    text = re.sub(r"[_\W]+", " ", text, flags=re.UNICODE)
    return " ".join(text.split())


def normalize_key_letter(raw: str) -> tuple[str | None, bool]:
    if not raw:
        return None, False
    char = raw.strip()[:1]
    mapped = KEY_LETTER_MAP.get(char)
    if mapped is None:
        return None, False
    return mapped, char != mapped and char not in {"A", "B", "C", "D", "a", "b", "c", "d"}


def para_text(paragraph: ET.Element) -> str:
    parts: list[str] = []
    for node in paragraph.iter():
        tag = node.tag
        if tag == f"{{{NS['w']}}}tab":
            parts.append(" ")
        elif tag == f"{{{NS['w']}}}t":
            parts.append(node.text or "")
    return "".join(parts)


def extract_docx_paragraphs(path: Path) -> list[str]:
    with zipfile.ZipFile(path) as archive:
        xml = archive.read("word/document.xml")
    root = ET.fromstring(xml)
    paragraphs: list[str] = []
    for paragraph in root.findall(".//w:p", NS):
        text = re.sub(r"\s+", " ", para_text(paragraph)).strip()
        if text:
            paragraphs.append(text)
    return paragraphs


def collapse_ws(value: str) -> str:
    return re.sub(r"\s+", " ", value).strip()


def strip_trailing_choice_label(value: str) -> str:
    return re.sub(r"\s+[a-dA-D]\.?\s*$", "", value).strip()


def choice_id(index: int) -> str:
    return chr(ord("a") + index)
