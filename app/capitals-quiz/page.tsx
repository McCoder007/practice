"use client"

import { CapitalsQuiz } from "@/components/CapitalsQuiz"
import { NavigationMenu } from "@/components/NavigationMenu"
import { motion } from "framer-motion"

export default function CapitalsQuizPage() {
    return (
        <div className="min-h-screen bg-slate-50 dark:bg-slate-950">
            <NavigationMenu />
            <div className="pt-6 pb-4 px-4">
                <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="max-w-xl mx-auto space-y-3"
                >
                    <div className="text-center space-y-0.5">
                        <h1 className="text-xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                            Capitals Quiz | 大写练习
                        </h1>
                        <p className="text-xs font-medium text-slate-600 dark:text-slate-300">
                            Tap words that should be capitalized
                            <span className="text-[10px] font-normal opacity-70 ml-2">点击需要大写的单词</span>
                        </p>
                    </div>

                    <CapitalsQuiz />
                </motion.div>
            </div>
        </div >
    )
}
