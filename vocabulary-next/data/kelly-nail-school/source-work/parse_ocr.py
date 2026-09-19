#!/usr/bin/env python3
"""Parse Kelly Nail School OCR dumps into merged Q&A text (stem-based)."""

from __future__ import annotations

import json
import re
from collections import defaultdict
from dataclasses import dataclass, field, asdict
from difflib import SequenceMatcher
from pathlib import Path

ROOT = Path(__file__).resolve().parent
OCR_DIR = ROOT / "ocr_raw"

CHROME_RE = re.compile(
    r"(?i)("
    r"đề\s*thi|de\s*thi|câu\s*hỏi|cau\s*hoi|cầu\s*hồ|cau\s*h\b|"
    r"trả\s*lời|tra\s*loi|rả\s*lời|ả\s*lời|rã\s*lời|ra\s*lời|"
    r"nail\s*trac|nails\s*theory|\.dll|start|\bhelp\b|\bfile\b|"
    r"chỉnh\s*giờ|chinh\s*gio|tạo\s*bài|tao\s*bai|hoặc|hoac|"
    r"in\s*điểm|in\s*diem|điểm\s*tổng|diem\s*tong|"
    r"chọn\s*bài|chon\s*bai|tiếp\s*theo|tiep\s*theo|tep\s*the|niếp\s*theo|"
    r"rất\s*tiếc|rat\s*tiec|không\s*phải|khong\s*phai|"
    r"xin\s*đọc|xin\s*doc|wednesday|thursday|friday|saturday|"
    r"sunday|monday|tuesday|september|bắt\s*đầu|bat\s*dau|"
    r"phút|giây|giờ|phut|giay|cua\s*97|của\s*97|của\s*0|"
    r"quizer|quiz\s*has\s*completed|cuộc\s*thi|hoàng\s*tát|hoàn\s*tất|"
    r"n\s*điểm|nđiểm|vednes|seprem|ban\s*hương|hương\s*dan|"
    r"occupatt|data\s*sheet|enviromental|tông\s*quát|tong\s*quat"
    r")"
)

WRONG_BANNER_RE = re.compile(
    r"(?i)(r[aăắ]t\s*ti[eế][tc]|kh[oô]ng\s*ph[aả]i|không\s*phải|khong\s*phai)"
)
QNUM_LABEL_RE = re.compile(r"(?i)c[aâ]u\s*h[oỏ]i\s*s[oố]")
OF97_RE = re.compile(r"(?i)c[uủũ]a\s*97")


def is_chrome(text: str) -> bool:
    t = text.strip()
    if not t:
        return True
    if CHROME_RE.search(t):
        return True
    if re.fullmatch(r"\d{1,2}:\d{2}(:\d{2})?\s*(AM|PM|AV|PN|41)?", t, re.I):
        return True
    if re.fullmatch(r"\d+", t):
        return True
    if re.fullmatch(r"00(\.00)*", t):
        return True
    if len(t) <= 2 and t.upper() in {"A", "B", "C", "D", "OK"}:
        return True
    ascii_letters = sum(c.isascii() and c.isalpha() for c in t)
    if ascii_letters < 3 and any(ord(c) > 127 for c in t):
        return True
    return False


def looks_english(text: str) -> bool:
    t = text.strip()
    if len(t) < 3:
        return False
    letters = [c for c in t if c.isalpha()]
    if not letters:
        return False
    return sum(c.isascii() for c in letters) / len(letters) >= 0.7


@dataclass
class PhotoParse:
    file: str
    img_num: int = 0
    pass_id: int = 1
    qnum: int | None = None
    stem: str | None = None
    choices: list[str] = field(default_factory=list)
    correct_count: int | None = None
    wrong_count: int | None = None
    wrong_banner: bool = False
    selected_hint: str | None = None
    selected_text: str | None = None
    parse_ok: bool = False
    notes: list[str] = field(default_factory=list)


