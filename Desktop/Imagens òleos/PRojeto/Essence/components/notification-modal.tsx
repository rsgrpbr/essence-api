"use client"

import { useState, useEffect } from "react"
import Image from "next/image"
import { useRouter } from "next/navigation"
import { getSupabaseClient } from "@/lib/supabase/client"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Sparkles } from "lucide-react"

interface NotificationModalProps {
  userTier: "free" | "premium"
  userId: string
}

interface NotificationModal {
  id: string
  title: string
  description: string | null
  image_url: string
  target_audience: "all" | "free" | "premium"
  is_active: boolean
  expires_at: string | null
  created_at: string
}

export function NotificationModal({ userTier, userId }: NotificationModalProps) {
  useEffect(() => {
    console.log("🔔 [MODAL] =========================")
    console.log("🔔 [MODAL] Component MOUNTED!")
    console.log("🔔 [MODAL] userTier:", userTier)
    console.log("🔔 [MODAL] userId:", userId)
    console.log("🔔 [MODAL] =========================")
  }, [])

  const [open, setOpen] = useState(false)
  const [modal, setModal] = useState<NotificationModal | null>(null)
  const router = useRouter()
  const [isProcessing, setIsProcessing] = useState(false)
  const supabase = getSupabaseClient()

  useEffect(() => {
    console.log("[v0] 🔔 NotificationModal mounted")
    console.log("[v0] 👤 User ID:", userId)
    console.log("[v0] 🎯 User tier:", userTier)

    async function fetchAndCheckModal() {
      try {
        console.log("[v0] 📡 Fetching active modal...")
        const response = await fetch(`/api/notifications/active?tier=${userTier}`)
        console.log("[v0] 📥 Response status:", response.status)

        const { data: modalData } = await response.json()
        console.log("[v0] 📦 Modal data:", modalData)

        if (!modalData) {
          console.log("[v0] ❌ No active modal found for tier:", userTier)
          return
        }

        console.log("[v0] ✅ Found modal:", modalData.id)
        console.log("[v0] 🔍 Checking if user already viewed...")

        // Check if user already viewed this modal
        const { data: viewData, error: viewError } = await supabase
          .from("user_modal_views")
          .select("id")
          .eq("user_id", userId)
          .eq("modal_id", modalData.id)
          .maybeSingle()

        if (viewError) {
          console.error("[v0] ❌ Error checking modal view:", viewError)
          return
        }

        console.log("[v0] 👁️ View data:", viewData)

        // If user hasn't viewed it, show the modal
        if (!viewData) {
          console.log("[v0] 🎉 Showing modal to user!")
          setModal(modalData)
          setOpen(true)
        } else {
          console.log("[v0] ⏭️ User already viewed this modal")
        }
      } catch (error) {
        console.error("[v0] ❌ Exception fetching notification modal:", error)
      }
    }

    if (userId) {
      fetchAndCheckModal()
    } else {
      console.log("[v0] ⚠️ No userId provided, skipping modal check")
    }
  }, [userId, userTier, supabase])

  const handleClose = async () => {
    if (!modal) return

    console.log("[v0] 📝 Recording modal view...")

    try {
      // Record that user viewed this modal
      const { error } = await supabase.from("user_modal_views").insert({
        user_id: userId,
        modal_id: modal.id,
      })

      if (error) {
        console.error("[v0] ❌ Error recording modal view:", error)
      } else {
        console.log("[v0] ✅ Modal view recorded successfully")
      }
    } catch (error) {
      console.error("[v0] ❌ Exception recording modal view:", error)
    }

    setOpen(false)
    setModal(null)
  }

  const handleSubscribe = async () => {
    setIsProcessing(true)

    try {
      // Record modal view before redirecting
      await supabase.from("user_modal_views").insert({
        user_id: userId,
        modal_id: modal!.id,
      })

      // Create checkout session with BEMVINDO coupon
      const response = await fetch("/api/create-checkout-session", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          priceId: process.env.NEXT_PUBLIC_STRIPE_PRICE_MONTHLY || "",
          userId,
          couponCode: "BEMVINDO",
        }),
      })

      const data = await response.json()

      if (data.url) {
        window.location.href = data.url
      } else {
        console.error("No checkout URL returned")
        setIsProcessing(false)
      }
    } catch (error) {
      console.error("Error creating checkout session:", error)
      setIsProcessing(false)
    }
  }

  if (!modal) return null

  return (
    <Dialog open={open} onOpenChange={(isOpen) => !isOpen && handleClose()}>
      <DialogContent className="max-w-3xl p-0 overflow-hidden">
        <div className="relative aspect-[4/3] w-full overflow-hidden rounded-t-lg">
          <Image src={modal.image_url || "/placeholder.svg"} alt={modal.title} fill className="object-cover" priority />
        </div>
        <DialogHeader className="p-6 space-y-3">
          <DialogTitle className="text-2xl font-bold text-center">{modal.title}</DialogTitle>
          {modal.description && (
            <DialogDescription className="text-center text-base">{modal.description}</DialogDescription>
          )}
        </DialogHeader>

        {userTier === "free" && (
          <div className="px-6 pb-6 space-y-3">
            <Button
              onClick={handleSubscribe}
              disabled={isProcessing}
              className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-semibold py-6 text-lg"
            >
              {isProcessing ? (
                "Processando..."
              ) : (
                <>
                  <Sparkles className="mr-2 h-5 w-5" />
                  Assinar Premium - R$ 9,90
                </>
              )}
            </Button>
            <Button onClick={handleClose} variant="ghost" className="w-full text-gray-600 hover:text-gray-800">
              Continuar com plano gratuito
            </Button>
          </div>
        )}
      </DialogContent>
    </Dialog>
  )
}
