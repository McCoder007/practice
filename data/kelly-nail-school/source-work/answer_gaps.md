# Answer / extraction gaps

- Items needing attention: **0**

## Dropped from published bank entirely (4)

These were pulled out of `extracted.md`/`extracted.jsonl` rather than kept with a `needs-review` flag, because the answer key could not be confidently verified against the source photos (either the on-screen UI is broken and shows no valid answer text, or the key is an unverified domain-knowledge guess with zero photographic evidence of the correct choice):

- **Disposal of chemical products in a nail salon must follow regulations established by:**
  - Choices: ['EPA', 'FDA', 'OSHA', 'CDC']
  - Last key on file: A (domain-knowledge)
  - Photos: ['IMG_4351.JPG']
  - Why dropped: IMG_4351: real on-screen choices are EPA/FDA/OSHA/CDC (extractor had mistaken the Next-Question button for choice A, shifting choices and dropping CDC). EPA regulates disposal of chemical/hazardous waste; no on-screen selection visible, so flagged for human confirmation vs. OSHA.
- **Disinfection means:**
  - Choices: ['Complete sterilization', '(source UI split: Sterili / ation)', 'Disinfection', 'Scrubbing/cleaning']
  - Last key on file: ??? (needs-review)
  - Photos: ['IMG_4359.JPG', 'IMG_4456.JPG']
  - Why dropped: IMG_4359: source UI options are broken (Sterilization split A/B). Human key needed from instructor/DLL.
- **During weekly disinfection of a pedicure spa, the disinfectant solution should remain in the basin for:**
  - Choices: ['Overnight', '10 minutes', '1 hour', '30 seconds']
  - Last key on file: B (domain-knowledge)
  - Photos: ['IMG_4384.JPG']
  - Why dropped: IMG_4384: real on-screen choices are Overnight/10 minutes/1 hour/30 seconds (extractor had mistaken the Next-Question button for choice A and dropped '30 seconds'). Standard pedicure-spa disinfectant contact time is 10 minutes, but no on-screen selection is visible — flagged for human confirmation.
- **Sterilization means:**
  - Choices: ['Cleaning', 'Disinfection', 'Sterili', 'ation']
  - Last key on file: ??? (needs-review)
  - Photos: ['IMG_4436.JPG', 'IMG_4461.JPG']
  - Why dropped: IMG_4436/IMG_4461: source UI splits 'Sterilization' across choices C/D (same broken-UI defect as kelly-014), leaving only Cleaning/Disinfection as real distinct choices — neither correctly defines sterilization (complete destruction of all microorganisms including spores). No on-screen answer selection visible in either photo. Needs human key from instructor/DLL, same as kelly-014.
