# NIC Domain Practice

New practice questions written from Milady Standard Nail Technology 8th Edition + Milady Standard Foundations (2020). They follow the 8 content areas of the NIC National Nail Technology Theory Examination outline (effective Sept 1, 2025; revised March 1, 2026).

- `sets/<setId>-<slug>.json`: one file per 20-question set.
- `npm run validate:nic-domain-practice`: format and style checks (runs anywhere).
- `npm run verify:nic-domain-evidence -- <pages.jsonl>`: confirms every quote is on its cited textbook page (local only; see the script header for making `pages.jsonl`).

## Set plan (23 sets, 460 questions)

| Area (exam weight) | Sets |
|---|---|
| 1. Infection Control and Safety (15%) | 1A disease and how it spreads · 1B levels of infection control, single/multi-use, blood exposure · 1C chemical safety, SDS, reactions, ventilation, ergonomics |
| 2. Anatomy and Physiology (15%) | 2A nail structure and growth · 2B nail disorders · 2C skin structure and disorders · 2D bones, muscles, joints of arms, hands, legs, feet |
| 3. Chemistry of Nail Products (10%) | 3A basic chemistry · 3B ingredients and harmful ingredients |
| 4. Pre-Service (5%) | 4A consultation, contraindications, setup, hand washing |
| 5. Nail Service Tools (13%) | 5A equipment · 5B implements and safe use · 5C supplies and products |
| 6. Manicure and Pedicure (18%) | 6A manicure steps · 6B massage · 6C pedicure care · 6D polish and add-on services |
| 7. Nail Enhancements (20%) | 7A tips, forms, wraps · 7B monomer/polymer · 7C soft, hard, hybrid gels · 7D dip, maintenance, removal · 7E problems and fixes (lifting, cracking, yellowing, heat spikes) |
| 8. Post-Service (4%) | 8A aftercare, client education, cleaning and disinfection |

## Accuracy rules

1. Every correct answer has at least one `evidence` quote from the textbook page it cites. The verify script must pass.
2. Each set is answered **blind** by a separate reviewer from the textbook alone. Any mismatch with the key is fixed or the question is dropped.
3. If a choice is changed after the blind check, that question is blind-checked again.
4. Wrong choices must be clearly wrong by the book. Avoid choices that are synonyms of each other or of the answer.
5. Where Milady differs from other sources, follow Milady and do not offer the other value as a choice (e.g. 24 hours, not 48, before a pedicure).

## Writing rules

- **Stems:** short and plain, like the NIC samples. 18 words max; most under 12.
- **Choices:** 8 words max, parallel in form, no "all/none of the above". Correct letters spread evenly across A–D.
- **Why / 为什么 (`explanation`):** the reason, in plain ESL English, 35 words max. Full Chinese translation with the English exam term kept beside it, e.g. ringworm（癣）.
- **Lock this / 记重点 (`lockPoint`):** a memory hook, 20 words max. It must add something the answer and the Why line do not. Never just restate the answer.

### Memory hook types (`hookType`)

Use the one that fits best. Every hook must be true.

| hookType | What it does | Example |
|---|---|---|
| `word-parts` | Real English word parts | Non = no, patho = disease, genic = makes. |
| `word-origin` | Real origin of the word | Scabies comes from an old word for "scratch". |
| `word-link` | A known word that sounds the same and shares the meaning | Communicable sounds like communicate. |
| `chinese-character` | What the Chinese characters show | 炎 = two 火: inflammation is fire in the tissue. |
| `picture` | An everyday image | A wet towel in a dark drawer: bacteria grow there. |
| `comparison` | A simple comparison | Skin is the wall; white blood cells are the guards. |
| `reason-chain` | Cause → effect steps | Razor → tiny cuts → water germs get in. |
| `real-life` | A situation learners know | Cold or flu? Antibiotics won't help. |
| `name-trap` | The name misleads, so say so | Ringworm: no worm, it's a fungus. |
| `real-acronym` | Letters of a real abbreviation | MRSA: R = Resistant, S = Staph. |
| `contrast` | Only when nothing above fits: how to tell it from the trap | Droplets fall fast; airborne particles float. |

**Banned:** rhymes, puns, made-up acronyms, and false word origins (e.g. "in-direct" does not mean "in between").
