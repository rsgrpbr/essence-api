export interface Profile {
  id: string
  phone: string | null
  phone_verified: boolean
  whatsapp_opt_in: boolean
}

export interface AromaticAlarm {
  id: string
  user_id: string
  time: string
  days_of_week: number[]
  enabled: boolean
  alarm_type: "morning" | "night" | "custom"
  alarm_name: string | null
}

export interface PendingTrigger {
  trigger_id: string
  alarm_name: string | null
  suggested_oil_name: string
  suggestion_reason: string
  triggered_at: string
  notification_type: string
}
