#!/usr/bin/env node
// Pre-generates the speech for the offline Study section (see docs/offline-study-china-plan.md).
//
// It collects the exact text the Study pages ask the player to speak, calls Google
// Text-to-Speech once per clip, and saves MP3 files under public/audio/study/. The page
// player (public/google-tts.js) looks a clip up by the same hash, so the two must agree.
//
// Usage (the key is read from the environment and is never printed):
//   node --env-file=.env.local question-bank/scripts/generate-study-audio.js            all Study audio
//   node --env-file=.env.local question-bank/scripts/generate-study-audio.js --topic infection-control
//   node question-bank/scripts/generate-study-audio.js --dry-run                         count only, no API calls
//
// Files already on disk are skipped, so a later run only pays for new or changed text.

const crypto = require("node:crypto")
const fs = require("node:fs")
const path = require("node:path")
const { createJiti } = require("jiti")

const ROOT = path.resolve(__dirname, "../..")
const OUT_DIR = path.join(ROOT, "public/audio/study")
const INDEX_PATH = path.join(OUT_DIR, "index.json")

const VOICE = "en-US-Neural2-D"
const NORMAL_RATE = 0.9
const SLOW_RATE = 0.6
const CONCURRENCY = 6
const MAX_ATTEMPTS = 6

const jiti = createJiti(__filename, { alias: { "@": ROOT } })
const { splitSentence, buildHardWordIndex } = jiti(path.join(ROOT, "lib/sentence-words.ts"))
const { topicReelSections, LOOK_ALIKE_TOPICS } = jiti(path.join(ROOT, "data/nic-domain-practice/word-reels.ts"))
const { EXAM_TOPIC_INDEX } = jiti(path.join(ROOT, "data/nic-domain-practice/index.generated.ts"))
const { QUESTION_WORD_SECTIONS } = jiti(path.join(ROOT, "data/nail-exam-practice/question-words.ts"))
const hardWordData = require(path.join(ROOT, "data/word-reel/hard-words.json"))
const questionData = require(path.join(ROOT, "question-bank/nic-domain-practice/questions.json"))

const HARD_WORDS = buildHardWordIndex(hardWordData.words)

// --- The same rules the player uses (keep in step with public/google-tts.js) ---

function isSsml(text) {
  return /^\s*<speak[\s>]/i.test(String(text).trim())
}

/** What is sent to Google: SSML is trimmed, plain text is sent as given. */
function inputFor(text) {
  return isSsml(text) ? String(text).trim() : String(text)
}

/** Name of a clip: a hash of the input, whether it is SSML, and the speed. */
function clipHash(text, rate) {
  const key = `${isSsml(text) ? "ssml" : "text"}|${rate}|${inputFor(text)}`
  return crypto.createHash("sha256").update(key, "utf8").digest("hex").slice(0, 20)
}

/** Same rule as spokenWord in components/word-reel/section-word-reel.tsx. */
function spokenWord(part) {
  const isAbbreviation = part.entry ? part.entry.word === part.entry.word.toUpperCase() : false
  return /^[A-Z]{2,}$/.test(part.text) && !isAbbreviation ? part.text.toLowerCase() : part.text
}

// --- Collecting the text ---

/** hash -> { text, rate } */
const clips = new Map()
/** How many clips each kind of text added, for the summary. */
const kindCounts = new Map()

function add(kind, text, rate = NORMAL_RATE) {
  if (typeof text !== "string" || !text.trim()) return
  const hash = clipHash(text, rate)
  if (clips.has(hash)) return
  clips.set(hash, { text: inputFor(text), rate })
  kindCounts.set(kind, (kindCounts.get(kind) ?? 0) + 1)
}

function addReelSections(sections) {
  for (const section of sections) {
    for (const card of section.cards) {
      const speech = card.tts ?? card.word
      add("reel word", speech)
      // The turtle button only shows when the card has a "say it" line.
      if (card.sayIt) add("reel word, slow", speech, SLOW_RATE)
      add("reel sentence", card.example)
      for (const part of splitSentence(card.example, HARD_WORDS)) {
        if (part.kind !== "word") continue
        add("sentence word", spokenWord(part))
        if (part.entry) add("underlined word", part.entry.word)
      }
    }
  }
}

function addQuestions(topicId) {
  const approved = questionData.questions.filter((q) => q.status === "approved")
  for (const q of approved) {
    if (topicId && q.domainId !== topicId) continue
    const correct = q.choices.find((choice) => choice.id === q.correctChoice)
    add("question", q.question.en)
    if (correct) add("correct answer", correct.en)
    add("explanation", q.explanation.en)
    add("memory tip", q.lockPoint.en)
    if (q.sourceWarning) add("source warning", q.sourceWarning.en)
  }
}

function addLookAlikes(topicId) {
  for (const topic of LOOK_ALIKE_TOPICS) {
    if (topicId && topic.topicId !== topicId) continue
    for (const group of topic.groups) {
      for (const item of group.items) {
        add("look-alike word", item.word)
        add("look-alike meaning", item.meaning.en)
        add("look-alike word and meaning", `${item.word}. ${item.meaning.en}`)
      }
      add("look-alike tip", group.tip.en)
    }
  }
}

// --- Google Text-to-Speech ---

const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms))

