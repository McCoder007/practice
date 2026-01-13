# Archive Directory

This directory contains legacy code and files from the project's evolution from a vanilla JavaScript application to a Next.js application.

**Archive Date:** December 2024

## Contents

### `old-app/`
Root-level files from the original vanilla JavaScript application:
- `app.js` - Main application file
- `index.html` - HTML entry point
- `index.js` - Entry point script
- `data.js` - Data file
- `styles.css` - Stylesheet
- `config.js`, `firebase-config.js` - Configuration files
- `tts.js`, `google-tts.js` - Text-to-speech implementations
- `check-analytics.js` - Analytics checker
- `StudyZone.png` - App icon/image

### `old-data/`
Root-level data files from the original application:
- `level1Data.js`, `level2Data.js` - Level data
- `vocabularyData.js` - Vocabulary data
- `irregularVerbStage1.js` through `irregularVerbStage5.js` - Irregular verb data
- `irregularVerbListsData.js`, `verbTensesData.js` - Quiz data
- `levels.ts`, `rawLevel1Data.ts` - TypeScript data files

### `old-docs/`
Documentation and project files:
- `docs/` - Original documentation folder
- `PROJECT_TASKS.md`, `project-summary.md` - Project documentation
- `text-to-speech-setup.md` - Setup documentation
- `test.md`, `practice/test.md` - Test files
- `github-pages-test.txt` - Test file

### `vocabulary-next-legacy/`
Legacy files from the vocabulary-next directory:
- `data/days/` - Old vocabulary day system (not connected to UI)
- `data/scripts/` - One-time migration and utility scripts:
  - `migrateToDayFiles.js` - Migration script
  - `splitVocabulary.js` - Script that generated `/days` files
  - `addDay13.js`, `addNewDay.js` - Utility scripts
- `data/raw/` - Raw source data files:
  - `rawVocabularyData.ts.archive` - Archived vocabulary data
  - `rawIrregularVerbStage1.js` through `rawIrregularVerbStage5.js`
  - `rawIrregularVerbListsData.js`, `rawVerbTensesData.js`
  - `rawLevel1Data.js`, `rawLevel2Data.js`
- `next.config.js` - Duplicate config file (TypeScript version is used)

### `examples/`
Example and template directories:
- `vocab_example/` - Example/template directory

## Why These Files Were Archived

1. **Root-level files**: The project migrated from a vanilla JavaScript app to a Next.js application. The old app files are no longer used.

2. **vocabulary-next/data/days/**: This directory was part of an older system that is not connected to the UI. The active system uses `vocabulary-next/data/source/` instead.

3. **Migration scripts**: One-time scripts used during the migration process. They are no longer needed for day-to-day operations.

4. **Raw data files**: Source data files that have been processed and are now in the active system.

5. **Duplicate config**: `next.config.js` was replaced by `next.config.ts`.

## Active System

The current active system uses:
- `vocabulary-next/` - Next.js application
- `vocabulary-next/data/source/` - Active vocabulary source files (one per day)
- `vocabulary-next/data/vocabulary.ts` - Active entry point
- `vocabulary-next/data/types.ts` - Type definitions
- `vocabulary-next/data/irregularVerbs.ts`, `verbTenses.ts`, `irregularVerbLists.ts`, `tooEnoughQuizData.ts` - Active quiz data
- `vocabulary-next/data/irregularVerbSentencesData.js` - Active sentence data (kept, not archived)

## Restoration Instructions

If you need to restore any of these files:

1. **Restore a single file:**
   ```bash
   cp archive/old-app/app.js ./
   ```

2. **Restore an entire directory:**
   ```bash
   cp -r archive/old-docs/docs ./
   ```

3. **Restore from git history:**
   ```bash
   git checkout <commit-hash> -- <file-path>
   ```

## Safe Deletion

After thorough testing confirms the Next.js application works correctly without these files, this entire `archive/` directory can be safely deleted.

**Verification Checklist:**
- [ ] Next.js app builds successfully (`npm run build` in vocabulary-next/)
- [ ] All pages load correctly (vocabulary, irregular-verbs, verb-tenses, etc.)
- [ ] Data imports work (vocabulary data loads from source/)
- [ ] No broken imports or missing files
- [ ] Browser console shows no errors
- [ ] Application has been tested in production environment

Once all items are checked, you can delete this archive directory:
```bash
rm -rf archive/
```

## Notes

- All files were moved (not deleted) to preserve history
- The archive is committed to git, so it can be restored from version control
- Keep this archive for a testing period before permanent deletion
- If any file is needed, it can be restored from this archive or git history