def parse_ocr_file(path: Path) -> PhotoParse:
    text = path.read_text(encoding="utf-8", errors="replace")
    img_num = int(path.stem.split("_")[1])
    p = PhotoParse(
        file=path.stem + ".JPG",
        img_num=img_num,
        pass_id=1 if img_num < 4444 else 2,
    )

    m = re.search(r"SELECTED_HINT:\s*([A-D]|none|unknown)\b(?:.*?text=(.*))?", text)
    if m and m.group(1) in "ABCD":
        p.selected_hint = m.group(1)
        if m.group(2):
            p.selected_text = m.group(2).strip()

    p.wrong_banner = bool(WRONG_BANNER_RE.search(text))

    raw_lines: list[tuple[float, float, str]] = []
    for m in re.finditer(r"\[[0-9.]+ @ ([0-9.\-]+),([0-9.\-]+)\] (.+)$", text, re.M):
        raw_lines.append((float(m.group(1)), float(m.group(2)), m.group(3).strip()))

    for i, (x, y, t) in enumerate(raw_lines):
        if QNUM_LABEL_RE.search(t):
            for j in range(i + 1, min(i + 5, len(raw_lines))):
                x2, y2, t2 = raw_lines[j]
                if abs(y2 - y) < 0.04 and re.fullmatch(r"\d{1,2}", t2):
                    n = int(t2)
                    if 1 <= n <= 97:
                        p.qnum = n
                        break
            if p.qnum:
                break
    if p.qnum is None:
        for i, (x, y, t) in enumerate(raw_lines):
            if OF97_RE.search(t):
                for j in range(max(0, i - 3), i):
                    x2, y2, t2 = raw_lines[j]
                    if abs(y2 - y) < 0.05 and re.fullmatch(r"\d{1,2}", t2):
                        n = int(t2)
                        if 1 <= n <= 97:
                            p.qnum = n
                            break
            if p.qnum:
                break

    for i, (x, y, t) in enumerate(raw_lines):
        if "ĐÚNG" in t.upper() or (
            "DUNG" in t.upper().replace("Đ", "D") and "SAI" in t.upper()
        ):
            nums = []
            for j in range(i + 1, min(i + 8, len(raw_lines))):
                x2, y2, t2 = raw_lines[j]
                if y2 > y + 0.12:
                    break
                if x2 >= 0.55 and re.fullmatch(r"\d{1,2}", t2):
                    nums.append(int(t2))
            if not nums:
                pair = []
                for x2, y2, t2 in raw_lines:
                    if abs(y2 - y) < 0.08 and x2 >= 0.60 and re.fullmatch(r"\d{1,2}", t2):
                        pair.append((x2, int(t2)))
                nums = [n for _, n in sorted(pair)]
            if nums:
                p.correct_count = nums[0]
                if len(nums) >= 2:
                    p.wrong_count = nums[1]
            break

    if p.correct_count is None:
        candidates = [
            (x, y, int(t))
            for x, y, t in raw_lines
            if x >= 0.60 and 0.55 <= y <= 0.78 and re.fullmatch(r"\d{1,2}", t) and int(t) != 0
        ]
        candidates.sort(key=lambda c: (c[1], c[0]))
        if candidates:
            p.correct_count = candidates[0][2]
            if len(candidates) >= 2 and abs(candidates[1][1] - candidates[0][1]) < 0.05:
                p.wrong_count = candidates[1][2]

    left = [(x, y, t) for x, y, t in raw_lines if x < 0.55]
    q_y = None
    for x, y, t in left:
        if QNUM_LABEL_RE.search(t) or OF97_RE.search(t):
            q_y = y
            break

    left_content = [
        (x, y, t)
        for x, y, t in left
        if not is_chrome(t) and looks_english(t) and (q_y is None or y >= q_y - 0.02)
    ]

    stem_candidates = []
    for x, y, t in left_content:
        if len(t) < 12 and not t.endswith(("?", ":")):
            continue
        stem_candidates.append((y, t))
    stem_y = q_y or 0.35
    if stem_candidates:
        stem_candidates.sort()
        p.stem = stem_candidates[0][1]
        stem_y = stem_candidates[0][0]

    choices = []
    for x, y, t in left_content:
        if y <= stem_y + 0.025:
            continue
        if p.stem and t == p.stem:
            continue
        if is_chrome(t) or len(t) < 3:
            continue
        if choices and choices[-1][1] == t:
            continue
        choices.append((y, t))
    choices.sort()
    # Prefer English answer-like lines; drop chrome that slipped through
    cleaned = [(y, t) for y, t in choices if not is_chrome(t)]
    if len(cleaned) >= 2:
        choices = cleaned
    if len(choices) > 4:
        long = [c for c in choices if len(c[1]) >= 6]
        choices = (long if len(long) >= 4 else choices)[:4]
    p.choices = [t for _, t in choices[:4]]

    # Repair common leading clip on stem if choice context exists
    if p.stem and p.stem[0].islower():
        # keep; clustering will merge with fuller variants
        pass

    p.parse_ok = bool(p.stem and len(p.choices) >= 2)
    if not p.qnum:
        p.notes.append("missing_qnum")
    if not p.stem:
        p.notes.append("missing_stem")
    if len(p.choices) < 4:
        p.notes.append(f"choices_{len(p.choices)}")
    return p


