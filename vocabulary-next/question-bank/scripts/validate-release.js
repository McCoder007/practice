#!/usr/bin/env node
/** Deploy/prebuild gate. Reads committed release artifacts only; never opens local Word or PDF sources. */

const fs = require("node:fs")
const path = require("node:path")
const { contentHash } = require("./canonical.cjs")
const {
  collectHeldReasonErrors,
  collectHeldReleaseErrors,
  collectOmittedReleaseErrors,
  collectAuthoredDistractorErrors,
  learnerTextContainsQuarantined,
} = require("./release-invariants.cjs")

const root = path.resolve(__dirname, "..")
const errors = []
const fail = (message) => errors.push(message)
const bannedEnglish = /the exam answer is|keep this wording|remember this wording|read the source warning/i
const bannedChinese = /这道题的考试答案是|请记住这个说法|请先阅读警告|原始资料答案\s*=/
const genericIdentity = /builder|generator|script|automation|practice-bank/i
const doublePunctuation = /\.\.|。。|\?\.|!\.|！！|？？/

function readJson(relative) {
  const file = path.join(root, relative)
  if (!fs.existsSync(file)) {
    fail(`${relative}: missing`)
    return null
  }
  try {
    return JSON.parse(fs.readFileSync(file, "utf8"))
  } catch (error) {
    fail(`${relative}: invalid JSON (${error.message})`)
    return null
  }
}

