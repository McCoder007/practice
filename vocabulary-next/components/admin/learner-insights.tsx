"use client"

import { FormEvent, useEffect, useMemo, useState } from "react"

import { BookOpen, CheckCircle2, Download, Layers, ListChecks, Pencil, Timer, X } from "lucide-react"

import {
  attemptTestSeconds,
  mostMissedQuestions,
  practiceByDay,
  practiceSessionsToCsv,
  scoresByBank,
  type PracticeDay,
} from "@/lib/nail-exam-insights"
import {
  PRACTICE_SESSION_KIND_LABELS,
  countWords,
  formatMinutes,
  summarizePracticeSources,
  type PracticeSession,
  type PracticeSessionKind,
} from "@/lib/nail-exam-practice-sessions"
import {
  NAIL_EXAM_LEARNER_NAME_MAX,
  formatRelativeTime,
  learnerAlias,
  summarizeLearnerTests,
  type NailExamAttempt,
} from "@/lib/nail-exam-usage"

/** Chart colors, checked for color-blind separation against the white card. */
const TEST_COLOR = "#8a3f68"
const PRACTICE_COLOR = "#0e8fa0"

const SESSIONS_PAGE_SIZE = 30

export function formatClock(timestamp: number): string {
  return new Intl.DateTimeFormat(undefined, { month: "short", day: "numeric", hour: "numeric", minute: "2-digit" }).format(timestamp)
}

export function downloadCsv(filename: string, csv: string) {
  // The byte-order mark makes Excel read the dashes and Chinese text correctly.
  const url = URL.createObjectURL(new Blob(["﻿", csv], { type: "text/csv;charset=utf-8" }))
  const link = document.createElement("a")
  link.href = url
  link.download = filename
  document.body.appendChild(link)
  link.click()
  link.remove()
  URL.revokeObjectURL(url)
}

function minutesLabel(seconds: number): string {
  return seconds > 0 && seconds < 60 ? "<1 min" : `${Math.round(seconds / 60)} min`
}

/** Minutes practiced per day: tests and reels/cards stacked. */
export function PracticeMinutesChart({ days }: { days: PracticeDay[] }) {
  const max = Math.max(60, ...days.map((day) => day.testSeconds + day.practiceSeconds))
  const total = days.reduce((sum, day) => sum + day.testSeconds + day.practiceSeconds, 0)
  const activeDays = days.filter((day) => day.testSeconds + day.practiceSeconds > 0).length
  const chartHeight = 128
  return (
    <figure>
      <div className="flex flex-wrap items-center justify-between gap-2">
        <figcaption className="text-xs text-[#8b7589]">
          {formatMinutes(total)} in the last {days.length} days · practiced on {activeDays} {activeDays === 1 ? "day" : "days"}
        </figcaption>
        <div className="flex items-center gap-3 text-xs text-[#6e5669]">
          <span className="inline-flex items-center gap-1.5"><span className="size-2.5 rounded-sm" style={{ background: TEST_COLOR }} />Tests</span>
          <span className="inline-flex items-center gap-1.5"><span className="size-2.5 rounded-sm" style={{ background: PRACTICE_COLOR }} />Reels &amp; cards</span>
        </div>
      </div>
      <div className="relative mt-3">
        <div className="pointer-events-none absolute inset-x-0 top-0 border-t border-[#f0e7ed]" />
        <span className="pointer-events-none absolute right-0 -top-4 text-[10px] text-[#a18f9e]">{Math.round(max / 60)} min</span>
        <ol className="flex items-end gap-1" style={{ height: chartHeight }} aria-label="Minutes practiced per day">
          {days.map((day) => {
            const testHeight = (day.testSeconds / max) * chartHeight
            const practiceHeight = (day.practiceSeconds / max) * chartHeight
            const both = testHeight > 0 && practiceHeight > 0
            return (
              <li
                key={day.dayStart}
                tabIndex={0}
                className="group relative flex h-full min-w-0 flex-1 flex-col items-center justify-end outline-none"
                aria-label={`${day.label}: tests ${minutesLabel(day.testSeconds)}, reels and cards ${minutesLabel(day.practiceSeconds)}`}
              >
                <div className="flex w-full max-w-6 flex-col justify-end" style={{ gap: both ? 2 : 0 }}>
                  {practiceHeight > 0 && <div className="w-full rounded-t" style={{ height: Math.max(2, practiceHeight), background: PRACTICE_COLOR }} />}
                  {testHeight > 0 && <div className={`w-full ${both ? "" : "rounded-t"}`} style={{ height: Math.max(2, testHeight), background: TEST_COLOR }} />}
                </div>
                <div className="pointer-events-none absolute bottom-full z-10 mb-2 hidden w-max rounded-lg bg-[#36223a] px-2.5 py-1.5 text-xs text-white shadow-lg group-hover:block group-focus:block">
                  <p className="font-semibold">{day.label}</p>
                  <p>Tests: {minutesLabel(day.testSeconds)}</p>
                  <p>Reels &amp; cards: {minutesLabel(day.practiceSeconds)}</p>
                </div>
              </li>
            )
          })}
        </ol>
        <div className="border-t border-[#e2d5de]" />
        <div className="mt-1 flex gap-1 text-[10px] text-[#a18f9e]">
          {days.map((day, index) => (
            <span key={day.dayStart} className="min-w-0 flex-1 truncate text-center">
              {index === 0 || index === days.length - 1 || index === Math.floor(days.length / 2) ? day.label.split(", ")[1] : ""}
            </span>
          ))}
        </div>
      </div>
    </figure>
  )
}

