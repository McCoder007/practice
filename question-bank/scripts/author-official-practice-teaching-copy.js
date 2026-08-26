#!/usr/bin/env node
/**
 * Phase 3 - Official Exam Practice pool.
 * Validates five independently authored 20-question teaching-copy batches and
 * assembles official-practice/teaching-copy.json. It never writes to the
 * Phase 1 or Phase 2 outputs.
 */
const fs = require("node:fs");
const path = require("node:path");
const { auditEntry } = require("./teaching-copy-quality.cjs");

const ROOT = path.join(__dirname, "..", "official-practice");
const BATCH_DIR = path.join(ROOT, "batches");
const STAGING_PATH = path.join(ROOT, "staging.json");
const TRANSLATED_PATH = path.join(ROOT, "translated.json");
const OUTPUT_PATH = path.join(ROOT, "teaching-copy.json");
const AUDIT_PATH = path.join(ROOT, "phase-3-audit.json");

const EXPECTED_BATCHES = [
  "01-scientific-concepts-001-020.json",
  "02-scientific-concepts-021-040.json",
  "03-procedures-041-060.json",
  "04-procedures-061-080.json",
  "05-procedures-081-100.json",
];
const BANNED_ENGLISH = /the exam answer is|keep this wording|remember this wording|read the source warning/i;
const BANNED_CHINESE = /这道题的考试答案是|请记住这个说法|请先阅读警告|原始资料答案\s*=/;
const DOUBLE_PUNCTUATION = /\.\.|。。|\?\.|!\.|！！|？？/;

function readJson(file) {
  return JSON.parse(fs.readFileSync(file, "utf8"));
}

function englishWordCount(value) {
  return (value.match(/[A-Za-z0-9]+(?:[-'][A-Za-z0-9]+)*/g) || []).length;
}

function assert(condition, message) {
  if (!condition) throw new Error(message);
}

function main() {
  const staging = readJson(STAGING_PATH);
  const translated = readJson(TRANSLATED_PATH);
  assert(staging.questions.length === 100, "Phase 1 staging must contain 100 questions");
  assert(translated.questions.length === 100, "Phase 2 translation must contain 100 questions");

  const stagedById = new Map(staging.questions.map((question) => [question.id, question]));
  const translatedById = new Map(translated.questions.map((question) => [question.id, question]));
  const entries = {};
  const batchSummary = [];

  for (const filename of EXPECTED_BATCHES) {
    const batch = readJson(path.join(BATCH_DIR, filename));
    const batchEntries = Object.entries(batch.entries || {});
    assert(batchEntries.length === 20, `${filename}: expected exactly 20 entries`);

    for (const [id, compact] of batchEntries) {
      assert(!entries[id], `${filename}: duplicate id ${id}`);
      const staged = stagedById.get(id);
      const translatedQuestion = translatedById.get(id);
      assert(staged && translatedQuestion, `${filename}: unknown id ${id}`);

      // Phase 3 must not hide upstream source drift.
      assert(translatedQuestion.correctChoice === staged.correctChoice, `${id}: correctChoice drifted before Phase 3`);
      assert(translatedQuestion.question.en === staged.question.en, `${id}: question.en drifted before Phase 3`);
      assert(
        translatedQuestion.choices.every((choice, index) =>
          choice.id === staged.choices[index].id && choice.en === staged.choices[index].en),
        `${id}: English choices drifted before Phase 3`,
      );

      const [explanationEn, explanationZh] = compact.why || [];
      const [lockEn, lockZh] = compact.lock || [];
      for (const [label, value] of Object.entries({ explanationEn, explanationZh, lockEn, lockZh })) {
        assert(typeof value === "string" && value.trim(), `${id}: missing ${label}`);
      }
      const whyWords = englishWordCount(explanationEn);
      const lockWords = englishWordCount(lockEn);
      assert(whyWords >= 12 && whyWords <= 30, `${id}: Why must be 12-30 English words; found ${whyWords}`);
      assert(lockWords <= 20, `${id}: Lock this exceeds 20 English words; found ${lockWords}`);
      assert(!BANNED_ENGLISH.test(`${explanationEn} ${lockEn}`), `${id}: banned English stock phrase`);
      assert(!BANNED_CHINESE.test(`${explanationZh} ${lockZh}`), `${id}: banned Chinese stock phrase`);
      assert(!DOUBLE_PUNCTUATION.test(`${explanationEn} ${explanationZh} ${lockEn} ${lockZh}`), `${id}: double punctuation`);
      assert(compact.relation, `${id}: missing teaching relation`);
      assert(Array.isArray(compact.refs) && compact.refs.length, `${id}: missing authority reference`);

      entries[id] = {
        id,
        explanation: { en: explanationEn, zh: explanationZh },
        lockPoint: { en: lockEn, zh: lockZh },
        teachingRelation: compact.relation,
        authorityRefs: compact.refs.map(([section, printedPage, pdfPage]) => ({
          source: batch.authoritySource,
          section,
          printedPage,
          pdfPage,
        })),
        author: batch.author,
        authoredAt: batch.authoredAt,
      };
    }

    batchSummary.push({ filename, entries: batchEntries.length });
  }

  const expectedIds = staging.questions.map((question) => question.id);
  assert(Object.keys(entries).length === 100, "Expected 100 unique teaching-copy entries");
  assert(
    Object.keys(entries).every((id, index) => id === expectedIds[index]),
    "Teaching-copy ids must match Phase 1 source order exactly",
  );

  const output = {
    schemaVersion: "1.0.0",
    language: { source: "en", translation: "zh-Hans" },
    generatedAt: new Date().toISOString(),
    batches: batchSummary,
    entries,
  };
  const audits = translated.questions.map((question) => auditEntry(question.id, entries[question.id], question));
  const flagged = audits.filter((row) => row.flags.length);
  assert(flagged.length === 0, `Teaching-copy quality flags:\n${JSON.stringify(flagged, null, 2)}`);
  const auditOutput = {
    generatedAt: output.generatedAt,
    totalQuestions: audits.length,
    bilingualEntries: Object.values(entries).filter((entry) =>
      entry.explanation.en && entry.explanation.zh && entry.lockPoint.en && entry.lockPoint.zh).length,
    batchCounts: batchSummary,
    bannedPhraseHits: 0,
    lengthViolations: 0,
    possibleRestatements: 0,
    sharedQualityFlags: 0,
    longestExplanationWords: Math.max(...audits.map((row) => row.explanationWords)),
    longestLockPointWords: Math.max(...audits.map((row) => row.lockWords)),
    factualReviewNotes: "phase-3-review-notes.json",
  };
  fs.writeFileSync(OUTPUT_PATH, `${JSON.stringify(output, null, 2)}\n`);
  fs.writeFileSync(AUDIT_PATH, `${JSON.stringify(auditOutput, null, 2)}\n`);
  console.log(`Wrote ${Object.keys(entries).length} bilingual teaching-copy entries to ${OUTPUT_PATH}`);
  console.log(`Wrote Phase 3 audit to ${AUDIT_PATH}`);
}

main();
