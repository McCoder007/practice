"use client"

import Link from 'next/link'
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Book, ArrowRightLeft, Clock, ListChecks, ListTodo, Scale } from "lucide-react"
import { motion } from "framer-motion"
import { cn } from "@/lib/utils"

const menuItems = [
  {
    title: "New Words | 生词",
    href: "/vocabulary",
    icon: Book,
    description: "Practice new words with audio and translations",
    color: "from-blue-500/10 to-blue-600/10",
    iconColor: "text-blue-500",
    borderColor: "border-blue-500/20",
    hoverColor: "hover:from-blue-500/20 hover:to-blue-600/20"
  },
  {
    title: "Irregular Verb Lists | 不规则动词列表",
    href: "/irregular-verb-lists",
    icon: ListTodo,
    description: "Browse and study irregular verb lists",
    color: "from-rose-500/10 to-rose-600/10",
    iconColor: "text-rose-500",
    borderColor: "border-rose-500/20",
    hoverColor: "hover:from-rose-500/20 hover:to-rose-600/20"
  },
  {
    title: "Irregular Verb Quiz | 不规则动词测验",
    href: "/irregular-verbs",
    icon: ListChecks,
    description: "Quiz yourself on irregular verb forms",
    color: "from-amber-500/10 to-amber-600/10",
    iconColor: "text-amber-500",
    borderColor: "border-amber-500/20",
    hoverColor: "hover:from-amber-500/20 hover:to-amber-600/20"
  },
  {
    title: "Too & Enough Quiz | 太/足够 测验",
    href: "/too-enough-quiz",
    icon: Scale,
    description: "Practice using too, too much, too many, and enough",
    color: "from-sky-500/10 to-sky-600/10",
    iconColor: "text-sky-500",
    borderColor: "border-sky-500/20",
    hoverColor: "hover:from-sky-500/20 hover:to-sky-600/20"
  },
  {
    title: "Preposition Quiz | 介词测验",
    href: "/prepositions",
    icon: ArrowRightLeft,
    description: "Master preposition usage in different contexts",
    color: "from-purple-500/10 to-purple-600/10",
    iconColor: "text-purple-500",
    borderColor: "border-purple-500/20",
    hoverColor: "hover:from-purple-500/20 hover:to-purple-600/20"
  },
  {
    title: "Verb Tense Quiz | 动词时态测验",
    href: "/verb-tenses",
    icon: Clock,
    description: "Practice different verb tenses and conjugations",
    color: "from-emerald-500/10 to-emerald-600/10",
    iconColor: "text-emerald-500",
    borderColor: "border-emerald-500/20",
    hoverColor: "hover:from-emerald-500/20 hover:to-emerald-600/20"
  }
]

export default function Home() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center p-24">
      <h1 className="text-4xl font-bold mb-8">Vocabulary Next</h1>
      <p className="mb-6">
        Welcome to the next version of the vocabulary application!
      </p>
      
      <div className="flex gap-4">
        <Link 
          href="/vocabulary" 
          className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
        >
          Go to Vocabulary App
        </Link>
        
        <Link 
          href="/test-staging" 
          className="px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600"
        >
          Test Staging Page
        </Link>
      </div>
    </main>
  );
}