async function synthesize(clip, apiKey) {
  const body = {
    input: isSsml(clip.text) ? { ssml: clip.text } : { text: clip.text },
    voice: { languageCode: "en-US", name: VOICE },
    audioConfig: { audioEncoding: "MP3", speakingRate: clip.rate },
  }
  let lastError = "unknown error"
  for (let attempt = 1; attempt <= MAX_ATTEMPTS; attempt++) {
    try {
      // The key goes in a header so it can never end up in a logged URL.
      const response = await fetch("https://texttospeech.googleapis.com/v1/text:synthesize", {
        method: "POST",
        headers: { "Content-Type": "application/json", "X-Goog-Api-Key": apiKey },
        body: JSON.stringify(body),
      })
      if (response.ok) {
        const data = await response.json()
        if (!data.audioContent) throw new Error("no audioContent in response")
        return Buffer.from(data.audioContent, "base64")
      }
      const detail = await response.text().catch(() => "")
      lastError = `HTTP ${response.status} ${detail.replace(/\s+/g, " ").slice(0, 200)}`
      // Only rate limits and server errors are worth retrying.
      if (response.status !== 429 && response.status < 500) throw Object.assign(new Error(lastError), { fatal: true })
    } catch (error) {
      if (error.fatal) throw error
      lastError = error.message
    }
    if (attempt < MAX_ATTEMPTS) await sleep(Math.min(30_000, 1000 * 2 ** (attempt - 1)) + Math.random() * 500)
  }
  throw new Error(`gave up after ${MAX_ATTEMPTS} tries: ${lastError}`)
}

async function runPool(items, worker) {
  let next = 0
  await Promise.all(
    Array.from({ length: Math.min(CONCURRENCY, items.length) }, async () => {
      while (next < items.length) await worker(items[next++])
    }),
  )
}

function readIndex() {
  try {
    const parsed = JSON.parse(fs.readFileSync(INDEX_PATH, "utf8"))
    return parsed && typeof parsed === "object" && !Array.isArray(parsed) ? parsed : {}
  } catch {
    return {}
  }
}

function writeAtomic(file, data) {
  const temp = `${file}.${process.pid}.tmp`
  fs.writeFileSync(temp, data)
  fs.renameSync(temp, file)
}

async function main() {
  const args = process.argv.slice(2)
  const dryRun = args.includes("--dry-run")
  const topicFlag = args.indexOf("--topic")
  const topicId = topicFlag >= 0 ? args[topicFlag + 1] : null
  if (topicFlag >= 0) {
    const ids = EXAM_TOPIC_INDEX.domains.map((d) => d.id)
    if (!topicId || !ids.includes(topicId)) {
      console.error(`--topic needs one of: ${ids.join(", ")}`)
      process.exit(1)
    }
  }

  const apiKey = process.env.GOOGLE_TTS_GENERATOR_KEY
  if (!dryRun && !apiKey) {
    console.error("GOOGLE_TTS_GENERATOR_KEY is missing. Add it to vocabulary-next/.env.local and run with --env-file.")
    process.exit(1)
  }

  const topics = topicId ? [topicId] : EXAM_TOPIC_INDEX.domains.map((d) => d.id)
  for (const id of topics) addReelSections(topicReelSections(id))
  if (!topicId) addReelSections(QUESTION_WORD_SECTIONS)
  addQuestions(topicId)
  addLookAlikes(topicId)

  const list = [...clips.entries()].map(([hash, clip]) => ({ hash, ...clip }))
  const characters = list.reduce((sum, clip) => sum + clip.text.length, 0)
  console.log(`${topicId ? `Topic ${topicId}` : "All Study audio"}: ${list.length} clips, ${characters.toLocaleString()} characters.`)
  for (const [kind, count] of kindCounts) console.log(`  ${String(count).padStart(5)}  ${kind}`)

  fs.mkdirSync(OUT_DIR, { recursive: true })
  const missing = list.filter((clip) => !fs.existsSync(path.join(OUT_DIR, `${clip.hash}.mp3`)))
  console.log(`${list.length - missing.length} already saved, ${missing.length} to generate.`)

  let failed = 0
  if (!dryRun && missing.length > 0) {
    let done = 0
    await runPool(missing, async (clip) => {
      try {
        const audio = await synthesize(clip, apiKey)
        writeAtomic(path.join(OUT_DIR, `${clip.hash}.mp3`), audio)
      } catch (error) {
        failed++
        console.error(`Failed ${clip.hash} (${JSON.stringify(clip.text.slice(0, 60))}): ${error.message}`)
      }
      done++
      if (done % 100 === 0 || done === missing.length) console.log(`  ${done}/${missing.length}`)
    })
  }

  // The index lists every clip that has a file. A one-topic run keeps the clips already there.
  const index = topicId ? readIndex() : {}
  for (const clip of list) {
    if (fs.existsSync(path.join(OUT_DIR, `${clip.hash}.mp3`))) index[clip.hash] = `${clip.hash}.mp3`
  }
  for (const hash of Object.keys(index)) {
    if (!fs.existsSync(path.join(OUT_DIR, index[hash]))) delete index[hash]
  }
  const sorted = Object.fromEntries(Object.entries(index).sort(([a], [b]) => (a < b ? -1 : 1)))
  if (!dryRun) writeAtomic(INDEX_PATH, `${JSON.stringify(sorted, null, 1)}\n`)

  const bytes = list.reduce((sum, clip) => {
    try {
      return sum + fs.statSync(path.join(OUT_DIR, `${clip.hash}.mp3`)).size
    } catch {
      return sum
    }
  }, 0)
  console.log(`Index has ${Object.keys(sorted).length} clips. This run's clips on disk: ${(bytes / 1e6).toFixed(1)} MB.`)
  if (!topicId) {
    const orphans = fs.readdirSync(OUT_DIR).filter((f) => f.endsWith(".mp3") && !sorted[f.slice(0, -4)])
    if (orphans.length) console.log(`${orphans.length} saved files are no longer used (not deleted).`)
  }
  if (failed) {
    console.error(`${failed} clips failed. Run the same command again to retry them.`)
    process.exit(1)
  }
}

main().catch((error) => {
  console.error(error.message)
  process.exit(1)
})
