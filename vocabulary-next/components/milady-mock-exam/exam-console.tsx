"use client"

import { useEffect, useMemo, useRef, useState } from "react"

import { MockExamActionRail } from "@/components/milady-mock-exam/action-rail"
import { MockExamCalculatorPanel } from "@/components/milady-mock-exam/calculator-panel"
import { MockExamCommentPanel } from "@/components/milady-mock-exam/comment-panel"
import { MockExamHeaderBar } from "@/components/milady-mock-exam/header-bar"
import { MockExamQuestionPanel } from "@/components/milady-mock-exam/question-panel"
import { MockExamScoreScreen } from "@/components/milady-mock-exam/score-screen"
import { MockExamStatusBar } from "@/components/milady-mock-exam/status-bar"
import { MockExamSummaryPanel } from "@/components/milady-mock-exam/summary-panel"
import { loadMockExamQuestions, type MockExamQuestion } from "@/data/milady-mock-exam/loadQuestions"
import {
  MOCK_EXAM_DURATION_SECONDS,
  buildMockExamSession,
  createEmptyAnswers,
  scoreMockExamSession,
  type MockExamAnswers,
} from "@/lib/milady-mock-exam"
import { MOCK_EXAM_TEXT } from "@/lib/milady-mock-exam-i18n"
import { MockExamChineseToggle } from "@/components/milady-mock-exam/chinese-toggle"

type Phase = "loading" | "start" | "in-progress" | "ended"
type PanelId = "none" | "summary" | "comment" | "calculator" | "converter"

const EXAM_ID = "396609891"
const CANDIDATE_ID = "1402266"