function Tile({ label, value, detail }: { label: string; value: string; detail?: string }) {
  return (
    <div className="rounded-2xl border border-[#eee4ea] bg-[#fdfafd] p-3.5">
      <p className="text-xs font-medium text-[#8b7589]">{label}</p>
      <p className="mt-1.5 font-[family-name:var(--font-outfit)] text-2xl font-semibold text-[#36223a]">{value}</p>
      {detail && <p className="mt-0.5 text-xs text-[#9a8798]">{detail}</p>}
    </div>
  )
}

function WordChips({ words, empty }: { words: { word: string; count: number }[]; empty: string }) {
  if (words.length === 0) return <p className="text-sm text-[#9a8798]">{empty}</p>
  return (
    <ul className="flex flex-wrap gap-1.5">
      {words.map((item) => (
        <li key={item.word} className="rounded-lg bg-[#f8f1f5] px-2.5 py-1 text-sm text-[#5f2949]">
          {item.word}
          {item.count > 1 && <span className="ml-1 text-xs text-[#9a8798]">×{item.count}</span>}
        </li>
      ))}
    </ul>
  )
}

function SectionHeading({ children, detail }: { children: React.ReactNode; detail?: string }) {
  return (
    <div className="mb-3">
      <h3 className="text-xs font-bold uppercase tracking-[0.12em] text-[#9a5277]">{children}</h3>
      {detail && <p className="mt-0.5 text-xs text-[#9a8798]">{detail}</p>}
    </div>
  )
}

export function RenameLearnerForm({
  learnerId,
  currentName,
  onSave,
  onDone,
}: {
  learnerId: string
  currentName: string
  onSave: (learnerId: string, name: string) => Promise<void>
  onDone: () => void
}) {
  const [name, setName] = useState(currentName)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState("")
  async function submit(event: FormEvent) {
    event.preventDefault()
    setSaving(true)
    setError("")
    try {
      await onSave(learnerId, name)
      onDone()
    } catch {
      setError("Could not save the name. Check that the database rules are published.")
    } finally {
      setSaving(false)
    }
  }
  return (
    <form onSubmit={submit} className="mt-2 flex flex-wrap items-center gap-2" onClick={(event) => event.stopPropagation()}>
      <input
        autoFocus
        value={name}
        maxLength={NAIL_EXAM_LEARNER_NAME_MAX}
        onChange={(event) => setName(event.target.value)}
        placeholder={learnerAlias(learnerId)}
        aria-label="Learner name"
        className="min-h-10 min-w-0 flex-1 rounded-xl border border-[#dfd0da] bg-white px-3 text-sm text-[#36223a] outline-none focus:border-[#9a4e75] focus:ring-4 focus:ring-[#ead7e2]"
      />
      <button type="submit" disabled={saving} className="min-h-10 rounded-xl bg-[#5f2949] px-3.5 text-sm font-semibold text-white disabled:opacity-50">
        {saving ? "Saving…" : "Save"}
      </button>
      <button type="button" onClick={onDone} className="min-h-10 rounded-xl px-3 text-sm font-semibold text-[#8a3f68] hover:bg-[#f8edf4]">
        Cancel
      </button>
      <p className="w-full text-xs text-[#9a8798]">Leave empty to use the private alias. Names are shared with other admins.</p>
      {error && <p role="alert" className="w-full text-xs text-rose-700">{error}</p>}
    </form>
  )
}

