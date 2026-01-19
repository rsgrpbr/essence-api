"use client"

import { useState, useEffect, useCallback } from "react"
import { getSupabaseClient } from "@/lib/supabase/client"
import type { PendingTrigger } from "@/types/alarm.types"

export function usePendingTriggers() {
  const [triggers, setTriggers] = useState<PendingTrigger[]>([])
  const [loading, setLoading] = useState(true)
  const supabase = getSupabaseClient()

  const fetchPendingTriggers = useCallback(async () => {
    try {
      setLoading(true)

      // Get authenticated user
      const {
        data: { user },
        error: userError,
      } = await supabase.auth.getUser()

      if (userError || !user) {
        console.error("[usePendingTriggers] User not authenticated:", userError)
        setTriggers([])
        return
      }

      // Call RPC function to get pending triggers
      const { data, error } = await supabase.rpc("get_pending_triggers", {
        p_user_id: user.id,
      })

      if (error) {
        console.error("[usePendingTriggers] Error fetching triggers:", error)
        setTriggers([])
        return
      }

      setTriggers(data || [])
    } catch (error) {
      console.error("[usePendingTriggers] Unexpected error:", error)
      setTriggers([])
    } finally {
      setLoading(false)
    }
  }, [supabase])

  const markAsViewed = useCallback(
    async (triggerId: string, feedback?: string) => {
      try {
        const now = new Date().toISOString()

        // Update trigger as viewed
        const { error } = await supabase
          .from("alarm_triggers")
          .update({
            viewed: true,
            viewed_at: now,
            user_feedback: feedback || null,
          })
          .eq("id", triggerId)

        if (error) {
          console.error("[usePendingTriggers] Error marking as viewed:", error)
          return { success: false, error: error.message }
        }

        setTriggers((prev) => prev.filter((t) => t.trigger_id !== triggerId))

        return { success: true }
      } catch (error) {
        console.error("[usePendingTriggers] Unexpected error:", error)
        return {
          success: false,
          error: error instanceof Error ? error.message : "Unknown error",
        }
      }
    },
    [supabase],
  )

  // Fetch on mount
  useEffect(() => {
    fetchPendingTriggers()
  }, [fetchPendingTriggers])

  return {
    triggers,
    loading,
    count: triggers.length,
    markAsViewed,
    refetch: fetchPendingTriggers,
  }
}
