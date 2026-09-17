"use client"

import { FormEvent, useCallback, useEffect, useMemo, useState } from "react"

import { onAuthStateChanged, signInWithEmailAndPassword, signOut, type Auth, type User } from "firebase/auth"
import { Activity, ArrowLeft, Award, BookOpenCheck, CheckCircle2, Clock3, LogOut, RefreshCw, Sparkles, Timer, Users } from "lucide-react"
import Link from "next/link"

import { getFirebaseApp } from "@/lib/firebase-app"
import { loadNailExamAttempts, loadNailExamLearnerActivity } from "@/lib/nail-exam-usage-store"
import { formatDuration, formatRelativeTime, learnerAlias, recentAttemptsPerLearner, type NailExamAttempt, type NailExamLearnerActivity } from "@/lib/nail-exam-usage"

type Period = "today" | "7d" | "30d" | "all"

const PERIOD_LABELS: Record<Period, string> = {
  today: "Today",
  "7d": "7 days",
  "30d": "30 days",
  all: "All time",
}

function formatClock(timestamp: number): string {
  return new Intl.DateTimeFormat(undefined, { month: "short", day: "numeric", hour: "numeric", minute: "2-digit" }).format(timestamp)
}

function scorePercent(attempt: NailExamAttempt): number | null {
  if (attempt.status !== "completed" || attempt.correct === null) return null
  return Math.round((attempt.correct / attempt.questionCount) * 100)
}

function Score({ attempt }: { attempt: NailExamAttempt }) {
  const percent = scorePercent(attempt)
  if (percent === null) {
    return <span className="inline-flex items-center gap-1.5 rounded-full bg-amber-50 px-2.5 py-1 text-xs font-semibold text-amber-800 ring-1 ring-inset ring-amber-200"><Clock3 size={13} aria-hidden="true" /> In progress</span>
  }
  return <div className="text-right"><p className="text-lg font-bold tabular-nums text-[#36223a]">{attempt.correct}<span className="font-medium text-[#7d687e]">/{attempt.questionCount}</span></p><p className="text-xs font-medium text-[#8b7589]">{percent}%</p></div>
}

function MetricCard({ label, value, detail, icon: Icon }: { label: string; value: string | number; detail: string; icon: typeof Activity }) {
  return (
    <article className="rounded-2xl border border-[#eadde5] bg-white p-4 shadow-[0_8px_30px_rgba(78,42,68,0.06)] sm:p-5">
      <div className="flex items-center justify-between gap-3"><p className="text-sm font-medium text-[#7d687e]">{label}</p><span className="grid size-9 place-items-center rounded-xl bg-[#f8edf4] text-[#8a3f68]"><Icon size={18} aria-hidden="true" /></span></div>
      <p className="mt-4 font-[family-name:var(--font-outfit)] text-3xl font-semibold tracking-tight text-[#36223a]">{value}</p>
      <p className="mt-1 text-xs text-[#9a8798]">{detail}</p>
    </article>
  )
}