function SessionRow({ session, nameOf, showLearner }: { session: PracticeSession; nameOf: (id: string) => string; showLearner: boolean }) {
  const isDrill = session.kind === "look-alike"
  return (
    <li className="grid grid-cols-[minmax(0,1fr)_auto] gap-x-4 gap-y-1 px-5 py-3.5 sm:px-6">
      <div className="min-w-0">
        <div className="flex min-w-0 flex-wrap items-center gap-x-2 gap-y-1">
          {showLearner && <p className="truncate text-sm font-semibold">{nameOf(session.learnerId)}</p>}
          <span className="rounded-full bg-[#e7f4f5] px-2 py-0.5 text-[11px] font-semibold text-[#0b6c78]">{PRACTICE_SESSION_KIND_LABELS[session.kind]}</span>
          <p className="min-w-0 truncate text-sm text-[#463044]">{session.title}</p>
        </div>
        <p className="mt-1 text-xs text-[#8b7589]">
          {formatClock(session.startedAt)} · {formatRelativeTime(session.lastSeenAt)}
          {session.sections.length > 0 && <> · {session.sections.slice(0, 3).join(", ")}{session.sections.length > 3 ? ` +${session.sections.length - 3} more` : ""}</>}
        </p>
        {(session.wordsTapped.length > 0 || session.wordsMissed.length > 0) && (
          <p className="mt-1 truncate text-xs text-[#806b7d]">
            {session.wordsTapped.length > 0 && <>Tapped: {session.wordsTapped.slice(0, 8).join(", ")}{session.wordsTapped.length > 8 ? ` +${session.wordsTapped.length - 8}` : ""}</>}
            {session.wordsMissed.length > 0 && <>Missed: {session.wordsMissed.slice(0, 8).join(", ")}</>}
          </p>
        )}
      </div>
      <div className="text-right text-xs text-[#6e5669]">
        <p className="flex items-center justify-end gap-1 text-sm font-semibold text-[#36223a]"><Timer size={13} aria-hidden="true" />{formatMinutes(session.activeSeconds)}</p>
        <p className="mt-0.5">{isDrill ? `${session.correct}/${session.answered} right` : `${session.cardsSeen} cards`}</p>
        {session.reachedEnd && <p className="mt-0.5 inline-flex items-center gap-1 text-[#0b6c78]"><CheckCircle2 size={12} aria-hidden="true" />Finished</p>}
      </div>
    </li>
  )
}

