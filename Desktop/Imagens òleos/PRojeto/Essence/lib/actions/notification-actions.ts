"use server"

import { createClient } from "@/lib/supabase/server"
import { revalidatePath } from "next/cache"
import { uploadImage, deleteImage } from "@/lib/supabase/storage"

export type NotificationModal = {
  id: string
  title: string
  description: string | null
  image_url: string
  target_audience: "free" | "premium" | "all"
  is_active: boolean
  created_at: string
  expires_at: string | null
  view_count?: number
}

/**
 * Fetches all notification modals with view counts
 * @returns Promise<NotificationModal[]> Array of notifications with view counts
 */
export async function getNotifications(): Promise<NotificationModal[]> {
  try {
    const supabase = await createClient()

    const { data, error } = await supabase
      .from("notification_modals")
      .select("*")
      .order("created_at", { ascending: false })

    if (error) {
      console.error("[v0] Error fetching notifications:", error)
      throw new Error("Failed to fetch notifications")
    }

    const notificationsWithCounts = await Promise.all(
      data.map(async (notification) => {
        const { count } = await supabase
          .from("user_modal_views")
          .select("*", { count: "exact", head: true })
          .eq("notification_id", notification.id)

        return {
          ...notification,
          view_count: count || 0,
        }
      }),
    )

    return notificationsWithCounts as NotificationModal[]
  } catch (error) {
    console.error("[v0] Exception in getNotifications:", error)
    throw error
  }
}

/**
 * Creates a new notification modal
 * @param formData FormData containing notification details
 * @returns Promise<NotificationModal> The created notification
 */
export async function createNotification(formData: FormData): Promise<NotificationModal> {
  try {
    console.log("[v0] Step 1: createNotification function started")

    const accessToken = formData.get("access_token") as string | null

    const title = formData.get("title") as string
    const description = formData.get("description") as string | null
    const image = formData.get("image") as File | null
    const target_audience = formData.get("target_audience") as string
    const is_active_raw = formData.get("is_active")
    const expires_at_raw = formData.get("expires_at") as string | null

    console.log("[v0] Step 2: FormData extracted", {
      title,
      hasDescription: !!description,
      hasImage: !!image,
      imageSize: image?.size,
      target_audience,
      is_active_raw,
      expires_at_raw,
      hasToken: !!accessToken, // Log if token was provided
    })

    if (!title || title.trim() === "") {
      throw new Error("Title is required")
    }

    if (!image || image.size === 0) {
      console.error("[v0] Step 3: Image validation failed - image is missing or empty")
      throw new Error("Image is required")
    }

    if (!["free", "premium", "all"].includes(target_audience)) {
      throw new Error(`Invalid target_audience: ${target_audience}`)
    }

    console.log("[v0] Step 3: Input validation passed")

    const supabase = await createClient()

    if (accessToken) {
      console.log("[v0] Step 3.5: Using provided access token for authentication")
      await supabase.auth.setSession({
        access_token: accessToken,
        refresh_token: "", // Not needed for this operation
      })
    }

    const {
      data: { user },
      error: userError,
    } = await supabase.auth.getUser()

    if (userError) {
      console.error("[v0] Step 4: User authentication error", userError)
      throw new Error(`Authentication failed: ${userError.message}`)
    }

    if (!user) {
      console.error("[v0] Step 4: No user found")
      throw new Error("User not authenticated")
    }

    console.log("[v0] Step 4: User authenticated", { userId: user.id })

    console.log("[v0] Step 5: Starting image upload to modal-images bucket")
    const imageResult = await uploadImage("modal-images", image)

    if (!imageResult.success || !imageResult.url) {
      console.error("[v0] Step 5: Image upload failed", imageResult.error)
      throw new Error(imageResult.error || "Failed to upload image")
    }

    console.log("[v0] Step 5: Image uploaded successfully", {
      url: imageResult.url,
      path: imageResult.path,
    })

    const is_active = is_active_raw === "true" || is_active_raw === true
    const expires_at = expires_at_raw && expires_at_raw.trim() !== "" ? expires_at_raw : null

    const insertData = {
      title: title.trim(),
      description: description && description.trim() !== "" ? description.trim() : null,
      image_url: imageResult.url,
      target_audience: target_audience as "free" | "premium" | "all",
      is_active,
      expires_at,
      created_by: user.id,
    }

    console.log("[v0] Step 6: Insert data prepared", insertData)

    console.log("[v0] Step 7: Starting database insert")
    const { data, error } = await supabase.from("notification_modals").insert(insertData).select().single()

    if (error) {
      console.error("[v0] Step 7: Database insert error", {
        message: error.message,
        code: error.code,
        details: error.details,
        hint: error.hint,
      })

      console.log("[v0] Step 7: Cleaning up uploaded image due to insert failure")
      await deleteImage("modal-images", imageResult.path)

      throw new Error(`Database insert failed: ${error.message}`)
    }

    console.log("[v0] Step 8: Notification created successfully", { id: data.id })

    revalidatePath("/admin/notifications")
    return data as NotificationModal
  } catch (error) {
    console.error("[v0] Exception in createNotification:", error)
    throw error
  }
}

