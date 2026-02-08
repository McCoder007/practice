"use client"

import { CapitalsQuiz } from "@/components/CapitalsQuiz"
import { NavigationMenu } from "@/components/NavigationMenu"
import { motion } from "framer-motion"

export default function CapitalsQuizPage() {
    return (
        <div className="min-h-screen bg-slate-50 dark:bg-slate-950">
            <NavigationMenu />
            <div className="pt-20 pb-10 px-4">
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="max-w-xl mx-auto space-y-6"
                >
                    <div className="text-center space-y-2">
                        <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                            Capitals Quiz | 大写练习
                        </h1>
                        <p className="text-slate-500 dark:text-slate-400">
                            Practice proper capitalization in English sentences.
                        </p>
                    </div>

                    <CapitalsQuiz />
                </motion.div>
            </div>
        </div>
    )
}
