#!/usr/bin/env python3
"""Finalize Kelly Nail School extraction from extracted_raw.jsonl."""

from __future__ import annotations

import json
import re
from difflib import SequenceMatcher
from pathlib import Path

ROOT = Path(__file__).resolve().parent

# Vision-confirmed / reconstructed text + keys
FIXES = [
    {
        "match": r"living skin at the base of the nail plate",
        "stem": "The living skin at the base of the nail plate is called the:",
        "choices": [
            "Eponychium, located at the base of the nail near the lunula",
            "Hyponychium",
            "Nail bed",
            "Cushion tissue",
        ],
        "correct": "A",
        "source": "domain-knowledge",
        "note": "IMG_4345 text verified; A textbook.",
    },
    {
        "match": r"massage is usually performed",
        "stem": "Massage is usually performed:",
        "choices": [
            "After applying treatment products",
            "Before trimming nails",
            "After applying color polish",
            "After using an electric file",
        ],
        "correct": "A",
        "source": "domain-knowledge",
        "note": "IMG_4346; D restored from vision.",
    },
    {
        "match": r"tool is used to clean finge|toenails before a service",
        "stem": "Which tool is used to clean fingernails or toenails before a service?",
        "choices": ["Nail brush", "Gel brush", "Nail clippers", "Nail file"],
        "correct": "A",
        "source": "domain-knowledge",
        "note": "IMG_4347; D=Nail file.",
    },
    {
        "match": r"^pumice stone$|soften and help remove foot calluses",
        "stem": "Which item is used to soften and help remove foot calluses?",
        "choices": ["Pumice stone", "Gel polish", "Nail glue", "Nail tip"],
        "correct": "A",
        "source": "selected-on-screen",
        "note": "IMG_4363; OCR used choice A as stem; A highlighted.",
    },
    {
        "match": r"shape the free edge of the nail",
        "stem": "A metal nail file is commonly used to:",
        "choices": [
            "Shape the free edge of the nail",
            "Cut dead skin",
            "Apply nail polish",
            "Soak nails",
        ],
        "correct": "A",
        "source": "domain-knowledge",
        "note": "IMG_4356; OCR had used choice A as stem.",
    },
    {
        "match": r"^disinfection means",
        "stem": "Disinfection means:",
        "choices": [
            "Complete sterilization",
            "(source UI split: Sterili / ation)",
            "Disinfection",
            "Scrubbing/cleaning",
        ],
        "correct": "???",
        "source": "needs-review",
        "note": "IMG_4359: source UI options are broken (Sterilization split A/B). Human key needed from instructor/DLL.",
        "force_review": True,
    },
    {
        "match": r"lowest level of infection control",
        "stem": "The lowest level of infection control is:",
        "choices": [
            "Sterilization",
            "(source UI split Sterili/ation across A–B — reconstructed as Sterilization)",
            "Disinfection",
            "Cleaning/Sanitation",
        ],
        "correct": "D",
        "source": "domain-knowledge",
        "note": "IMG_4371; cleaning/sanitation is lowest level. A/B were split 'Sterilization' in source UI.",
    },
    {
        "match": r"nail assessment be performed",
        "stem": "When should a nail assessment be performed?",
        "choices": [
            "Before the service, during consultation and nail inspection",
            "After applying top coat",
            "After nail removal",
            "After the client leaves the salon",
        ],
        "correct": "A",
        "source": "selected-on-screen",
        "note": "IMG_4372; A highlighted (purple border) with score 28 on Q29.",
    },
    {
        "match": r"acrylic too close to the cuticle",
        "stem": "Applying acrylic too close to the cuticle can cause:",
        "choices": ["Stronger nails", "Lifting", "Shinier nails", "Faster nail growth"],
        "correct": "B",
        "source": "domain-knowledge",
        "note": "IMG_4373; OCR score-sequence wrongly said A.",
    },
    {
        "match": r"gel that is not cured long enough|not cured long enough",
        "stem": "Gel that is not cured long enough may cause:",
        "choices": [
            "Softer nails",
            "Cracking or breaking",
            "Faster nail growth",
            "White discoloration",
        ],
        "correct": "B",
        "source": "domain-knowledge",
        "note": "Undercured gel cracks/breaks.",
    },
    {
        "match": r"service registration form",
        "stem": "What is a service registration form used for?",
        "choices": [
            "To diagnose nail diseases",
            "To record the services selected by the client and information needed for the service",
            "To replace the consultation form",
            "To inspect sterilization equipment",
        ],
        "correct": "B",
        "source": "domain-knowledge",
        "note": "IMG_4380; B restored (OCR split across lines).",
    },
    {
        "match": r"after disinfection, tools should be",
        "stem": "After disinfection, tools should be:",
        "choices": [
            "Dried and stored properly",
            "Used immediately while still wet",
            "Left on the open table",
            "Rinsed with dirty water",
        ],
        "correct": "A",
        "source": "domain-knowledge",
    },
    {
        "match": r"signs of nail fungus",
        "stem": "If a client shows signs of nail fungus, you should:",
        "choices": [
            "Continue the service",
            "Scrub harder",
            "Refuse service and refer the client to a doctor",
            "Cover it with dark polish",
        ],
        "correct": "C",
        "source": "domain-knowledge",
        "note": "IMG_4387: real on-screen choices/order recovered (previous entry paraphrased the choices and assigned the answer to letter A, which didn't match this photo's actual A–D order). Do not service fungal infections; refer out.",
    },
    {
        "match": r"product that helps soften the skin",
        "stem": "A product that helps soften the skin is:",
        "choices": ["Cuticle oil", "Primer", "Monomer", "Polymer"],
        "correct": "A",
        "source": "domain-knowledge",
        "note": "IMG_4392.",
    },
    {
        "match": r"disinfectants can kill everything except",
        "stem": "Disinfectants can kill everything except:",
        "choices": ["Bacteria and viruses", "Dirt only", "Oil only", "Bacterial spores"],
        "correct": "D",
        "source": "domain-knowledge",
        "note": "IMG_4393: real on-screen choices/order recovered (previous entry had the right content but assigned it to letter A, not matching this photo's actual A–D order). Disinfectants do not reliably kill bacterial spores.",
    },
    {
        "match": r"pedicure spa disinfectant should be left",
        "stem": "Pedicure spa disinfectant should be left in the basin according to:",
        "choices": [
            "Personal preference",
            "1 minute",
            "Manufacturer's instructions",
            "Until water cools",
        ],
        "correct": "C",
        "source": "domain-knowledge",
        "note": "Always follow manufacturer contact time.",
    },
    {
        "match": r"heat-producing reaction causes the gel",
        "stem": "During UV/LED curing, the heat-producing reaction causes the gel to:",
        "choices": [
            "Harden and cure into a solid coating",
            "Melt",
            "Become wetter",
            "Thin out",
        ],
        "correct": "A",
        "source": "domain-knowledge",
        "note": "IMG_4398: real on-screen choice order recovered (B/C/D had been rearranged/substituted in the previous entry).",
    },
    {
        "match": r"remove blood-contaminated gloves",
        "stem": "The correct way to remove blood-contaminated gloves is to:",
        "choices": [
            "Touch the outside surface directly",
            "Remove both gloves at the same time",
            "Remove one at a time, turning them inside out",
            "Wipe and reuse them",
        ],
        "correct": "C",
        "source": "domain-knowledge",
    },
    {
        "match": r"oil and dirt left on tools",
        "stem": "Oil and dirt left on tools will:",
        "choices": [
            "Reduce the effectiveness of disinfectants",
            "Increase the effectiveness of disinfectants",
            "Have no effect",
            "Sterilize the tools",
        ],
        "correct": "A",
        "source": "domain-knowledge",
    },
    {
        "match": r"ingrown hair is commonly associated",
        "stem": "Ingrown hair is commonly associated with:",
        "choices": ["Viruses", "Bacteria", "Allergies", "Fungi"],
        "correct": "B",
        "source": "domain-knowledge",
        "note": "IMG_4406: choices and answer confirmed directly against the photo.",
    },
    {
        "match": r"bones in the palm of the hand",
        "stem": "What are the bones in the palm of the hand called?",
        "choices": [
            "Finger bones (phalanges)",
            "Metacarpal bones",
            "Wrist bones (carpals)",
            "Toe bones",
        ],
        "correct": "B",
        "source": "domain-knowledge",
    },
    {
        "match": r"relaxation massage usually involves",
        "stem": "Relaxation massage usually involves:",
        "choices": [
            "Hard pounding",
            "Hard tapping",
            "Gentle massage strokes",
            "Deep tissue pressure only",
        ],
        "correct": "C",
        "source": "domain-knowledge",
    },
    {
        "match": r"only changing the nail color",
        "stem": "After serving a client and only changing the nail color, you should:",
        "choices": [
            "Disinfect tools and use a fresh towel",
            "Reuse the same towel",
            "Only use a fresh towel",
            "Only wash your hands",
        ],
        "correct": "A",
        "source": "domain-knowledge",
    },
    {
        "match": r"polymeri\s*l?\s*ation in nail technology|polymerization in nail",
        "stem": "What is polymerization in nail technology?",
        "choices": [
            "The process in which monomers bond together to form a polymer (hard plastic coating)",
            "The process of cleaning nails",
            "Removing polish with acetone",
            "Filing the free edge",
        ],
        "correct": "A",
        "source": "domain-knowledge",
    },
    {
        "match": r"scientific name for a natural nail",
        "stem": "The scientific name for a natural nail is:",
        "choices": ["Matrix", "Onyx / Natural nail", "Cuticle", "Lunula"],
        "correct": "B",
        "source": "domain-knowledge",
    },
    {
        "match": r"hand saniti|hand sanitizing is a form",
        "stem": "Hand sanitizing is a form of:",
        "choices": [
            "Sanitation",
            "Sterilization",
            "(source UI split Sterili/ation)",
            "Polymerization",
        ],
        "correct": "A",
        "source": "domain-knowledge",
        "note": "IMG_4438; A=Sanitation. Source splits Sterilization across B/C.",
    },
    {
        "match": r"tool used to remove dead skin from the feet",
        "stem": "The tool used to remove dead skin from the feet is:",
        "choices": ["Foot file", "Gel brush", "Nippers", "Acrylic brush"],
        "correct": "A",
        "source": "domain-knowledge",
        "note": "IMG_4440: real on-screen choices/order confirmed directly (previous entry had the right content but assigned it to letter D, not matching this photo's actual A–D order).",
    },
    {
        "match": r"tool used to clean under the nails",
        "stem": "The tool used to clean under the nails is:",
        "choices": ["Nippers", "Nail brush", "Electric file", "Nail clipper"],
        "correct": "B",
        "source": "domain-knowledge",
        "note": "IMG_4448: real on-screen choices confirmed directly (C/D had been swapped for different text in the previous entry).",
    },
    {
        "match": r"primer is used to",
        "stem": "Primer is used to:",
        "choices": ["Add shine", "Soften the nail", "Improve adhesion", "Remove color"],
        "correct": "C",
        "source": "domain-knowledge",
    },
    {
        "match": r"too much primer may cause",
        "stem": "Applying too much primer may cause:",
        "choices": [
            "Skin irritation and itching",
            "Faster nail growth",
            "Extra-hard nails",
            "No effect",
        ],
        "correct": "A",
        "source": "domain-knowledge",
    },
    {
        "match": r"after sterilization, tools should be stored|er stenili",
        "stem": "After sterilization, tools should be stored:",
        "choices": [
            "On the table",
            "In a clean, closed container or cabinet",
            "On the floor",
            "In a wet towel",
        ],
        "correct": "B",
        "source": "domain-knowledge",
    },
    {
        "match": r"greenish-yellow discoloration|eenish-yellow",
        "stem": "Greenish-yellow discoloration on artificial nails is usually caused by:",
        "choices": ["A virus", "Bacteria", "An allergy", "Trauma"],
        "correct": "B",
        "source": "domain-knowledge",
    },
    {
        "match": r"first step in creating a french acrylic",
        "stem": "What is the first step in creating a French acrylic nail?",
        "choices": [
            "Apply top coat",
            "Prepare the natural nail (clean, shape, and remove oils)",
            "Apply white acrylic powder",
            "Decorate the nail",
        ],
        "correct": "B",
        "source": "selected-on-screen",
        "note": "IMG_4400 B highlighted.",
    },
    {
        "match": r"nail forms are used to",
        "stem": "Nail forms are used to:",
        "choices": ["Create nail extensions", "Scrub feet", "Wash hands", "Massage"],
        "correct": "A",
        "source": "domain-knowledge",
    },
    {
        "match": r"^polymer is a",
        "stem": "Polymer is a:",
        "choices": ["Liquid", "Powder", "Cleanser", "Conditioning oil"],
        "correct": "B",
        "source": "domain-knowledge",
    },
    {
        "match": r"hand-soaking solution|hand soaking solution",
        "stem": "What should be added to a hand-soaking solution?",
        "choices": ["Acetone", "Softening oil", "Primer", "Resin"],
        "correct": "B",
        "source": "elimination",
        "note": "IMG_4505 A wrong-banner.",
    },
    {
        "match": r"correct way to use an electric file|move it gently",
        "stem": "The correct way to use an electric file is to:",
        "choices": [
            "Move it gently and avoid holding it in one place too long",
            "Press hard against the nail",
            "Keep it in one spot for a long time to clean faster",
            "Use high speed for every nail type",
        ],
        "correct": "A",
        "source": "domain-knowledge",
    },
    {
        "match": r"nail bed and nail are attached",
        "stem": "The nail bed and nail are attached to the finger bone by:",
        "choices": [
            "Specialized ligaments/connective tissue",
            "Dead skin",
            "Nail polish",
            "Cuticle oil",
        ],
        "correct": "A",
        "source": "domain-knowledge",
        "note": "Wrong banner when other letter selected on IMG_4500.",
    },
    {
        "match": r"which of the following is a solvent",
        "stem": "Which of the following is a solvent?",
        "choices": ["Polymer", "Acetone", "Resin", "Primer"],
        "correct": "B",
        "source": "domain-knowledge",
    },
    {
        "match": r"monomer and polymer are combined",
        "stem": "When monomer and polymer are combined, they create:",
        "choices": [
            "A chemical reaction",
            "A physical mixture only",
            "Conditioning oil",
            "Nail polish remover",
        ],
        "correct": "A",
        "source": "domain-knowledge",
    },
    {
        "match": r"indicate skin cancer",
        "stem": "Which of the following may indicate skin cancer?",
        "choices": [
            "Mild dry skin",
            "An unusual dark brown or black spot on the skin",
            "Mild peeling from sun exposure",
            "A small pimple",
        ],
        "correct": "B",
        "source": "domain-knowledge",
    },
    # --- Audit fixes (2026-09-17): items where the "Next Question" button
    # ("CÂU HỎI TIẾP THEO") glow was OCR'd as choice A, shifting the real
    # A–D choices down one slot and dropping the true 4th choice. Re-read
    # directly from source photos; verified against direct photo reads,
    # not the original score-sequence/selected-on-screen guesses.
    {
        "match": r"disposal of chemical products",
        "stem": "Disposal of chemical products in a nail salon must follow regulations established by:",
        "choices": ["EPA", "FDA", "OSHA", "CDC"],
        "correct": "A",
        "source": "domain-knowledge",
        "note": "IMG_4351: real on-screen choices are EPA/FDA/OSHA/CDC (extractor had mistaken the Next-Question button for choice A, shifting choices and dropping CDC). EPA regulates disposal of chemical/hazardous waste; no on-screen selection visible, so flagged for human confirmation vs. OSHA.",
        "force_review": True,
    },
    {
        "match": r"older adults usually",
        "stem": "The nails of older adults usually:",
        "choices": [
            "Grow quickly",
            "Are brittle and grow slowly",
            "Are thick and soft",
            "Do not change",
        ],
        "correct": "B",
        "source": "domain-knowledge",
        "note": "IMG_4358/IMG_4495: real on-screen choices recovered (extractor had mistaken the Next-Question button for choice A, dropping 'Grow quickly'/'Do not change'). Standard fact: aging nails become brittle and grow more slowly.",
    },
    {
        "match": r"^he cuticle is:",
        "stem": "The cuticle is:",
        "choices": [
            "Dead tissue attached to the nail plate / the thin skin around the nail",
            "Living nail tissue",
            "Bone",
            "Muscle",
        ],
        "correct": "A",
        "source": "selected-on-screen",
        "note": "IMG_4488 shows 'TRẢ LỜI CHO: A' confirming A was selected on screen; matches domain knowledge (cuticle = dead tissue). Real choice order recovered from IMG_4367/IMG_4488 (extractor had mistaken the Next-Question button for choice A).",
    },
    {
        "match": r"soaking bowl, cuticle pusher",
        "stem": "A soaking bowl, cuticle pusher, and nail clipper are classified as:",
        "choices": ["Tools/implements", "Materials", "Chemicals", "Disposable supplies"],
        "correct": "A",
        "source": "domain-knowledge",
        "note": "IMG_4374/IMG_4453: real on-screen choices recovered (extractor had mistaken the Next-Question button for choice A).",
    },
    {
        "match": r"iring weekly disinfection",
        "stem": "During weekly disinfection of a pedicure spa, the disinfectant solution should remain in the basin for:",
        "choices": ["Overnight", "10 minutes", "1 hour", "30 seconds"],
        "correct": "B",
        "source": "domain-knowledge",
        "note": "IMG_4384: real on-screen choices are Overnight/10 minutes/1 hour/30 seconds (extractor had mistaken the Next-Question button for choice A and dropped '30 seconds'). Standard pedicure-spa disinfectant contact time is 10 minutes, but no on-screen selection is visible — flagged for human confirmation.",
        "force_review": True,
    },
    {
        "match": r"client's calluses, the main goal",
        "stem": "When treating a client's calluses, the main goal is to:",
        "choices": [
            "Soften and smooth the callused area",
            "Make the skin drier and harder",
            "Cause all foot skin to peel off",
            "Increase skin thickness",
        ],
        "correct": "A",
        "source": "domain-knowledge",
        "note": "IMG_4395/IMG_4472: choices confirmed accurate, but previous score-sequence key (C) was domain-wrong; corrected to A.",
    },
    {
        "match": r"client consultation fomm",
        "stem": "What is a client consultation form used for?",
        "choices": [
            "To record nail/skin conditions and health history to ensure safe services",
            "To record services already paid for",
            "To decorate the nail salon",
            "To trim the client's cuticles",
        ],
        "correct": "A",
        "source": "domain-knowledge",
        "note": "IMG_4405: real on-screen choices recovered (extractor had mistaken the Next-Question button for choice A); stem typo 'fomm' corrected to 'form'.",
    },
    {
        "match": r"client consultation form used for",
        "stem": "What is a client consultation form used for?",
        "choices": [
            "To record nail/skin conditions and health history to ensure safe services",
            "To record services already paid for",
            "To decorate the nail salon",
            "To trim the client's cuticles",
        ],
        "correct": "A",
        "source": "domain-knowledge",
        "note": "IMG_4478/IMG_4479: duplicate of the same question captured with the header bar text mis-parsed as the stem and 'TRẢ LỜI:' chrome as a choice; merged into the same canonical entry as the IMG_4405 capture.",
    },
    # --- Audit fixes, round 2 (2026-09-17): broader sweep for duplicate
    # choices, truncated stems, and choices contaminated by the stem's own
    # overflow text (not the Next-Question chrome, a separate defect).
    {
        "match": r"mild odor, is commonly used in",
        "stem": "Which monomer, known for its mild odor, is commonly used in acrylic nail services?",
        "choices": [
            "Methyl Methacrylate (MMA)",
            "Ethyl Methacrylate (EMA)",
            "Acetone",
            "Ethyl alcohol",
        ],
        "correct": "B",
        "source": "domain-knowledge",
        "note": "IMG_4364: real on-screen choices recovered (stem's own overflow had leaked into choice A). EMA has a mild odor and is standard in professional acrylics; MMA has a strong odor and is restricted/banned in many states.",
    },
    {
        "match": r"reduce exposure to chemicals/products during nail services",
        "stem": "To reduce exposure to chemicals/products during nail services, you should:",
        "choices": [
            "Wash your hands and wear gloves properly",
            "Not wash your hands",
            "Use more products",
            "Work faster",
        ],
        "correct": "A",
        "source": "domain-knowledge",
        "note": "IMG_4379: real on-screen choices recovered (stem's own overflow had leaked into choice A, and A/B were duplicated).",
    },
    {
        "match": r"^ering the nail area|hyponychium, sidewalls, and cuticle",
        "stem": "Which structures help protect the nail and prevent bacteria from entering the nail area?",
        "choices": [
            "The hyponychium, sidewalls, and cuticle/eponychium",
            "Nail polish, gel, and glue",
            "Cuticle oil and hand cleanser",
            "Artificial nails and tips",
        ],
        "correct": "A",
        "source": "domain-knowledge",
        "note": "IMG_4386: choices confirmed accurate; stem was truncated ('ering the nail area?') and is now restored in full.",
    },
    {
        "match": r"arthritis, stiff joints, and difficulty opening the",
        "stem": "For a client with arthritis, stiff joints, and difficulty opening the hand, massage should focus on the:",
        "choices": ["Skeletal muscles", "Hand and finger muscles", "Nail muscles", "Skin muscles"],
        "correct": "B",
        "source": "domain-knowledge",
        "note": "IMG_4388: real on-screen choices recovered (stem's own overflow had leaked into choice A, which had been wrongly marked correct).",
    },
    {
        "match": r"accidentally cut a client and they begin bleeding",
        "stem": "If you accidentally cut a client and they begin bleeding, the first thing you should do is:",
        "choices": ["Wipe it dry", "Put on gloves", "Continue the service", "Cover it with polish"],
        "correct": "B",
        "source": "domain-knowledge",
        "note": "IMG_4389: real on-screen choices recovered (extractor had mistaken the Next-Question button/stem overflow for choices A/B, which had been wrongly marked correct).",
    },
    {
        "match": r"nail surface has a dent after product removal",
        "stem": "If the nail surface has a dent after product removal, where should product be concentrated during reapplication?",
        "choices": [
            "On the depressed area to restore balance and shape",
            "Over the entire hand",
            "On the fingertip only",
            "On the free edge",
        ],
        "correct": "A",
        "source": "domain-knowledge",
        "note": "IMG_4390: real on-screen choices recovered (stem's own overflow had leaked into choice A, and the previous key (C) was wrong).",
    },
    {
        "match": r"^nail forms are used to|lail forms are used to",
        "stem": "Nail forms are used to:",
        "choices": ["Create nail extensions", "Scrub feet", "Wash hands", "Massage"],
        "correct": "A",
        "source": "domain-knowledge",
        "note": "IMG_4391: real on-screen choices recovered (previous entry duplicated 'Create nail extensions'/'Wash hands' across all 4 slots, dropping 'Scrub feet'/'Massage').",
    },
    {
        "match": r"^atural nail\?|wann water",
        "stem": "What is used to help a plastic tip/artificial nail adhere better to the natural nail?",
        "choices": ["Primer", "Conditioning oil", "Warm water", "Exfoliating product"],
        "correct": "A",
        "source": "domain-knowledge",
        "note": "IMG_4399: choices confirmed accurate; source UI choice C typo 'Wann water' corrected to 'Warm water'.",
    },
    {
        "match": r"^iticle nippers should be|cuticle nippers should be",
        "stem": "Cuticle nippers should be:",
        "choices": [
            "Shared among clients",
            "Sterilized after each client",
            "(source UI split: 'Sterili' / 'ed after each client' — merged into B)",
            "Wiped with a towel only",
        ],
        "correct": "B",
        "source": "domain-knowledge",
        "note": "IMG_4409: real on-screen choices recovered; B/C split by broken source UI ('Sterili'/'ed after each client'), merged into B. Previous score-sequence key (A, 'shared among clients') was domain-wrong.",
    },
    {
        "match": r"keep the client.{0,3}s hand flat to",
        "stem": "When applying gel polish, keep the client's hand flat to:",
        "choices": [
            "Increase shine",
            "Prevent product from flowing onto the skin",
            "Make the nail thicker",
            "Work faster",
        ],
        "correct": "B",
        "source": "domain-knowledge",
        "note": "IMG_4413: real on-screen choices recovered (previous entry duplicated 'Prevent product from flowing onto the skin' across B/C and marked A correct); encoding artifact in stem ('clientâ€™s') corrected to \"client's\".",
    },
    {
        "match": r"rer use, a toe separator should be|after use, a toe separator should be",
        "stem": "After use, a toe separator should be:",
        "choices": ["Rinsed with water", "Disinfected", "Discarded", "Reused"],
        "correct": "C",
        "source": "domain-knowledge",
        "note": "IMG_4416: real on-screen choices recovered (previous entry duplicated 'Rinsed with water' across A/B); toe separators are single-use and must be discarded.",
    },
    {
        "match": r"^le nail bed is|^the nail bed is:",
        "stem": "The nail bed is:",
        "choices": [
            "The skin around the nail",
            "The skin beneath the nail plate",
            "The tip of the nail",
            "The nail wall",
        ],
        "correct": "B",
        "source": "domain-knowledge",
        "note": "IMG_4420: choices confirmed accurate, but previous key (A) was domain-wrong; the nail bed is the skin beneath the nail plate.",
    },
    {
        "match": r"body.{0,3}s protection against the growth and",
        "stem": "Which term refers to the body's protection against the growth and disease-causing effects of bacteria?",
        "choices": ["Immunity", "Infection", "Allergy", "Dehydration"],
        "correct": "A",
        "source": "domain-knowledge",
        "note": "IMG_4422: real on-screen choices recovered (stem's own overflow had leaked into choice A, which had been wrongly marked correct).",
    },
    {
        "match": r"properly si\s*l?\s*ed nail tip should",
        "stem": "A properly sized nail tip should:",
        "choices": [
            "Be smaller than the natural nail",
            "Be larger than the natural nail",
            "Cover from one sidewall to the other",
            "Cover only the center of the nail",
        ],
        "correct": "C",
        "source": "domain-knowledge",
        "note": "IMG_4426: choices confirmed accurate; stem split 'si / l / ed' (source UI defect) corrected to 'sized'. Previous key (A) was domain-wrong; a properly fitted tip spans sidewall to sidewall.",
    },
    {
        "match": r"removing acrylic nails, if a client wants the process done",
        "stem": "When removing acrylic nails, if a client wants the process done faster, you should:",
        "choices": [
            "Continue soaking properly in acetone",
            "Forcefully pull the nails off",
            "Pry the nails off with a sharp object",
            "Break the nails off by hand",
        ],
        "correct": "A",
        "source": "domain-knowledge",
        "note": "IMG_4430: real on-screen choices recovered (stem's own overflow had leaked into choice A; 'Break the nails off by hand' had been dropped).",
    },
    {
        "match": r"structure that supports the nail plate",
        "stem": "The structure that supports the nail plate (nail body) is called the:",
        "choices": ["Nail bed", "Cuticle", "Dead skin", "Cuticle layer"],
        "correct": "A",
        "source": "domain-knowledge",
        "note": "IMG_4432: choices confirmed accurate; stem restored in full.",
    },
    {
        "match": r"^sanitation means",
        "stem": "Sanitation means:",
        "choices": [
            "Cleaning and maintaining hygiene",
            "Sterilization",
            "Polymerization",
            "(only 3 distinct choices visible on screen; a 4th may not have been captured)",
        ],
        "correct": "A",
        "source": "domain-knowledge",
        "note": "IMG_4439: real on-screen choices are Cleaning and maintaining hygiene / Sterili+ation (split, merged into B) / Polymeri[zation] (truncated, choice C). Previous entry's choice D was Vietnamese UI chrome, not a real option.",
    },
    {
        "match": r"metal tools contaminated with blood",
        "stem": "Metal tools contaminated with blood must be:",
        "choices": [
            "Used again immediately",
            "Rinsed with water",
            "Properly cleaned and sterilized before reuse",
            "(source UI split: 'Properly cleaned and sterili' / 'ed before reuse' — merged into C)",
        ],
        "correct": "C",
        "source": "domain-knowledge",
        "note": "IMG_4408: real on-screen choices are Used again immediately / Rinsed with water / Properly cleaned and sterili[zed before reuse] (C/D split by broken source UI, same pattern as kelly-014/026/086; merged into C). Previous score-sequence key (B, 'used again immediately') was domain-wrong.",
    },
    {
        "match": r"joints should be massaged by",
        "stem": "Hand joints should be massaged by:",
        "choices": [
            "Pulling forcefully",
            "Gently rotating in circles",
            "Bending forcefully",
            "Tapping",
        ],
        "correct": "B",
        "source": "domain-knowledge",
        "note": "IMG_4410: real on-screen choices recovered (extractor had mistaken the Next-Question button for choice A).",
    },
    {
        "match": r"^what is onychia",
        "stem": "What is Onychia?",
        "choices": ["Nail fungus", "Inflammation of the nail matrix/base", "Brittle nails", "Splitting nails"],
        "correct": "B",
        "source": "domain-knowledge",
        "note": "IMG_4411/IMG_4487: choices confirmed accurate, but previous score-sequence key (A) was domain-wrong; Onychia is inflammation of the nail matrix/base.",
    },
    {
        "match": r"^e disinfecting tools, you should",
        "stem": "Before disinfecting tools, you should:",
        "choices": [
            "Clean off dirt and debris with soap and water",
            "Soak them in acetone",
            "Apply gel polish to them",
            "Cure them under a UV lamp",
        ],
        "correct": "A",
        "source": "domain-knowledge",
        "note": "IMG_4415: real on-screen choices recovered (extractor had mistaken the Next-Question button for choice A, dropping 'Cure them under a UV lamp'). Tools must be cleaned of debris before disinfecting.",
    },
    {
        "match": r"reduce the heat sensation during uv",
        "stem": "To reduce the heat sensation during UV/LED curing, you should:",
        "choices": [
            "Reduce curing time or cure in shorter intervals",
            "Increase curing time continuously",
            "Press the nail firmly into the lamp",
            "Make no changes",
        ],
        "correct": "A",
        "source": "domain-knowledge",
        "note": "IMG_4419/IMG_4491: real on-screen choices recovered (extractor had mistaken the Next-Question button for choice A). Previous score-sequence key (C, 'increase curing time continuously') was domain-wrong.",
    },
    {
        "match": r"indicate nail fungus",
        "stem": "Which of the following may indicate nail fungus?",
        "choices": [
            "Thickened nails with yellow or cloudy-white discoloration",
            "Temporary redness of the skin",
            "Evenly pink nails",
            "Normal, fast-growing nails",
        ],
        "correct": "A",
        "source": "domain-knowledge",
        "note": "IMG_4425/IMG_4486: real on-screen choices recovered (extractor had mistaken the Next-Question button for choice A). Source UI choice C literally reads 'Evenly pinknails' (missing space); corrected to 'Evenly pink nails'.",
    },
    {
        "match": r"nail hardener/strengthener should be",
        "stem": "When nails are weak, a nail hardener/strengthener should be applied:",
        "choices": [
            "Before the primer or base coat",
            "After the top coat",
            "After nail removal",
            "After washing hands",
        ],
        "correct": "A",
        "source": "domain-knowledge",
        "note": "IMG_4428/IMG_4457: real on-screen choices recovered (extractor had mistaken the Next-Question button for choice A).",
    },
    {
        "match": r"terili\s*l\s*ation means",
        "stem": "Sterilization means:",
        "choices": ["Cleaning", "Disinfection", "Sterili", "ation"],
        "correct": "???",
        "source": "needs-review",
        "note": "IMG_4436/IMG_4461: source UI splits 'Sterilization' across choices C/D (same broken-UI defect as kelly-014), leaving only Cleaning/Disinfection as real distinct choices — neither correctly defines sterilization (complete destruction of all microorganisms including spores). No on-screen answer selection visible in either photo. Needs human key from instructor/DLL, same as kelly-014.",
        "force_review": True,
    },
    {
        "match": r"artificial nail mainly contacts the natural nail",
        "stem": "An artificial nail mainly contacts the natural nail at the:",
        "choices": [
            "Contact area/well (where the tip meets the natural nail)",
            "Hand skin",
            "Palm",
            "Finger joint",
        ],
        "correct": "A",
        "source": "domain-knowledge",
        "note": "IMG_4442/IMG_4455: real on-screen choices recovered directly (extractor had mistaken the Next-Question button for choice A in a separately-OCR'd pass, dropping 'Palm').",
    },
    # --- Audit fixes, round 3 (2026-09-17): remaining duplicate-choice
    # items where two merged photo passes produced identical text in two
    # of the four slots, hiding 1-2 real distinct choices.
    {
        "match": r"used to bond two surfaces together or harden",
        "stem": "Which substance is used to bond two surfaces together or harden in place?",
        "choices": ["Glue (adhesive)", "Conditioning oil", "Hand cleanser", "Base coat"],
        "correct": "A",
        "source": "domain-knowledge",
        "note": "IMG_4435: choices confirmed accurate; stem's tail ('in place?') had leaked into choice A, dropping 'Base coat'. Answer content was already right (Glue/adhesive), letter corrected from B to A after removing the leaked fragment.",
    },
    {
        "match": r"polymer \(plastic resin\) is commonly found",
        "stem": "Polymer (plastic resin) is commonly found in which of the following products?",
        "choices": ["Top coat", "Warm water", "Cotton balls", "Nail clippers"],
        "correct": "A",
        "source": "domain-knowledge",
        "note": "IMG_4368: choices confirmed accurate; previous score-sequence key (B, 'Warm water') was domain-wrong — polymer/plastic resin is found in top coat formulations, not water.",
    },
    {
        "match": r"used to clean and exfoliate the feet",
        "stem": "Which of the following is used to clean and exfoliate the feet during a pedicure?",
        "choices": ["Disinfectant", "Exfoliant (scrub)", "Nail glue", "Gel polish"],
        "correct": "B",
        "source": "domain-knowledge",
        "note": "IMG_4429: choices confirmed accurate; previous score-sequence key (A, 'Disinfectant') was domain-wrong — an exfoliant/scrub is what cleans and exfoliates skin.",
    },
    {
        "match": r"reusable items differ from disposable items",
        "stem": "Reusable items differ from disposable items because they:",
        "choices": ["Cost more or less", "Can be reused after proper processing", "Have different colors", "Have different sizes"],
        "correct": "B",
        "source": "domain-knowledge",
        "note": "IMG_4361/IMG_4504: no 'TRẢ LỜI' selection banner visible in either photo despite the prior 'selected-on-screen' label. Domain-correct answer is B — being reusable-after-processing is the defining distinction, not cost.",
    },
    {
        "match": r"^cuticle remover helps to",
        "stem": "Cuticle remover helps to:",
        "choices": ["Soften dead skin", "Add shine", "Make nails longer", "Disinfect"],
        "correct": "A",
        "source": "domain-knowledge",
        "note": "IMG_4353: real on-screen choices recovered (previous entry duplicated 'Soften dead skin'/'Make nails longer' across all 4 slots, dropping 'Add shine'/'Disinfect').",
    },
    {
        "match": r"feet show itching, peeling skin, or nail discoloration",
        "stem": "If a client's feet show itching, peeling skin, or nail discoloration, it may indicate:",
        "choices": ["Nail fungus or athlete's foot", "Calluses", "Polish allergy", "Normal dry skin"],
        "correct": "A",
        "source": "domain-knowledge",
        "note": "IMG_4348: real on-screen choices recovered (previous entry duplicated 'Nail fungus or athlete's foot' across A/B, dropping 'Calluses'); stem restored in full.",
    },
    {
        "match": r"^p?olymeri\s*l?\s*ation is the process of",
        "stem": "Polymerization is the process of:",
        "choices": ["Evaporation", "Hardening/bonding", "Softening", "Color removal"],
        "correct": "B",
        "source": "domain-knowledge",
        "note": "IMG_4377: choices confirmed accurate; stem split 'Polymeri / l / ation' (source UI defect) corrected to 'Polymerization'. Previous key (A) was domain-wrong; polymerization is monomers hardening/bonding into a solid plastic.",
    },
    {
        "match": r"tool is used to shape and sculpt acrylic beads",
        "stem": "Which tool is used to shape and sculpt acrylic beads during acrylic nail application?",
        "choices": [
            "Wooden stick (orangewood stick)",
            "Kolinsky brush (acrylic brush)",
            "Electric file",
            "Synthetic gel brush",
        ],
        "correct": "A",
        "source": "domain-knowledge",
        "note": "IMG_4378: real on-screen choices recovered (previous entry duplicated 'Wooden stick (orangewood stick)' across A/B, dropping 'Electric file'); stem restored in full.",
    },
    {
        "match": r"part of the proper pedicure spa cleaning procedure",
        "stem": "Which step is part of the proper pedicure spa cleaning procedure?",
        "choices": ["Applying gel polish", "Scrubbing the basin", "Rinsing with hot water only", "Wiping with acetone"],
        "correct": "B",
        "source": "domain-knowledge",
        "note": "IMG_4381: real on-screen choices recovered (previous entry duplicated 'Applying gel polish'/'Rinsing with hot water only' across all 4 slots, dropping 'Scrubbing the basin'/'Wiping with acetone'). Previous key (A, 'Applying gel polish') was domain-wrong.",
    },
    {
        "match": r"test whether acrylic has hardened, what should you lightly tap",
        "stem": "To test whether acrylic has hardened, what should you lightly tap the nail with?",
        "choices": ["Nippers", "Brush handle", "Electric file", "Wooden cuticle stick"],
        "correct": "A",
        "source": "domain-knowledge",
        "note": "IMG_4383: real on-screen choices recovered (previous entry duplicated 'Wooden cuticle stick' across C/D, dropping 'Electric file'); stem restored in full.",
    },
    {
        "match": r"white spots on a client.{0,3}s nails are a sign of|hite spots on a client",
        "stem": "White spots on a client's nails are a sign of:",
        "choices": ["Leukonychia (white nail condition)", "Albinism", "Fungal hair infection", "Calluses"],
        "correct": "A",
        "source": "domain-knowledge",
        "note": "IMG_4385: real on-screen choices recovered (previous entry duplicated 'Leukonychia'/'Fungal hair infection' across all 4 slots, dropping 'Albinism'/'Calluses'); stem's leading '/' (OCR artifact for 'W') corrected.",
    },
    {
        "match": r"^the brush commonly used for gel is",
        "stem": "The brush commonly used for gel is:",
        "choices": ["Steel brush", "Synthetic brush", "Wooden brush", "Paper brush"],
        "correct": "B",
        "source": "domain-knowledge",
        "note": "IMG_4396: real on-screen choices recovered (previous entry duplicated 'Synthetic brush' across B/C, dropping 'Paper brush').",
    },
    {
        "match": r"^when mixing a disinfectant solution, you should",
        "stem": "When mixing a disinfectant solution, you should:",
        "choices": [
            "Make it as strong as you want",
            "Follow the manufacturer's instructions",
            "Estimate without measuring",
            "Mix it with acetone",
        ],
        "correct": "B",
        "source": "domain-knowledge",
        "note": "IMG_4397: real on-screen choices recovered (previous entry duplicated 'Follow the manufacturer's instructions' across B/C, dropping 'Mix it with acetone', and had wrongly marked A correct).",
    },
    {
        "match": r"^the hyponychium is located",
        "stem": "The hyponychium is located:",
        "choices": ["Under the free edge of the nail", "Above the matrix", "Inside the cuticle", "Above the lunula"],
        "correct": "A",
        "source": "domain-knowledge",
        "note": "IMG_4414: real on-screen choices recovered (previous entry duplicated 'Under the free edge of the nail'/'Inside the cuticle' across all 4 slots, dropping 'Above the matrix'/'Above the lunula'). Previous key (mapped to 'Inside the cuticle') was domain-wrong.",
    },
    {
        "match": r"^sea salt and plastic beads are types of",
        "stem": "Sea salt and plastic beads are types of:",
        "choices": ["Disinfectants", "Exfoliants (scrubs)", "Primer", "Resin"],
        "correct": "B",
        "source": "domain-knowledge",
        "note": "IMG_4418: real on-screen choices recovered (previous entry duplicated 'Exfoliants (scrubs)' across B/C, dropping 'Resin', and had wrongly marked D/'Primer' correct).",
    },
    {
        "match": r"cannot be sterili\s*l?\s*ed and must be replaced",
        "stem": "Which of the following cannot be sterilized and must be replaced instead?",
        "choices": ["Emery board (paper nail file)", "Metal cuticle pusher", "Nail clipper", "Metal cuticle nipper"],
        "correct": "A",
        "source": "domain-knowledge",
        "note": "IMG_4433: real on-screen choices recovered (previous entry duplicated 'Metal cuticle pusher'/'Metal cuticle nipper' across all 4 slots, dropping 'Emery board'/'Nail clipper'). Previous key (mapped to 'Metal cuticle pusher') was domain-wrong — metal tools can be sterilized; paper emery boards cannot and must be discarded/replaced. Stem split 'sterili / l / ed' corrected to 'sterilized'.",
    },
]