/** Word reels, study cards and drills for the whole page, with filters and CSV. */
export function PracticeSessionsSection({
  sessions,
  periodLabel,
  nameOf,
  loadError,
}: {
  sessions: PracticeSession[]
  periodLabel: string
  nameOf: (learnerId: string) => string
  loadError: boolean
}) {
  const [learner, setLearner] = useState("all")
  const [kind, setKind] = useState<"all" | PracticeSessionKind>("all")
  const [shown, setShown] = useState(SESSIONS_PAGE_SIZE)
  const learners = useMemo(
    () => [...new Set(sessions.map((session) => session.learnerId))].sort((a, b) => nameOf(a).localeCompare(nameOf(b))),
    [nameOf, sessions],
  )
  const filtered = useMemo(
    () =>
      sessions
        .filter((session) => learner === "all" || session.learnerId === learner)
        .filter((session) => kind === "all" || session.kind === kind)
        .sort((a, b) => b.startedAt - a.startedAt),
    [kind, learner, sessions],
  )
  const sources = useMemo(() => summarizePracticeSources(filtered).slice(0, 8), [filtered])
  const totalSeconds = filtered.reduce((sum, session) => sum + session.activeSeconds, 0)
  const selectClass = "mt-1 min-h-10 w-full rounded-xl border border-[#dfd0da] bg-white px-3 text-sm font-medium text-[#36223a] outline-none focus:border-[#9a4e75] focus:ring-4 focus:ring-[#ead7e2]"

  return (
    <section id="practice-sessions" aria-labelledby="practice-sessions-heading" className="mt-8 scroll-mt-4 overflow-hidden rounded-3xl border border-[#eadde5] bg-white shadow-[0_8px_30px_rgba(78,42,68,0.05)]">
      <div className="border-b border-[#eee4ea] px-5 py-4 sm:px-6">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <h2 id="practice-sessions-heading" className="flex items-center gap-2 font-[family-name:var(--font-outfit)] text-lg font-semibold"><Layers size={19} className="text-[#0e8fa0]" aria-hidden="true" /> Word reels &amp; study cards</h2>
            <p className="mt-0.5 text-xs text-[#9a8798]">Word reels, study cards, and the look-alike drill in {periodLabel} · {filtered.length} visits · {formatMinutes(totalSeconds)}</p>
          </div>
          <button type="button" disabled={filtered.length === 0} onClick={() => downloadCsv(`nail-exam-reels-${new Date().toISOString().slice(0, 10)}.csv`, practiceSessionsToCsv(filtered, nameOf))} className="inline-flex min-h-10 items-center gap-2 rounded-xl border border-[#e2d5de] bg-white px-3.5 text-sm font-semibold text-[#6e5669] transition hover:bg-[#faf5f8] disabled:opacity-50"><Download size={16} aria-hidden="true" /> Download CSV</button>
        </div>
        <div className="mt-4 grid gap-2 sm:grid-cols-2">
          <label className="text-xs font-semibold text-[#8b7589]">Learner<select value={learner} onChange={(event) => { setLearner(event.target.value); setShown(SESSIONS_PAGE_SIZE) }} className={selectClass}><option value="all">All learners</option>{learners.map((id) => <option key={id} value={id}>{nameOf(id)}</option>)}</select></label>
          <label className="text-xs font-semibold text-[#8b7589]">Type<select value={kind} onChange={(event) => { setKind(event.target.value as "all" | PracticeSessionKind); setShown(SESSIONS_PAGE_SIZE) }} className={selectClass}><option value="all">All types</option>{(Object.keys(PRACTICE_SESSION_KIND_LABELS) as PracticeSessionKind[]).map((item) => <option key={item} value={item}>{PRACTICE_SESSION_KIND_LABELS[item]}</option>)}</select></label>
        </div>
      </div>
      {loadError ? (
        <p className="px-5 py-10 text-center text-sm text-rose-700 sm:px-6">Reel activity could not be loaded. Check that the latest database rules are published.</p>
      ) : filtered.length === 0 ? (
        <p className="px-5 py-10 text-center text-sm text-[#9a8798] sm:px-6">No word reel or study card use in this period yet. It starts recording once this update is live.</p>
      ) : (
        <>
          <div className="border-b border-[#f0e7ed] px-5 py-4 sm:px-6">
            <SectionHeading detail="Most time first">Most used</SectionHeading>
            <ul className="grid gap-2 sm:grid-cols-2">
              {sources.map((source) => (
                <li key={`${source.kind}:${source.sourceId}`} className="flex items-center justify-between gap-3 rounded-xl bg-[#f6fbfb] px-3 py-2">
                  <div className="min-w-0"><p className="truncate text-sm font-semibold text-[#36223a]">{source.title}</p><p className="text-xs text-[#6e7f82]">{PRACTICE_SESSION_KIND_LABELS[source.kind]} · {source.sessions} {source.sessions === 1 ? "visit" : "visits"} · {source.cardsSeen} {source.kind === "look-alike" ? "questions" : "cards"}</p></div>
                  <p className="shrink-0 text-sm font-semibold text-[#0b6c78]">{formatMinutes(source.activeSeconds)}</p>
                </li>
              ))}
            </ul>
          </div>
          <ol className="divide-y divide-[#f0e7ed]">{filtered.slice(0, shown).map((session) => <SessionRow key={session.sessionId} session={session} nameOf={nameOf} showLearner />)}</ol>
          {filtered.length > shown && <div className="border-t border-[#f0e7ed] px-5 py-3 text-center sm:px-6"><button type="button" onClick={() => setShown((current) => current + SESSIONS_PAGE_SIZE)} className="min-h-10 rounded-xl px-4 text-sm font-semibold text-[#8a3f68] transition hover:bg-[#f8edf4]">{filtered.length - shown > SESSIONS_PAGE_SIZE ? `Show ${SESSIONS_PAGE_SIZE} more · ${filtered.length - shown} left` : `Show the last ${filtered.length - shown}`}</button></div>}
        </>
      )}
    </section>
  )
}

