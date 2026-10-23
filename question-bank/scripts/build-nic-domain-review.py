#!/usr/bin/env python3
"""Write a readable review sheet (question-bank/review/nic-<set>.md) for each NIC Domain Practice set.

Pass set ids to build only those: build-nic-domain-review.py 1B 1C
"""

import json
import sys
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
only = sys.argv[1:]
for set_file in sorted((ROOT / "nic-domain-practice" / "sets").glob("*.json")):
    if only and not any(set_file.name.startswith(f"{s}-") for s in only):
        continue
    d = json.loads(set_file.read_text(encoding="utf-8"))
    lines = [
        f"# Set {d['setId']} — {d['title']['en']} / {d['title']['zh']}",
        "",
        f"{d['domain']['title']['en']} · {len(d['questions'])} questions · status: {d['status']}",
        "",
    ]
    for i, q in enumerate(d["questions"], 1):
        lines.append(f"**{i}. {q['question']['en']}**  ")
        lines.append(f"{q['question']['zh']}  ")
        for c in q["choices"]:
            mark = " ✅" if c["id"] == q["correctChoice"] else ""
            lines.append(f"{c['id'].upper()}. {c['en']} / {c['zh']}{mark}  ")
        lines.append(f"*Why:* {q['explanation']['en']}  ")
        lines.append(f"*为什么:* {q['explanation']['zh']}  ")
        lines.append(f"*Lock this ({q.get('hookType', '?')}):* {q['lockPoint']['en']}  ")
        lines.append(f"*记重点:* {q['lockPoint']['zh']}  ")
        refs = ", ".join(f"{r['source']} p.{r['printedPage']} (PDF {r['pdfPage']})" for r in q["authorityRefs"])
        lines.append(f"*Source:* {refs}")
        lines.append("")
    out = ROOT / "review" / f"nic-{set_file.stem}.md"
    out.write_text("\n".join(lines), encoding="utf-8")
    print(f"wrote {out.relative_to(ROOT.parent)}")