def normalize_stem(s: str) -> str:
    s = s.strip().lower()
    # drop leading non-letters (OCR clips often leave /hich, eenish, etc.)
    s = re.sub(r"^[^a-z]+", "", s)
    # if starts with remnant of clipped word, try common repairs later
    s = re.sub(r"\s+", " ", s)
    s = re.sub(r"[^\w\s\?\-\(\)/]", "", s)
    return s.strip()


def stems_similar(a: str, b: str) -> bool:
    if not a or not b:
        return False
    if a == b:
        return True
    # one is suffix of the other (leading OCR clip)
    if len(a) >= 20 and len(b) >= 20:
        if a.endswith(b) or b.endswith(a):
            return True
        if a in b or b in a:
            return True
    ratio = SequenceMatcher(None, a, b).ratio()
    if ratio >= 0.86:
        return True
    # compare without first 1-3 chars
    for n in (1, 2, 3):
        if SequenceMatcher(None, a[n:], b).ratio() >= 0.9:
            return True
        if SequenceMatcher(None, a, b[n:]).ratio() >= 0.9:
            return True
    return False


def best_text(*candidates: str | None) -> str | None:
    opts = [c.strip() for c in candidates if c and c.strip()]
    if not opts:
        return None

    def score(t: str) -> tuple:
        lead = 1 if t[0].islower() or not t[0].isalpha() else 0
        chrome_pen = 1 if is_chrome(t) else 0
        return (-chrome_pen, -lead, len(t))

    return sorted(opts, key=score)[-1]


def cluster_by_stem(photos: list[PhotoParse]) -> list[dict]:
    skip_re = re.compile(
        r"(?i)(quizer|quiz has completed|cuộc thi|hoàn tất|tông quát|tong quat)"
    )
    items = [p for p in photos if p.stem and not skip_re.search(p.stem)]
    clusters: list[dict] = []

    for p in sorted(items, key=lambda x: x.img_num):
        ns = normalize_stem(p.stem or "")
        placed = False
        for c in clusters:
            if stems_similar(ns, c["norm"]):
                c["photos"].append(p)
                # keep longest norm as centroid
                if len(ns) > len(c["norm"]):
                    c["norm"] = ns
                placed = True
                break
        if not placed:
            clusters.append({"norm": ns, "photos": [p]})

    merged = []
    for idx, c in enumerate(sorted(clusters, key=lambda x: min(p.img_num for p in x["photos"]))):
        photos = sorted(c["photos"], key=lambda p: p.img_num)
        stem = best_text(*[p.stem for p in photos])
        choice_cols: list[list[str]] = [[], [], [], []]
        for p in photos:
            for i, ch in enumerate(p.choices[:4]):
                if not is_chrome(ch):
                    choice_cols[i].append(ch)
        choices = []
        for col in choice_cols:
            bt = best_text(*col)
            if bt:
                choices.append(bt)

        exam_nums = sorted({p.qnum for p in photos if p.qnum})
        merged.append(
            {
                "id": idx + 1,
                "stem": stem,
                "norm": c["norm"],
                "choices": choices,
                "photos": [p.file for p in photos],
                "photo_objs": photos,
                "exam_qnums": exam_nums,
                "passes": sorted({p.pass_id for p in photos}),
            }
        )
    return merged


