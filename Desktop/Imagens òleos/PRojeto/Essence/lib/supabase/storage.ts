"use server"

import { createClient } from "@/lib/supabase/server"

/**
 * Get public URL for a file in Supabase Storage
 * @param bucket - Storage bucket name
 * @param path - File path within the bucket
 * @returns Public URL for the file
 */
export async function getStorageUrl(bucket: string, path: string): Promise<string> {
  try {
    const supabase = await createClient()
    const { data } = supabase.storage.from(bucket).getPublicUrl(path)
    return data.publicUrl
  } catch (error) {
    console.error("[v0] Error getting storage URL:", error)
    throw new Error(`Failed to get storage URL for ${bucket}/${path}`)
  }
}

/**
 * Get optimized image URL with transformations
 * @param bucket - Storage bucket name
 * @param path - File path within the bucket
 * @param options - Transformation options (width, height, quality)
 * @returns Optimized image URL with transformations
 */
export async function getOptimizedImageUrl(
  bucket: string,
  path: string,
  options?: {
    width?: number
    height?: number
    quality?: number
  },
): Promise<string> {
  try {
    const supabase = await createClient()
    const { data } = supabase.storage.from(bucket).getPublicUrl(path, {
      transform: {
        width: options?.width,
        height: options?.height,
        quality: options?.quality || 80,
        format: "webp",
      },
    })
    return data.publicUrl
  } catch (error) {
    console.error("[v0] Error getting optimized image URL:", error)
    throw new Error(`Failed to get optimized image URL for ${bucket}/${path}`)
  }
}

/**
 * Upload file to Supabase Storage
 * @param bucket - Storage bucket name
 * @param file - File to upload
 * @param customPath - Optional custom path (auto-generated if not provided)
 * @returns Object with success status, URL, path, and optional error
 */
export async function uploadImage(
  bucket: string,
  file: File,
  customPath?: string,
): Promise<{ success: boolean; url?: string; path?: string; error?: string }> {
  try {
    console.log("[v0] uploadImage: Starting upload", { bucket, fileName: file.name, fileSize: file.size })

    const supabase = await createClient()

    const fileName = file.name.replace(/\s+/g, "-").replace(/[^a-zA-Z0-9.-]/g, "_")
    const uploadPath = customPath || `${Date.now()}-${fileName}`

    console.log("[v0] uploadImage: Upload path generated", { uploadPath })

    const { data, error } = await supabase.storage.from(bucket).upload(uploadPath, file, {
      cacheControl: "3600",
      upsert: false,
    })

    if (error) {
      console.error("[v0] uploadImage: Upload error", error)
      return {
        success: false,
        error: `Upload failed: ${error.message}`,
      }
    }

    if (!data) {
      console.error("[v0] uploadImage: No data returned from upload")
      return {
        success: false,
        error: "Upload succeeded but no data returned",
      }
    }

    const { data: urlData } = supabase.storage.from(bucket).getPublicUrl(data.path)

    console.log("[v0] uploadImage: Upload successful", {
      path: data.path,
      url: urlData.publicUrl,
    })

    return {
      success: true,
      url: urlData.publicUrl,
      path: data.path,
    }
  } catch (error) {
    console.error("[v0] uploadImage: Exception", error)
    return {
      success: false,
      error: error instanceof Error ? error.message : "Unknown upload error",
    }
  }
}

/**
 * Delete file from Supabase Storage
 * @param bucket - Storage bucket name
 * @param path - File path to delete (not full URL)
 */
export async function deleteImage(bucket: string, path: string): Promise<{ success: boolean; error?: string }> {
  try {
    console.log("[v0] deleteImage: Starting deletion", { bucket, path })

    const supabase = await createClient()

    let filePath = path
    if (path.includes("/storage/v1/object/public/")) {
      const urlParts = path.split("/storage/v1/object/public/")
      if (urlParts.length > 1) {
        const remainingPath = urlParts[1]
        // Remove bucket name if it's at the start
        filePath = remainingPath.replace(`${bucket}/`, "")
      }
    }

    console.log("[v0] deleteImage: Extracted file path", { filePath })

    const { error } = await supabase.storage.from(bucket).remove([filePath])

    if (error) {
      console.error("[v0] deleteImage: Deletion error", error)
      return {
        success: false,
        error: `Delete failed: ${error.message}`,
      }
    }

    console.log("[v0] deleteImage: File deleted successfully")
    return { success: true }
  } catch (error) {
    console.error("[v0] deleteImage: Exception", error)
    return {
      success: false,
      error: error instanceof Error ? error.message : "Unknown deletion error",
    }
  }
}
