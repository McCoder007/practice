# Topic word reels and look-alike drills

One file per exam topic: `<order>-<topicId>.json` (e.g. `2-anatomy-physiology.json`). Each file feeds:

- the topic's **Word Reel** (swipe cards: word, how to say it, Chinese, one example sentence), and
- the **Look-alike drill** (pick which look-alike word matches a short meaning).

Learners are Chinese-speaking ESL students at about level 2 who take the NIC exam in English. The bank's main [README](../README.md) rules apply: no wrong facts, plain level-2 English, no Latin/Greek/French word origins.

## File shape

```json
{
  "topicId": "anatomy-physiology",
  "status": "draft",
  "words": [
    {
      "setId": "2A",
      "word": "eponychium",
      "sayIt": "ep-oh-NICK-ee-um",
      "translation": "甲上皮",
      "partOfSpeech": "Noun",
      "example": "The eponychium is living skin at the base of the nail.",
      "exampleTranslation": "甲上皮是指甲根部的活皮肤。",
      "evidence": [{ "pdfPage": 123, "quote": "exact words from that textbook page" }]
    }
  ],
  "lookAlikes": [
    {
      "id": "eponychium-hyponychium",
      "setId": "2A",
      "items": [
        { "word": "eponychium", "translation": "甲上皮", "meaning": { "en": "living skin at the nail base", "zh": "指甲根部的活皮肤" } },
        { "word": "hyponychium", "translation": "甲下皮", "meaning": { "en": "skin under the free edge", "zh": "游离缘下面的皮肤" } }
      ],
      "tip": { "en": "Hypo- = under: the hyponychium hides under the free edge. The eponychium is at the base.", "zh": "hypo- = 下面。看中文：甲下皮在指尖下面，甲上皮在指甲根部。" },
      "evidence": [{ "pdfPage": 123, "quote": "…" }]
    }
  ]
}
```

`status` is `draft` until the content is fact-checked, then `reviewed`. Only `reviewed` files ship.

## Which words

- **8–12 words per set** (3–12 for a short More Key Facts set), in the set's order. Pick the hard exam terms a learner must know to read and answer that set's questions: technical names, disorders, product and tool names, process words. Skip everyday words a level-2 learner knows (hand, water, clean).
- **Each word appears once in the whole bank.** If two sets use it, it goes in the first set. Exception: a More Key Facts set may hold a word an earlier set mentions in passing when that earlier set already has 12 cards.
- **Use the exact spelling the questions use**, and the same Chinese term the questions' `zh` text uses for it.

## Each card

- `word`: the term as it appears on the exam. Lowercase unless it is a name (e.g. "Safety Data Sheet").
- `sayIt` (optional): how to say it, for words a learner would struggle to pronounce (most 3+ syllable technical terms). Plain English sound chunks joined by hyphens, with the stressed chunk in CAPS: `ep-oh-NICK-ee-um`, `ahn-ih-KAHL-ih-sis` (onycholysis). Must match the standard American pronunciation. Leave it out for easy words.
- `translation`: the Chinese term, short (no explanation).
- `partOfSpeech`: `Noun`, `Verb`, `Adjective`, or `Phrase`.
- `example`: one short, true sentence that uses the word and shows what it means. **12 words max**, level-2 English, present tense where possible. It must be true by Milady and backed by `evidence`.
- `exampleTranslation`: natural Chinese translation of the example.
- `evidence`: at least one exact quote (5+ words) from the cited PDF page that supports the example. Same rules as the question sets.

## Look-alike groups

- **2 or 3 words that learners mix up** because they look or sound alike, or are close in meaning: e.g. eponychium / hyponychium, sudoriferous / sebaceous glands, cleaning / disinfecting / sterilizing, monomer / polymer.
- **3–6 groups per topic.** Words in a group don't need to be on the word cards.
- `meaning.en`: 8 words max, plain English, true, and it must fit **only** that word in the group. The drill asks "Which word means: <meaning>?"
- `tip` (**required**): a memory hook for **which one is which**, 20 words max. See below.
- `evidence`: quotes that support every meaning in the group.

### Tips: how to remember which is which

The learner sees the tip after each drill answer. It must help them pick the right word next time, not just repeat the meanings. Write for ESL level 2: short sentences, everyday words, no Latin/Greek/French origins. Every tip must be true.

Use what fits best:

| Kind | Example |
|---|---|
| **Letters inside the word** | **Tap**otement starts with "tap": tap, tap, tap. |
| **A sound-alike English word** | Ef**fl**eurage sounds like "flow": smooth, flowing strokes. |
| **Body cue** (do it now) | Flex your arm: flexors bend it. Extensors make it straight again. |
| **Exam-term parts that repeat** (no language names) | Hypo- = under: hyponychium is under the free edge. Mono = one, poly = many. |
| **Order or size** | Clean → disinfect → sterilize: each step kills more. |
| **The Chinese name** (in `zh` only) | 甲上皮 = 上 (on top, at the base); 甲下皮 = 下 (under the tip). |

The `zh` tip is a Chinese version of the English tip and may add a Chinese-character hook when the Chinese names show the difference. The English tip must not contain Chinese characters. Banned: rhymes, puns, made-up acronyms, false word parts.

## Checks

- `npm run validate:nic-word-reels` checks format and limits (runs anywhere).
- `npm run verify:nic-domain-evidence -- <pages.jsonl>` also checks every word-reel quote.