function words(value) {
  return (value.match(/[A-Za-z0-9]+(?:[-'][A-Za-z0-9]+)*/g) || [])
}

function normalizedTerms(value) {
  return new Set(words(value.toLowerCase()).filter((word) => word.length > 2))
}

function similarity(left, right) {
  const a = normalizedTerms(left)
  const b = normalizedTerms(right)
  if (!a.size || !b.size) return 0
  const intersection = [...a].filter((term) => b.has(term)).length
  const union = new Set([...a, ...b]).size
  return intersection / union
}

function usableAuthorityRefs(refs) {
  return Array.isArray(refs) && refs.length > 0 && refs.every((ref) =>
    ref && typeof ref === "object" && ref.source && ref.section && (ref.printedPage || ref.pdfPage),
  )
}

const shipped = readJson("practice/questions.json")
const ledgerDoc = readJson("reports/review-ledger.json")
const idMap = readJson("sources/id-map.json")
const manifest = readJson("sources/manifest.json")
const staging = readJson("practice/staging.json")
const heldDoc = readJson("practice/questions-to-review.json")
if (!shipped || !ledgerDoc || !idMap || !manifest || !staging || !heldDoc) {
  console.error(errors.join("\n"))
  process.exit(1)
}

const questions = shipped.questions || []
const ledger = new Map((ledgerDoc.records || []).map((row) => [row.id, row]))
const ids = new Set()
const approvedAuthoredFamilies = new Set([
  "angle", "bone", "duration", "infection-term", "massage", "muscle",
  "nail-anatomy", "nail-condition", "nail-shape", "nerve", "organ",
  "organization", "percentage", "skin-layer", "timing", "tool",
  "action-or-procedure", "method-or-manner", "product-or-substance", "technical-term",
])

if (!manifest.scriptVersion) fail("manifest missing scriptVersion")
if (!Array.isArray(questions)) fail("questions.json missing questions array")
if (!questions.length && shipped.releaseState !== "remediation-hold") {
  fail("empty release requires releaseState remediation-hold")
}
if (questions.length && shipped.releaseState !== "active") {
  fail("non-empty release requires releaseState active")
}

for (const question of questions) {
  const context = question?.id || "(missing id)"
  if (!question?.id) {
    fail("shipped record missing id")
    continue
  }
  if (ids.has(question.id)) fail(`${context}: duplicate shipped id`)
  ids.add(question.id)
  if (question.status !== "approved") fail(`${context}: status must be approved`)
  if (!idMap[question.id]) fail(`${context}: missing from id-map`)
  const row = ledger.get(question.id)
  if (!row) {
    fail(`${context}: missing from review ledger`)
    continue
  }
  for (const field of ["answerReviewStatus", "teachingCopyStatus", "englishReviewStatus", "chineseReviewStatus"]) {
    if (row[field] !== "pass") fail(`${context}: ${field} must be pass`)
  }
  if (row.transcriptionStatus !== "pass") fail(`${context}: transcriptionStatus must be pass`)
  if (["quarantined", "fail", "approved-override"].includes(row.disputeStatus)) {
    fail(`${context}: unresolved or automatic disputeStatus ${row.disputeStatus}`)
  }
  if (row.contentHash !== contentHash(question)) fail(`${context}: contentHash does not match ledger`)
  if (row.reviewCandidateHash !== row.contentHash) fail(`${context}: reviewed candidate hash does not match released content`)
  if (!question.explanation?.en || !question.explanation?.zh) fail(`${context}: missing bilingual explanation`)
  if (!question.lockPoint?.en || !question.lockPoint?.zh) fail(`${context}: missing bilingual lockPoint`)
  if (!question.teachingRelation) fail(`${context}: missing teachingRelation`)
  if (!usableAuthorityRefs(row.authorityRefs)) fail(`${context}: missing usable authority references`)

  const author = (row.author || "").trim()
  if (!author || genericIdentity.test(author)) fail(`${context}: missing or generic author identity`)
  for (const role of ["answer", "teaching", "english", "chinese"]) {
    const reviewer = (row[`${role}Reviewer`] || "").trim()
    if (!reviewer || genericIdentity.test(reviewer)) fail(`${context}: missing or generic ${role} reviewer`)
    if (reviewer === author) fail(`${context}: ${role} reviewer cannot equal author`)
    if (!row[`${role}ReviewedAt`]) fail(`${context}: missing ${role} review date`)
  }

  const allTeaching = [
    question.explanation.en,
    question.explanation.zh,
    question.lockPoint.en,
    question.lockPoint.zh,
  ].join(" ")
  if (bannedEnglish.test(`${question.explanation.en} ${question.lockPoint.en}`)) fail(`${context}: banned English stock phrase`)
  if (bannedChinese.test(`${question.explanation.zh} ${question.lockPoint.zh}`)) fail(`${context}: banned Chinese stock phrase`)
  if (doublePunctuation.test(allTeaching)) fail(`${context}: double punctuation in teaching copy`)
  if (words(question.explanation.en).length > 35) fail(`${context}: English explanation exceeds 35 words`)
  if (words(question.lockPoint.en).length > 20) fail(`${context}: English lock point exceeds 20 words`)
  if (/^.+\s=\s.+\.\s*Not\s/i.test(question.lockPoint.en)) fail(`${context}: legacy mechanical Not-X lock pattern`)
  if (similarity(question.explanation.en, `${question.question.en} ${question.answerEn || ""}`) >= 0.82) {
    fail(`${context}: explanation is too similar to the question and answer`)
  }
  if (/TODO|PLACEHOLDER|待翻译/i.test(`${question.explanation.zh}${question.lockPoint.zh}${question.question?.zh || ""}`)) {
    fail(`${context}: placeholder translation marker`)
  }

  const correct = (question.choices || []).find((choice) => choice.id === question.correctChoice)
  if (!correct) fail(`${context}: correctChoice not in choices`)
  if (!Array.isArray(question.choices) || question.choices.length !== 4) fail(`${context}: expected 4 choices`)
  if (question.choicesOrigin === "authored-distractors") {
    if (!question.distractorFamily) fail(`${context}: authored distractors missing distractorFamily`)
    if (!approvedAuthoredFamilies.has(question.distractorFamily) && !question.distractorFamily.startsWith("curated:")) {
      fail(`${context}: authored distractor family ${question.distractorFamily} is not release-approved`)
    }
    if (question.kind === "open-ended" && correct?.en !== question.answerEn) {
      fail(`${context}: correct choice must exactly match original answerEn`)
    }
    if (question.displayAnswerEn) fail(`${context}: displayAnswerEn overrides are forbidden`)
  }
  for (const correction of question.sourceChoiceCorrections || []) {
    const choice = (question.choices || []).find((item) => item.id === correction.choiceId)
    if (question.choicesOrigin !== "source") fail(`${context}: source choice correction requires source choices`)
    if (!choice || choice.sourceEn !== correction.sourceEn || choice.en !== correction.displayEn) {
      fail(`${context}: source choice correction does not match rendered choice`)
    }
    if (!correction.reason || correction.sourceEn === correction.displayEn) {
      fail(`${context}: source choice correction lacks an auditable change reason`)
    }
  }
  if (question.sourceWarning) {
    if (row.disputeStatus !== "resolved") fail(`${context}: warned source answer requires explicit resolution`)
    if (!["source-key-confirmed", "learner-answer-corrected"].includes(row.resolutionOutcome)) {
      fail(`${context}: invalid source-warning resolution outcome`)
    }
    if (!row.resolutionNote || !usableAuthorityRefs(row.resolutionAuthorityRefs)) {
      fail(`${context}: source-warning resolution lacks note or usable authority`)
    }
  }
}

const stagingQuestions = staging.questions || []
const heldIds = stagingQuestions.filter((question) => question.status === "quarantined").map((question) => question.id)
const omittedIds = stagingQuestions.filter((question) => question.status === "omitted").map((question) => question.id)
const heldQuestions = heldDoc.questions || []
for (const message of collectHeldReleaseErrors(ids, heldIds)) fail(message)
for (const message of collectOmittedReleaseErrors(ids, omittedIds)) fail(message)
if (heldIds.length !== 125) fail(`expected 125 held questions in staging, found ${heldIds.length}`)
if (omittedIds.length !== 2) fail(`expected 2 omitted questions in staging, found ${omittedIds.length}`)
if (questions.length && questions.length !== 348) fail(`expected 348 approved shipped questions, found ${questions.length}`)
if (heldQuestions.length !== heldIds.length) fail(`questions-to-review count ${heldQuestions.length} does not match staging held count ${heldIds.length}`)
if (new Set(heldQuestions.map((question) => question.id)).size !== heldQuestions.length) fail("duplicate IDs in questions-to-review.json")
for (const held of heldQuestions) {
  if (ids.has(held.id)) fail(`${held.id}: held question appeared in released JSON because a Chinese review reason exists`)
  if (held.status) fail(`${held.id}: learner-facing held record must not expose internal status`)
}
for (const message of collectHeldReasonErrors(heldQuestions)) fail(message)
for (const message of collectAuthoredDistractorErrors(questions)) fail(message)
if (learnerTextContainsQuarantined({
  title: heldDoc.title,
  notice: heldDoc.notice,
  labels: heldDoc.labels,
  questions: heldQuestions,
})) {
  fail("learner-facing held-question data contains the word quarantined")
}

if (errors.length) {
  console.error(errors.join("\n"))
  process.exit(1)
}
console.log(`release ok: ${questions.length} shipped questions (${shipped.releaseState})`)
