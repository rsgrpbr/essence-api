"use client"

import type React from "react"

import Image from "next/image"
import Link from "next/link"
import { useState } from "react"
import { useRouter } from "next/navigation"
import { getOleoImagePath, PLACEHOLDER_IMAGE } from "@/lib/utils/image-loader"
import type { Oleo } from "@/lib/data/oleos"
import { useSubscription } from "@/lib/contexts/subscription-context"
import { Lock, ChevronDown, Brain, Lightbulb } from "lucide-react"
import { Button } from "@/components/ui/button"

export function OleoImageClient({ slug, nome }: { slug: string; nome: string }) {
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
    <div className="relative aspect-square bg-gradient-to-br from-emerald-100 to-teal-100 md:aspect-auto">
      <Image
        src={imgSrc || "/placeholder.svg"}
        alt={nome}
        fill
        className="object-cover"
        onError={handleImageError}
        priority
      />
    </div>
  )
}

export function RelatedOleoCardClient({ oleo }: { oleo: Oleo }) {
  const [imgSrc, setImgSrc] = useState(getOleoImagePath(oleo.slug))
  const [attempts, setAttempts] = useState(0)

  const handleImageError = () => {
    const formats = ["webp", "jpg", "jpeg", "png"]

    if (attempts < formats.length - 1) {
      const nextFormat = formats[attempts + 1]
      setImgSrc(`/oleos/${oleo.slug}.${nextFormat}`)
      setAttempts(attempts + 1)
    } else {
      setImgSrc(PLACEHOLDER_IMAGE)
    }
  }

  return (
    <Link
      href={`/oleo/${oleo.slug}`}
      className="group block overflow-hidden rounded-xl bg-white shadow-sm transition-all hover:shadow-md hover:-translate-y-1"
      style={{ borderTop: `3px solid ${oleo.cor}` }}
    >
      <div className="relative aspect-square bg-gradient-to-br from-emerald-100 to-teal-100">
        <Image
          src={imgSrc || "/placeholder.svg"}
          alt={oleo.nome}
          fill
          className="object-cover transition-transform group-hover:scale-105"
          onError={handleImageError}
        />
      </div>
      <div className="p-3 max-w-full">
        <h3 className="text-xs font-semibold text-emerald-900 line-clamp-2 text-balance break-words">{oleo.nome}</h3>
      </div>
    </Link>
  )
}

export function LockedContentClient({
  oleo,
  children,
}: {
  oleo: Oleo
  children: React.ReactNode
}) {
  const { userTier, user } = useSubscription()
  const router = useRouter()
  const isLocked = !oleo.is_free && userTier === "free"

  const handleUnlockClick = (e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()

    // If user is not logged in, redirect to login with callback to checkout
    if (!user?.id || !user?.email) {
      router.push("/login?redirect=/checkout")
      return
    }

    // If user is logged in, redirect directly to checkout page
    router.push("/checkout")
  }

  if (!isLocked) {
    return <>{children}</>
  }

  return (
    <div className="relative">
      <div className="relative">{children}</div>

      <div className="absolute inset-0 bg-gradient-to-b from-transparent via-white/60 to-white pointer-events-none" />

      <div className="absolute inset-0 flex items-center justify-center">
        <Button
          onClick={handleUnlockClick}
          type="button"
          className="bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-white font-bold px-8 py-6 rounded-full shadow-2xl text-lg"
        >
          <Lock className="w-5 h-5 mr-2" />
          Desbloquear Premium
        </Button>
      </div>
    </div>
  )
}

