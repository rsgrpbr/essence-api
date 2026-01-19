import { type NextRequest, NextResponse } from "next/server"
import { createAdminClient } from "@/lib/supabase/admin"

export async function POST(request: NextRequest) {
  try {
    console.log("[API] Step 1: POST received")

    const formData = await request.formData()

    const accessToken = formData.get("access_token") as string | null
    const title = formData.get("title") as string
    const description = formData.get("description") as string | null
    const image = formData.get("image") as File | null
    const target_audience = formData.get("target_audience") as string
    const is_active_raw = formData.get("is_active")
    const expires_at_raw = formData.get("expires_at") as string | null

    console.log("[API] Step 2: Data extracted", { hasToken: !!accessToken })

    // Validation
    if (!title || title.trim() === "") {
      return NextResponse.json({ error: "Title is required" }, { status: 400 })
    }

    if (!image || image.size === 0) {
      return NextResponse.json({ error: "Image is required" }, { status: 400 })
    }

    if (!["free", "premium", "all"].includes(target_audience)) {
      return NextResponse.json({ error: "Invalid target_audience" }, { status: 400 })
    }

    if (!accessToken) {
      return NextResponse.json({ error: "Access token is required" }, { status: 401 })
    }

    console.log("[API] Step 3: Validation passed")

    const adminClient = createAdminClient()
    const {
      data: { user },
      error: userError,
    } = await adminClient.auth.getUser(accessToken)

    if (userError || !user) {
      console.error("[API] Step 4: Token validation failed", userError)
      return NextResponse.json({ error: "Invalid or expired token" }, { status: 401 })
    }

    console.log("[API] Step 4: Token validated, user:", user.id)

    console.log("[API] Step 5: Uploading image with admin client")

    const fileExt = image.name.split(".").pop()
    const fileName = `${Date.now()}-${Math.random().toString(36).substring(7)}.${fileExt}`
    const filePath = fileName

    // Convert File to ArrayBuffer
    const arrayBuffer = await image.arrayBuffer()
    const fileBuffer = new Uint8Array(arrayBuffer)

    // Upload using admin client (bypasses RLS)
    const { data: uploadData, error: uploadError } = await adminClient.storage
      .from("modal-images")
      .upload(filePath, fileBuffer, {
        contentType: image.type,
        upsert: false,
      })

    if (uploadError) {
      console.error("[API] Step 5: Upload failed", uploadError)
      return NextResponse.json({ error: `Upload failed: ${uploadError.message}` }, { status: 500 })
    }

    // Get public URL
    const {
      data: { publicUrl },
    } = adminClient.storage.from("modal-images").getPublicUrl(filePath)

    console.log("[API] Step 6: Image uploaded:", publicUrl)

    // Prepare data
    const is_active = is_active_raw === "true" || is_active_raw === true
    const expires_at = expires_at_raw && expires_at_raw.trim() !== "" ? expires_at_raw : null

    const insertData = {
      title: title.trim(),
      description: description && description.trim() !== "" ? description.trim() : null,
      image_url: publicUrl,
      target_audience: target_audience as "free" | "premium" | "all",
      is_active,
      expires_at,
      created_by: user.id,
    }

    console.log("[API] Step 7: Inserting with admin client (bypasses RLS)")

    // Insert using admin client (bypasses RLS)
    const { data, error } = await adminClient.from("notification_modals").insert(insertData).select().single()

    if (error) {
      console.error("[API] Step 7: Insert failed", error)
      await adminClient.storage.from("modal-images").remove([filePath])
      return NextResponse.json({ error: `Insert failed: ${error.message}` }, { status: 500 })
    }

    console.log("[API] Step 8: SUCCESS! Notification created:", data.id)

    return NextResponse.json({ success: true, data }, { status: 200 })
  } catch (error) {
    console.error("[API] Unexpected error:", error)
    return NextResponse.json({ error: error instanceof Error ? error.message : "Unknown error" }, { status: 500 })
  }
}

export async function GET(request: NextRequest) {
  try {
    const adminClient = createAdminClient()

    const { data, error } = await adminClient
      .from("notification_modals")
      .select("*")
      .order("created_at", { ascending: false })

    if (error) {
      console.error("[API-GET] Erro ao buscar notificações:", error)
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json({ data }, { status: 200 })
  } catch (error: any) {
    console.error("[API-GET] Erro fatal:", error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
