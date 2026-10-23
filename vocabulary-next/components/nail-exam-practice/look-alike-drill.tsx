"use client"

import Link from "next/link"
import { useState } from "react"
import { CheckCircle2, Lightbulb, Play, Volume2, XCircle } from "lucide-react"

import { ExamQuizChineseToggle } from "@/components/ExamQuizChineseToggle"
import { NavigationMenu } from "@/components/NavigationMenu"
import { useExamQuizPreferences } from "@/contexts/ExamQuizPreferencesContext"
import {
  EXAM_TOPICS_HREF,
  EXAM_TOPICS_TITLE,
  LOOK_ALIKE_DESCRIPTION,
  LOOK_ALIKE_TITLE,
} from "@/data/nail-exam-practice/catalog"
import { LOOK_ALIKE_GROUP_COUNT, LOOK_ALIKE_TOPICS, type TopicLookAlikeGroup } from "@/data/nic-domain-practice/word-reels"
import { buildLookAlikeRound, type LookAlikePrompt } from "@/lib/look-alike-drill"
import { playText } from "@/lib/tts"
import { cn } from "@/lib/utils"

const ROUND_SIZE = 10

type Phase =
  | { kind: "setup" }
  | { kind: "question"; prompts: LookAlikePrompt<TopicLookAlikeGroup>[]; at: number; picked: number | null; missed: LookAlikePrompt<TopicLookAlikeGroup>[] }
  | { kind: "done"; total: number; missed: LookAlikePrompt<TopicLookAlikeGroup>[] }

function speak(text: string) {
  try {
    playText(text)
  } catch {
    // Audio is optional.
  }
}

/** Small speaker button that reads English text aloud. */
function SpeakButton({ text, label, className }: { text: string; label: string; className?: string }) {
  return (
    <button
      type="button"
      onClick={() => speak(text)}
      className={cn(
        "flex size-10 shrink-0 items-center justify-center rounded-full text-slate-500 hover:bg-slate-100 hover:text-sky-600 dark:hover:bg-slate-800",
        className,
      )}
      aria-label={label}
    >
      <Volume2 className="size-5" aria-hidden />
    </button>
  )
}

