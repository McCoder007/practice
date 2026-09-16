"use client"

import { useEffect, useLayoutEffect, useState } from "react"

type TutorialStep = {
  target: string
  title: string
  description: string
  advanceOnTargetClick?: boolean
}

const STEPS: TutorialStep[] = [
  {
    target: "timer",
    title: "先看剩余时间",
    description: "考试开始后，这里会持续倒数。导览期间计时会暂停；导览结束后才开始倒数。",
  },
  {
    target: "question-number",
    title: "确认目前题号",
    description: "你现在正在做第 1 题。每次前进或返回时，可以在这里确认题号。",
  },
  {
    target: "question",
    title: "阅读题目和选项",
    description: "先读上方的题目，再看下面的四个答案。每道题只能选择一个答案，但之后仍可更改。",
  },
  {
    target: "answer-choice",
    title: "选择一个答案",
    description: "现在请点击这个答案，看看选择后的样子。被选中的答案会变成红色。",
    advanceOnTargetClick: true,
  },
  {
    target: "answer-choice",
    title: "答案已经选中",
    description: "红色表示这是你目前选择的答案。要更改答案，只要点击另一个选项。",
  },
  {
    target: "answered",
    title: "已回答题数增加了",
    description: "选择答案后，已回答题数变成 1；未回答题数也会同时减少。",
  },
  {
    target: "next",
    title: "前往下一题",
    description: "现在请点击右下角的“下一题”按钮前往第 2 题。刚才的答案会自动保留。",
    advanceOnTargetClick: true,
  },
  {
    target: "question-number",
    title: "你现在在第 2 题",
    description: "题号已经变成 2。即使这题还没有回答，你也可以先移动到其他题目。",
  },
  {
    target: "back",
    title: "返回上一题",
    description: "现在请点击左下角的“上一题”按钮回到第 1 题，确认原来的答案仍然保留。",
    advanceOnTargetClick: true,
  },
  {
    target: "answer-choice",
    title: "答案仍然保留",
    description: "回到第 1 题后，原来选择的答案还是红色，不需要重新作答。",
  },
  {
    target: "flag",
    title: "不确定时先标记",
    description: "假设你不确定第 1 题，请点击右侧的“标记”按钮，稍后再回来检查。",
    advanceOnTargetClick: true,
  },
  {
    target: "flag",
    title: "题目已经标记",
    description: "按钮变深表示第 1 题已标记。再次点击同一个按钮可以取消标记。",
  },
  {
    target: "summary",
    title: "打开答题总览",
    description: "现在请点击右侧的“答题总览”按钮，查看哪些题目已回答、未回答或已标记。",
    advanceOnTargetClick: true,
  },
  {
    target: "summary-answered",
    title: "查看已回答的题目",
    description: "第 1 题显示绿色勾号，表示你已经选择了答案。",
  },
  {
    target: "summary-unanswered",
    title: "查看未回答的题目",
    description: "第 2 题显示横线，表示还没有选择答案。你可以用这个清单找出漏答的题目。",
  },
  {
    target: "summary-flagged",
    title: "查看已标记的题目",
    description: "第 1 题旁边的小旗子表示它需要再次检查。结束考试前，可以在这里找出所有标记题。",
  },
  {
    target: "summary-first-row",
    title: "从总览跳回题目",
    description: "现在请点击第 1 题这一行，直接回到那道题。",
    advanceOnTargetClick: true,
  },
  {
    target: "chinese-toggle",
    title: "显示中文辅助",
    description: "需要帮助时，可以点这里显示中文翻译；英文题目会一直保留。",
  },
  {
    target: "comment",
    title: "回报题目意见",
    description: "如果题目内容有问题，可以在这里记录意见。这不会改变你的答案。",
  },
  {
    target: "calculator",
    title: "使用计算器",
    description: "遇到需要计算的题目时，可以从这里打开考试内的计算器。",
  },
  {
    target: "converter",
    title: "使用单位换算",
    description: "这个按钮代表单位换算工具；目前练习版暂时不提供实际换算功能。",
  },
  {
    target: "end-test",
    title: "结束考试",
    description: "完成 100 题并检查总览后，点击这里交卷并查看成绩。导览结束后，你可以继续从第 1 题作答。",
  },
]

type TargetRect = {
  top: number
  left: number
  width: number
  height: number
}

function getTarget(target: string) {
  return document.querySelector<HTMLElement>(`[data-tutorial="${target}"]`)
}

function getTargetRect(target: string): TargetRect | null {
  const element = getTarget(target)
  if (!element) return null
  const rect = element.getBoundingClientRect()
  return { top: rect.top, left: rect.left, width: rect.width, height: rect.height }
}

