"use client"

import React from "react"
import { NavigationMenu } from "@/components/NavigationMenu"
import { IngSpellingQuiz } from "@/components/IngSpellingQuiz"

export default function IngSpellingQuizPage() {
  return (
    <>
      <NavigationMenu />
      <div className="min-h-screen bg-gray-50 dark:bg-slate-900">
        <header className="bg-white dark:bg-slate-800 p-4 shadow sticky top-0 z-10">
          <div className="max-w-3xl mx-auto text-center">
            <h1 className="text-xl font-semibold text-slate-900 dark:text-white">
              -ing Spelling Quiz | -ing拼写测验
            </h1>
            <p className="text-sm text-slate-600 dark:text-slate-400 mt-1">
              Practice the -ing form spelling rules. 练习动词-ing形式的拼写规则。
            </p>
          </div>
        </header>
        <main className="max-w-3xl mx-auto p-2 sm:p-4">
          <IngSpellingQuiz />
        </main>
      </div>
    </>
  )
}
