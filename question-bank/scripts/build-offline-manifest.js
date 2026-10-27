#!/usr/bin/env node
// Writes out/offline-manifest.json: the list of files the offline Study copy saves
// (see docs/offline-study-china-plan.md, "The list of files to save").
//
// Runs after `next build` (npm "postbuild"). The service worker (public/sw.js) downloads
// every file in the list and only marks the copy ready when all of them are saved.
//
// Format:
//   version     build SHA (NEXT_PUBLIC_BUILD_VERSION), or a hash of the files for local builds
//   totalBytes  size of everything below, so the page can show the real size
//   app         [url, bytes] or [url, bytes, src]: pages, code, icons, clip index.
//               Pages use the address the learner opens (no ".html") and give the file to fetch as `src`.
//   audio       [url, bytes]: every clip in public/audio/study/index.json

const crypto = require("node:crypto")
const fs = require("node:fs")
const path = require("node:path")

const ROOT = path.resolve(__dirname, "../..")

// Production base path (next.config.js sets basePath "/practice" for production builds).
const BASE_PATH = "/practice"

// Study routes, without ".html". Every route under a "/**" prefix is included.
const STUDY_ROUTES = [
  "nail-exam-practice",
  "nail-exam-practice/exam-topics",
  "nail-exam-practice/exam-topics/**",
  "nail-exam-practice/question-words",
]

const APP_FILES = ["manifest.json", "google-tts.js", "icon.svg", "apple-icon.png", "audio/study/index.json"]

function listFiles(dir) {
  const out = []
  if (!fs.existsSync(dir)) return out
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const full = path.join(dir, entry.name)
    if (entry.isDirectory()) out.push(...listFiles(full))
    else if (entry.isFile()) out.push(full)
  }
  return out
}

function toPosix(relative) {
  return relative.split(path.sep).join("/")
}

/**
 * Builds the manifest object from an exported site folder.
 * @param {{ outDir: string, basePath?: string, version?: string }} options
 */
function buildOfflineManifest({ outDir, basePath = BASE_PATH, version }) {
  const problems = []
  const app = []
  const seen = new Set()
  const sizeOf = (relative) => fs.statSync(path.join(outDir, relative)).size
  // Encoded the way the browser asks for it: "[topic]" in a chunk path is requested as "%5Btopic%5D".
  const url = (relative) => `${basePath}/${relative.split("/").map(encodeURIComponent).join("/")}`

  const addFile = (relative) => {
    const key = url(relative)
    if (seen.has(key)) return
    if (!fs.existsSync(path.join(outDir, relative))) {
      problems.push(`missing file: ${relative}`)
      return
    }
    seen.add(key)
    app.push([key, sizeOf(relative)])
  }

  // A page: saved under the address the learner opens, with its page data (.txt) next to it.
  const addPage = (route) => {
    const htmlFile = route === "" ? "index.html" : `${route}.html`
    const txtFile = route === "" ? "index.txt" : `${route}.txt`
    const key = route === "" ? `${basePath}/` : url(route)
    if (!fs.existsSync(path.join(outDir, htmlFile))) {
      problems.push(`missing page: ${htmlFile}`)
      return
    }
    if (!seen.has(key)) {
      seen.add(key)
      app.push([key, sizeOf(htmlFile), url(htmlFile)])
    }
    addFile(txtFile)
  }

  addPage("") // the home-screen icon opens /practice/
  addPage("offline")

  for (const route of STUDY_ROUTES) {
    if (!route.endsWith("/**")) {
      addPage(route)
      continue
    }
    const prefix = route.slice(0, -3)
    const pages = listFiles(path.join(outDir, prefix))
      .map((file) => toPosix(path.relative(outDir, file)))
      .filter((file) => file.endsWith(".html"))
      .sort()
    if (pages.length === 0) problems.push(`no pages under ${prefix}/`)
    for (const file of pages) addPage(file.slice(0, -5))
  }

  // All of _next/static: every chunk, including those loaded later, plus the fonts.
  const staticFiles = listFiles(path.join(outDir, "_next/static"))
    .map((file) => toPosix(path.relative(outDir, file)))
    .sort()
  if (staticFiles.length === 0) problems.push("no files in _next/static")
  staticFiles.forEach(addFile)

  APP_FILES.forEach(addFile)

  // Icons listed in manifest.json that exist (some listed sizes may not be in the repo).
  try {
    const webManifest = JSON.parse(fs.readFileSync(path.join(outDir, "manifest.json"), "utf8"))
    for (const icon of webManifest.icons || []) {
      const relative = String(icon.src || "").replace(new RegExp(`^${basePath}/`), "")
      if (relative && fs.existsSync(path.join(outDir, relative))) addFile(relative)
    }
  } catch {
    // Reported above as a missing manifest.json if it is not there.
  }

  // Audio clips from the clip index.
  const audio = []
  const indexPath = path.join(outDir, "audio/study/index.json")
  if (fs.existsSync(indexPath)) {
    const index = JSON.parse(fs.readFileSync(indexPath, "utf8"))
    for (const fileName of [...new Set(Object.values(index))].sort()) {
      const relative = `audio/study/${fileName}`
      if (!fs.existsSync(path.join(outDir, relative))) {
        problems.push(`missing clip: ${relative}`)
        continue
      }
      audio.push([url(relative), sizeOf(relative)])
    }
  }

  if (problems.length > 0) {
    throw new Error(`Offline manifest: ${problems.length} problem(s)\n  ${problems.join("\n  ")}`)
  }

  const resolvedVersion = version || localVersion(outDir, app)
  const appBytes = app.reduce((sum, entry) => sum + entry[1], 0)
  const audioBytes = audio.reduce((sum, entry) => sum + entry[1], 0)

  return {
    version: resolvedVersion,
    builtAt: new Date().toISOString(),
    totalBytes: appBytes + audioBytes,
    appBytes,
    audioBytes,
    app,
    audio,
  }
}

/** For local builds without a SHA: a hash of the app files, so each different build gets a new version. */
function localVersion(outDir, app) {
  const hash = crypto.createHash("sha256")
  for (const [key, , src] of app) {
    const relative = decodeURIComponent((src || key).slice(BASE_PATH.length + 1)) || "index.html"
    hash.update(key)
    hash.update(fs.readFileSync(path.join(outDir, relative)))
  }
  return `local-${hash.digest("hex").slice(0, 12)}`
}

function buildVersionFromEnv() {
  const value = (process.env.NEXT_PUBLIC_BUILD_VERSION || "").trim()
  return value && value !== "dev-local" ? value : undefined
}

function main() {
  const outDir = path.join(ROOT, "out")
  if (!fs.existsSync(path.join(outDir, "index.html"))) {
    throw new Error("out/index.html not found. Run `next build` first.")
  }
  const manifest = buildOfflineManifest({ outDir, version: buildVersionFromEnv() })
  fs.writeFileSync(path.join(outDir, "offline-manifest.json"), JSON.stringify(manifest))
  const mb = (bytes) => `${(bytes / 1e6).toFixed(1)} MB`
  console.log(
    `Offline manifest ${manifest.version}: ${manifest.app.length} app files (${mb(manifest.appBytes)}), ` +
      `${manifest.audio.length} clips (${mb(manifest.audioBytes)}), total ${mb(manifest.totalBytes)}`,
  )
}

if (require.main === module) {
  try {
    main()
  } catch (error) {
    console.error(error.message)
    process.exit(1)
  }
}

module.exports = { buildOfflineManifest, BASE_PATH, STUDY_ROUTES }
