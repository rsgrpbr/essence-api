"use client"

import { useState } from "react"
import { Share2, ImageIcon, Loader2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import type { Receita } from "@/lib/receitas"

interface ReceitaShareProps {
  receita: Receita
}

const CATEGORY_COLORS: Record<
  string,
  {
    bg: string
    bgLight: string
    header: string
    border: string
    title: string
    number: string
    numberBg: string
    text: string
  }
> = {
  difusor: {
    bg: "#F0FDF4", // very light green
    bgLight: "#DCFCE7",
    header: "#86EFAC", // pastel green
    border: "#4ADE80",
    title: "#166534", // dark green for titles
    number: "#166534", // dark green for numbers
    numberBg: "#BBF7D0", // light green bg for number circles
    text: "#374151",
  },
  "roll-on": {
    bg: "#F0F9FF", // very light blue
    bgLight: "#E0F2FE",
    header: "#7DD3FC", // pastel sky blue
    border: "#38BDF8",
    title: "#0C4A6E", // dark blue for titles
    number: "#0C4A6E",
    numberBg: "#BAE6FD",
    text: "#374151",
  },
  massagem: {
    bg: "#FFFBEB", // very light amber
    bgLight: "#FEF3C7",
    header: "#FCD34D", // pastel yellow
    border: "#FBBF24",
    title: "#92400E", // dark amber for titles
    number: "#92400E",
    numberBg: "#FDE68A",
    text: "#374151",
  },
  banho: {
    bg: "#F0FDFA", // very light teal
    bgLight: "#CCFBF1",
    header: "#5EEAD4", // pastel teal
    border: "#2DD4BF",
    title: "#115E59", // dark teal for titles
    number: "#115E59",
    numberBg: "#99F6E4",
    text: "#374151",
  },
  spray: {
    bg: "#ECFEFF", // very light cyan
    bgLight: "#CFFAFE",
    header: "#67E8F9", // pastel cyan
    border: "#22D3EE",
    title: "#155E75", // dark cyan for titles
    number: "#155E75",
    numberBg: "#A5F3FC",
    text: "#374151",
  },
  pet: {
    bg: "#FAF5FF", // very light purple
    bgLight: "#F3E8FF",
    header: "#C4B5FD", // pastel purple
    border: "#A78BFA",
    title: "#5B21B6", // dark purple for titles
    number: "#5B21B6",
    numberBg: "#DDD6FE",
    text: "#374151",
  },
  home: {
    bg: "#ECFEFF", // very light cyan
    bgLight: "#CFFAFE",
    header: "#67E8F9", // pastel cyan
    border: "#22D3EE",
    title: "#155E75", // dark cyan for titles
    number: "#155E75",
    numberBg: "#A5F3FC",
    text: "#374151",
  },
  casal: {
    bg: "#FDF2F8", // very light pink
    bgLight: "#FCE7F3",
    header: "#F9A8D4", // pastel pink
    border: "#F472B6",
    title: "#9D174D", // dark pink for titles
    number: "#9D174D",
    numberBg: "#FBCFE8",
    text: "#374151",
  },
}

const DEFAULT_COLORS = {
  bg: "#F0FDF4",
  bgLight: "#DCFCE7",
  header: "#86EFAC",
  border: "#4ADE80",
  title: "#166534",
  number: "#166534",
  numberBg: "#BBF7D0",
  text: "#374151",
}

export function ReceitaShare({ receita }: ReceitaShareProps) {
  const [isGenerating, setIsGenerating] = useState(false)

  // Share as text
  async function compartilharTexto() {
    try {
      const beneficiosText =
        receita.beneficios && receita.beneficios.length > 0
          ? `\n✨ *BENEFÍCIOS:*\n${receita.beneficios.map((b) => `• ${b}`).join("\n")}\n`
          : ""

      const texto = `🌿 *${receita.nome}*
${receita.categoria.toUpperCase()}

${receita.descricao}${beneficiosText}
📝 *INGREDIENTES:*
${receita.ingredientes?.map((ing, i) => `${i + 1}. ${ing.quantidade} de ${ing.nome}`).join("\n") || ""}

🔧 *MODO DE PREPARO:*
${receita.modoPreparo?.map((p) => `${p.passo}. ${p.texto}`).join("\n") || ""}

💡 *COMO USAR:*
${receita.comoUsar}

⏱️ Tempo: ${receita.tempoPreparo || "N/A"} min

🌿 Criado no Essence App`

      if (navigator.share) {
        await navigator.share({
          title: receita.nome,
          text: texto,
        })
      } else {
        await navigator.clipboard.writeText(texto)
        alert("✅ Texto copiado para a área de transferência!")
      }
    } catch (err: any) {
      if (err.name !== "AbortError") {
        console.error("Erro ao compartilhar texto:", err)
        alert("Erro ao compartilhar. Tente novamente.")
      }
    }
  }

  // Share as image
  async function compartilharImagem() {
    setIsGenerating(true)

    try {
      console.log("Gerando imagem para:", receita.nome)

      const colors = CATEGORY_COLORS[receita.categoria] || DEFAULT_COLORS

      const canvas = document.createElement("canvas")
      canvas.width = 1080

      const baseHeight = 1400
      const ingredientesHeight = (receita.ingredientes?.length || 0) * 60
      const preparoHeight = (receita.modoPreparo?.length || 0) * 80
      const comoUsarHeight = 150
      const beneficiosHeight =
        receita.beneficios && receita.beneficios.length > 0 ? Math.min(receita.beneficios.length, 3) * 70 : 0
      canvas.height = baseHeight + ingredientesHeight + preparoHeight + comoUsarHeight + beneficiosHeight + 200

      console.log("Canvas dimensions:", canvas.width, "x", canvas.height)

      const ctx = canvas.getContext("2d")
      if (!ctx) {
        throw new Error("Could not get canvas context")
      }

      let y = 0

      // Background gradient with pastel colors
      const gradient = ctx.createLinearGradient(0, 0, 0, canvas.height)
      gradient.addColorStop(0, colors.bg)
      gradient.addColorStop(1, colors.bgLight)
      ctx.fillStyle = gradient
      ctx.fillRect(0, 0, canvas.width, canvas.height)

      // Border with category color
      ctx.strokeStyle = colors.border
      ctx.lineWidth = 20
      ctx.strokeRect(20, 20, canvas.width - 40, canvas.height - 40)

      // Header with pastel color
      y = 40
      ctx.fillStyle = colors.header
      ctx.fillRect(40, y, canvas.width - 80, 180)

      // Icon centered (darker for contrast)
      ctx.font = "bold 70px Arial, sans-serif"
      ctx.fillStyle = colors.title
      ctx.textAlign = "center"
      ctx.fillText(receita.icone || "🌿", canvas.width / 2, y + 120)

      // 4. Recipe name
      y = 280
      ctx.fillStyle = "#1F2937"
      ctx.font = "bold 56px Arial, sans-serif"
      ctx.textAlign = "center"
      y = wrapText(ctx, receita.nome, canvas.width / 2, y, 960, 70)
      y += 30

      // 5. Metadata
      ctx.font = "36px Arial, sans-serif"
      ctx.fillStyle = "#6B7280"
      ctx.textAlign = "center"
      const metadata = `${receita.categoria.toUpperCase()} • ${receita.tempoPreparo || "N/A"} min • ${receita.dificuldade || "Médio"}`
      ctx.fillText(metadata, canvas.width / 2, y)
      y += 80

      ctx.fillStyle = colors.title
      ctx.font = "bold 48px Arial, sans-serif"
      ctx.textAlign = "left"
      ctx.fillText("🧪  Ingredientes", 100, y)
      y += 60

      receita.ingredientes?.forEach((ing, index) => {
        ctx.fillStyle = colors.numberBg
        ctx.beginPath()
        ctx.arc(130, y - 12, 24, 0, Math.PI * 2)
        ctx.fill()

        ctx.font = "bold 32px Arial, sans-serif"
        ctx.fillStyle = colors.number
        ctx.textAlign = "center"
        ctx.fillText((index + 1).toString(), 130, y + 2)

        // Text
        ctx.font = "38px Arial, sans-serif"
        ctx.fillStyle = colors.text
        ctx.textAlign = "left"
        ctx.fillText(`${ing.quantidade} de ${ing.nome}`, 180, y)

        y += 60
      })

      y += 40

      ctx.fillStyle = colors.title
      ctx.font = "bold 48px Arial, sans-serif"
      ctx.textAlign = "left"
      ctx.fillText("📝  Modo de Preparo", 100, y)
      y += 60

      receita.modoPreparo?.forEach((passo) => {
        ctx.fillStyle = colors.numberBg
        ctx.beginPath()
        ctx.arc(130, y - 12, 24, 0, Math.PI * 2)
        ctx.fill()

        ctx.font = "bold 32px Arial, sans-serif"
        ctx.fillStyle = colors.number
        ctx.textAlign = "center"
        ctx.fillText(passo.passo.toString(), 130, y + 2)

        // Text with line wrapping
        ctx.font = "34px Arial, sans-serif"
        ctx.fillStyle = colors.text
        ctx.textAlign = "left"
        y = wrapText(ctx, passo.texto, 180, y, 840, 45)

        y += 40
      })

      y += 40

      ctx.fillStyle = colors.title
      ctx.font = "bold 48px Arial, sans-serif"
      ctx.textAlign = "left"
      ctx.fillText("💡  Como Usar", 100, y)
      y += 60

      ctx.font = "36px Arial, sans-serif"
      ctx.fillStyle = colors.text
      y = wrapText(ctx, receita.comoUsar, 130, y, canvas.width - 200, 50)
      y += 60

      if (receita.beneficios && receita.beneficios.length > 0) {
        ctx.fillStyle = colors.title
        ctx.font = "bold 48px Arial, sans-serif"
        ctx.textAlign = "left"
        ctx.fillText("✨  Benefícios", 100, y)
        y += 60

        ctx.font = "34px Arial, sans-serif"
        ctx.fillStyle = colors.text

        receita.beneficios.slice(0, 3).forEach((beneficio) => {
          // Bullet point
          ctx.fillText("•", 130, y)

          // Text
          y = wrapText(ctx, beneficio, 170, y, canvas.width - 270, 48)
          y += 15
        })

        y += 40
      }

      // 10. Footer
      ctx.strokeStyle = "#D1D5DB"
      ctx.lineWidth = 2
      ctx.beginPath()
      ctx.moveTo(100, y)
      ctx.lineTo(canvas.width - 100, y)
      ctx.stroke()

      y += 60

      ctx.font = "32px Arial, sans-serif"
      ctx.fillStyle = "#6B7280"
      ctx.textAlign = "center"
      ctx.fillText("Criado no Essence App", canvas.width / 2, y)

      y += 50

      ctx.font = "bold 36px Arial, sans-serif"
      ctx.fillStyle = colors.title
      ctx.fillText("essenceapp.com.br", canvas.width / 2, y)

      // Convert to blob and share
      canvas.toBlob(
        async (blob) => {
          if (!blob) {
            alert("Erro ao gerar imagem")
            return
          }

          console.log("Blob gerado:", blob.size, "bytes")

          const file = new File([blob], `receita-${receita.slug}.png`, {
            type: "image/png",
          })

          if (navigator.share && navigator.canShare && navigator.canShare({ files: [file] })) {
            try {
              await navigator.share({
                files: [file],
                title: receita.nome,
                text: `🌿 ${receita.nome} - Receita do Essence App`,
              })
            } catch (err: any) {
              if (err.name !== "AbortError") {
                console.error("Erro ao compartilhar:", err)
              }
            }
          } else {
            const url = URL.createObjectURL(blob)
            const a = document.createElement("a")
            a.href = url
            a.download = `receita-${receita.slug}.png`
            document.body.appendChild(a)
            a.click()
            document.body.removeChild(a)
            URL.revokeObjectURL(url)
            alert("✅ Imagem salva na pasta Downloads!")
          }
        },
        "image/png",
        1.0,
      )
    } catch (err) {
      console.error("Erro ao gerar imagem:", err)
      alert("Erro ao gerar imagem. Tente novamente.")
    } finally {
      setIsGenerating(false)
    }
  }

  return (
    <div className="flex gap-3">
      <Button
        variant="outline"
        onClick={compartilharTexto}
        className="flex-1 rounded-xl py-6 font-semibold border-2 border-emerald-600 text-emerald-700 hover:bg-emerald-50 hover:text-emerald-800 bg-transparent"
      >
        <Share2 className="w-5 h-5 mr-2" />
        Compartilhar Texto
      </Button>

      <Button
        onClick={compartilharImagem}
        disabled={isGenerating}
        className="flex-1 rounded-xl py-6 font-semibold bg-emerald-600 hover:bg-emerald-700 text-white"
      >
        {isGenerating ? (
          <>
            <Loader2 className="w-5 h-5 mr-2 animate-spin" />
            Gerando...
          </>
        ) : (
          <>
            <ImageIcon className="w-5 h-5 mr-2" />
            Compartilhar Imagem
          </>
        )}
      </Button>
    </div>
  )
}

// Helper function to wrap text in multiple lines
function wrapText(
  ctx: CanvasRenderingContext2D,
  text: string,
  x: number,
  y: number,
  maxWidth: number,
  lineHeight: number,
): number {
  const words = text.split(" ")
  let line = ""
  let currentY = y

  words.forEach((word, i) => {
    const testLine = line + word + " "
    const metrics = ctx.measureText(testLine)

    if (metrics.width > maxWidth && i > 0) {
      ctx.fillText(line.trim(), x, currentY)
      currentY += lineHeight
      line = word + " "
    } else {
      line = testLine
    }
  })

  if (line.trim()) {
    ctx.fillText(line.trim(), x, currentY)
    currentY += lineHeight
  }

  return currentY
}
