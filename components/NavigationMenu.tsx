"use client"

import React, { useState } from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { Menu, Home, Film, Book, ListTodo, ListChecks, Scale, ArrowRightLeft, Clock, PenLine } from "lucide-react"
import { Button } from "@/components/ui/button"
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet"
import { useLanguage } from "@/contexts/LanguageContext"
import { cn } from "@/lib/utils"

interface MenuItem {
  title: string
  href: string
  icon: React.ComponentType<{ className?: string }>
}

const getMenuItems = (language: "chinese" | "japanese"): MenuItem[] => [
  {
    title: "Main | 主页",
    href: "/",
    icon: Home,
  },
  {
    title: language === "japanese" ? "Word Reel | 単語リール" : "Word Reel | 单词卷轴",
    href: "/word-reel",
    icon: Film,
  },
  {
    title: "Verb Reel | 动词卷轴",
    href: "/irregular-verb-reel",
    icon: Film,
  },
  {
    title: language === "japanese" ? "New Words | 新単語" : "New Words | 生词",
    href: "/vocabulary",
    icon: Book,
  },
  {
    title: "-ing Spelling Quiz | -ing拼写测验",
    href: "/ing-spelling-quiz",
    icon: PenLine,
  },
  {
    title: "Capitals Quiz | 大写练习",
    href: "/capitals-quiz",
    icon: PenLine,
  },
  {
    title: "Irregular Verb Lists | 不规则动词列表",
    href: "/irregular-verb-lists",
    icon: ListTodo,
  },
  {
    title: "Irregular Verb Quiz | 不规则动词测验",
    href: "/irregular-verbs",
    icon: ListChecks,
  },
  {
    title: "Too & Enough Quiz | 太/足够 测验",
    href: "/too-enough-quiz",
    icon: Scale,
  },
  {
    title: "Preposition Quiz | 介词测验",
    href: "/prepositions",
    icon: ArrowRightLeft,
  },
  {
    title: "Verb Tense Quiz | 动词时态测验",
    href: "/verb-tenses",
    icon: Clock,
  },
]

export function NavigationMenu() {
  const pathname = usePathname()
  const { language, setLanguage } = useLanguage()
  const [open, setOpen] = useState(false)
  const menuItems = getMenuItems(language)

  const handleLinkClick = () => {
    setOpen(false)
  }

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger asChild>
        <Button
          variant="ghost"
          size="icon"
          className="fixed top-4 left-4 z-50 h-10 w-10 rounded-full bg-background/80 backdrop-blur-sm border shadow-lg hover:bg-accent"
          aria-label="Open navigation menu"
        >
          <Menu className="h-5 w-5" />
        </Button>
      </SheetTrigger>
      <SheetContent side="left" className="w-[300px] sm:w-[350px]">
        <SheetHeader>
          <SheetTitle>Navigation</SheetTitle>
        </SheetHeader>
        <div className="mt-6 flex flex-col gap-2">
          {menuItems.map((item) => {
            const Icon = item.icon
            const isActive = pathname === item.href
            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={handleLinkClick}
                className={cn(
                  "flex items-center gap-3 rounded-lg px-4 py-3 text-sm font-medium transition-colors",
                  isActive
                    ? "bg-accent text-accent-foreground"
                    : "hover:bg-accent hover:text-accent-foreground"
                )}
              >
                <Icon className="h-5 w-5" />
                <span>{item.title}</span>
              </Link>
            )
          })}
        </div>

        <div className="mt-8 pt-6 border-t">
          <div className="px-4 mb-3">
            <h3 className="text-sm font-semibold mb-3">Language | 语言</h3>
            <div className="flex flex-col gap-2">
              <button
                onClick={() => {
                  setLanguage("chinese")
                  setOpen(false)
                }}
                className={cn(
                  "flex items-center justify-between rounded-lg px-4 py-2 text-sm font-medium transition-colors text-left",
                  language === "chinese"
                    ? "bg-primary text-primary-foreground"
                    : "hover:bg-accent hover:text-accent-foreground"
                )}
              >
                <span>Chinese | 中文</span>
                {language === "chinese" && (
                  <span className="text-xs">✓</span>
                )}
              </button>
              <button
                onClick={() => {
                  setLanguage("japanese")
                  setOpen(false)
                }}
                className={cn(
                  "flex items-center justify-between rounded-lg px-4 py-2 text-sm font-medium transition-colors text-left",
                  language === "japanese"
                    ? "bg-primary text-primary-foreground"
                    : "hover:bg-accent hover:text-accent-foreground"
                )}
              >
                <span>Japanese | 日本語</span>
                {language === "japanese" && (
                  <span className="text-xs">✓</span>
                )}
              </button>
            </div>
          </div>
        </div>
      </SheetContent>
    </Sheet>
  )
}