def infer_answers(clusters: list[dict]) -> None:
    # Build per-pass chronological events
    all_photos = []
    for c in clusters:
        all_photos.extend(c["photo_objs"])
    all_photos.sort(key=lambda p: p.img_num)

    # Map file -> cluster
    file_to_cluster = {}
    for c in clusters:
        for p in c["photo_objs"]:
            file_to_cluster[p.file] = c

    for pass_id in (1, 2):
        seq = [p for p in all_photos if p.pass_id == pass_id and p.qnum]
        last = None
        last_sel: dict[int, str] = {}
        for p in seq:
            if p.selected_hint and p.qnum:
                last_sel[p.qnum] = p.selected_hint
            if last and p.qnum != last.qnum and p.correct_count is not None and last.correct_count is not None:
                d_corr = p.correct_count - last.correct_count
                d_wrong = 0
                if p.wrong_count is not None and last.wrong_count is not None:
                    d_wrong = p.wrong_count - last.wrong_count
                cl = file_to_cluster.get(last.file)
                if cl is not None:
                    letter = last_sel.get(last.qnum) or last.selected_hint
                    if d_corr == 1 and d_wrong <= 0:
                        cl.setdefault("seq_correct_votes", [])
                        if letter:
                            cl["seq_correct_votes"].append(letter)
                    elif d_wrong == 1 and d_corr <= 0:
                        cl.setdefault("seq_wrong_votes", [])
                        if letter:
                            cl["seq_wrong_votes"].append(letter)
            if p.correct_count is not None or p.wrong_count is not None or p.qnum:
                last = p

    for c in clusters:
        votes: dict[str, int] = defaultdict(int)
        wrong: set[str] = set()
        for p in c["photo_objs"]:
            hint = p.selected_hint
            if hint and hint in "ABCD":
                if p.wrong_banner:
                    wrong.add(hint)
                else:
                    votes[hint] += 1
        for L in c.get("seq_wrong_votes") or []:
            wrong.add(L)

        correct = None
        source = "needs-review"
        seq_votes = c.get("seq_correct_votes") or []
        if seq_votes:
            # majority of sequence inferences
            cnt = Counterish(seq_votes)
            correct, _ = cnt[0]
            source = "score-sequence"
        else:
            ranked = sorted(
                ((k, v) for k, v in votes.items() if k not in wrong),
                key=lambda kv: -kv[1],
            )
            if ranked:
                correct = ranked[0][0]
                source = "selected-on-screen"
            elif len(wrong) == 3:
                rem = [L for L in "ABCD" if L not in wrong]
                if len(rem) == 1:
                    correct = rem[0]
                    source = "elimination"

        if correct in wrong and source == "selected-on-screen":
            correct = None
            source = "needs-review"

        c["correct"] = correct
        c["answer_source"] = source
        c["selected_votes"] = dict(votes)
        c["wrong_selected"] = sorted(wrong)
        c["had_wrong_banner"] = any(p.wrong_banner for p in c["photo_objs"])


def Counterish(items: list[str]) -> list[tuple[str, int]]:
    d: dict[str, int] = defaultdict(int)
    for i in items:
        d[i] += 1
    return sorted(d.items(), key=lambda kv: -kv[1])


