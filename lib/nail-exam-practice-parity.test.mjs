import assert from "node:assert/strict"
import { readFileSync } from "node:fs"
import { dirname, join } from "node:path"
import test from "node:test"
import { fileURLToPath } from "node:url"

import {
  LEARNER_FACING_QUESTION_COUNT,
  NAIL_EXAM_BANKS,
  bankGroupCards,
  orderedQuestionsForBank,
  sliceBankGroup,
} from "../data/nail-exam-practice/catalog.ts"
import { examQuestionToQaCard } from "./nail-technician-qa-reel.ts"

const root = join(dirname(fileURLToPath(import.meta.url)), "..")

function loadApprovedPool(relativePath) {
  const release = JSON.parse(readFileSync(join(root, relativePath), "utf8"))
  return release.questions
    .filter((question) => question.status === "approved")
    .map((question) => ({
      id: question.id,
      question: question.question,
      choices: question.choices,
      correctChoiceId: question.correctChoice,
      explanation: question.explanation,
      lockPoint: question.lockPoint,
      sourceWarning: question.sourceWarning,
    }))
}

const officialPool = loadApprovedPool("question-bank/official-practice/questions.json")
const practicePool = loadApprovedPool("question-bank/practice/questions.json")

function poolFor(bank) {
  return bank.pool === "official" ? officialPool : practicePool
}

test("every approved question converts to a Study Card from the keyed correct choice", () => {
  const seenIds = new Set()

  for (const bank of NAIL_EXAM_BANKS) {
    const ordered = orderedQuestionsForBank(poolFor(bank), bank)
    assert.equal(ordered.length, bank.approvedCount)

    for (const question of ordered) {
      assert.ok(question.id?.trim(), "question id must be stable and non-empty")
      assert.equal(seenIds.has(question.id), false, `duplicate learner-facing id ${question.id}`)
      seenIds.add(question.id)

      const card = examQuestionToQaCard(question)
      assert.equal(card.id, question.id)
      assert.equal(card.question.en, question.question.en)
      assert.equal(card.question.zh, question.question.zh)
      assert.equal(card.answerId, question.correctChoiceId)
      const keyedChoice = question.choices.find((choice) => choice.id === question.correctChoiceId)
      assert.equal(card.answer.en, keyedChoice.en)
      assert.equal(card.answer.zh, keyedChoice.zh)
      assert.notEqual(card.answerId, "A")
      assert.notEqual(card.answerId, "B")
      assert.notEqual(card.answerId, "C")
      assert.notEqual(card.answerId, "D")
    }
  }

  assert.equal(seenIds.size, LEARNER_FACING_QUESTION_COUNT)
})

test("Multiple Choice and Study Cards inventories match by id, group, and order", () => {
  const combined = []

  for (const bank of NAIL_EXAM_BANKS) {
    const pool = poolFor(bank)
    const multipleChoiceIds = orderedQuestionsForBank(pool, bank).map((question) => question.id)
    const studyCardIds = orderedQuestionsForBank(pool, bank).map((question) => examQuestionToQaCard(question).id)

    assert.equal(multipleChoiceIds.length, bank.approvedCount)
    assert.deepEqual(studyCardIds, multipleChoiceIds)

    const groups = bankGroupCards(bank)
    assert.equal(groups.length, bank.groupCount)

    for (const group of groups) {
      const mcGroup = sliceBankGroup(pool, bank, group.offset).map((question) => question.id)
      const scGroup = sliceBankGroup(pool, bank, group.offset).map((question) => examQuestionToQaCard(question).id)
      assert.equal(mcGroup.length, group.count)
      assert.deepEqual(scGroup, mcGroup)
      if (group !== groups.at(-1)) {
        assert.equal(mcGroup.length, 20)
      }
    }

    combined.push(...multipleChoiceIds)
  }

  assert.equal(combined.length, LEARNER_FACING_QUESTION_COUNT)
  assert.equal(new Set(combined).size, LEARNER_FACING_QUESTION_COUNT)
})