/** Everything about one learner, in a panel over the page. */
export function LearnerDetailPanel({
  learnerId,
  attempts,
  sessions,
  nameOf,
  hasCustomName,
  lastActiveAt,
  onRename,
  onShowAllTests,
  onClose,
}: {
  learnerId: string
  attempts: NailExamAttempt[]
  sessions: PracticeSession[]
  nameOf: (learnerId: string) => string
  hasCustomName: boolean
  lastActiveAt: number
  onRename: (learnerId: string, name: string) => Promise<void>
  onShowAllTests: (learnerId: string) => void
  onClose: () => void
}) {
  const [renaming, setRenaming] = useState(false)
  const [sessionsShown, setSessionsShown] = useState(10)

  useEffect(() => {
    const onKey = (event: KeyboardEvent) => event.key === "Escape" && onClose()
    window.addEventListener("keydown", onKey)
    const { overflow } = document.body.style
    document.body.style.overflow = "hidden"
    return () => {
      window.removeEventListener("keydown", onKey)
      document.body.style.overflow = overflow
    }
  }, [onClose])

  const summary = summarizeLearnerTests(attempts)
  const days = useMemo(() => practiceByDay(attempts, sessions, 14), [attempts, sessions])
  const lastWeekSeconds = days.slice(-7).reduce((sum, day) => sum + day.testSeconds + day.practiceSeconds, 0)
  const testSeconds = attempts.reduce((sum, attempt) => sum + attemptTestSeconds(attempt), 0)
  const practiceSeconds = sessions.reduce((sum, session) => sum + session.activeSeconds, 0)
  const banks = useMemo(() => scoresByBank(attempts), [attempts])
  const missed = useMemo(() => mostMissedQuestions(attempts, 10), [attempts])
  const hasMissedData = attempts.some((attempt) => attempt.missed !== undefined)
  const sources = useMemo(() => summarizePracticeSources(sessions), [sessions])
  const lookedUp = useMemo(() => countWords(sessions.map((session) => session.hardWordsOpened), 24), [sessions])
  const drillMissed = useMemo(() => countWords(sessions.map((session) => session.wordsMissed), 24), [sessions])
  const sortedSessions = useMemo(() => [...sessions].sort((a, b) => b.startedAt - a.startedAt), [sessions])
  const lastUsed = Math.max(lastActiveAt, ...sessions.map((session) => session.lastSeenAt), ...attempts.map((attempt) => attempt.completedAt ?? attempt.startedAt ?? 0))

  return (
    <div className="fixed inset-0 z-50 flex justify-end bg-[#36223a]/35 backdrop-blur-[2px]" onClick={onClose}>
      <div role="dialog" aria-modal="true" aria-labelledby="learner-detail-heading" className="h-full w-full max-w-3xl overflow-y-auto bg-[#f7f1f5] shadow-2xl" onClick={(event) => event.stopPropagation()}>
        <header className="sticky top-0 z-10 bg-gradient-to-r from-[#60304d] to-[#7d4565] px-5 py-4 text-white sm:px-6">
          <div className="flex items-start justify-between gap-3">
            <div className="min-w-0">
              <h2 id="learner-detail-heading" className="truncate font-[family-name:var(--font-outfit)] text-xl font-semibold">{nameOf(learnerId)}</h2>
              <p className="mt-0.5 text-xs text-white/70">{hasCustomName ? `Private alias: ${learnerAlias(learnerId)}` : "Private browser alias"} · last used {lastUsed ? formatRelativeTime(lastUsed) : "never"}</p>
            </div>
            <div className="flex shrink-0 items-center gap-1">
              <button type="button" onClick={() => setRenaming((current) => !current)} className="inline-flex min-h-10 items-center gap-1.5 rounded-xl px-3 text-sm font-semibold text-white/90 hover:bg-white/15"><Pencil size={15} aria-hidden="true" /> Rename</button>
              <button type="button" onClick={onClose} aria-label="Close" className="grid size-10 place-items-center rounded-xl text-white/90 hover:bg-white/15"><X size={20} aria-hidden="true" /></button>
            </div>
          </div>
          {renaming && <div className="rounded-2xl bg-white p-3"><RenameLearnerForm learnerId={learnerId} currentName={hasCustomName ? nameOf(learnerId) : ""} onSave={onRename} onDone={() => setRenaming(false)} /></div>}
        </header>

        <div className="space-y-5 px-4 py-5 sm:px-6">
          <section className="grid grid-cols-2 gap-3 sm:grid-cols-4">
            <Tile label="Tests" value={String(summary.total)} detail={`${summary.finished} finished`} />
            <Tile label="Average score" value={summary.averagePercent === null ? "—" : `${summary.averagePercent}%`} detail={summary.finished ? `Across ${summary.finished} tests` : "No finished tests"} />
            <Tile label="Last 7 days" value={formatMinutes(lastWeekSeconds)} detail="Tests, reels, and cards" />
            <Tile label="All time" value={formatMinutes(testSeconds + practiceSeconds)} detail={`${formatMinutes(practiceSeconds)} on reels & cards`} />
          </section>

          <section className="rounded-3xl border border-[#eadde5] bg-white p-5">
            <SectionHeading>Minutes practiced per day</SectionHeading>
            <div className="pt-3"><PracticeMinutesChart days={days} /></div>
            <p className="mt-3 text-xs text-[#a18f9e]">Test time runs from start to finish (up to 90 minutes). Reel and card time only counts while they are swiping or tapping.</p>
          </section>

          <section className="rounded-3xl border border-[#eadde5] bg-white p-5">
            <div className="flex flex-wrap items-start justify-between gap-2">
              <SectionHeading detail="Average of finished tests; last scores oldest to newest">Scores by question bank</SectionHeading>
              {summary.total > 0 && <button type="button" onClick={() => onShowAllTests(learnerId)} className="inline-flex min-h-9 items-center gap-1.5 rounded-lg px-2.5 text-xs font-semibold text-[#8a3f68] hover:bg-[#f8edf4]"><ListChecks size={14} aria-hidden="true" /> See all {summary.total} tests</button>}
            </div>
            {banks.length === 0 ? <p className="text-sm text-[#9a8798]">No tests yet.</p> : (
              <ul className="divide-y divide-[#f0e7ed]">
                {banks.map((bank) => (
                  <li key={bank.bankId} className="flex flex-wrap items-center justify-between gap-x-4 gap-y-1.5 py-2.5">
                    <div className="min-w-0"><p className="truncate text-sm font-semibold text-[#463044]">{bank.bankName}</p><p className="text-xs text-[#8b7589]">{bank.finished} of {bank.tests} finished{bank.bestPercent !== null ? ` · best ${bank.bestPercent}%` : ""}</p></div>
                    <div className="flex items-center gap-3">
                      <ol className="flex gap-1" aria-label="Last scores">{bank.recentPercents.map((percent, index) => <li key={index} className={`rounded-md px-1.5 py-0.5 text-xs font-semibold tabular-nums ${percent >= 75 ? "bg-[#eef6ee] text-[#2f6b3a]" : "bg-[#fbefe9] text-[#9a4a26]"}`}>{percent}</li>)}</ol>
                      <p className="w-12 text-right text-base font-bold tabular-nums text-[#36223a]">{bank.averagePercent === null ? "—" : `${bank.averagePercent}%`}</p>
                    </div>
                  </li>
                ))}
              </ul>
            )}
            <p className="mt-2 text-xs text-[#a18f9e]">Green is 75% or higher.</p>
          </section>

          <section className="rounded-3xl border border-[#eadde5] bg-white p-5">
            <SectionHeading detail="Answered wrong or skipped, across finished tests">Most-missed questions</SectionHeading>
            {missed.length === 0 ? (
              <p className="text-sm text-[#9a8798]">{hasMissedData ? "No missed questions. Nice work." : "Missed questions are recorded for tests finished after this update."}</p>
            ) : (
              <ol className="space-y-2">
                {missed.map((item) => (
                  <li key={item.id} className="flex items-start gap-3 rounded-xl bg-[#fdfafd] p-3">
                    <span className="grid size-8 shrink-0 place-items-center rounded-lg bg-[#f8edf4] text-sm font-bold text-[#8a3f68]">×{item.count}</span>
                    <div className="min-w-0"><p className="text-sm text-[#36223a]">{item.question || item.id}</p><p className="mt-0.5 text-xs text-[#9a8798]">{item.bankName}{item.skippedCount ? ` · skipped ${item.skippedCount}×` : ""}</p></div>
                  </li>
                ))}
              </ol>
            )}
          </section>

          <section className="rounded-3xl border border-[#eadde5] bg-white p-5">
            <SectionHeading detail="Word reels, study cards, and the look-alike drill">Reels &amp; study cards</SectionHeading>
            {sessions.length === 0 ? <p className="text-sm text-[#9a8798]">No reel or study card use recorded yet.</p> : (
              <>
                <ul className="grid gap-2 sm:grid-cols-2">
                  {sources.map((source) => (
                    <li key={`${source.kind}:${source.sourceId}`} className="flex items-center justify-between gap-3 rounded-xl bg-[#f6fbfb] px-3 py-2">
                      <div className="min-w-0"><p className="truncate text-sm font-semibold text-[#36223a]">{source.title}</p><p className="text-xs text-[#6e7f82]">{PRACTICE_SESSION_KIND_LABELS[source.kind]} · {source.sessions} {source.sessions === 1 ? "visit" : "visits"} · {source.cardsSeen} {source.kind === "look-alike" ? "questions" : "cards"} · {formatRelativeTime(source.lastUsedAt)}</p></div>
                      <p className="shrink-0 text-sm font-semibold text-[#0b6c78]">{formatMinutes(source.activeSeconds)}</p>
                    </li>
                  ))}
                </ul>
                <div className="mt-4 grid gap-4 sm:grid-cols-2">
                  <div><p className="mb-2 flex items-center gap-1.5 text-xs font-semibold text-[#6e5669]"><BookOpen size={14} aria-hidden="true" /> Words they looked up</p><WordChips words={lookedUp} empty="No word cards opened yet." /></div>
                  <div><p className="mb-2 text-xs font-semibold text-[#6e5669]">Words missed in the look-alike drill</p><WordChips words={drillMissed} empty="None missed." /></div>
                </div>
                <div className="-mx-5 mt-4 border-t border-[#f0e7ed]">
                  <ol className="divide-y divide-[#f0e7ed]">{sortedSessions.slice(0, sessionsShown).map((session) => <SessionRow key={session.sessionId} session={session} nameOf={nameOf} showLearner={false} />)}</ol>
                  {sortedSessions.length > sessionsShown && <div className="border-t border-[#f0e7ed] px-5 pt-3 text-center"><button type="button" onClick={() => setSessionsShown((current) => current + 20)} className="min-h-10 rounded-xl px-4 text-sm font-semibold text-[#8a3f68] hover:bg-[#f8edf4]">Show more · {sortedSessions.length - sessionsShown} left</button></div>}
                </div>
              </>
            )}
          </section>
        </div>
      </div>
    </div>
  )
}
