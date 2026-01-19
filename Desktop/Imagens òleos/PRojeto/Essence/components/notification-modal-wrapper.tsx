"use client"

import { useEffect, useState } from "react"
import { getSupabaseClient } from "@/lib/supabase/client"
import { NotificationModal } from "./notification-modal"

export function NotificationModalWrapper() {
  const [userId, setUserId] = useState<string | null>(null)
  const [userTier, setUserTier] = useState<"free" | "premium">("free")
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    console.log("🔍 [WRAPPER] Iniciando busca de usuário...")

    async function loadUser() {
      try {
        const supabase = getSupabaseClient()
        const {
          data: { user },
          error,
        } = await supabase.auth.getUser()

        console.log("🔍 [WRAPPER] User:", user?.id || "NULL")
        console.log("🔍 [WRAPPER] Error:", error)

        if (user) {
          setUserId(user.id)

          // Buscar tier do user_metadata primeiro
          const metadataTier = user.user_metadata?.subscription_tier
          console.log("🔍 [WRAPPER] Metadata tier:", metadataTier || "not found")

          if (metadataTier) {
            setUserTier(metadataTier)
          } else {
            // Se não tiver no metadata, buscar do profile
            const { data: profile } = await supabase
              .from("profiles")
              .select("subscription_tier")
              .eq("id", user.id)
              .single()

            console.log("🔍 [WRAPPER] Profile tier:", profile?.subscription_tier || "free")
            setUserTier(profile?.subscription_tier || "free")
          }
        }
      } catch (error) {
        console.error("🔍 [WRAPPER] Erro:", error)
      } finally {
        setIsLoading(false)
      }
    }

    loadUser()
  }, [])

  console.log("🔍 [WRAPPER] Renderizando - userId:", userId, "tier:", userTier, "loading:", isLoading)

  if (isLoading) {
    console.log("🔍 [WRAPPER] Ainda carregando, não renderiza modal")
    return null
  }

  if (!userId) {
    console.log("🔍 [WRAPPER] Sem userId, não renderiza modal")
    return null
  }

  console.log("🔍 [WRAPPER] ✅ Renderizando NotificationModal!")
  return <NotificationModal userTier={userTier} userId={userId} />
}