def main() -> None:
    files = sorted(OCR_DIR.glob("IMG_*.txt"))
    files = [
        f
        for f in files
        if re.fullmatch(r"IMG_\d+", f.stem)
        and 4345 <= int(f.stem.split("_")[1]) <= 4506
    ]
    photos = [parse_ocr_file(f) for f in files]
    (ROOT / "photo_parses.jsonl").write_text(
        "\n".join(json.dumps(asdict(p), ensure_ascii=False) for p in photos) + "\n",
        encoding="utf-8",
    )

    clusters = cluster_by_stem(photos)
    infer_answers(clusters)

    # Sort clusters for stable output: by first photo number
    clusters.sort(key=lambda c: min(p.img_num for p in c["photo_objs"]))
    for i, c in enumerate(clusters, 1):
        c["id"] = i

    keyed = sum(1 for c in clusters if c.get("correct"))
    multi_photo = [c for c in clusters if len(c["photos"]) > 1]
    extra_photos = sum(len(c["photos"]) - 1 for c in multi_photo)
    # Same stem appearing under different exam qnums (expected with shuffle)
    cross_q = [c for c in clusters if len(c["exam_qnums"]) > 1]

    lines = [
        "# Kelly Nail School — extracted English Q&A",
        "",
        "Source: `Temp/IMG_4345.JPG`–`IMG_4506.JPG` (ĐỀ THI: NAILS (EN) 2026).",
        "Two randomized passes of the same ~97-question exam were photographed.",
        "Items are merged by **question stem** (not session question number).",
        "Extraction: local Vision OCR + parse/merge. Not yet translated or imported.",
        "",
        f"- Photos processed: **{len(photos)}**",
        f"- Unique stems (after near-dupe clustering): **{len(clusters)}**",
        f"- With inferred correct answer: **{keyed}**",
        f"- Extra photos of already-seen stems: **{extra_photos}**",
        f"- Stems seen under multiple session Q numbers: **{len(cross_q)}** (shuffle)",
        "",
    ]

    for c in clusters:
        photos_s = ", ".join(x.replace(".JPG", "") for x in c["photos"])
        qnums = ",".join(str(n) for n in c["exam_qnums"]) or "?"
        lines.append(f"## q{c['id']:03d} (session Q#{qnums}; photos {photos_s})")
        lines.append("")
        lines.append(f"Q: {c.get('stem') or '???'}")
        letters = "ABCD"
        ch = c.get("choices") or []
        for i in range(4):
            lines.append(f"{letters[i]}: {ch[i] if i < len(ch) else '???'}")
        lines.append(f"Correct: {c.get('correct') or '???'}")
        lines.append(f"Answer source: {c.get('answer_source')}")
        if c.get("had_wrong_banner"):
            lines.append("Note: at least one photo shows wrong-answer banner")
        lines.append("")

    (ROOT / "extracted.md").write_text("\n".join(lines) + "\n", encoding="utf-8")

    # Also write compact jsonl for later bank import
    out_rows = []
    for c in clusters:
        out_rows.append(
            {
                "id": f"kelly-{c['id']:03d}",
                "question_en": c.get("stem"),
                "choices_en": c.get("choices"),
                "correct": c.get("correct"),
                "answer_source": c.get("answer_source"),
                "source_photos": c.get("photos"),
                "session_qnums": c.get("exam_qnums"),
                "needs_review": c.get("answer_source") == "needs-review"
                or not c.get("correct")
                or len(c.get("choices") or []) < 4,
            }
        )
    (ROOT / "extracted.jsonl").write_text(
        "\n".join(json.dumps(r, ensure_ascii=False) for r in out_rows) + "\n",
        encoding="utf-8",
    )

    dup_lines = [
        "# Duplicates and coverage",
        "",
        f"- Exam photos processed (IMG_4345–4506): **{len(photos)}**",
        f"- Unique question stems (clustered): **{len(clusters)}**",
        f"- Expected bank size (UI): **97**",
        f"- Extra photos of already-seen stems: **{extra_photos}** "
        f"(across {len(multi_photo)} stems with >1 photo)",
        f"- Stems appearing under different session Q numbers: **{len(cross_q)}** "
        "(normal — exam shuffles order between passes)",
        f"- Photos with no parsed stem: **{sum(1 for p in photos if not p.stem)}**",
        f"- Photos with no parsed qnum: **{sum(1 for p in photos if not p.qnum)}**",
        "",
        "## Stem clusters with multiple photos",
        "",
    ]
    for c in multi_photo:
        dup_lines.append(
            f"- q{c['id']:03d} ({len(c['photos'])} photos, session Q {c['exam_qnums']}): "
            f"{(c.get('stem') or '')[:80]}"
        )
    dup_lines += ["", "## Same stem, different session Q numbers", ""]
    if not cross_q:
        dup_lines.append("_None._")
    else:
        for c in cross_q:
            dup_lines.append(
                f"- q{c['id']:03d} session Qs {c['exam_qnums']}: {(c.get('stem') or '')[:80]}"
            )
    (ROOT / "duplicates.md").write_text("\n".join(dup_lines) + "\n", encoding="utf-8")

    gaps = []
    for c in clusters:
        issues = []
        if not c.get("correct"):
            issues.append("no_correct_answer")
        if not c.get("stem"):
            issues.append("no_stem")
        if len(c.get("choices") or []) < 4:
            issues.append(f"only_{len(c.get('choices') or [])}_choices")
        if c.get("answer_source") == "needs-review":
            issues.append("needs-review")
        # choice looks like chrome
        if any(is_chrome(x) for x in (c.get("choices") or [])):
            issues.append("chrome_in_choices")
        if issues:
            gaps.append((c, issues))

    # photos that never joined a good cluster
    unstemmed = [p for p in photos if not p.stem]

    gap_lines = [
        "# Answer / extraction gaps",
        "",
        f"- Cluster items needing attention: **{len(gaps)}**",
        f"- Photos with no stem parsed: **{len(unstemmed)}** → "
        + ", ".join(p.file for p in unstemmed),
        "",
    ]
    for c, issues in gaps:
        gap_lines.append(f"## q{c['id']:03d} — {','.join(issues)}")
        gap_lines.append(f"- Stem: {c.get('stem')}")
        gap_lines.append(f"- Choices: {c.get('choices')}")
        gap_lines.append(
            f"- Votes: {c.get('selected_votes')} wrong={c.get('wrong_selected')} "
            f"seq_ok={c.get('seq_correct_votes')} seq_bad={c.get('seq_wrong_votes')}"
        )
        gap_lines.append(f"- Photos: {c.get('photos')}")
        gap_lines.append("")
    (ROOT / "answer_gaps.md").write_text("\n".join(gap_lines) + "\n", encoding="utf-8")

    print(
        f"photos={len(photos)} clusters={len(clusters)} keyed={keyed} "
        f"extra_photos={extra_photos} cross_q={len(cross_q)} gaps={len(gaps)} "
        f"unstemmed={len(unstemmed)}"
    )


if __name__ == "__main__":
    main()
