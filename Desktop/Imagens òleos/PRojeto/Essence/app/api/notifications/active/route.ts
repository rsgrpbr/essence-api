import { type NextRequest, NextResponse } from "next/server"
import { createAdminClient } from "@/lib/supabase/admin"

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams
    const userTier = searchParams.get("tier") || "free"

    const adminClient = createAdminClient()

    const { data, error } = await adminClient
      .from("notification_modals")
      .select("*")
      .eq("is_active", true)
      .or(`target_audience.eq.all,target_audience.eq.${userTier}`)
      .or("expires_at.is.null,expires_at.gt." + new Date().toISOString())
      .order("created_at", { ascending: false })
      .limit(1)
      .single()

    if (error && error.code !== "PGRST116") {
      console.error("[API-ACTIVE] Error fetching active notification:", error)
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json({ data: data || null }, { status: 200 })
  } catch (error: any) {
    console.error("[API-ACTIVE] Fatal error:", error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