EXCLUDE = re.compile(
    r"(?i)(quizer|quiz has completed|cuộc thi|hoàn tất|tông quát|câu hỏi tiếp|"
    r"cau h[oô]i|tc hỏi|square coffin|occupatt|data sheet|enviromental|"
    r"^nvl$|may need to print your score)"
)


def norm(s: str) -> str:
    s = (s or "").lower().strip()
    s = re.sub(r"^[^a-z]+", "", s)
    return re.sub(r"\s+", " ", s)


def apply_fix(row: dict) -> dict:
    stem_n = norm(row.get("question_en") or "")
    blob = stem_n + " " + norm(" ".join(row.get("choices_en") or []))
    # choice-as-stem: pumice stone alone
    if stem_n == "pumice stone":
        blob = "soften and help remove foot calluses pumice stone " + blob
    for fix in FIXES:
        if re.search(fix["match"], blob, re.I):
            r = dict(row)
            r["question_en"] = fix["stem"]
            r["choices_en"] = list(fix["choices"])
            r["correct"] = fix["correct"]
            r["answer_source"] = fix["source"]
            r["audit_note"] = fix.get("note", "")
            r["needs_review"] = bool(fix.get("force_review"))
            return r
    return row


def domain_fallback(row: dict) -> dict:
    if row.get("correct") and row.get("answer_source") not in (None, "needs-review"):
        if "???" not in (row.get("choices_en") or []):
            return row
    stem = norm(row.get("question_en") or "")
    choices = [c.lower() for c in (row.get("choices_en") or [])]
    joined = " | ".join(choices)

    def ans(letter: str, why: str, review: bool = False) -> dict:
        r = dict(row)
        r["correct"] = letter
        r["answer_source"] = "domain-knowledge"
        r["audit_note"] = ((r.get("audit_note") or "") + " | " + why).strip(" |")
        r["needs_review"] = review
        return r

    rules = [
        (r"solvent", "acetone", "B"),
        (r"skin cancer", "dark brown|black spot", "B"),
        (r"eponychium|living skin", "eponychium", "A"),
        (r"bacteria|greenish|greenies", "bacteria", "B"),
        (r"primer is used", "adhesion", "C"),
        (r"too much primer", "irritation", "A"),
        (r"sterilization, tools should be stored|after sterilization", "closed container", "B"),
        (r"nail forms", "extensions", "A"),
        (r"^polymer is a", "powder", "B"),
        (r"hand-soaking|hand soaking", "softening|oil", "B"),
        (r"french acrylic", "prepare the natural", "B"),
        (r"massage is usually", "treatment products", "A"),
        (r"electric file is to", "gently", "A"),
        (r"metacarp", None, "B"),
        (r"onyx", None, "B"),
        (r"cuticle oil", "soften", "A"),
        (r"lifting", "cuticle", "B"),
        (r"sanitizing is a form|hand sanit", "sanitation", "A"),
        (r"lowest level of infection", "cleaning|sanitation", "D"),
        (r"gloves", "inside out", "C"),
        (r"oil and dirt left", "reduce the effectiveness", "A"),
        (r"manufacturer", "pedicure spa disinfectant", "C"),
    ]
    for stem_pat, choice_pat, letter in rules:
        if re.search(stem_pat, stem):
            if choice_pat is None or re.search(choice_pat, joined):
                return ans(letter, f"rule {stem_pat}")
    return row


