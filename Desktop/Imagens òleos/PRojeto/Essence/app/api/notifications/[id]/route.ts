import { type NextRequest, NextResponse } from "next/server"
import { createAdminClient } from "@/lib/supabase/admin"

export async function PATCH(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const adminClient = createAdminClient()
    const formData = await request.formData()
    const id = params.id

    console.log("[API] Updating notification:", id)

    const title = formData.get("title") as string
    const description = formData.get("description") as string | null
    const targetAudience = formData.get("target_audience") as string
    const isActiveRaw = formData.get("is_active")
    const expiresAt = formData.get("expires_at") as string | null
    const oldImageUrl = formData.get("old_image_url") as string
    const imageFile = formData.get("image") as File | null

    let imageUrl = oldImageUrl

    // If new image provided, upload it
    if (imageFile && imageFile.size > 0) {
      console.log("[API] Uploading new image...")

      const fileExt = imageFile.name.split(".").pop()
      const fileName = `${Date.now()}-${Math.random().toString(36).substring(7)}.${fileExt}`

      const arrayBuffer = await imageFile.arrayBuffer()
      const fileBuffer = new Uint8Array(arrayBuffer)

      const { data: uploadData, error: uploadError } = await adminClient.storage
        .from("modal-images")
        .upload(fileName, fileBuffer, {
          contentType: imageFile.type,
          upsert: false,
        })

      if (uploadError) {
        console.error("[API] Upload failed:", uploadError)
        return NextResponse.json({ error: `Upload failed: ${uploadError.message}` }, { status: 500 })
      }

      const {
        data: { publicUrl },
      } = adminClient.storage.from("modal-images").getPublicUrl(fileName)

      imageUrl = publicUrl

      // Delete old image
      if (oldImageUrl) {
        console.log("[API] Deleting old image...")
        const oldImagePath = oldImageUrl.split("/").pop() || oldImageUrl
        await adminClient.storage.from("modal-images").remove([oldImagePath])
      }
    }

    // Prepare update data
    const isActive = isActiveRaw === "true" || isActiveRaw === true
    const updateData = {
      title: title.trim(),
      description: description && description.trim() !== "" ? description.trim() : null,
      image_url: imageUrl,
      target_audience: targetAudience as "free" | "premium" | "all",
      is_active: isActive,
      expires_at: expiresAt && expiresAt.trim() !== "" ? expiresAt : null,
    }

    // Update notification in database
    const { data, error } = await adminClient
      .from("notification_modals")
      .update(updateData)
      .eq("id", id)
      .select()
      .single()

    if (error) {
      console.error("[API] Error updating notification:", error)
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    console.log("[API] Notification updated successfully:", data.id)
    return NextResponse.json({ data }, { status: 200 })
  } catch (error: any) {
    console.error("[API] Unexpected error:", error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}

export async function DELETE(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const adminClient = createAdminClient()
    const { searchParams } = new URL(request.url)
    const imageUrl = searchParams.get("image_url")
    const id = params.id

    console.log("[API] Deleting notification:", id)

    // Delete from database
    const { error } = await adminClient.from("notification_modals").delete().eq("id", id)

    if (error) {
      console.error("[API] Error deleting notification:", error)
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    // Delete image from storage
    if (imageUrl) {
      console.log("[API] Deleting image from storage...")
      const imagePath = imageUrl.split("/").pop() || imageUrl
      await adminClient.storage.from("modal-images").remove([imagePath])
    }

    console.log("[API] Notification deleted successfully")
    return NextResponse.json({ success: true }, { status: 200 })
  } catch (error: any) {
    console.error("[API] Unexpected error:", error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