export function MockExamTutorialOverlay({ onClose }: { onClose: () => void }) {
  const [stepIndex, setStepIndex] = useState(0)
  const [targetRect, setTargetRect] = useState<TargetRect | null>(null)
  const step = STEPS[stepIndex]

  useLayoutEffect(() => {
    const update = () => setTargetRect(getTargetRect(step.target))
    const frame = window.requestAnimationFrame(update)
    window.addEventListener("resize", update)
    window.addEventListener("scroll", update, true)
    return () => {
      window.cancelAnimationFrame(frame)
      window.removeEventListener("resize", update)
      window.removeEventListener("scroll", update, true)
    }
  }, [step.target, stepIndex])

  useEffect(() => {
    const handleClick = (event: MouseEvent) => {
      if (!step.advanceOnTargetClick) return
      const clicked = event.target as Node
      const tutorialCard = document.querySelector<HTMLElement>("[data-tutorial-card]")
      if (tutorialCard?.contains(clicked)) return

      const target = getTarget(step.target)
      if (!target?.contains(clicked)) {
        event.preventDefault()
        event.stopPropagation()
        return
      }

      window.setTimeout(() => {
        setStepIndex((current) => Math.min(STEPS.length - 1, current + 1))
      }, 0)
    }

    document.addEventListener("click", handleClick, true)
    return () => document.removeEventListener("click", handleClick, true)
  }, [step.advanceOnTargetClick, step.target])

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") onClose()
    }
    window.addEventListener("keydown", handleKeyDown)
    return () => window.removeEventListener("keydown", handleKeyDown)
  }, [onClose])

  const padding = 6
  const spotlight = targetRect
    ? {
        top: Math.max(0, targetRect.top - padding),
        left: Math.max(0, targetRect.left - padding),
        width: targetRect.width + padding * 2,
        height: targetRect.height + padding * 2,
      }
    : null
  const viewportHeight = typeof window === "undefined" ? 800 : window.innerHeight
  const estimatedCardHeight = step.advanceOnTargetClick ? 330 : 270
  const belowTop = spotlight ? spotlight.top + spotlight.height + 16 : 16
  const aboveTop = spotlight ? spotlight.top - estimatedCardHeight - 16 : 16
  const cardTop =
    belowTop + estimatedCardHeight <= viewportHeight - 16
      ? belowTop
      : aboveTop >= 16
        ? aboveTop
        : 16
  const cardStyle = {
    top: cardTop,
    maxHeight: `calc(100vh - ${cardTop + 16}px)`,
  }

  return (
    <div
      className={`fixed inset-0 z-[100] ${step.advanceOnTargetClick ? "pointer-events-none" : ""}`}
      role="dialog"
      aria-modal="true"
      aria-label="考试界面导览"
    >
      {spotlight ? (
        <div
          className="pointer-events-none absolute rounded-md ring-4 ring-amber-300 shadow-[0_0_0_9999px_rgba(0,0,0,0.7)]"
          style={spotlight}
        />
      ) : (
        <div className="absolute inset-0 bg-black/70" />
      )}

      <section
        data-tutorial-card
        className="pointer-events-auto absolute left-1/2 w-[min(92vw,420px)] -translate-x-1/2 overflow-y-auto rounded-xl bg-white p-5 text-neutral-900 shadow-2xl"
        style={cardStyle}
      >
        <div className="mb-3 flex items-start justify-between gap-4">
          <div>
            <p className="mb-1 text-xs font-semibold text-red-600">
              第 {stepIndex + 1} 项，共 {STEPS.length} 项
            </p>
            <h2 className="text-xl font-bold">{step.title}</h2>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="-mr-2 -mt-2 rounded-md px-2 py-1 text-2xl leading-none text-neutral-500 hover:bg-neutral-100 hover:text-neutral-900"
            aria-label="关闭导览"
          >
            ×
          </button>
        </div>
        <p className="text-base leading-7 text-neutral-700">{step.description}</p>
        {step.advanceOnTargetClick ? (
          <p className="mt-4 rounded-md bg-amber-50 px-3 py-2 text-sm font-medium text-amber-900">
            请点击黄色框内的项目继续
          </p>
        ) : null}
        <div className="mt-5 flex items-center justify-between gap-3">
          <button
            type="button"
            onClick={onClose}
            className="rounded-md px-3 py-2 text-sm text-neutral-500 hover:bg-neutral-100 hover:text-neutral-900"
          >
            跳过导览
          </button>
          {!step.advanceOnTargetClick ? (
            <button
              type="button"
              onClick={() => {
                if (stepIndex === STEPS.length - 1) onClose()
                else setStepIndex((current) => current + 1)
              }}
              className="rounded-md bg-red-600 px-4 py-2 text-sm font-medium text-white hover:bg-red-700"
            >
              {stepIndex === STEPS.length - 1 ? "开始答题" : "继续"}
            </button>
          ) : null}
        </div>
      </section>
    </div>
  )
}
