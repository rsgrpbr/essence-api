"use client"

import { useState, useEffect, useCallback } from "react"
import { getSupabaseClient } from "@/lib/supabase/client"
import type { AromaticAlarm } from "@/types/alarm.types"

interface CreateAlarmParams {
  time: string
  days_of_week: number[]
  alarm_type: string
  alarm_name?: string
}

interface AlarmResponse {
  success: boolean
  data?: AromaticAlarm
  error?: string
}

export function useAlarms() {
  const [alarms, setAlarms] = useState<AromaticAlarm[]>([])
  const [loading, setLoading] = useState(true)
  const supabase = getSupabaseClient()

  const fetchAlarms = useCallback(async () => {
    try {
      setLoading(true)
      const {
        data: { user },
      } = await supabase.auth.getUser()

      if (!user) {
        console.error("[v0] User not authenticated")
        setAlarms([])
        return
      }

      const { data, error } = await supabase.from("aromatic_alarms").select("*").eq("user_id", user.id).order("time")

      if (error) {
        console.error("[v0] Error fetching alarms:", error)
        return
      }

      setAlarms(data || [])
    } catch (error) {
      console.error("[v0] Exception fetching alarms:", error)
    } finally {
      setLoading(false)
    }
  }, [supabase])

  const createAlarm = async (params: CreateAlarmParams): Promise<AlarmResponse> => {
    try {
      console.log("🔵 [1] Iniciando createAlarm com params:", params)

      const {
        data: { user },
      } = await supabase.auth.getUser()

      console.log("🔵 [2] Usuário obtido:", user?.id)

      if (!user) {
        console.error("❌ [3] Usuário não autenticado")
        return { success: false, error: "Usuário não autenticado" }
      }

      const alarmData = {
        user_id: user.id,
        time: params.time + ":00",
        days_of_week: params.days_of_week,
        alarm_type: params.alarm_type,
        alarm_name: params.alarm_name?.trim() || `Alarme ${params.time}`,
        enabled: true,
      }

      console.log("🔵 [4] Dados que serão inseridos:", alarmData)

      const { data, error } = await supabase.from("aromatic_alarms").insert(alarmData).select().single()

      console.log("🔵 [5] Resultado do insert:", { data, error })

      if (error) {
        console.error("❌ [6] Erro ao criar alarme:", error)
        return { success: false, error: error.message }
      }

      console.log("✅ [7] Alarme criado com sucesso!")
      await fetchAlarms()
      return { success: true, data }
    } catch (error) {
      console.error("❌ [8] Exception creating alarm:", error)
      return {
        success: false,
        error: error instanceof Error ? error.message : "Erro ao criar alarme",
      }
    }
  }

  const deleteAlarm = async (id: string): Promise<AlarmResponse> => {
    try {
      const { error } = await supabase.from("aromatic_alarms").delete().eq("id", id)

      if (error) {
        console.error("[v0] Error deleting alarm:", error)
        return { success: false, error: error.message }
      }

      await fetchAlarms()
      return { success: true }
    } catch (error) {
      console.error("[v0] Exception deleting alarm:", error)
      return {
        success: false,
        error: error instanceof Error ? error.message : "Erro ao deletar alarme",
      }
    }
  }

  const toggleAlarm = async (id: string, enabled: boolean): Promise<AlarmResponse> => {
    try {
      const { error } = await supabase.from("aromatic_alarms").update({ enabled }).eq("id", id)

      if (error) {
        console.error("[v0] Error toggling alarm:", error)
        return { success: false, error: error.message }
      }

      await fetchAlarms()
      return { success: true }
    } catch (error) {
      console.error("[v0] Exception toggling alarm:", error)
      return {
        success: false,
        error: error instanceof Error ? error.message : "Erro ao atualizar alarme",
      }
    }
  }

  useEffect(() => {
    fetchAlarms()
  }, [fetchAlarms])

  return {
    alarms,
    loading,
    fetchAlarms,
    createAlarm,
    deleteAlarm,
    toggleAlarm,
  }
}
