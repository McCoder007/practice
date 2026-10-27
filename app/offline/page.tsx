"use client"

import { useCallback, useEffect, useRef, useState, type ReactNode } from "react"
import { CheckCircle2, ClipboardCheck, Layers, TriangleAlert, WifiOff } from "lucide-react"

import { NavigationMenu } from "@/components/NavigationMenu"
import {
  CleanListBackLink,
  CleanListBadge,
  CleanListGroup,
  CleanListPage,
  CleanListSection,
  CleanListTitle,
} from "@/components/nail-exam-practice/clean-list"
import { Button } from "@/components/ui/button"
import {
  fetchLatestManifest,
  getOfflineStatus,
  isIosSafariTab,
  isStoragePersisted,
  offlineState,
  removeOffline,
  requestPersistentStorage,
  roundedMegabytes,
  saveOffline,
  savingPercent,
  type OfflineManifest,
  type OfflineStatus,
  type SaveProgress,
} from "@/lib/offline-study"

/** English with Chinese under it. Every learner-facing line on this page uses both. */
function Bi({ en, zh, className }: { en: ReactNode; zh: ReactNode; className?: string }) {
  return (
    <p className={className}>
      {en}
      <span className="block text-[0.9em] text-slate-500 dark:text-slate-400" lang="zh-Hans">
        {zh}
      </span>
    </p>
  )
}

function Note({ children }: { children: ReactNode }) {
  return (
    <div className="flex gap-2.5 rounded-2xl bg-amber-50 px-4 py-3 text-[15px] text-amber-900 dark:bg-amber-950/60 dark:text-amber-100">
      <TriangleAlert className="mt-0.5 size-5 shrink-0" aria-hidden />
      <div className="flex flex-col gap-2">{children}</div>
    </div>
  )
}

const SAVED_PARTS = [
  { title: { en: "Prov Exam Topics", zh: "Prov 考试主题" }, icon: <Layers />, color: "bg-fuchsia-700 text-white" },
  { title: { en: "Tricky Words", zh: "易错词" }, icon: <TriangleAlert />, color: "bg-orange-700 text-white" },
  { title: { en: "Practice Test", zh: "模拟测试" }, icon: <ClipboardCheck />, color: "bg-violet-700 text-white" },
]

type Problem = "stopped" | "quota" | "changed" | "no-internet" | "remove-failed" | null

function megabytes(bytes: number): string {
  return (bytes / 1_000_000).toFixed(0)
}

function savedDate(savedAt: number): string {
  return new Date(savedAt).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })
}

