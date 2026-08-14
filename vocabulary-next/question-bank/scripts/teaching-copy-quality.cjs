const bannedEnglish = /the exam answer is|keep this wording|remember this wording|read the source warning/i
const bannedChinese = /这道题的考试答案是|请记住这个说法|请先阅读警告|原始资料答案\s*=/
const doublePunctuation = /\.\.|。。|\?\.|!\.|！！|？？/
const eslVocabularyWatch = /\b(nonporous|microbial|spores?|invad(?:e|es|ed|ing)|rigid|prohibited|adhesion|intact|barrier|particles?|ventilation|inflamm(?:ation|ed)|disturb(?:s|ed|ing)?|solvent-resistant|exothermic|reliabl(?:e|y))\b/gi

function englishWords(value = "") {
  return value.match(/[A-Za-z0-9]+(?:[-'][A-Za-z0-9]+)*/g) || []
}

function normalizedTerms(value = "") {
  return new Set(englishWords(value.toLowerCase()).filter((word) => word.length > 2))
}

function similarity(left, right) {
  const a = normalizedTerms(left)
  const b = normalizedTerms(right)
  if (!a.size || !b.size) return 0
  const overlap = [...a].filter((term) => b.has(term)).length
  return overlap / new Set([...a, ...b]).size
}

function escapedRegExp(value) {
  return value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")
}

function auditEntry(id, entry, question) {
  const flags = []
  const explanationEn = entry?.explanation?.en || ""
  const explanationZh = entry?.explanation?.zh || ""
  const lockEn = entry?.lockPoint?.en || ""
  const lockZh = entry?.lockPoint?.zh || ""
  if (!explanationEn || !explanationZh || !lockEn || !lockZh) flags.push("missing-bilingual-copy")
  if (bannedEnglish.test(`${explanationEn} ${lockEn}`)) flags.push("banned-english-phrase")
  if (bannedChinese.test(`${explanationZh} ${lockZh}`)) flags.push("banned-chinese-phrase")
  if (englishWords(explanationEn).length > 35) flags.push("explanation-over-35-words")
  if (englishWords(lockEn).length > 20) flags.push("lock-over-20-words")
  if (doublePunctuation.test(`${explanationEn} ${explanationZh} ${lockEn} ${lockZh}`)) flags.push("double-punctuation")
  if (/^.+\s=\s.+\.\s*Not\s/i.test(lockEn)) flags.push("mechanical-not-x-lock")
  const answer = question
    ? (question.choices || []).find((choice) => choice.id === question.correctChoice)?.en || question.answerEn || ""
    : ""
  const definedExamTerms = Array.isArray(entry?.definedExamTerms) ? entry.definedExamTerms : []
  const validDefinedTerms = definedExamTerms.filter((term) => {
    if (typeof term !== "string" || !term.trim()) return false
    const normalized = term.trim()
    const definitionPattern = new RegExp(`\\b${escapedRegExp(normalized)}\\s+(?:is|are|means?)\\b`, "i")
    return answer.toLowerCase().includes(normalized.toLowerCase()) && definitionPattern.test(explanationEn)
  })
  if (definedExamTerms.length !== validDefinedTerms.length) flags.push("invalid-defined-exam-term")
  const definedWords = new Set(validDefinedTerms.flatMap((term) => englishWords(term.toLowerCase())))
  const watchedWords = [...`${explanationEn} ${lockEn}`.matchAll(eslVocabularyWatch)]
    .map((match) => match[0].toLowerCase())
    .filter((word) => !definedWords.has(word))
  if (watchedWords.length) flags.push(`esl-vocabulary-watch:${[...new Set(watchedWords)].join(",")}`)
  if (!entry?.teachingRelation) flags.push("missing-teaching-relation")
  const refs = entry?.authorityRefs
  if (!Array.isArray(refs) || !refs.length || refs.some((ref) => !ref?.source || !ref?.section || !(ref?.printedPage || ref?.pdfPage))) {
    flags.push("weak-authority-reference")
  }
  if (!entry?.author || !entry?.authoredAt) flags.push("missing-author-attribution")
  if (question) {
    if (similarity(explanationEn, `${question.question?.en || ""} ${answer}`) >= 0.82) flags.push("possible-restatement")
  }
  const latinTokens = explanationZh.match(/[A-Za-z][A-Za-z-]*/g) || []
  if (latinTokens.length > 8) flags.push("high-untranslated-english-concentration")
  return { id, flags, explanationWords: englishWords(explanationEn).length, lockWords: englishWords(lockEn).length }
}

module.exports = { auditEntry, bannedChinese, bannedEnglish, doublePunctuation, englishWords, similarity }