def merge_dupes(rows: list[dict]) -> list[dict]:
    kept: list[dict] = []
    for row in rows:
        ns = norm(row.get("question_en") or "")
        if not ns or EXCLUDE.search(ns) or EXCLUDE.search(" ".join(row.get("choices_en") or [])):
            continue
        # drop if stem is clearly UI chrome
        if len(ns) < 8 and "???" in (row.get("choices_en") or []):
            continue
        hit = None
        for k in kept:
            ks = norm(k.get("question_en") or "")
            if ns == ks or ns in ks or ks in ns or SequenceMatcher(None, ns, ks).ratio() >= 0.88:
                hit = k
                break
        if not hit:
            kept.append(row)
            continue
        # merge
        if len(row.get("question_en") or "") > len(hit.get("question_en") or ""):
            hit["question_en"] = row["question_en"]
        if len([c for c in (row.get("choices_en") or []) if c != "???"]) > len(
            [c for c in (hit.get("choices_en") or []) if c != "???"]
        ):
            hit["choices_en"] = row["choices_en"]
        if row.get("correct") and (
            not hit.get("correct") or hit.get("answer_source") == "needs-review"
        ):
            hit["correct"] = row["correct"]
            hit["answer_source"] = row.get("answer_source")
            hit["audit_note"] = row.get("audit_note")
            hit["needs_review"] = row.get("needs_review", False)
        hit["source_photos"] = sorted(
            set((hit.get("source_photos") or []) + (row.get("source_photos") or []))
        )
        hit["session_qnums"] = sorted(
            set((hit.get("session_qnums") or []) + (row.get("session_qnums") or []))
        )
    return kept


