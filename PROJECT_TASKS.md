# Project Status

## Completed

- Scaffolded new Next.js (v15, App Router) project under `vocabulary-next`
- Installed and configured Tailwind CSS via `create-next-app --app --tw`
- Added shadcn-ui components: `Button`, `Card`, `ScrollArea`
- Installed `next-themes` and created `ThemeProvider` wrapper
- Updated `app/layout.tsx` to wrap pages in `ThemeProvider` and suppress hydration warning
- Migrated VocabularyPractice page:
  - Copied `page.tsx` example
  - Installed `framer-motion`, `lucide-react`
  - Integrated inline data, then transformed into `data/vocabulary.ts` module
  - Replaced stub `playAudio` with browser Web Speech API fallback
- Ported Prepositions practice:
  - Copied raw data (`level1Data.js`, `level2Data.js`) to `data/`
  - Created `data/levels.ts` to type and export levels array
  - Built reusable `components/Quiz.tsx` component
  - Scaffolded `app/prepositions/page.tsx` with level selection and quiz
- Ported Verb Tenses practice:
  - Copied `rawVerbTensesData.js` to `data`
  - Created `data/verbTenses.ts` with TS interfaces
  - Scaffolded `app/verb-tenses/page.tsx` using `<Quiz>`
- Updated `Quiz.tsx` to render blanks as underlined spans instead of literal underscores
- Moved Vocabulary practice to `/vocabulary` and created full-page `/` menu linking all modules
- Ported Irregular Verbs quiz:
  - Copied stage data (`rawIrregularVerbStage[1-5].js`) to `data`
  - Created `data/irregularVerbs.ts` mapping stages for `<Quiz>`
  - Scaffolded `app/irregular-verbs/page.tsx` with stage selection and quiz
- Ported Irregular Verb Lists:
  - Copied `rawIrregularVerbListsData.js` to `data`
  - Created `data/irregularVerbLists.ts` for typed stage lists
  - Scaffolded `app/irregular-verb-lists/page.tsx` with stage selection and list display
- Updated navigation to full-page Practice Menu at `/` and removed header links

## Remaining

1. Polish Prepositions flow:
   - Address question over-usage (group similar items or reduce length)
   - Tune UI spacing, typography, feedback states
2. (Optional) Automate Google TTS audio generation via GitHub Actions and serve from `/public/audio/*`
3. Merge and prepare for deployment on GitHub Pages/Vercel 