export function UsageTipsClient({ dicasUso }: { dicasUso: Array<{ categoria: string; dicas: string[] }> }) {
  const [isExpanded, setIsExpanded] = useState(true)
  const [expandedBoxes, setExpandedBoxes] = useState<Set<number>>(new Set(dicasUso.map((_, idx) => idx)))

  const toggleBox = (idx: number) => {
    setExpandedBoxes((prev) => {
      const newSet = new Set(prev)
      if (newSet.has(idx)) {
        newSet.delete(idx)
      } else {
        newSet.add(idx)
      }
      return newSet
    })
  }

  return (
    <div className="mb-8">
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        className="flex w-full items-center justify-between gap-2 mb-5 text-left hover:opacity-80 transition-opacity"
      >
        <div className="flex items-center gap-2">
          <Lightbulb className="h-5 w-5 text-amber-600" />
          <h2 className="text-lg font-bold text-amber-900">Dicas de uso</h2>
        </div>
        <ChevronDown className={`h-5 w-5 text-amber-600 transition-transform ${isExpanded ? "rotate-180" : ""}`} />
      </button>

      {isExpanded && (
        <div className="space-y-4">
          {dicasUso.map((item, idx) => (
            <div key={idx} className="rounded-lg border-l-4 border-amber-400 bg-amber-50 overflow-hidden">
              <button
                onClick={() => toggleBox(idx)}
                className="w-full flex items-center justify-between gap-2 p-5 pb-3 text-left hover:opacity-80 transition-opacity"
              >
                <h3 className="text-sm font-bold uppercase tracking-wide text-amber-900">{item.categoria}</h3>
                <ChevronDown
                  className={`h-4 w-4 text-amber-600 transition-transform flex-shrink-0 ${
                    expandedBoxes.has(idx) ? "rotate-180" : ""
                  }`}
                />
              </button>

              {expandedBoxes.has(idx) && (
                <div className="px-5 pb-5">
                  <ul className="space-y-2.5">
                    {item.dicas.map((dica, i) => (
                      <li key={i} className="flex items-start gap-2.5 text-sm leading-relaxed text-gray-700">
                        <span className="mt-1.5 h-1.5 w-1.5 flex-shrink-0 rounded-full bg-amber-600" />
                        <span>{dica}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

export function PsicoaromaterapiaClient({
  psico,
  nomeOleo,
}: {
  psico: {
    textoPrincipal?: string
    emocoesNegativas?: string[]
    propriedadesPositivas?: string[]
    usosSugeridos?: Array<{
      tipo: string
      titulo: string
      descricao: string
    }>
  }
  nomeOleo: string
}) {
  const [isExpanded, setIsExpanded] = useState(false)

  const getPreviewText = () => {
    const fullText = psico.textoPrincipal || ""
    const words = fullText.split(" ")
    const firstTwoLines = words.slice(0, 25).join(" ")
    return firstTwoLines + (words.length > 25 ? "..." : "")
  }

  if (!psico.textoPrincipal) return null

  return (
    <div className="mb-8">
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        className="flex w-full items-center justify-between gap-2 mb-5 text-left hover:opacity-80 transition-opacity"
      >
        <div className="flex items-center gap-2">
          <Brain className="h-5 w-5 text-purple-600" />
          <h2 className="text-lg font-bold text-purple-900">Psicoaromaterapia</h2>
        </div>
        <ChevronDown className={`h-5 w-5 text-purple-600 transition-transform ${isExpanded ? "rotate-180" : ""}`} />
      </button>

      {!isExpanded ? (
        <div className="rounded-lg border-l-4 border-purple-500 bg-purple-100/60 p-5">
          <p className="text-sm leading-relaxed text-gray-700 text-justify line-clamp-2">{getPreviewText()}</p>
        </div>
      ) : (
        <div className="space-y-4">
          <div className="rounded-lg border-l-4 border-purple-500 bg-purple-100/60 p-5">
            <p className="text-sm leading-relaxed text-gray-700 text-justify">
              {psico.textoPrincipal.split(nomeOleo).map((part, i, arr) =>
                i < arr.length - 1 ? (
                  <span key={i}>
                    {part}
                    <span className="font-semibold text-cyan-600">{nomeOleo}</span>
                  </span>
                ) : (
                  part
                ),
              )}
            </p>
          </div>

          {psico.emocoesNegativas && psico.emocoesNegativas.length > 0 && (
            <div className="rounded-lg border-l-4 border-red-500 bg-red-50 p-5">
              <h3 className="mb-2 text-sm font-bold uppercase tracking-wide text-red-700">Emoções Negativas</h3>
              <p className="text-sm text-gray-900 text-justify">{psico.emocoesNegativas.join(", ")}.</p>
            </div>
          )}

          {psico.propriedadesPositivas && psico.propriedadesPositivas.length > 0 && (
            <div className="rounded-lg border-l-4 border-green-500 bg-green-50 p-5">
              <h3 className="mb-2 text-sm font-bold uppercase tracking-wide text-green-700">Propriedades Positivas</h3>
              <p className="text-sm text-gray-900 text-justify">{psico.propriedadesPositivas.join(", ")}.</p>
            </div>
          )}

          {psico.usosSugeridos && psico.usosSugeridos.length > 0 && (
            <div className="mt-5">
              <h3 className="mb-3 text-sm font-bold uppercase tracking-wide text-purple-900">Usos Sugeridos</h3>

              <div className="space-y-3">
                {psico.usosSugeridos.map((uso, idx) => (
                  <div
                    key={idx}
                    className={`rounded-lg border p-4 ${
                      uso.tipo === "A" ? "border-blue-100 bg-blue-50" : "border-orange-100 bg-orange-50"
                    }`}
                  >
                    <div className="flex items-start gap-3">
                      <div
                        className={`flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full text-white shadow-sm ${
                          uso.tipo === "A" ? "bg-blue-500" : "bg-orange-500"
                        }`}
                      >
                        <span className="text-sm font-bold">{uso.tipo}</span>
                      </div>
                      <div className="flex-1">
                        <h4 className={`mb-2 font-semibold ${uso.tipo === "A" ? "text-blue-900" : "text-orange-900"}`}>
                          {uso.titulo}:
                        </h4>
                        <p className="text-sm leading-relaxed text-gray-700 text-justify">{uso.descricao}</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  )
}
