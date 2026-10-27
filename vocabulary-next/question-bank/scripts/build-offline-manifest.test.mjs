import assert from "node:assert/strict"
import fs from "node:fs"
import os from "node:os"
import path from "node:path"
import { createRequire } from "node:module"
import test from "node:test"

const require = createRequire(import.meta.url)
const { buildOfflineManifest } = require("./build-offline-manifest.js")

function makeSite(files) {
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), "offline-manifest-"))
  for (const [relative, content] of Object.entries(files)) {
    const full = path.join(dir, relative)
    fs.mkdirSync(path.dirname(full), { recursive: true })
    fs.writeFileSync(full, content)
  }
  return dir
}

const SITE = {
  "index.html": "<html>home</html>",
  "index.txt": "home-data",
  "offline.html": "<html>offline</html>",
  "offline.txt": "offline-data",
  "nail-exam-practice.html": "hub",
  "nail-exam-practice.txt": "hub-data",
  "nail-exam-practice/exam-topics.html": "topics",
  "nail-exam-practice/exam-topics.txt": "topics-data",
  "nail-exam-practice/exam-topics/chemistry.html": "chem",
  "nail-exam-practice/exam-topics/chemistry.txt": "chem-data",
  "nail-exam-practice/exam-topics/chemistry/words.html": "chem-words",
  "nail-exam-practice/exam-topics/chemistry/words.txt": "chem-words-data",
  "nail-exam-practice/question-words.html": "tricky",
  "nail-exam-practice/question-words.txt": "tricky-data",
  "nail-exam-practice/bank-a.html": "not saved",
  "_next/static/chunks/app.js": "js",
  "_next/static/chunks/app/[topic]/page-1.js": "topic-js",
  "_next/static/media/font.woff2": "font",
  "manifest.json": JSON.stringify({ icons: [{ src: "/practice/icon.svg" }, { src: "/practice/icon-512.png" }] }),
  "google-tts.js": "tts",
  "icon.svg": "<svg/>",
  "apple-icon.png": "png",
  "build-version.json": "{}",
  "audio/study/index.json": JSON.stringify({ aa: "aa.mp3", bb: "bb.mp3" }),
  "audio/study/aa.mp3": "clip-a",
  "audio/study/bb.mp3": "clip-bb",
}

test("lists the Study pages, code, icons and every clip", () => {
  const manifest = buildOfflineManifest({ outDir: makeSite(SITE), version: "abc123" })
  const appUrls = manifest.app.map((entry) => entry[0])

  assert.equal(manifest.version, "abc123")
  // Pages are saved under the address the learner opens, fetched from the .html file.
  assert.deepEqual(
    manifest.app.find((entry) => entry[0] === "/practice/"),
    ["/practice/", SITE["index.html"].length, "/practice/index.html"],
  )
  for (const url of [
    "/practice/index.txt",
    "/practice/offline",
    "/practice/nail-exam-practice",
    "/practice/nail-exam-practice/exam-topics/chemistry",
    "/practice/nail-exam-practice/exam-topics/chemistry/words",
    "/practice/nail-exam-practice/exam-topics/chemistry/words.txt",
    "/practice/nail-exam-practice/question-words.txt",
    "/practice/_next/static/chunks/app.js",
    // The browser asks for "[topic]" as "%5Btopic%5D", so that is the saved address.
    "/practice/_next/static/chunks/app/%5Btopic%5D/page-1.js",
    "/practice/_next/static/media/font.woff2",
    "/practice/google-tts.js",
    "/practice/apple-icon.png",
    "/practice/audio/study/index.json",
  ]) {
    assert.ok(appUrls.includes(url), url)
  }
  // Not part of the Study section, and never cached (update checks).
  assert.ok(!appUrls.includes("/practice/nail-exam-practice/bank-a"))
  assert.ok(!appUrls.some((url) => url.includes("build-version")))
  assert.equal(new Set(appUrls).size, appUrls.length)

  assert.deepEqual(manifest.audio, [
    ["/practice/audio/study/aa.mp3", 6],
    ["/practice/audio/study/bb.mp3", 7],
  ])
  const sum = [...manifest.app, ...manifest.audio].reduce((total, entry) => total + entry[1], 0)
  assert.equal(manifest.totalBytes, sum)
})

test("fails when a clip in the index is missing", () => {
  const site = { ...SITE, "audio/study/index.json": JSON.stringify({ aa: "aa.mp3", cc: "cc.mp3" }) }
  assert.throws(() => buildOfflineManifest({ outDir: makeSite(site), version: "v" }), /missing clip: audio\/study\/cc\.mp3/)
})

test("fails when a Study page is missing", () => {
  const site = { ...SITE }
  delete site["nail-exam-practice/question-words.html"]
  assert.throws(() => buildOfflineManifest({ outDir: makeSite(site), version: "v" }), /question-words\.html/)
})

test("local builds get a version from the file contents", () => {
  const first = buildOfflineManifest({ outDir: makeSite(SITE) })
  const same = buildOfflineManifest({ outDir: makeSite(SITE) })
  const changed = buildOfflineManifest({ outDir: makeSite({ ...SITE, "_next/static/chunks/app.js": "js2" }) })
  assert.match(first.version, /^local-[0-9a-f]{12}$/)
  assert.equal(first.version, same.version)
  assert.notEqual(first.version, changed.version)
})
