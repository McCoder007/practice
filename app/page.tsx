"use client"

import Link from 'next/link'
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Book, ArrowRightLeft, Clock, ListChecks, ListTodo, Scale, Film } from "lucide-react"
import { motion } from "framer-motion"
import { cn } from "@/lib/utils"
import { NavigationMenu } from "@/components/NavigationMenu"
import { useLanguage } from "@/contexts/LanguageContext"

const getMenuItems = (language: "chinese" | "japanese") => [
  {
    title: language === "japanese" ? "Word Reel | 単語リール" : "Word Reel | 单词卷轴",
    href: "/word-reel",
    icon: Film,
    description: "Swipe through vocabulary like TikTok",
    color: "from-pink-500/10 to-rose-600/10",
    iconColor: "text-pink-500",
    borderColor: "border-pink-500/20",
    hoverColor: "hover:from-pink-500/20 hover:to-rose-600/20"
  },
  {
    title: language === "japanese" ? "New Words | 新単語" : "New Words | 生词",
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

export default function HomePage() {
  const { language } = useLanguage()
  const menuItems = getMenuItems(language)
  
  return (
    <>
      <NavigationMenu />
      <div className="min-h-screen flex flex-col items-center bg-gradient-to-b from-slate-50 to-slate-100 dark:from-slate-900 dark:to-slate-800 p-4">
      <motion.h1 
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-4xl font-bold mb-8 text-center bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent"
      >
        Study Zone
      </motion.h1>
      <div className="w-full max-w-md space-y-4">
        {menuItems.map((item, index) => (
          <motion.div
            key={item.href}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
          >
            <Link href={item.href}>
              <Card className={cn(
                "transition-all duration-300 border-2",
                item.color,
                item.borderColor,
                item.hoverColor,
                "hover:shadow-lg hover:scale-[1.02]",
                "py-3 gap-2"
              )}>
                <CardHeader className="flex flex-row items-center gap-4 px-6">
                  <div className={cn(
                    "p-2 rounded-lg bg-gradient-to-br",
                    item.color,
                    "shadow-sm"
                  )}>
                    <item.icon className={cn("h-6 w-6", item.iconColor)} />
                  </div>
                  <CardTitle className="text-lg">{item.title}</CardTitle>
                </CardHeader>
                <CardContent className="px-6">
                  <p className="text-sm text-muted-foreground">
                    {item.description}
                  </p>
                </CardContent>
              </Card>
            </Link>
          </motion.div>
        ))}
      </div>
    </div>
    </>
  )
}
