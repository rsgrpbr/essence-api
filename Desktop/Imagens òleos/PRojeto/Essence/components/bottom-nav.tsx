"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { Droplet, Sparkles, BookOpen, Wrench } from "lucide-react"

export function BottomNav() {
  const pathname = usePathname()

  const navItems = [
    {
      href: "/",
      label: "Óleos",
      icon: Droplet,
      active: pathname === "/" || pathname.startsWith("/oleo/"),
    },
    {
      href: "/como-me-sinto",
      label: "Como me sinto",
      icon: Sparkles,
      active: pathname === "/como-me-sinto",
    },
    {
      href: "/receitas",
      label: "Receitas",
      icon: BookOpen,
      active: pathname === "/receitas" || pathname.startsWith("/receita/"),
    },
    {
      href: "/ferramentas",
      label: "Ferramentas",
      icon: Wrench,
      active:
        pathname === "/ferramentas" ||
        pathname.startsWith("/calculadora") ||
        pathname.startsWith("/teste-sensibilidade"),
    },
  ]

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 border-t-2 border-emerald-200 bg-white shadow-lg">
      <div className="mx-auto flex max-w-7xl items-center justify-around">
        {navItems.map((item) => {
          const Icon = item.icon
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex flex-1 flex-col items-center gap-1 py-3 transition-colors ${
                item.active ? "text-emerald-600" : "text-emerald-400 hover:text-emerald-600"
              }`}
            >
              <Icon className="h-6 w-6" />
              <span className="text-xs font-medium">{item.label}</span>
            </Link>
          )
        })}
      </div>
    </nav>
  )
}
