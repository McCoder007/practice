#!/usr/bin/env node
/**
 * Phase 1 of docs/official-exam-practice-plan.md.
 *
 * Rebuilds the mhtml -> JSON extraction from the two Trivie Learn "Results" pages
 * (never from any previously decoded/cached HTML) and writes a source-faithful,
 * English-only staging file: 100 questions, 4 choices each, one correctChoice per
 * question, keyed on Trivie's green (rgb(0, 203, 118)) correct-answer color.
 */

const fs = require("node:fs")
const path = require("node:path")

const root = path.resolve(__dirname, "..", "..")
const tempDir = path.join(root, "question-bank", "Temp")
const outDir = path.join(root, "question-bank", "official-practice")

const SOURCES = [
  {
    file: "NIC Nail Technology Practice Exam - Trivie Learn.mhtml",
    book: "NIC Nail Technology Practice Exam - Trivie Learn",
    expectedCount: 40,
    idStart: 1,
  },
  {
    file: "Results - Trivie Learn Quiz 2.mhtml",
    book: "Nail Technology Procedures - Trivie Learn",
    expectedCount: 60,
    idStart: 41,
  },
]

const CORRECT_GREEN = "rgb(0, 203, 118)"

function decodeQuotedPrintableBytes(qpBytesString) {
  // Byte-level QP decode: operate on the latin1 (1 char == 1 byte) string so that
  // multi-byte UTF-8 sequences split across soft line breaks are reassembled correctly
  // BEFORE any UTF-8 decoding happens. Decoding line-by-line as text first is the
  // classic mhtml mojibake bug (stray "Â" before entities, etc.) this avoids.
  const joined = qpBytesString.replace(/=\r\n/g, "").replace(/=\n/g, "")
  const bytesString = joined.replace(/=([0-9A-Fa-f]{2})/g, (_, hex) =>
    String.fromCharCode(parseInt(hex, 16)),
  )
  return Buffer.from(bytesString, "latin1").toString("utf8")
}

function extractFirstHtmlPart(mhtmlPath) {
  const raw = fs.readFileSync(mhtmlPath).toString("latin1")
  const boundaryMatch = raw.match(/boundary="([^"]+)"/)
  if (!boundaryMatch) throw new Error(`${mhtmlPath}: no MIME boundary found`)
  const boundary = boundaryMatch[1]
  const parts = raw.split(`--${boundary}`)
  const htmlPart = parts.find((part) => /Content-Type:\s*text\/html/i.test(part))
  if (!htmlPart) throw new Error(`${mhtmlPath}: no text/html MIME part found`)

  const headerBodySplit = htmlPart.match(/\r?\n\r?\n/)
  if (!headerBodySplit) throw new Error(`${mhtmlPath}: malformed MIME part (no header/body split)`)
  const headers = htmlPart.slice(0, headerBodySplit.index)
  const body = htmlPart.slice(headerBodySplit.index + headerBodySplit[0].length)

  if (!/Content-Transfer-Encoding:\s*quoted-printable/i.test(headers)) {
    throw new Error(`${mhtmlPath}: expected quoted-printable transfer encoding`)
  }

  return decodeQuotedPrintableBytes(body)
}