export function MockExamConsole() {
  const [phase, setPhase] = useState<Phase>("loading")
  const [pool, setPool] = useState<MockExamQuestion[]>([])
  const [questions, setQuestions] = useState<MockExamQuestion[]>([])
  const [answers, setAnswers] = useState<MockExamAnswers>({})
  const [currentIndex, setCurrentIndex] = useState(0)
  const [timeRemaining, setTimeRemaining] = useState(MOCK_EXAM_DURATION_SECONDS)
  const [showChinese, setShowChinese] = useState(false)
  const [activePanel, setActivePanel] = useState<PanelId>("none")
  const [candidateName, setCandidateName] = useState("Ermuciniu Wang")
  const phaseRef = useRef(phase)
  phaseRef.current = phase

  useEffect(() => {
    let cancelled = false
    loadMockExamQuestions().then((loaded) => {
      if (cancelled) return
      setPool(loaded)
      setPhase("start")
    })
    return () => {
      cancelled = true
    }
  }, [])

  useEffect(() => {
    if (phase !== "in-progress") return
    const interval = setInterval(() => {
      setTimeRemaining((prev) => {
        if (prev <= 1) {
          clearInterval(interval)
          setPhase("ended")
          return 0
        }
        return prev - 1
      })
    }, 1000)
    return () => clearInterval(interval)
  }, [phase])

  const currentQuestion = questions[currentIndex]

  const answeredCount = useMemo(
    () => questions.filter((question) => answers[question.id]?.selectedChoiceId).length,
    [questions, answers],
  )
  const unansweredCount = questions.length - answeredCount

  function startExam() {
    const session = buildMockExamSession(pool)
    setQuestions(session)
    setAnswers(createEmptyAnswers(session))
    setCurrentIndex(0)
    setTimeRemaining(MOCK_EXAM_DURATION_SECONDS)
    setActivePanel("none")
    setPhase("in-progress")
  }

  function selectChoice(choiceId: string) {
    if (!currentQuestion) return
    setAnswers((prev) => ({
      ...prev,
      [currentQuestion.id]: { ...prev[currentQuestion.id], selectedChoiceId: choiceId },
    }))
  }

  function toggleFlag() {
    if (!currentQuestion) return
    setAnswers((prev) => ({
      ...prev,
      [currentQuestion.id]: { ...prev[currentQuestion.id], flagged: !prev[currentQuestion.id].flagged },
    }))
  }

  function saveComment(reason: string, text: string) {
    if (!currentQuestion) return
    setAnswers((prev) => ({
      ...prev,
      [currentQuestion.id]: { ...prev[currentQuestion.id], comment: { reason, text } },
    }))
  }

  function goTo(index: number) {
    setCurrentIndex(Math.max(0, Math.min(questions.length - 1, index)))
    setActivePanel("none")
  }

  if (phase === "loading") {
    return (
      <div className="flex h-full items-center justify-center text-neutral-500">
        {MOCK_EXAM_TEXT.loadingExam.en}
      </div>
    )
  }

  if (phase === "start") {
    return (
      <div className="relative flex h-full flex-col items-center justify-center gap-4 bg-neutral-100 px-4 text-center">
        <div className="absolute right-4 top-4">
          <MockExamChineseToggle showChinese={showChinese} onToggle={() => setShowChinese((prev) => !prev)} />
        </div>
        <span className="text-2xl font-black italic tracking-tight text-neutral-900">
          Pro<span className="text-red-600">✓</span> {MOCK_EXAM_TEXT.examTitle.en}
        </span>
        {showChinese ? (
          <span className="-mt-3 text-base text-neutral-500">{MOCK_EXAM_TEXT.examTitle.zh}</span>
        ) : null}
        <p className="max-w-md text-sm text-neutral-600">
          {MOCK_EXAM_TEXT.examIntro.en(pool.length)}
          {showChinese ? (
            <span className="mt-1 block text-neutral-500">{MOCK_EXAM_TEXT.examIntro.zh(pool.length)}</span>
          ) : null}
        </p>
        <label className="flex flex-col gap-1 text-sm text-neutral-700">
          {MOCK_EXAM_TEXT.candidateName.en}
          {showChinese ? <span className="text-xs text-neutral-500">{MOCK_EXAM_TEXT.candidateName.zh}</span> : null}
          <input
            value={candidateName}
            onChange={(event) => setCandidateName(event.target.value)}
            className="rounded-sm border border-neutral-300 px-3 py-2 text-center"
          />
        </label>
        <button
          type="button"
          onClick={startExam}
          className="rounded-sm bg-red-600 px-6 py-2.5 text-sm font-medium text-white hover:bg-red-700"
        >
          {MOCK_EXAM_TEXT.beginExam.en}
          {showChinese ? <span className="ml-1.5">{MOCK_EXAM_TEXT.beginExam.zh}</span> : null}
        </button>
      </div>
    )
  }

  if (phase === "ended") {
    const { correct, total } = scoreMockExamSession(questions, answers)
    return (
      <MockExamScoreScreen
        questions={questions}
        answers={answers}
        correct={correct}
        total={total}
        showChinese={showChinese}
        onRestart={startExam}
      />
    )
  }

  if (!currentQuestion) return null
  const currentState = answers[currentQuestion.id]

  return (
    <div className="relative flex h-full flex-col overflow-hidden">
      <MockExamHeaderBar
        examId={EXAM_ID}
        candidateName={candidateName}
        candidateId={CANDIDATE_ID}
        showChinese={showChinese}
        onToggleChinese={() => setShowChinese((prev) => !prev)}
      />
      <MockExamStatusBar
        questionNumber={currentIndex + 1}
        flagged={currentState.flagged}
        timeRemainingSeconds={timeRemaining}
        answeredCount={answeredCount}
        unansweredCount={unansweredCount}
        showChinese={showChinese}
      />
      <div className="relative flex flex-1 overflow-hidden">
        <MockExamQuestionPanel
          question={currentQuestion}
          selectedChoiceId={currentState.selectedChoiceId}
          showChinese={showChinese}
          onSelectChoice={selectChoice}
        />
        <MockExamActionRail
          flagged={currentState.flagged}
          activePanel={activePanel}
          showChinese={showChinese}
          onToggleFlag={toggleFlag}
          onOpenComment={() => setActivePanel((prev) => (prev === "comment" ? "none" : "comment"))}
          onOpenSummary={() => setActivePanel((prev) => (prev === "summary" ? "none" : "summary"))}
          onOpenCalculator={() => setActivePanel((prev) => (prev === "calculator" ? "none" : "calculator"))}
          onOpenUnitConverter={() => setActivePanel((prev) => (prev === "converter" ? "none" : "converter"))}
          onBack={() => goTo(currentIndex - 1)}
          onNext={() => goTo(currentIndex + 1)}
          onEndTest={() => setPhase("ended")}
          canGoBack={currentIndex > 0}
          canGoNext={currentIndex < questions.length - 1}
        />

        {activePanel === "summary" ? (
          <MockExamSummaryPanel
            questions={questions}
            answers={answers}
            showChinese={showChinese}
            onJumpTo={goTo}
            onClose={() => setActivePanel("none")}
          />
        ) : null}
        {activePanel === "comment" ? (
          <MockExamCommentPanel
            initialReason={currentState.comment?.reason ?? null}
            initialText={currentState.comment?.text ?? null}
            showChinese={showChinese}
            onSave={saveComment}
            onClose={() => setActivePanel("none")}
          />
        ) : null}
        {activePanel === "calculator" ? (
          <MockExamCalculatorPanel showChinese={showChinese} onClose={() => setActivePanel("none")} />
        ) : null}
        {activePanel === "converter" ? (
          <div className="absolute right-6 top-20 z-40 w-64 rounded-md bg-white p-4 text-center text-sm text-neutral-500 shadow-2xl">
            <div className="mb-2 flex items-center justify-between">
              <h2 className="text-base font-semibold text-neutral-900">
                {MOCK_EXAM_TEXT.unitConverter.en}
                {showChinese ? <span className="ml-1.5 text-sm font-normal text-neutral-500">{MOCK_EXAM_TEXT.unitConverter.zh}</span> : null}
              </h2>
              <button
                type="button"
                onClick={() => setActivePanel("none")}
                aria-label="Close unit converter"
                className="text-lg leading-none text-neutral-500 hover:text-neutral-900"
              >
                ×
              </button>
            </div>
            {MOCK_EXAM_TEXT.notAvailablePractice.en}
            {showChinese ? <span className="block">{MOCK_EXAM_TEXT.notAvailablePractice.zh}</span> : null}
          </div>
        ) : null}
      </div>
    </div>
  )
}
