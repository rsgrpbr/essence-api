"use client"

import { useState, useEffect } from "react"
import { getSupabaseClient } from "@/lib/supabase/client"

interface PhoneSettings {
  phone: string
  whatsappOptIn: boolean
  loading: boolean
  saving: boolean
}

interface SaveResult {
  success: boolean
  error?: string
}

export function usePhoneSettings() {
  const [phone, setPhone] = useState<string>("")
  const [whatsappOptIn, setWhatsappOptIn] = useState<boolean>(false)
  const [loading, setLoading] = useState<boolean>(true)
  const [saving, setSaving] = useState<boolean>(false)
  const supabase = getSupabaseClient()

  const loadPhoneSettings = async () => {
    try {
      setLoading(true)

      const {
        data: { user },
        error: userError,
      } = await supabase.auth.getUser()

      if (userError || !user) {
        console.error("[v0] Error getting user:", userError)
        return
      }

      const { data, error } = await supabase
        .from("profiles")
        .select("phone, whatsapp_opt_in")
        .eq("id", user.id)
        .single()

      if (error) {
        console.error("[v0] Error loading phone settings:", error)
        return
      }

      if (data) {
        setPhone(data.phone || "")
        setWhatsappOptIn(data.whatsapp_opt_in || false)
      }
    } catch (error) {
      console.error("[v0] Exception loading phone settings:", error)
    } finally {
      setLoading(false)
    }
  }

  const savePhoneSettings = async (newPhone: string, newOptIn: boolean): Promise<SaveResult> => {
    try {
      setSaving(true)

      const e164Regex = /^\+[1-9]\d{1,14}$/
      if (newPhone && !e164Regex.test(newPhone)) {
        return {
          success: false,
          error: "Formato de telefone inválido. Use o formato internacional (ex: +5511999999999)",
        }
      }

      const {
        data: { user },
        error: userError,
      } = await supabase.auth.getUser()

      if (userError || !user) {
        return {
          success: false,
          error: "Usuário não autenticado",
        }
      }

      const { error } = await supabase
        .from("profiles")
        .update({
          phone: newPhone,
          whatsapp_opt_in: newOptIn,
        })
        .eq("id", user.id)

      if (error) {
        console.error("[v0] Error saving phone settings:", error)
        return {
          success: false,
          error: "Erro ao salvar configurações",
        }
      }

      setPhone(newPhone)
      setWhatsappOptIn(newOptIn)

      return { success: true }
    } catch (error) {
      console.error("[v0] Exception saving phone settings:", error)
      return {
        success: false,
        error: "Erro inesperado ao salvar",
      }
    } finally {
      setSaving(false)
    }
  }

  useEffect(() => {
    loadPhoneSettings()
  }, [])

  return {
    phone,
    whatsappOptIn,
    loading,
    saving,
    loadPhoneSettings,
    savePhoneSettings,
    setPhone,
    setWhatsappOptIn,
  }
}