function decodeHtmlEntities(text) {
  return text
    // Trivie's export doubly-escapes some entities as literal "&amp;rsquo;" etc,
    // and separately emits a stray U+00C2 immediately before one literal "&nbsp;"
    // (a mangled non-breaking space) -- both are source artifacts, not regex
    // mis-captures, so they're normalized here rather than left as visible junk.
    .replace(/Â&nbsp;/g, " ")
    .replace(/&amp;(rsquo|lsquo|ldquo|rdquo|mdash|ndash|hellip|nbsp|quot|amp|lt|gt|#39|apos|#x27);/g, "&$1;")
    .replace(/&nbsp;/g, " ")
    .replace(/&rsquo;/g, "’")
    .replace(/&lsquo;/g, "‘")
    .replace(/&rdquo;/g, "”")
    .replace(/&ldquo;/g, "“")
    .replace(/&mdash;/g, "—")
    .replace(/&ndash;/g, "–")
    .replace(/&hellip;/g, "…")
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/&apos;/g, "'")
    .replace(/&#x27;/g, "'")
    .replace(/&#(\d+);/g, (_, dec) => String.fromCharCode(parseInt(dec, 10)))
    .replace(/&#x([0-9a-fA-F]+);/g, (_, hex) => String.fromCharCode(parseInt(hex, 16)))
    .replace(/\s+/g, " ")
    .trim()
}

const STEM_RE = /<div dir="auto" class="css-146c3p1[^"]*" style="[^"]*font-weight:\s*600;[^"]*">([\s\S]*?)<\/div>/g
const CHOICE_RE = /<div dir="auto" class="css-146c3p1" style="color:\s*([^;]+);[^"]*">([\s\S]*?)<\/div>/g

function extractQuestionsFromHtml(html, book, expectedCount, idStart) {
  const stemMatches = [...html.matchAll(STEM_RE)].map((m) => ({
    index: m.index,
    end: m.index + m[0].length,
    text: decodeHtmlEntities(m[1]),
  }))

  const reviewIdx = stemMatches.findIndex((s) => s.text === "Review Questions")
  const nextIdx = stemMatches.findIndex((s, i) => i > reviewIdx && s.text === "Next")
  if (reviewIdx === -1 || nextIdx === -1) {
    throw new Error(`Could not locate "Review Questions"/"Next" markers (found reviewIdx=${reviewIdx}, nextIdx=${nextIdx})`)
  }

  const questionStems = stemMatches.slice(reviewIdx + 1, nextIdx)
  const sectionEnd = stemMatches[nextIdx].index
  if (questionStems.length !== expectedCount) {
    throw new Error(`Expected ${expectedCount} question stems, found ${questionStems.length}`)
  }

  const choiceIds = ["a", "b", "c", "d"]
  const questions = []

  questionStems.forEach((stem, i) => {
    const blockEnd = i + 1 < questionStems.length ? questionStems[i + 1].index : sectionEnd
    const block = html.slice(stem.end, blockEnd)

    const choiceMatches = [...block.matchAll(CHOICE_RE)]
    if (choiceMatches.length !== 4) {
      throw new Error(`Question "${stem.text}": expected 4 choices, found ${choiceMatches.length}`)
    }

    let correctChoice = null
    const choices = choiceMatches.map((m, choiceIndex) => {
      const color = m[1].trim()
      const text = decodeHtmlEntities(m[2])
      if (color === CORRECT_GREEN) {
        if (correctChoice) throw new Error(`Question "${stem.text}": more than one green choice`)
        correctChoice = choiceIds[choiceIndex]
      }
      return { id: choiceIds[choiceIndex], en: text }
    })

    if (!correctChoice) throw new Error(`Question "${stem.text}": no green (correct) choice found`)
    if (choices.some((c) => !c.en)) throw new Error(`Question "${stem.text}": empty choice text`)
    if (!stem.text) throw new Error(`Question at index ${i}: empty stem text`)

    const num = idStart + i
    questions.push({
      id: `official-practice-${String(num).padStart(3, "0")}`,
      question: { en: stem.text },
      choices,
      correctChoice,
      sources: [{ book, itemRef: `q${String(i + 1).padStart(2, "0")}` }],
    })
  })

  return questions
}

function main() {
  const allQuestions = []
  for (const source of SOURCES) {
    const mhtmlPath = path.join(tempDir, source.file)
    const html = extractFirstHtmlPart(mhtmlPath)
    const questions = extractQuestionsFromHtml(html, source.book, source.expectedCount, source.idStart)
    allQuestions.push(...questions)
    console.log(`${source.file}: extracted ${questions.length} questions`)
  }

  // Mechanical verification (Phase 1 requirement).
  const errors = []
  if (allQuestions.length !== 100) errors.push(`expected 100 total, got ${allQuestions.length}`)
  const seenIds = new Set()
  for (const q of allQuestions) {
    if (seenIds.has(q.id)) errors.push(`duplicate id ${q.id}`)
    seenIds.add(q.id)
    if (q.choices.length !== 4) errors.push(`${q.id}: not exactly 4 choices`)
    if (!["a", "b", "c", "d"].includes(q.correctChoice)) errors.push(`${q.id}: invalid correctChoice`)
    if (!q.question.en.trim()) errors.push(`${q.id}: empty stem`)
    for (const c of q.choices) {
      if (!c.en.trim()) errors.push(`${q.id}: empty choice ${c.id}`)
    }
  }
  if (errors.length) {
    console.error("Verification FAILED:")
    for (const e of errors) console.error(` - ${e}`)
    process.exit(1)
  }

  fs.mkdirSync(outDir, { recursive: true })
  const staging = {
    generatedAt: new Date().toISOString(),
    sourceFiles: SOURCES.map((s) => s.file),
    statistics: { total: allQuestions.length },
    questions: allQuestions,
  }
  const outPath = path.join(outDir, "staging.json")
  fs.writeFileSync(outPath, JSON.stringify(staging, null, 2) + "\n")
  console.log(`Wrote ${allQuestions.length} questions to ${path.relative(root, outPath)}`)
  console.log("Verification passed: 100 records, 4 choices each, 1 correctChoice each, no empty text, no duplicate ids.")
}

main()