export function LookAlikeDrill() {
  const { showChinese } = useExamQuizPreferences()
  // "English | 中文" when Chinese is on, English only when it is off.
  const bi = (en: string, zh: string) => (showChinese ? `${en} | ${zh}` : en)
  const [topicFilter, setTopicFilter] = useState<string>("all")
  const [phase, setPhase] = useState<Phase>({ kind: "setup" })

  const groupsFor = (topicId: string) =>
    topicId === "all"
      ? LOOK_ALIKE_TOPICS.flatMap((topic) => topic.groups)
      : (LOOK_ALIKE_TOPICS.find((topic) => topic.topicId === topicId)?.groups ?? [])

  const start = (prompts: LookAlikePrompt<TopicLookAlikeGroup>[]) => {
    if (prompts.length === 0) return
    setPhase({ kind: "question", prompts, at: 0, picked: null, missed: [] })
  }
  const startRound = (topicId: string = topicFilter) => {
    setTopicFilter(topicId)
    start(buildLookAlikeRound(groupsFor(topicId), ROUND_SIZE, Math.random))
  }

  const page = (children: React.ReactNode) => (
    <>
      <NavigationMenu />
      <ExamQuizChineseToggle />
      <div className="min-h-screen bg-gradient-to-b from-slate-50 to-slate-100 px-4 pb-10 pt-20 dark:from-slate-900 dark:to-slate-800">
        <div className="mx-auto flex w-full max-w-md flex-col gap-5">{children}</div>
      </div>
    </>
  )

  if (phase.kind === "question") {
    const prompt = phase.prompts[phase.at]
    const answered = phase.picked !== null
    const correct = phase.picked === prompt.answer
    const isLast = phase.at === phase.prompts.length - 1
    const answeredCount = phase.at + (answered ? 1 : 0)
    const score = answeredCount - phase.missed.length
    const target = prompt.group.items[prompt.answer]

    const pick = (choice: number) => {
      if (answered) return
      speak(prompt.group.items[choice].word)
      setPhase({
        ...phase,
        picked: choice,
        missed: choice === prompt.answer ? phase.missed : [...phase.missed, prompt],
      })
    }
    const next = () => {
      if (isLast) setPhase({ kind: "done", total: phase.prompts.length, missed: phase.missed })
      else setPhase({ ...phase, at: phase.at + 1, picked: null })
    }

    return page(
      <>
        <div className="flex items-center justify-between">
          <button
            type="button"
            onClick={() => setPhase({ kind: "setup" })}
            className="text-lg font-medium text-slate-600 underline-offset-2 hover:underline dark:text-slate-300"
          >
            ← {LOOK_ALIKE_TITLE.en}
          </button>
          <span className="rounded-full bg-white px-3 py-1 text-sm font-semibold text-slate-600 tabular-nums shadow-sm dark:bg-slate-800 dark:text-slate-300">
            {phase.at + 1} / {phase.prompts.length} · ✓ {score}
          </span>
        </div>

        <div className="rounded-3xl border-2 border-sky-200 bg-white p-5 shadow-sm dark:border-sky-900/60 dark:bg-slate-900">
          <div className="flex items-start justify-between gap-2">
            <p className="text-base font-medium text-slate-500 dark:text-slate-400">
              Which word means:{showChinese && " | 哪个词的意思是："}
            </p>
            <SpeakButton text={`Which word means: ${target.meaning.en}`} label="Hear the question" className="-mt-2 -mr-2" />
          </div>
          <p className="mt-1 text-2xl leading-snug font-bold text-slate-900 dark:text-white">{target.meaning.en}</p>
          {showChinese && <p className="mt-1 text-lg text-slate-500 dark:text-slate-400">{target.meaning.zh}</p>}
        </div>

        <div className="flex flex-col gap-3">
          {prompt.order.map((choice) => {
            const item = prompt.group.items[choice]
            const isAnswer = choice === prompt.answer
            const isPicked = choice === phase.picked
            return (
              <div key={item.word} className="flex items-stretch gap-2">
                <button
                  type="button"
                  disabled={answered}
                  onClick={() => pick(choice)}
                  className={cn(
                    "flex min-h-16 flex-1 items-center justify-between gap-3 rounded-2xl border-2 px-4 py-3 text-left transition-colors",
                    !answered && "border-slate-200 bg-white hover:border-sky-300 dark:border-slate-700 dark:bg-slate-900",
                    answered && isAnswer && "border-emerald-500 bg-emerald-50 dark:bg-emerald-950/40",
                    answered && isPicked && !isAnswer && "border-rose-400 bg-rose-50 dark:bg-rose-950/40",
                    answered && !isAnswer && !isPicked && "border-slate-200 bg-white opacity-80 dark:border-slate-700 dark:bg-slate-900",
                  )}
                >
                  <span>
                    <span className="block text-xl font-semibold text-slate-900 dark:text-white">{item.word}</span>
                    {showChinese && <span className="block text-base text-slate-500 dark:text-slate-400">{item.translation}</span>}
                    {answered && (
                      <span className="mt-0.5 block text-base text-slate-600 dark:text-slate-300">
                        {item.meaning.en}
                        {showChinese && <span className="block text-sm text-slate-500 dark:text-slate-400">{item.meaning.zh}</span>}
                      </span>
                    )}
                  </span>
                  {answered && isAnswer && <CheckCircle2 className="size-6 shrink-0 text-emerald-600" aria-label="Correct answer" />}
                  {answered && isPicked && !isAnswer && <XCircle className="size-6 shrink-0 text-rose-500" aria-label="Your answer" />}
                </button>
                <button
                  type="button"
                  // Before answering: just the word. After: the word and what it means.
                  onClick={() => speak(answered ? `${item.word}. ${item.meaning.en}` : item.word)}
                  className="flex w-12 shrink-0 items-center justify-center rounded-2xl border-2 border-slate-200 bg-white text-slate-500 hover:text-sky-600 dark:border-slate-700 dark:bg-slate-900"
                  aria-label={`Hear ${item.word}`}
                >
                  <Volume2 className="size-5" aria-hidden />
                </button>
              </div>
            )
          })}
        </div>

        {answered && (
          <>
            <p className={cn("text-center text-xl font-bold", correct ? "text-emerald-700 dark:text-emerald-400" : "text-rose-600 dark:text-rose-400")}>
              {correct ? bi("Correct!", "答对了！") : bi(`It's ${target.word}.`, `正确答案是 ${target.word}。`)}
            </p>
            <div className="rounded-2xl border-2 border-amber-200 bg-amber-50 p-4 dark:border-amber-900/50 dark:bg-amber-950/30">
              <div className="flex items-center justify-between gap-2">
                <p className="flex items-center gap-2 text-sm font-semibold tracking-wide text-amber-800 uppercase dark:text-amber-300">
                  <Lightbulb className="size-4" aria-hidden />
                  {bi("Remember", "记住")}
                </p>
                <SpeakButton text={prompt.group.tip.en} label="Hear the tip" className="-my-2 -mr-2 hover:bg-amber-100 dark:hover:bg-amber-900/40" />
              </div>
              <p className="mt-1.5 text-lg leading-snug text-slate-900 dark:text-white">{prompt.group.tip.en}</p>
              {showChinese && <p className="mt-1 text-base text-slate-600 dark:text-slate-300">{prompt.group.tip.zh}</p>}
            </div>
            <button
              type="button"
              onClick={next}
              className="min-h-14 rounded-2xl bg-sky-600 px-4 py-3 text-lg font-semibold text-white shadow-sm hover:bg-sky-700"
            >
              {isLast ? bi("See my score", "查看成绩") : bi("Next", "下一题")}
            </button>
          </>
        )}
      </>,
    )
  }

  if (phase.kind === "done") {
    const score = phase.total - phase.missed.length
    return page(
      <>
        <h1 className="text-center text-3xl font-bold text-slate-900 dark:text-white">
          {score} / {phase.total}
        </h1>
        <p className="text-center text-lg text-slate-600 dark:text-slate-300">
          {phase.missed.length === 0 ? bi("Perfect!", "全对！") : bi(`You missed ${phase.missed.length}.`, `错了 ${phase.missed.length} 题。`)}
        </p>
        {phase.missed.length > 0 && (
          <button
            type="button"
            onClick={() => start(phase.missed.map((p) => ({ ...p, order: [...p.order].reverse() })))}
            className="min-h-14 rounded-2xl bg-rose-600 px-4 py-3 text-lg font-semibold text-white shadow-sm hover:bg-rose-700"
          >
            {bi("Try the missed ones again", "再练错题")}
          </button>
        )}
        <button
          type="button"
          onClick={() => startRound()}
          className="min-h-14 rounded-2xl bg-sky-600 px-4 py-3 text-lg font-semibold text-white shadow-sm hover:bg-sky-700"
        >
          {bi("New round", "再来一轮")}
        </button>
        <button
          type="button"
          onClick={() => setPhase({ kind: "setup" })}
          className="min-h-12 rounded-2xl border-2 border-slate-200 bg-white px-4 py-3 text-lg font-semibold text-slate-700 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-200"
        >
          {bi("Choose a topic", "选择主题")}
        </button>
      </>,
    )
  }

  return page(
    <>
      <Link
        href={EXAM_TOPICS_HREF}
        className="text-lg font-medium text-slate-600 underline-offset-2 hover:underline dark:text-slate-300"
      >
        ← {EXAM_TOPICS_TITLE.en}
        {showChinese && <> | {EXAM_TOPICS_TITLE.zh}</>}
      </Link>
      <div>
        <h1 className="text-3xl font-bold text-slate-900 dark:text-white">
          {LOOK_ALIKE_TITLE.en}
          {showChinese && <span className="ml-2 text-xl font-semibold text-slate-400">{LOOK_ALIKE_TITLE.zh}</span>}
        </h1>
        <p className="mt-2 text-lg text-slate-600 dark:text-slate-300">
          {LOOK_ALIKE_DESCRIPTION.en}
          {showChinese && <span className="block text-base text-slate-500">{LOOK_ALIKE_DESCRIPTION.zh}</span>}
        </p>
      </div>

      {LOOK_ALIKE_GROUP_COUNT === 0 ? (
        <p className="rounded-2xl bg-white p-4 text-lg text-slate-600 shadow-sm dark:bg-slate-900 dark:text-slate-300">
          {bi("Coming soon.", "即将推出。")}
        </p>
      ) : (
        <>
          <div>
            <p className="mb-2 text-lg font-semibold text-slate-700 dark:text-slate-200">
              Tap a topic to start 10 questions{showChinese && " | 点一个主题，开始 10 道题"}
            </p>
            <div className="flex flex-col gap-2">
              {[{ topicId: "all", title: { en: "All topics", zh: "全部主题" }, count: LOOK_ALIKE_GROUP_COUNT }, ...LOOK_ALIKE_TOPICS.map((t) => ({ topicId: t.topicId, title: { en: `${t.order}. ${t.title.en}`, zh: t.title.zh }, count: t.groups.length }))].map((option) => {
                const all = option.topicId === "all"
                return (
                  <button
                    key={option.topicId}
                    type="button"
                    onClick={() => startRound(option.topicId)}
                    className={cn(
                      "flex items-center justify-between gap-3 rounded-2xl border-2 px-4 py-3 text-left transition-colors",
                      all
                        ? "border-sky-500 bg-sky-50 hover:bg-sky-100 dark:bg-sky-950/40"
                        : "border-slate-200 bg-white hover:border-sky-300 dark:border-slate-700 dark:bg-slate-900",
                    )}
                  >
                    <span>
                      <span className="block text-base font-semibold text-slate-900 dark:text-white">{option.title.en}</span>
                      {showChinese && <span className="block text-sm text-slate-500 dark:text-slate-400">{option.title.zh}</span>}
                    </span>
                    <span className="flex shrink-0 items-center gap-2 text-sm text-slate-500 dark:text-slate-400">
                      {option.count} {option.count === 1 ? "group" : "groups"}
                      <Play className="size-5 fill-sky-600 text-sky-600" aria-hidden />
                    </span>
                  </button>
                )
              })}
            </div>
          </div>
        </>
      )}
    </>,
  )
}