export function NailExamUsageAdminPage() {
  const [auth, setAuth] = useState<Auth | null>(null)
  const [user, setUser] = useState<User | null>(null)
  const [authReady, setAuthReady] = useState(false)
  const [initError, setInitError] = useState("")
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [loginError, setLoginError] = useState("")
  const [attempts, setAttempts] = useState<NailExamAttempt[]>([])
  const [learnerActivity, setLearnerActivity] = useState<NailExamLearnerActivity[]>([])
  const [loading, setLoading] = useState(false)
  const [loadError, setLoadError] = useState("")
  const [period, setPeriod] = useState<Period>("7d")
  const [lastRefreshedAt, setLastRefreshedAt] = useState<number | null>(null)

  useEffect(() => {
    void import("firebase/auth").then(({ getAuth }) => {
      const app = getFirebaseApp()
      if (!app) {
        setInitError("Firebase is not configured for this build.")
        setAuthReady(true)
        return
      }
      setAuth(getAuth(app))
    })
  }, [])

  useEffect(() => {
    if (!auth) return
    return onAuthStateChanged(auth, (nextUser) => { setUser(nextUser); setAuthReady(true) })
  }, [auth])

  const refresh = useCallback(async () => {
    setLoading(true)
    setLoadError("")
    try {
      const [nextAttempts, nextLearnerActivity] = await Promise.all([
        loadNailExamAttempts(),
        loadNailExamLearnerActivity(),
      ])
      setAttempts(nextAttempts)
      setLearnerActivity(nextLearnerActivity)
      setLastRefreshedAt(Date.now())
    } catch (error) {
      console.error(error)
      setLoadError("Activity could not be loaded. Confirm this account is in the admin allowlist and Firestore rules are published.")
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    if (user) void refresh()
    else {
      setAttempts([])
      setLearnerActivity([])
    }
  }, [refresh, user])

  const visibleAttempts = useMemo(() => {
    if (period === "all") return attempts
    const cutoff = new Date()
    if (period === "today") cutoff.setHours(0, 0, 0, 0)
    else cutoff.setTime(Date.now() - (period === "7d" ? 7 : 30) * 24 * 60 * 60 * 1000)
    return attempts.filter((attempt) => (attempt.startedAt ?? attempt.completedAt ?? 0) >= cutoff.getTime())
  }, [attempts, period])

  const completed = visibleAttempts.filter((attempt) => attempt.status === "completed" && attempt.correct !== null)
  const learners = new Set(visibleAttempts.map((attempt) => attempt.learnerId)).size
  const completionRate = visibleAttempts.length ? Math.round((completed.length / visibleAttempts.length) * 100) : 0
  const averageScore = completed.length ? Math.round(completed.reduce((total, attempt) => total + ((attempt.correct || 0) / attempt.questionCount) * 100, 0) / completed.length) : 0
  const attemptsByLearner = useMemo(() => recentAttemptsPerLearner(attempts), [attempts])
  const activityByLearner = useMemo(
    () => new Map(learnerActivity.map((activity) => [activity.learnerId, activity])),
    [learnerActivity],
  )
  const learnerTimelines = useMemo(() => {
    const learnerIds = new Set([...attemptsByLearner.keys(), ...activityByLearner.keys()])
    return [...learnerIds].map((learnerId) => {
      const recentAttempts = attemptsByLearner.get(learnerId) || []
      const activity = activityByLearner.get(learnerId)
      const fallbackActivity = recentAttempts.map((attempt) => attempt.completedAt ?? attempt.startedAt ?? 0)
      const recentActiveAt = activity?.recentActiveAt || fallbackActivity
      return {
        learnerId,
        recentAttempts,
        recentActiveAt: recentActiveAt.slice(0, 3),
        lastActiveAt: activity?.lastActiveAt || fallbackActivity[0] || 0,
      }
    }).sort((a, b) => b.lastActiveAt - a.lastActiveAt)
  }, [activityByLearner, attemptsByLearner])
  const bankSummary = useMemo(() => {
    const counts = new Map<string, { name: string; starts: number; completed: number }>()
    for (const attempt of visibleAttempts) {
      const item = counts.get(attempt.bankId) || { name: attempt.bankName, starts: 0, completed: 0 }
      item.starts += 1
      if (attempt.status === "completed") item.completed += 1
      counts.set(attempt.bankId, item)
    }
    return [...counts.values()].sort((a, b) => b.starts - a.starts)
  }, [visibleAttempts])
  const maxBankStarts = Math.max(1, ...bankSummary.map((bank) => bank.starts))

  async function submitLogin(event: FormEvent) {
    event.preventDefault()
    if (!auth) return
    setLoginError("")
    try {
      await signInWithEmailAndPassword(auth, email.trim(), password)
      setPassword("")
    } catch {
      setLoginError("Sign-in failed. Check your email and password.")
    }
  }

  if (!authReady || (!auth && !initError)) return <main className="grid min-h-dvh place-items-center bg-[#f7f1f5] text-[#7d687e]">Loading dashboard…</main>

  if (initError) return <main className="grid min-h-dvh place-items-center bg-[#f7f1f5] px-4 text-center text-[#36223a]"><div><Sparkles className="mx-auto text-[#a04f78]" /><p className="mt-3">{initError}</p></div></main>

  if (!user) {
    return (
      <main className="relative grid min-h-dvh place-items-center overflow-hidden bg-[#f7f1f5] px-4 py-10 text-[#36223a]">
        <div className="absolute -left-24 -top-24 size-72 rounded-full bg-[#eed7e5] blur-3xl" /><div className="absolute -bottom-32 -right-20 size-80 rounded-full bg-[#e6dced] blur-3xl" />
        <form onSubmit={submitLogin} className="relative w-full max-w-sm rounded-3xl border border-white/80 bg-white/85 p-7 shadow-[0_24px_80px_rgba(78,42,68,0.14)] backdrop-blur sm:p-8">
          <span className="grid size-12 place-items-center rounded-2xl bg-[#5f2949] text-white shadow-lg shadow-[#5f2949]/20"><BookOpenCheck size={23} aria-hidden="true" /></span>
          <p className="mt-6 text-xs font-bold uppercase tracking-[0.2em] text-[#a04f78]">Study Zone</p><h1 className="mt-2 font-[family-name:var(--font-outfit)] text-3xl font-semibold tracking-tight">Nail exam insights</h1><p className="mt-2 text-sm leading-relaxed text-[#7d687e]">Private activity and progress for Nail Exam Practice.</p>
          <label className="mt-7 block text-sm font-semibold">Email<input required type="email" autoComplete="username" value={email} onChange={(event) => setEmail(event.target.value)} className="mt-2 min-h-12 w-full rounded-xl border border-[#dfd0da] bg-white px-3.5 text-base outline-none transition focus:border-[#9a4e75] focus:ring-4 focus:ring-[#ead7e2]" /></label>
          <label className="mt-4 block text-sm font-semibold">Password<input required type="password" autoComplete="current-password" value={password} onChange={(event) => setPassword(event.target.value)} className="mt-2 min-h-12 w-full rounded-xl border border-[#dfd0da] bg-white px-3.5 text-base outline-none transition focus:border-[#9a4e75] focus:ring-4 focus:ring-[#ead7e2]" /></label>
          {loginError && <p role="alert" className="mt-4 rounded-xl bg-rose-50 px-3 py-2.5 text-sm text-rose-700">{loginError}</p>}
          <button type="submit" className="mt-6 min-h-12 w-full rounded-xl bg-[#5f2949] px-4 font-semibold text-white shadow-lg shadow-[#5f2949]/15 transition hover:bg-[#713356] focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-[#dcbccc]">Sign in</button>
          <Link href="/" className="mt-5 flex items-center justify-center gap-1.5 text-sm font-medium text-[#82677b] hover:text-[#5f2949]"><ArrowLeft size={15} /> Back to Study Zone</Link>
        </form>
      </main>
    )
  }

  const metrics = [
    { label: "Learners", value: learners, detail: "Pseudonymous browser profiles", icon: Users },
    { label: "Exam starts", value: visibleAttempts.length, detail: `${completed.length} completed`, icon: Activity },
    { label: "Completion", value: `${completionRate}%`, detail: "Started exams finished", icon: CheckCircle2 },
    { label: "Average score", value: `${averageScore}%`, detail: completed.length ? `Across ${completed.length} completions` : "No completed exams yet", icon: Award },
  ]

  return (
    <main className="min-h-dvh bg-[#f7f1f5] text-[#36223a]">
      <header className="border-b border-[#eadde5] bg-white/90 backdrop-blur"><div className="mx-auto flex max-w-6xl items-center justify-between gap-4 px-4 py-4 sm:px-6"><div><p className="text-xs font-bold uppercase tracking-[0.18em] text-[#a04f78]">Study Zone</p><h1 className="font-[family-name:var(--font-outfit)] text-xl font-semibold">Nail exam insights</h1></div><button type="button" onClick={() => auth && signOut(auth)} className="inline-flex min-h-10 items-center gap-2 rounded-xl border border-[#e2d5de] bg-white px-3.5 text-sm font-semibold text-[#6e5669] transition hover:bg-[#faf5f8]"><LogOut size={16} /> Sign out</button></div></header>
      <div className="mx-auto max-w-6xl px-4 py-6 sm:px-6 sm:py-8">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between"><div><p className="text-sm font-medium text-[#8b7589]">A clear view of practice, persistence, and progress.</p><p className="mt-1 text-xs text-[#a18f9e]">Learners are shown with private, device-based aliases.</p></div><div className="flex flex-wrap items-center gap-2"><div className="flex rounded-xl border border-[#e3d7df] bg-white p-1" aria-label="Reporting period">{(Object.keys(PERIOD_LABELS) as Period[]).map((item) => <button key={item} type="button" onClick={() => setPeriod(item)} aria-pressed={period === item} className={`min-h-9 rounded-lg px-3 text-xs font-semibold transition ${period === item ? "bg-[#5f2949] text-white shadow-sm" : "text-[#7d687e] hover:bg-[#faf5f8]"}`}>{PERIOD_LABELS[item]}</button>)}</div>{lastRefreshedAt && <p className="text-xs text-[#a18f9e]">Last refreshed {formatRelativeTime(lastRefreshedAt)}</p>}<button type="button" onClick={() => void refresh()} disabled={loading} aria-label="Refresh activity" className="grid size-11 place-items-center rounded-xl border border-[#e3d7df] bg-white text-[#765c70] transition hover:bg-[#faf5f8] disabled:opacity-50"><RefreshCw size={17} className={loading ? "animate-spin" : ""} /></button></div></div>
        {loadError && <p role="alert" className="mt-5 rounded-2xl border border-rose-200 bg-rose-50 p-4 text-sm text-rose-800">{loadError}</p>}
        <section className="mt-6 grid grid-cols-2 gap-3 lg:grid-cols-4">{metrics.map((metric) => <MetricCard key={metric.label} {...metric} />)}</section>
        {!loading && !loadError && visibleAttempts.length === 0 ? (
          <section className="mt-6 rounded-3xl border border-dashed border-[#d8c4d1] bg-white/60 px-6 py-14 text-center"><span className="mx-auto grid size-12 place-items-center rounded-2xl bg-[#f1e3ec] text-[#965171]"><Activity size={22} /></span><h2 className="mt-4 text-lg font-semibold">No activity in this period</h2><p className="mx-auto mt-2 max-w-md text-sm leading-relaxed text-[#826f80]">A start appears when someone opens a Multiple Choice session. Their score is added when they finish.</p></section>
        ) : (
          <div className="mt-6 grid gap-6 lg:grid-cols-[minmax(0,1.35fr)_minmax(18rem,0.65fr)]">
            <section className="overflow-hidden rounded-3xl border border-[#eadde5] bg-white shadow-[0_8px_30px_rgba(78,42,68,0.05)]"><div className="flex items-center justify-between border-b border-[#eee4ea] px-5 py-4 sm:px-6"><div><h2 className="font-[family-name:var(--font-outfit)] text-lg font-semibold">Recent activity</h2><p className="text-xs text-[#9a8798]">Newest exam starts first</p></div><span className="rounded-full bg-[#f7edf3] px-2.5 py-1 text-xs font-semibold text-[#8d4a6d]">{visibleAttempts.length} total</span></div><ol className="divide-y divide-[#f0e7ed]">{visibleAttempts.slice(0, 12).map((attempt) => <li key={attempt.attemptId} className="grid grid-cols-[minmax(0,1fr)_auto] gap-4 px-5 py-4 transition hover:bg-[#fdfafd] sm:px-6"><div className="min-w-0"><div className="flex min-w-0 items-center gap-2"><span className="size-2 shrink-0 rounded-full bg-[#c27ba0]" /><p className="truncate font-semibold">{learnerAlias(attempt.learnerId)}</p></div><p className="mt-1 truncate text-sm text-[#725d70]">{attempt.sessionTitle}</p><p className="mt-1 text-xs text-[#a18f9e]">{attempt.startedAt !== null ? `${formatRelativeTime(attempt.startedAt)} · ${formatClock(attempt.startedAt)}` : "Start time unavailable"}</p></div><Score attempt={attempt} /></li>)}</ol></section>
            <div className="space-y-6">
              <section className="rounded-3xl border border-[#eadde5] bg-white p-5 shadow-[0_8px_30px_rgba(78,42,68,0.05)]"><h2 className="font-[family-name:var(--font-outfit)] text-lg font-semibold">Practice mix</h2><p className="mt-1 text-xs text-[#9a8798]">Starts by question bank</p><div className="mt-5 space-y-4">{bankSummary.map((bank) => <div key={bank.name}><div className="flex items-center justify-between gap-3 text-sm"><p className="truncate font-medium">{bank.name}</p><p className="shrink-0 text-xs text-[#8d778a]">{bank.completed}/{bank.starts} finished</p></div><div className="mt-2 h-2 overflow-hidden rounded-full bg-[#f1e7ed]"><div className="h-full rounded-full bg-gradient-to-r from-[#7c345b] to-[#c47aa0]" style={{ width: `${(bank.starts / maxBankStarts) * 100}%` }} /></div></div>)}</div></section>
              <section className="rounded-3xl bg-[#5f2949] p-5 text-white shadow-[0_16px_40px_rgba(75,34,59,0.18)]"><div className="flex items-center gap-2"><Users size={18} className="text-[#efbfd7]" /><h2 className="font-[family-name:var(--font-outfit)] text-lg font-semibold">Last app activity</h2></div><ol className="mt-4 divide-y divide-white/10">{learnerTimelines.slice(0, 6).map((learner) => <li key={learner.learnerId} className="flex items-center justify-between gap-3 py-3 first:pt-0 last:pb-0"><p className="min-w-0 truncate text-sm font-semibold">{learnerAlias(learner.learnerId)}</p><div className="shrink-0 text-right"><p className="text-sm font-semibold">{learner.lastActiveAt ? formatRelativeTime(learner.lastActiveAt) : "Not recorded"}</p>{learner.lastActiveAt > 0 && <p className="mt-0.5 text-xs text-white/55">{formatClock(learner.lastActiveAt)}</p>}</div></li>)}</ol></section>
            </div>
          </div>
        )}
        {learnerTimelines.length > 0 && (
          <section className="mt-8">
            <div className="flex items-end justify-between gap-4"><div><h2 className="font-[family-name:var(--font-outfit)] text-2xl font-semibold">Learner timelines</h2><p className="mt-1 text-sm text-[#8b7589]">Last app activity and the three most recent exams.</p></div><span className="hidden text-xs text-[#9a8798] sm:block">Newest activity first</span></div>
            <div className="mt-4 grid gap-4 lg:grid-cols-2">
              {learnerTimelines.map((learner) => (
                <article key={learner.learnerId} className="overflow-hidden rounded-3xl border border-[#eadde5] bg-white shadow-[0_8px_30px_rgba(78,42,68,0.05)]">
                  <div className="bg-gradient-to-r from-[#60304d] to-[#7d4565] px-5 py-4 text-white sm:px-6"><div className="flex items-start justify-between gap-4"><div><p className="font-[family-name:var(--font-outfit)] text-lg font-semibold">{learnerAlias(learner.learnerId)}</p><p className="mt-1 text-xs text-white/65">Private browser alias</p></div><div className="text-right"><p className="text-xs font-semibold uppercase tracking-wide text-[#f0cadd]">Last used</p><p className="mt-1 text-sm font-semibold">{learner.lastActiveAt ? formatRelativeTime(learner.lastActiveAt) : "Not recorded"}</p>{learner.lastActiveAt > 0 && <p className="mt-0.5 text-xs text-white/60">{formatClock(learner.lastActiveAt)}</p>}</div></div></div>
                  <div className="px-5 py-5 sm:px-6">
                    <div><p className="text-xs font-bold uppercase tracking-[0.12em] text-[#9a5277]">Last 3 app activity times</p><ol className="mt-2 flex flex-wrap gap-2">{learner.recentActiveAt.length ? learner.recentActiveAt.map((timestamp, index) => <li key={`${timestamp}-${index}`} className="rounded-lg bg-[#f8f1f5] px-2.5 py-1.5 text-xs font-medium text-[#715c6e]">{formatClock(timestamp)}</li>) : <li className="text-sm text-[#9a8798]">No app activity recorded yet.</li>}</ol></div>
                    <div className="mt-5"><p className="text-xs font-bold uppercase tracking-[0.12em] text-[#9a5277]">Last 3 exams</p><ol className="mt-3 space-y-3">{learner.recentAttempts.length ? learner.recentAttempts.map((attempt) => <li key={attempt.attemptId} className="rounded-2xl border border-[#eee4ea] bg-[#fdfafd] p-3.5"><div className="flex items-start justify-between gap-3"><div className="min-w-0"><p className="truncate text-sm font-semibold text-[#463044]">{attempt.sessionTitle}</p><dl className="mt-2 grid gap-1 text-xs text-[#7d687e]"><div className="flex gap-2"><dt className="w-14 shrink-0 font-semibold text-[#9a5277]">Started</dt><dd>{attempt.startedAt !== null ? formatClock(attempt.startedAt) : "Unavailable"}</dd></div><div className="flex gap-2"><dt className="w-14 shrink-0 font-semibold text-[#9a5277]">Finished</dt><dd>{attempt.completedAt ? formatClock(attempt.completedAt) : "Not finished"}</dd></div></dl></div><Score attempt={attempt} /></div><div className="mt-3 flex items-center gap-1.5 border-t border-[#eee4ea] pt-2.5 text-xs font-medium text-[#806b7d]"><Timer size={13} aria-hidden="true" /> {formatDuration(attempt.startedAt, attempt.completedAt)}</div></li>) : <li className="text-sm text-[#9a8798]">No exams recorded yet.</li>}</ol></div>
                  </div>
                </article>
              ))}
            </div>
          </section>
        )}
      </div>
    </main>
  )
}