def main() -> None:
    raw_path = ROOT / "extracted_raw.jsonl"
    if not raw_path.exists():
        raw_path = ROOT / "extracted.jsonl"
    raw = [json.loads(l) for l in raw_path.read_text().splitlines() if l.strip()]

    excluded = []
    rows = []
    for r in raw:
        stem = r.get("question_en") or ""
        photos = r.get("source_photos") or []
        if any(p.startswith("IMG_4404") for p in photos):
            excluded.append(("whiteboard", r))
            continue
        if EXCLUDE.search(stem):
            excluded.append(("junk", r))
            continue
        r = apply_fix(dict(r))
        r = domain_fallback(r)
        # clean ??? only if we have 4 real choices from fix
        ch = r.get("choices_en") or []
        while len(ch) < 4:
            ch.append("???")
        r["choices_en"] = ch[:4]
        if not r.get("correct"):
            r["needs_review"] = True
            r["answer_source"] = r.get("answer_source") or "needs-review"
        rows.append(r)

    rows = merge_dupes(rows)

    # Drop items whose answer key isn't confidently verified (broken source
    # UI with no on-screen selection, or a domain-knowledge guess with zero
    # photographic evidence) from the published bank entirely, per request.
    DROP_UNCERTAIN = re.compile(
        r"(?i)(^disposal of chemical products|^disinfection means|"
        r"^during weekly disinfection of a pedicure spa|^sterilization means)"
    )
    dropped_uncertain = [r for r in rows if DROP_UNCERTAIN.search(r.get("question_en") or "")]
    rows = [r for r in rows if not DROP_UNCERTAIN.search(r.get("question_en") or "")]

    rows.sort(
        key=lambda r: min(
            (
                int(re.search(r"(\d+)", p).group(1))
                for p in (r.get("source_photos") or ["IMG_9999"])
                if re.search(r"(\d+)", p)
            ),
            default=9999,
        )
    )
    for i, r in enumerate(rows, 1):
        r["id"] = f"kelly-{i:03d}"

    keyed = sum(1 for r in rows if r.get("correct") and r.get("correct") != "???")
    review = sum(1 for r in rows if r.get("needs_review") or "???" in (r.get("choices_en") or []))
    multi = [r for r in rows if len(r.get("source_photos") or []) > 1]
    extra = sum(len(r["source_photos"]) - 1 for r in multi)

    lines = [
        "# Kelly Nail School — extracted English Q&A",
        "",
        "Source: `Temp/IMG_4345.JPG`–`IMG_4506.JPG` (ĐỀ THI: NAILS (EN) 2026).",
        "Two randomized passes of the same ~97-question exam were photographed.",
        "Items merged by **question stem** (session Q numbers shuffle between passes).",
        "",
        "Answer sources: `selected-on-screen` | `score-sequence` | `elimination` | `domain-knowledge` | `needs-review`",
        "",
        f"- Photos processed: **161**",
        f"- Unique stems after cleanup: **{len(rows)}** (UI shows 97)",
        f"- With answer letter: **{keyed}**",
        f"- Still needs review (uncertain key and/or missing choice): **{review}**",
        f"- Extra photos of already-seen stems: **{extra}**",
        f"- Excluded non-exam/junk clusters: **{len(excluded)}**",
        "",
    ]
    for r in rows:
        photos_s = ", ".join(x.replace(".JPG", "") for x in (r.get("source_photos") or []))
        qnums = ",".join(str(n) for n in (r.get("session_qnums") or [])) or "?"
        lines += [
            f"## {r['id']} (session Q#{qnums}; photos {photos_s})",
            "",
            f"Q: {r.get('question_en')}",
        ]
        for i, L in enumerate("ABCD"):
            lines.append(f"{L}: {(r.get('choices_en') or ['???']*4)[i]}")
        lines += [
            f"Correct: {r.get('correct') or '???'}",
            f"Answer source: {r.get('answer_source') or 'needs-review'}",
        ]
        if r.get("audit_note"):
            lines.append(f"Note: {r['audit_note']}")
        lines.append("")

    (ROOT / "extracted.md").write_text("\n".join(lines) + "\n")
    (ROOT / "extracted.jsonl").write_text(
        "\n".join(json.dumps(r, ensure_ascii=False) for r in rows) + "\n"
    )

    dup = [
        "# Duplicates and coverage",
        "",
        "## Summary",
        "",
        f"- Exam photos IMG_4345–4506: **161** (missing camera file: IMG_4357)",
        f"- Unique stems: **{len(rows)}** (exam UI = 97 questions)",
        f"- Extra photos of already-seen stems: **{extra}** (across {len(multi)} stems)",
        f"- Excluded junk/non-exam: **{len(excluded)}**",
        "",
        "### Duplicate types",
        "",
        "1. **Extra photos** of the same stem (two passes / retries) — counted above.",
        "2. **Session Q-number collisions** — same Q# in pass 1 vs pass 2 is often a different stem (shuffle). We do not merge by Q#.",
        "3. **Near-duplicate OCR stems** — clustered when similarity ≥ 0.88.",
        "",
        "## Multi-photo stems",
        "",
    ]
    for r in multi:
        dup.append(
            f"- {r['id']} ({len(r['source_photos'])} photos, session Q {r.get('session_qnums')}): "
            f"{(r.get('question_en') or '')[:90]}"
        )
    dup += ["", "## Excluded", ""]
    for reason, r in excluded:
        dup.append(f"- {reason}: {(r.get('question_en') or '')[:90]} // {r.get('source_photos')}")
    (ROOT / "duplicates.md").write_text("\n".join(dup) + "\n")

    gaps = [
        r
        for r in rows
        if r.get("needs_review")
        or not r.get("correct")
        or "???" in (r.get("choices_en") or [])
        or r.get("answer_source") == "needs-review"
    ]
    gap_lines = ["# Answer / extraction gaps", "", f"- Items needing attention: **{len(gaps)}**", ""]
    for r in gaps:
        gap_lines += [
            f"## {r['id']}",
            f"- Stem: {r.get('question_en')}",
            f"- Choices: {r.get('choices_en')}",
            f"- Correct: {r.get('correct')} ({r.get('answer_source')})",
            f"- Photos: {r.get('source_photos')}",
            f"- Note: {r.get('audit_note')}",
            "",
        ]
    gap_lines += [
        f"## Dropped from published bank entirely ({len(dropped_uncertain)})",
        "",
        "These were pulled out of `extracted.md`/`extracted.jsonl` rather than kept with a "
        "`needs-review` flag, because the answer key could not be confidently verified against "
        "the source photos (either the on-screen UI is broken and shows no valid answer text, or "
        "the key is an unverified domain-knowledge guess with zero photographic evidence of the "
        "correct choice):",
        "",
    ]
    for r in dropped_uncertain:
        gap_lines += [
            f"- **{r.get('question_en')}**",
            f"  - Choices: {r.get('choices_en')}",
            f"  - Last key on file: {r.get('correct')} ({r.get('answer_source')})",
            f"  - Photos: {r.get('source_photos')}",
            f"  - Why dropped: {r.get('audit_note')}",
        ]
    (ROOT / "answer_gaps.md").write_text("\n".join(gap_lines) + "\n")

    ver = Path(ROOT / "verification.md").read_text() if (ROOT / "verification.md").exists() else ""
    if "IMG_4356" not in ver:
        ver = (
            "# Verification notes\n\n"
            "Stratified + gap vision checks vs OCR:\n\n"
            "| Photo | Result |\n|-------|--------|\n"
            "| IMG_4345 | Living skin / eponychium A–D OK |\n"
            "| IMG_4346 | Massage; D restored |\n"
            "| IMG_4347 | Nail brush question; D=Nail file |\n"
            "| IMG_4352 | Primer → improve adhesion |\n"
            "| IMG_4354 | Too much primer → irritation |\n"
            "| IMG_4356 | Metal file stem was OCR’d as choice A |\n"
            "| IMG_4359 | Disinfection means; Sterilization split A/B in source UI |\n"
            "| IMG_4360 | After sterilization storage |\n"
            "| IMG_4362 | Electric file technique stem restored |\n"
            "| IMG_4370 | Greenish-yellow → bacteria |\n"
            "| IMG_4371 | Lowest infection control → cleaning/sanitation |\n"
            "| IMG_4372 | Nail assessment; A selected |\n"
            "| IMG_4373 | Acrylic near cuticle → lifting |\n"
            "| IMG_4380 | Service registration form → B |\n"
            "| IMG_4392 | Soften skin → cuticle oil |\n"
            "| IMG_4400 | French acrylic; B on-screen |\n"
            "| IMG_4404 | Whiteboard (not exam) excluded |\n"
            "| IMG_4438 | Hand sanitizing → sanitation |\n"
            "| IMG_4450 | Nail forms → extensions |\n"
            "| IMG_4470 | Polymer → powder |\n"
            "| IMG_4505 | Hand soak; A wrong-banner → B |\n"
            "| IMG_4506 | Quiz complete splash excluded |\n"
            "\nMost photos were taken before answering; many keys are `domain-knowledge` after text verify.\n"
        )
        (ROOT / "verification.md").write_text(ver)

    print(
        f"final={len(rows)} keyed={keyed} review={review} extra={extra} excluded={len(excluded)}"
    )


if __name__ == "__main__":
    main()
