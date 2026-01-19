"use client"

import Image from "next/image"
import { useState } from "react"
import { getOleoImagePath, PLACEHOLDER_IMAGE } from "@/lib/utils/image-loader"

export function OilCardImage({
  slug,
  nome,
  isLocked,
}: {
  slug: string
  nome: string
  isLocked?: boolean
}) {
  const [imgSrc, setImgSrc] = useState(getOleoImagePath(slug))
  const [attempts, setAttempts] = useState(0)

  const handleImageError = () => {
    const formats = ["webp", "jpg", "jpeg", "png"]

    if (attempts < formats.length - 1) {
      const nextFormat = formats[attempts + 1]
      setImgSrc(`/oleos/${slug}.${nextFormat}`)
      setAttempts(attempts + 1)
    } else {
      setImgSrc(PLACEHOLDER_IMAGE)
    }
  }

  return (
    <Image
      src={imgSrc || "/placeholder.svg"}
      alt={nome}
      fill
      className={`object-cover transition-transform group-hover:scale-105 ${isLocked ? "opacity-70" : ""}`}
      onError={handleImageError}
      priority={false}
    />
  )
}