/**
 * Updates an existing notification modal
 * @param id Notification ID
 * @param formData FormData containing updated notification details
 * @returns Promise<NotificationModal> The updated notification
 */
export async function updateNotification(id: string, formData: FormData): Promise<NotificationModal> {
  try {
    const { createAdminClient } = await import("@/lib/supabase/admin")
    const adminClient = createAdminClient()

    console.log("🔄 [ACTION] Atualizando notificação:", id)

    const title = formData.get("title") as string
    const description = formData.get("description") as string
    const targetAudience = formData.get("target_audience") as string
    const expiresAt = formData.get("expires_at") as string
    const oldImageUrl = formData.get("old_image_url") as string
    const imageFile = formData.get("image") as File | null

    let imageUrl = oldImageUrl

    // Se tem nova imagem, fazer upload
    if (imageFile && imageFile.size > 0) {
      console.log("📤 [ACTION] Upload nova imagem...")
      const uploadResult = await uploadImage(imageFile, "modal-images")

      if (!uploadResult) {
        throw new Error("Falha no upload da imagem")
      }

      imageUrl = uploadResult

      // Deletar imagem antiga
      if (oldImageUrl) {
        console.log("🗑️ [ACTION] Deletando imagem antiga...")
        await deleteImage(oldImageUrl)
      }
    }

    // Atualizar notificação
    const { data, error } = await adminClient
      .from("notification_modals")
      .update({
        title,
        description,
        image_url: imageUrl,
        target_audience: targetAudience,
        expires_at: expiresAt || null,
      })
      .eq("id", id)
      .select()
      .single()

    if (error) {
      console.error("❌ [ACTION] Erro ao atualizar:", error)
      throw new Error("Failed to update notification")
    }

    console.log("✅ [ACTION] Notificação atualizada:", data.id)
    revalidatePath("/admin/notifications")
    return data
  } catch (error: any) {
    console.error("❌ [ACTION] Exception ao atualizar:", error)
    throw error
  }
}

/**
 * Toggles the active status of a notification
 * @param id Notification ID
 * @param isActive New active status
 * @returns Promise<void>
 */
export async function toggleNotificationStatus(id: string, isActive: boolean): Promise<void> {
  try {
    const { createAdminClient } = await import("@/lib/supabase/admin")
    const adminClient = createAdminClient()

    console.log("🔄 [ACTION] Atualizando status da notificação:", id)

    const { error } = await adminClient.from("notification_modals").update({ is_active: isActive }).eq("id", id)

    if (error) {
      console.error("❌ [ACTION] Erro ao atualizar status:", error)
      throw new Error("Failed to toggle notification status")
    }

    console.log("✅ [ACTION] Status da notificação atualizado:", id, isActive)
    revalidatePath("/admin/notifications")
  } catch (error: any) {
    console.error("❌ [ACTION] Exception ao atualizar status:", error)
    throw error
  }
}

/**
 * Deletes a notification modal and its associated image
 * @param id Notification ID
 * @param imageUrl URL of the image to delete
 * @returns Promise<void>
 */
export async function deleteNotification(id: string, imageUrl: string): Promise<void> {
  try {
    const { createAdminClient } = await import("@/lib/supabase/admin")
    const adminClient = createAdminClient()

    console.log("🗑️ [ACTION] Deletando notificação:", id)

    // Deletar do banco
    const { error } = await adminClient.from("notification_modals").delete().eq("id", id)

    if (error) {
      console.error("❌ [ACTION] Erro ao deletar:", error)
      throw new Error("Failed to delete notification")
    }

    // Deletar imagem do storage
    if (imageUrl) {
      console.log("🗑️ [ACTION] Deletando imagem do storage...")
      await deleteImage(imageUrl)
    }

    console.log("✅ [ACTION] Notificação deletada")
    revalidatePath("/admin/notifications")
  } catch (error: any) {
    console.error("❌ [ACTION] Exception ao deletar:", error)
    throw error
  }
}
