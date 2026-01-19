"use client"

import { Crown } from "lucide-react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { useSubscription } from "@/lib/contexts/subscription-context"

export function PremiumButton() {
  const { user, userTier, isLoading } = useSubscription()
  const router = useRouter()
  const isLoggedIn = !!user

  if (isLoading || !isLoggedIn || userTier === "premium") {
    return null
  }

  return (
    <Link
      href="/checkout" // Alterado de /checkout/mobile para /checkout
      className="flex items-center gap-2 rounded-full bg-gradient-to-r from-emerald-500 via-teal-500 to-emerald-600 px-4 py-2 text-sm font-bold text-white shadow-lg transition-all hover:scale-105 hover:shadow-xl"
    >
      <Crown className="h-4 w-4" />
      Seja Premium
    </Link>
  )
}