export default function OfflineStudyPage() {
  const [loaded, setLoaded] = useState(false)
  const [status, setStatus] = useState<OfflineStatus | null>(null)
  const [latest, setLatest] = useState<OfflineManifest | null>(null)
  const [busy, setBusy] = useState<"saving" | "removing" | null>(null)
  const [progress, setProgress] = useState<SaveProgress | null>(null)
  const [problem, setProblem] = useState<Problem>(null)
  const [persisted, setPersisted] = useState<boolean | null>(null)
  const [iosSafari, setIosSafari] = useState(false)
  const busyRef = useRef(busy)
  busyRef.current = busy

  const refresh = useCallback(async () => {
    const [nextStatus, nextLatest, nextPersisted] = await Promise.all([
      getOfflineStatus(),
      fetchLatestManifest(),
      isStoragePersisted(),
    ])
    setStatus(nextStatus)
    if (nextLatest) setLatest(nextLatest)
    setPersisted(nextPersisted)
    setLoaded(true)
    return nextStatus
  }, [])

  useEffect(() => {
    setIosSafari(isIosSafariTab())
    void refresh()
    const onVisible = () => {
      if (document.visibilityState === "visible" && !busyRef.current) void refresh()
    }
    document.addEventListener("visibilitychange", onVisible)
    return () => document.removeEventListener("visibilitychange", onVisible)
  }, [refresh])

  // A save started on an earlier visit finishes its last batch: watch it, then offer Continue.
  useEffect(() => {
    if (busy || !status?.saving) return
    const timer = setTimeout(() => void refresh(), 2000)
    return () => clearTimeout(timer)
  }, [busy, status, refresh])

  const state = offlineState(status)
  const active = status?.active ?? null
  const updateReady = state === "ready" && latest !== null && active !== null && latest.version !== active.version
  const sizeBytes = latest?.totalBytes ?? active?.bytesTotal ?? status?.pending?.bytesTotal ?? 0

  const startSave = async () => {
    if (!latest || busy) return
    const updating = Boolean(active && active.version !== latest.version)
    setBusy("saving")
    setProblem(null)
    setProgress(null)
    const persistRequest = requestPersistentStorage()
    try {
      const result = await saveOffline(latest, setProgress)
      setPersisted(await persistRequest)
      if (result.result === "ready" && updating) {
        // The new copy is in use now: load it.
        window.location.reload()
        return
      }
      if (result.result === "changed") {
        setProblem("changed")
        setLatest(await fetchLatestManifest())
      } else if (result.result === "stopped") {
        setProblem(result.quotaExceeded ? "quota" : "stopped")
      }
    } catch {
      setProblem("stopped")
    }
    setBusy(null)
    await refresh()
  }

  const remove = async () => {
    if (busy) return
    if (!window.confirm("Remove the offline copy?\n删除离线内容？")) return
    setBusy("removing")
    setProblem(null)
    try {
      await removeOffline()
    } catch {
      setProblem("remove-failed")
    }
    setBusy(null)
    await refresh()
  }

  const shownProgress: SaveProgress | null =
    busy === "saving" ? progress : status?.saving ?? null
  const percent = savingPercent(shownProgress)

  let statusArea: ReactNode
  if (!loaded) {
    statusArea = <p className="text-slate-500">Checking… · 检查中…</p>
  } else if (state === "unsupported") {
    statusArea = (
      <Bi en="This browser cannot save for offline." zh="这个浏览器不能离线保存。" className="text-base" />
    )
  } else if (busy === "saving" || state === "saving") {
    statusArea = (
      <div className="flex flex-col gap-3">
        <Bi en={`Saving… ${percent}%`} zh="保存中…" className="text-lg font-semibold" />
        <div
          className="h-3 w-full overflow-hidden rounded-full bg-slate-200 dark:bg-slate-700"
          role="progressbar"
          aria-valuemin={0}
          aria-valuemax={100}
          aria-valuenow={percent}
        >
          <div className="h-full rounded-full bg-fuchsia-700 transition-[width]" style={{ width: `${percent}%` }} />
        </div>
        {shownProgress && (
          <p className="text-sm text-slate-500 dark:text-slate-400">
            {megabytes(shownProgress.bytesDone)} of {megabytes(shownProgress.bytesTotal)} MB
          </p>
        )}
        <Bi en="Keep this page open." zh="请不要关闭这个页面。" className="text-base font-medium" />
      </div>
    )
  } else if (state === "ready" && active) {
    statusArea = (
      <div className="flex flex-col gap-3">
        <div className="flex items-center gap-2.5">
          <CheckCircle2 className="size-7 shrink-0 text-emerald-600" aria-hidden />
          <Bi en="Ready ✓" zh="已保存" className="text-lg font-semibold" />
        </div>
        <p className="text-[15px] text-slate-600 dark:text-slate-300">
          Saved {savedDate(active.savedAt)} · 保存于 {new Date(active.savedAt).toLocaleDateString("zh-CN")}
        </p>
        {updateReady && (
          <>
            <Bi
              en="A new version is ready. Your saved copy still works."
              zh="有新版本。已保存的内容仍然可以用。"
              className="text-[15px]"
            />
            <Button size="lg" className="h-12 text-base" onClick={startSave}>
              Update | 更新
            </Button>
          </>
        )}
        <button
          type="button"
          onClick={remove}
          disabled={busy === "removing"}
          className="self-start text-sm text-slate-500 underline underline-offset-2 hover:text-rose-700 disabled:opacity-60 dark:text-slate-400"
        >
          Remove | 删除
        </button>
      </div>
    )
  } else if (state === "partial") {
    statusArea = (
      <div className="flex flex-col gap-3">
        <Bi en="Saving stopped before it finished." zh="保存没有完成。" className="text-lg font-semibold" />
        {status?.pending && (
          <p className="text-sm text-slate-500 dark:text-slate-400">
            {savingPercent({ bytesDone: status.pending.bytesPresent, bytesTotal: status.pending.bytesTotal })}%
          </p>
        )}
        <Button size="lg" className="h-12 text-base" onClick={startSave} disabled={!latest}>
          Continue | 继续
        </Button>
      </div>
    )
  } else {
    statusArea = (
      <Button size="lg" className="h-12 text-base" onClick={startSave} disabled={!latest}>
        Save for offline | 保存离线
      </Button>
    )
  }

  const problemText: Record<Exclude<Problem, null>, { en: string; zh: string }> = {
    stopped: { en: "Saving stopped. Check your internet, then try again.", zh: "保存停止了。请检查网络，然后再试一次。" },
    quota: { en: "The phone is full. Free some space, then try again.", zh: "手机空间不够。请清理空间，然后再试一次。" },
    changed: { en: "The app changed while saving. Tap Save again.", zh: "保存时应用有更新。请再点一次保存。" },
    "no-internet": { en: "No internet.", zh: "没有网络。" },
    "remove-failed": { en: "Could not remove. Try again.", zh: "删除失败，请再试一次。" },
  }

  const needsInternet = loaded && state !== "unsupported" && !latest && state !== "ready" && !busy

  return (
    <>
      <NavigationMenu />
      <CleanListPage>
        <CleanListBackLink href="/" title={{ en: "Study Zone", zh: "学习区" }} showChinese />
        <CleanListTitle
          title={{ en: "Offline study", zh: "离线学习" }}
          showChinese
          badge={
            <CleanListBadge className="bg-sky-700 text-white">
              <WifiOff />
            </CleanListBadge>
          }
        />

        <Bi
          en="Save the Study section on this phone so it works with no internet."
          zh="把学习部分保存在这部手机上，没有网络也能用。"
          className="px-1 text-base text-slate-800 dark:text-slate-100"
        />

        {iosSafari && (
          <Note>
            <Bi en="Open Study Zone from your home screen first." zh="请先从主屏幕打开学习区。" className="font-semibold" />
            <Bi
              en="In Safari, tap Share, then “Add to Home Screen”."
              zh="在 Safari 里点“分享”，再点“添加到主屏幕”。"
            />
          </Note>
        )}

        <CleanListSection label={{ en: "What is saved", zh: "保存的内容" }} showChinese>
          <CleanListGroup>
            {SAVED_PARTS.map((part) => (
              <div key={part.title.en} className="flex min-h-[52px] items-center gap-3 py-2">
                <CleanListBadge className={part.color}>{part.icon}</CleanListBadge>
                <span className="text-base font-semibold text-slate-900 dark:text-white">
                  {part.title.en}
                  <span className="ml-1.5 text-sm font-normal text-slate-500 dark:text-slate-400" lang="zh-Hans">
                    {part.title.zh}
                  </span>
                </span>
              </div>
            ))}
          </CleanListGroup>
          {sizeBytes > 0 && (
            <Bi
              en={`About ${roundedMegabytes(sizeBytes)} MB.`}
              zh={`大约 ${roundedMegabytes(sizeBytes)} MB。`}
              className="px-1 text-[15px] text-slate-600 dark:text-slate-300"
            />
          )}
        </CleanListSection>

        <div className="mt-1 flex flex-col gap-3 rounded-[18px] bg-white p-4 shadow-xs dark:bg-slate-800">
          {statusArea}
          {problem && (
            <Bi en={problemText[problem].en} zh={problemText[problem].zh} className="text-[15px] text-rose-700 dark:text-rose-300" />
          )}
          {needsInternet && (
            <Bi
              en="No internet. Connect to the internet to save."
              zh="没有网络。请连接网络后再保存。"
              className="text-[15px] text-slate-600 dark:text-slate-300"
            />
          )}
        </div>

        {state === "ready" && persisted === false && (
          <Note>
            <Bi
              en="The phone may remove this if storage is full. Open the app now and then."
              zh="手机空间不够时，可能会删除这些内容。请经常打开这个应用。"
            />
          </Note>
        )}
      </CleanListPage>
    </>
  )
}
