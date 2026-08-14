function uniqueIds(items) {
  return [...new Set((items || []).map((item) => item.id).filter(Boolean))]
}

function collectHeldReleaseErrors(shippedIds, heldIds) {
  const shipped = new Set(shippedIds)
  return [...heldIds].filter((id) => shipped.has(id)).map((id) => `${id}: held question must not enter released JSON`)
}

function collectOmittedReleaseErrors(shippedIds, omittedIds) {
  const shipped = new Set(shippedIds)
  return [...omittedIds].filter((id) => shipped.has(id)).map((id) => `${id}: omitted question must not enter released JSON`)
}

function learnerTextContainsQuarantined(value) {
  if (typeof value === "string") return /quarantined/i.test(value)
  if (Array.isArray(value)) return value.some(learnerTextContainsQuarantined)
  if (value && typeof value === "object") {
    return Object.values(value).some(learnerTextContainsQuarantined)
  }
  return false
}

function collectHeldReasonErrors(heldQuestions) {
  const errors = []
  for (const question of heldQuestions || []) {
    const en = question?.reviewReason?.en?.trim()
    const zh = question?.reviewReason?.zh?.trim()
    if (!en) errors.push(`${question?.id || "(missing id)"}: missing English review reason`)
    if (!zh) errors.push(`${question?.id || "(missing id)"}: missing Chinese review reason`)
  }
  return errors
}

const distractorStopWords = new Set([
  "a", "an", "the", "to", "of", "and", "or", "in", "on", "at", "for", "with",
  "is", "are", "be", "from", "it", "they", "that", "this", "only", "use", "used",
])

function distractorStem(word) {
  if (word.endsWith("ies") && word.length > 4) return `${word.slice(0, -3)}y`
  if (/(?:ses|xes|zes|ches|shes)$/.test(word) && word.length > 4) return word.slice(0, -2)
  if (word.endsWith("s") && word.length > 3) return word.slice(0, -1)
  return word
}

function distractorTerms(value) {
  return new Set((String(value).toLowerCase().match(/[a-z0-9]+/g) || [])
    .filter((word) => !distractorStopWords.has(word))
    .map(distractorStem))
}

function isSubset(left, right) {
  return [...left].every((term) => right.has(term))
}

function collectAuthoredDistractorErrors(questions) {
  const errors = []
  const intentionalContrastIds = new Set([
    "practice-nail-test-n019", // both harmful and beneficial vs only one group
    "practice-nail-test-n029", // all three required properties vs each one alone
    "practice-nail-test-n035", // back-to-front vs front-to-back direction
  ])
  for (const question of questions || []) {
    if (question?.choicesOrigin !== "authored-distractors") continue
    const correct = (question.choices || []).find((choice) => choice.id === question.correctChoice)
    if (!correct || intentionalContrastIds.has(question.id)) continue
    const correctTerms = distractorTerms(correct.en)
    for (const choice of question.choices || []) {
      if (choice.id === question.correctChoice) continue
      const wrongTerms = distractorTerms(choice.en)
      if (!correctTerms.size || !wrongTerms.size) continue
      const overlap = [...correctTerms].filter((term) => wrongTerms.has(term)).length
      const union = new Set([...correctTerms, ...wrongTerms]).size
      const nearContainment = isSubset(correctTerms, wrongTerms) || isSubset(wrongTerms, correctTerms)
      if (nearContainment || overlap / union >= 0.75) {
        errors.push(`${question.id}: distractor ${choice.id} is too close to the correct answer (${choice.en})`)
      }
    }
  }
  return errors
}

module.exports = {
  uniqueIds,
  collectHeldReleaseErrors,
  collectOmittedReleaseErrors,
  learnerTextContainsQuarantined,
  collectHeldReasonErrors,
  collectAuthoredDistractorErrors,
}
