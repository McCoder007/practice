"use client"

import { useEffect, useState } from "react"
import Link from "next/link"

import { NavigationMenu } from "@/components/NavigationMenu"
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion"
import { QUESTIONS_TO_REVIEW_TITLE } from "@/data/exam-quiz/catalog"
import { loadQuestionsToReview } from "@/data/exam-quiz/loadChapter"
import type { HeldQuestionBank } from "@/data/exam-quiz/types"
import { cn } from "@/lib/utils"

export default function QuestionsToReviewPage() {
  const [bank, setBank] = useState<HeldQuestionBank | null>(null)

  useEffect(() => {
    let cancelled = false
    loadQuestionsToReview().then((data) => {
      if (!cancelled) setBank(data)
    })
    return () => {
      cancelled = true
    }
  }, [])

  return (
    <>
      <NavigationMenu />
      <main className="min-h-screen bg-[#f7f3ea] text-stone-900">
        <div className="mx-auto flex w-full max-w-md flex-col gap-4 px-4 py-6 pb-16">
          <Link
            href="/exam-quiz"
            className="ml-12 text-sm font-medium text-stone-600 underline-offset-4 hover:text-stone-900 hover:underline sm:ml-0"
          >
            Back to Exam Practice | 返回考试练习
          </Link>
          <header className="rounded-2xl border border-amber-200 bg-[#fff8ee] px-4 py-5">
            <p className="text-xs font-semibold tracking-[0.18em] text-amber-800/80 uppercase">
              Study notes | 学习备注
            </p>
            <h1 className={cn("mt-2 text-xl font-semibold leading-snug break-words [overflow-wrap:anywhere]")}>
              {QUESTIONS_TO_REVIEW_TITLE.en} | {QUESTIONS_TO_REVIEW_TITLE.zh}
            </h1>
            <p className="mt-2 text-sm text-amber-900/80">
              {bank?.count ?? "…"} questions | {bank?.count ?? "…"} 道题目
            </p>
            {bank ? (
              <div className="mt-3 space-y-2 text-sm leading-relaxed text-stone-700">
                <p className="break-words [overflow-wrap:anywhere]">{bank.notice.en}</p>
                <p className="break-words [overflow-wrap:anywhere]" lang="zh-Hans">
                  {bank.notice.zh}
                </p>
              </div>
            ) : (
              <p className="mt-3 text-sm text-stone-600">Loading… | 正在加载…</p>
            )}
          </header>

          {bank ? (
            <Accordion type="multiple" className="flex flex-col gap-3">
              {bank.questions.map((question) => (
                <AccordionItem
                  key={question.id}
                  value={question.id}
                  className="overflow-hidden rounded-2xl border border-amber-200/90 bg-white shadow-none last:border-b"
                >
                  <AccordionTrigger className="items-start rounded-none border-0 bg-transparent px-4 py-4 text-left shadow-none hover:bg-amber-50/70 data-[state=open]:border-0 data-[state=open]:bg-amber-50">
                    <span className="min-w-0 flex-1">
                      <span className="block font-mono text-[11px] tracking-wide text-stone-500">
                        {question.id}
                      </span>
                      <span className="mt-2 block text-sm font-semibold leading-relaxed break-words [overflow-wrap:anywhere] text-stone-900">
                        {question.question.en}
                      </span>
                      <span
                        className="mt-1 block text-sm leading-relaxed break-words [overflow-wrap:anywhere] text-stone-700"
                        lang="zh-Hans"
                      >
                        {question.question.zh}
                      </span>
                      <span className="mt-3 block text-xs font-semibold tracking-wide text-amber-900/80 uppercase">
                        {bank.labels.reviewReason.en} | {bank.labels.reviewReason.zh}
                      </span>
                      <span className="mt-1 block text-sm font-normal leading-relaxed break-words [overflow-wrap:anywhere] text-stone-800">
                        {question.reviewReason.en}
                      </span>
                      <span
                        className="mt-1 block text-sm font-normal leading-relaxed break-words [overflow-wrap:anywhere] text-stone-700"
                        lang="zh-Hans"
                      >
                        {question.reviewReason.zh}
                      </span>
                    </span>
                  </AccordionTrigger>
                  <AccordionContent className="rounded-none border-0 border-t border-amber-100 bg-[#fffdf8] shadow-none">
                    <div className="space-y-4 text-sm leading-relaxed text-stone-700">
                      {question.choices.length ? (
                        <section>
                          <h2 className="text-xs font-semibold tracking-wide text-stone-500 uppercase">
                            Original choices | 原题选项
                          </h2>
                          <ul className="mt-2 space-y-2">
                            {question.choices.map((choice) => (
                              <li key={choice.id} className="break-words [overflow-wrap:anywhere]">
                                <span className="font-mono text-xs text-stone-500">{choice.id}.</span>{" "}
                                <span>{choice.en}</span>
                                <span className="block pl-4 text-stone-600" lang="zh-Hans">
                                  {choice.zh}
                                </span>
                              </li>
                            ))}
                          </ul>
                        </section>
                      ) : null}
                      <section className="rounded-xl border border-amber-200 bg-amber-50/80 px-3 py-3">
                        <h2 className="text-xs font-semibold tracking-wide text-amber-900/80 uppercase">
                          {bank.labels.sourceAnswer.en} | {bank.labels.sourceAnswer.zh}
                        </h2>
                        <p className="mt-2 break-words [overflow-wrap:anywhere]">{question.sourceAnswer.en || "—"}</p>
                        {question.sourceAnswer.zh ? (
                          <p className="mt-1 break-words [overflow-wrap:anywhere] text-stone-600" lang="zh-Hans">
                            {question.sourceAnswer.zh}
                          </p>
                        ) : null}
                        <p className="mt-2 text-xs break-words [overflow-wrap:anywhere] text-stone-600">
                          This is the original source answer. It is still under review and is not an approved correct answer.
                        </p>
                        <p className="mt-1 text-xs break-words [overflow-wrap:anywhere] text-stone-600" lang="zh-Hans">
                          这是原资料答案，仍在审核中，不是已批准的正确答案。
                        </p>
                      </section>
                      <section>
                        <h2 className="text-xs font-semibold tracking-wide text-stone-500 uppercase">
                          Original source | 原始来源
                        </h2>
                        <ul className="mt-2 space-y-1">
                          {question.sources.map((source) => (
                            <li key={`${source.book}-${source.itemRef}`} className="break-words [overflow-wrap:anywhere]">
                              {source.book} · {source.itemRef}
                            </li>
                          ))}
                        </ul>
                      </section>
                      {question.authorityRefs.length ? (
                        <section>
                          <h2 className="text-xs font-semibold tracking-wide text-stone-500 uppercase">
                            Authority references | 参考依据
                          </h2>
                          <ul className="mt-2 space-y-2">
                            {question.authorityRefs.map((ref, index) => (
                              <li key={`${question.id}-ref-${index}`} className="break-words [overflow-wrap:anywhere]">
                                {ref.source}
                                {ref.section ? ` · ${ref.section}` : ""}
                                {ref.printedPage ? ` · p. ${ref.printedPage}` : ""}
                              </li>
                            ))}
                          </ul>
                        </section>
                      ) : null}
                    </div>
                  </AccordionContent>
                </AccordionItem>
              ))}
            </Accordion>
          ) : null}
        </div>
      </main>
    </>
  )
}
