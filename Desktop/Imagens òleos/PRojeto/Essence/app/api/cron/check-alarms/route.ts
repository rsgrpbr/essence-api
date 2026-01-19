import { type NextRequest, NextResponse } from "next/server"
import { createClient } from "@supabase/supabase-js"
import { sendWhatsAppNotification } from "@/lib/twilio"

// Use service role for backend operations
const supabaseAdmin = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!, {
  auth: {
    autoRefreshToken: false,
    persistSession: false,
  },
})

export async function GET(req: NextRequest) {
  // 1. Check authorization
  const authHeader = req.headers.get("authorization")
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    console.error("[CRON] Unauthorized access attempt")
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  // 2. Get current time and day
  const now = new Date()
  const brasilTime = new Date(now.toLocaleString("en-US", { timeZone: "America/Sao_Paulo" }))
  const currentTime = brasilTime.toTimeString().slice(0, 8) // HH:MM:SS
  const currentDay = brasilTime.getDay() // 0-6 (Sunday-Saturday)

  console.log(`[CRON] Checking alarms at ${currentTime}, day ${currentDay}`)

  try {
    // 3. Get alarms to trigger
    const { data: alarms, error } = await supabaseAdmin.rpc("get_alarms_to_trigger", {
      p_current_time: currentTime,
      p_current_day_of_week: currentDay,
    })

    if (error) {
      console.error("[CRON] Error fetching alarms:", error)
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    if (!alarms || alarms.length === 0) {
      console.log("[CRON] No alarms to trigger")
      return NextResponse.json({ success: true, processed: 0 })
    }

    console.log(`[CRON] Found ${alarms.length} alarms to trigger`)

    // 4. Process each alarm
    let processed = 0
    const errors: string[] = []

    for (const alarm of alarms) {
      try {
        const { data: fullAlarm } = await supabaseAdmin
          .from("aromatic_alarms")
          .select("time")
          .eq("id", alarm.alarm_id)
          .single()

        const alarmTime = fullAlarm?.time || null

        // Select oil based on alarm type
        const oil = selectOil(alarm.alarm_type)

        console.log(`[CRON] Alarm ${alarm.alarm_id}:`, {
          phone: alarm.user_phone,
          whatsapp_opt_in: alarm.whatsapp_opt_in,
          subscription_tier: alarm.subscription_tier,
        })

        // Determine notification type
        let notificationType = alarm.user_phone && alarm.whatsapp_opt_in ? "whatsapp" : "pending"

        console.log(`[CRON] Initial notification type for alarm ${alarm.alarm_id}: ${notificationType}`)

        if (notificationType === "whatsapp" && alarm.subscription_tier !== "premium") {
          console.log(`[CRON] User ${alarm.user_id} is not premium, using pending notification`)
          notificationType = "pending"
        }

        console.log(`[CRON] Final notification type for alarm ${alarm.alarm_id}: ${notificationType}`)

        if (notificationType === "whatsapp") {
          console.log(`📱 Enviando WhatsApp para ${alarm.user_phone}...`)
          const whatsappResult = await sendWhatsAppNotification(
            alarm.user_phone,
            oil.name,
            oil.reason,
            alarm.alarm_name,
            alarmTime,
          )

          if (!whatsappResult.success) {
            console.log("⚠️ WhatsApp falhou, criando trigger pending como fallback")
            notificationType = "pending"
          }
        }

        // Create trigger
        const { error: insertError } = await supabaseAdmin.from("alarm_triggers").insert({
          alarm_id: alarm.alarm_id,
          user_id: alarm.user_id,
          triggered_date: now.toISOString().split("T")[0],
          suggested_oil_name: oil.name,
          suggestion_reason: oil.reason,
          notification_type: notificationType,
          notification_sent: notificationType === "whatsapp",
          viewed: false,
        })

        if (insertError) {
          console.error(`[CRON] Error creating trigger for alarm ${alarm.alarm_id}:`, insertError)
          errors.push(`Alarm ${alarm.alarm_id}: ${insertError.message}`)
          continue
        }

        console.log(`[CRON] ✓ Trigger created for alarm ${alarm.alarm_id} (${notificationType})`)
        processed++
      } catch (err) {
        const errorMsg = err instanceof Error ? err.message : "Unknown error"
        console.error(`[CRON] Error processing alarm ${alarm.alarm_id}:`, errorMsg)
        errors.push(`Alarm ${alarm.alarm_id}: ${errorMsg}`)
      }
    }

    return NextResponse.json({
      success: true,
      processed,
      total: alarms.length,
      errors: errors.length > 0 ? errors : undefined,
    })
  } catch (err) {
    const errorMsg = err instanceof Error ? err.message : "Unknown error"
    console.error("[CRON] Fatal error:", errorMsg)
    return NextResponse.json(
      {
        error: "Internal server error",
        details: errorMsg,
      },
      { status: 500 },
    )
  }
}

// Helper function to select oil based on alarm type
function selectOil(alarmType: string): { name: string; reason: string } {
  // Opções de óleos por tipo de alarme (com variação)
  const oilOptions = {
    morning: [
      { name: "Hortelã-Pimenta", reason: "Energiza e aumenta o foco" },
      { name: "Limão", reason: "Estimula clareza mental e bom humor" },
      { name: "Alecrim", reason: "Melhora concentração e memória" },
      { name: "Laranja", reason: "Eleva energia e disposição" },
      { name: "Eucalipto", reason: "Purifica e revitaliza" },
    ],
    afternoon: [
      { name: "Lavanda", reason: "Promove relaxamento e equilíbrio" },
      { name: "Bergamota", reason: "Reduz ansiedade e tensão" },
      { name: "Gerânio", reason: "Harmoniza emoções" },
      { name: "Ylang-Ylang", reason: "Acalma e restaura" },
    ],
    night: [
      { name: "Lavanda", reason: "Relaxa e promove sono tranquilo" },
      { name: "Camomila", reason: "Acalma a mente para dormir" },
      { name: "Cedro", reason: "Induz relaxamento profundo" },
      { name: "Vetiver", reason: "Tranquiliza e prepara para descanso" },
    ],
    custom: [
      { name: "Eucalipto", reason: "Purifica o ambiente" },
      { name: "Tea Tree", reason: "Limpa e renova" },
      { name: "Sálvia", reason: "Clareia pensamentos" },
    ],
  }

  // Escolher óleo aleatório baseado no tipo
  const options = oilOptions[alarmType as keyof typeof oilOptions] || oilOptions.custom
  const randomIndex = Math.floor(Math.random() * options.length)
  return options[randomIndex]
}
