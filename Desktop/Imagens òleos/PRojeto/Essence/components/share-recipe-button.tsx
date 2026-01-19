"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Share2 } from "lucide-react"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Textarea } from "@/components/ui/textarea"

interface Oil {
  name: string
  drops: number
}

interface Recipe {
  name?: string
  purpose: string
  percentage: number
  oils: Oil[]
  carrierMl: number
  carrierType?: string
}

interface ImageCustomization {
  forWhom: string
  title: string
  useType: "topical" | "aromatic"
  usageInstructions: string
  backgroundColor: string
  preparedBy: string
}

export function ShareRecipeButton({ recipe }: { recipe: Recipe }) {
  const [isGenerating, setIsGenerating] = useState(false)
  const [showCustomizationModal, setShowCustomizationModal] = useState(false)

  const [customization, setCustomization] = useState<ImageCustomization>({
    forWhom: "",
    title: "Blend de Óleos Essenciais",
    useType: "topical",
    usageInstructions: "",
    backgroundColor: "#F0F9F4",
    preparedBy: "",
  })

  const usagePlaceholder =
    customization.useType === "topical"
      ? "Ex: Aplicar 3 vezes ao dia na região lombar"
      : "Ex: Usar no difusor todas as noites por 30 min"

  const shareAsText = () => {
    const oilsList = recipe.oils
      .filter((oil) => oil.name.trim())
      .map((oil) => `   • ${oil.name}: ${oil.drops} gotas`)
      .join("\n")

    const text = `🌿 ${recipe.name || "Blend Relaxante"}

Finalidade: ${recipe.purpose} (${recipe.percentage}%)

Óleos Essenciais:
${oilsList}

Óleo Carreador:
🥥 ${recipe.carrierMl}ml de ${recipe.carrierType || "Coco"}

📋 Como preparar:
1. Coloque ${recipe.carrierMl}ml de óleo carreador no frasco
2. Adicione as gotas conforme receita
3. Misture bem antes de usar

Criado no Essence App
essenceapp.com.br`

    if (navigator.share) {
      navigator.share({ title: recipe.name || "Minha Receita", text })
    } else {
      navigator.clipboard.writeText(text)
      alert("Texto copiado!")
    }
  }

  const calculateCanvasHeight = (recipe: Recipe): number => {
    let height = 120 // Padding top inicial

    // Logo (se existir) ou espaço inicial
    height += 240 // Espaço para logo + margem

    if (customization.forWhom) {
      height += 80
    }

    // Título
    height += 100

    height += 80

    height += 80

    // Seção "Óleos Essenciais"
    height += 80 // Título da seção
    const activeOils = recipe.oils.filter((oil) => oil.name.trim()).length
    height += activeOils * 70 // Cada óleo

    // Espaçamento após óleos
    height += 50

    // Óleo Carreador (se uso tópico)
    if (customization.useType === "topical") {
      height += 80 // Título
      height += 70 // Linha do carreador
      height += 40 // Espaçamento
    }

    height += 80

    // Seção "Como preparar"
    height += 80 // Título
    if (customization.useType === "topical") {
      height += 200 // 3 linhas de instruções
    } else {
      height += 150 // 2 linhas de instruções
    }

    // Seção "Como usar" (se preenchido)
    if (customization.usageInstructions) {
      const charCount = customization.usageInstructions.length
      const estimatedLines = Math.ceil(charCount / 50)
      height += 100 + estimatedLines * 45 // Box + linhas de texto
      height += 40 // Espaçamento
    }

    height += 80

    height += 70 // Espaçamento antes do rodapé
    if (customization.preparedBy) {
      height += 60
    }
    height += 110 // Assinatura Essence (2 linhas)

    // Padding bottom e margem de segurança
    height += 120

    console.log("[v0] Altura calculada:", height, "| Óleos ativos:", activeOils)

    return height
  }

  const shareAsImage = async () => {
    setIsGenerating(true)
    try {
      const canvasHeight = calculateCanvasHeight(recipe)

      const canvas = document.createElement("canvas")
      canvas.width = 1080
      canvas.height = canvasHeight

      console.log("[v0] Canvas - Width:", canvas.width, "Height:", canvas.height)

      const ctx = canvas.getContext("2d")!

      const adjustBrightness = (hex: string, percent: number) => {
        const num = Number.parseInt(hex.replace("#", ""), 16)
        const amt = Math.round(2.55 * percent)
        const R = Math.min(255, Math.max(0, (num >> 16) + amt))
        const G = Math.min(255, Math.max(0, ((num >> 8) & 0x00ff) + amt))
        const B = Math.min(255, Math.max(0, (num & 0x0000ff) + amt))
        return `#${((1 << 24) + (R << 16) + (G << 8) + B).toString(16).slice(1)}`
      }

      const gradient = ctx.createLinearGradient(0, 0, 0, canvas.height)
      gradient.addColorStop(0, customization.backgroundColor)
      gradient.addColorStop(1, adjustBrightness(customization.backgroundColor, -5))
      ctx.fillStyle = gradient
      ctx.fillRect(0, 0, canvas.width, canvas.height)

      let y = 60

      // Logo emoji no canto superior direito
      ctx.font = "32px Arial, sans-serif"
      ctx.fillStyle = "rgba(0,0,0,0.7)"
      ctx.textAlign = "right"
      ctx.fillText("🌿", canvas.width - 60, 90)
      ctx.textAlign = "left"

      const essenceLogo = new Image()
      essenceLogo.crossOrigin = "anonymous"
      essenceLogo.src = "/logo-essence.png"

      await new Promise((resolve) => {
        essenceLogo.onload = resolve
        essenceLogo.onerror = () => {
          console.log("[v0] Logo não encontrado, continuando sem ele")
          resolve(null)
        }
        setTimeout(() => resolve(null), 2000)
      })

      if (essenceLogo.complete && essenceLogo.naturalWidth > 0) {
        const logoSize = 180
        const logoX = (canvas.width - logoSize) / 2
        ctx.drawImage(essenceLogo, logoX, y, logoSize, logoSize)
        y += 240
      } else {
        y += 60
      }

      if (customization.forWhom) {
        ctx.font = "30px Arial, sans-serif"
        ctx.fillStyle = "#666666"
        ctx.textAlign = "center"
        ctx.fillText(`Para: ${customization.forWhom}`, canvas.width / 2, y)
        y += 60
      }

      ctx.fillStyle = "#1a1a1a"
      ctx.font = "bold 56px Arial, sans-serif"
      ctx.textAlign = "center"

      // Word wrap para título longo
      const titleWords = customization.title.split(" ")
      let titleLine = ""
      const titleLines: string[] = []

      for (const word of titleWords) {
        const testLine = titleLine + word + " "
        const metrics = ctx.measureText(testLine)
        if (metrics.width > 900 && titleLine !== "") {
          titleLines.push(titleLine.trim())
          titleLine = word + " "
        } else {
          titleLine = testLine
        }
      }
      titleLines.push(titleLine.trim())

      for (const line of titleLines) {
        ctx.fillText(line, canvas.width / 2, y)
        y += 65
      }
      y += 10

      ctx.font = "36px Arial, sans-serif"
      ctx.fillStyle = "#555555"
      const useTypeText =
        customization.useType === "topical" ? "🧴 Uso Tópico (diluído)" : "💨 Uso Aromático (concentrado)"
      ctx.fillText(useTypeText, canvas.width / 2, y)
      y += 60

      ctx.strokeStyle = "#d1d5db"
      ctx.lineWidth = 2
      ctx.beginPath()
      ctx.moveTo(60, y)
      ctx.lineTo(canvas.width - 60, y)
      ctx.stroke()
      y += 60

      ctx.font = "bold 44px Arial, sans-serif"
      ctx.fillStyle = "#2D7A4F"
      ctx.textAlign = "left"
      ctx.fillText("Óleos Essenciais:", 60, y)
      y += 70

      ctx.font = "36px Arial, sans-serif"
      ctx.fillStyle = "#333333"
      recipe.oils
        .filter((oil) => oil.name.trim())
        .forEach((oil) => {
          ctx.fillText(`• ${oil.name}: ${oil.drops} gotas`, 90, y)
          y += 60
        })

      y += 30

      if (customization.useType === "topical") {
        ctx.font = "bold 44px Arial, sans-serif"
        ctx.fillStyle = "#2D7A4F"
        ctx.fillText("Óleo Carreador:", 60, y)
        y += 70

        ctx.font = "36px Arial, sans-serif"
        ctx.fillStyle = "#333333"
        ctx.fillText(`🥥 ${recipe.carrierMl}ml de ${recipe.carrierType || "Coco"}`, 90, y)
        y += 70
      }

      ctx.strokeStyle = "#d1d5db"
      ctx.lineWidth = 2
      ctx.beginPath()
      ctx.moveTo(60, y)
      ctx.lineTo(canvas.width - 60, y)
      ctx.stroke()
      y += 60

      ctx.font = "bold 40px Arial, sans-serif"
      ctx.fillStyle = "#2D7A4F"
      ctx.fillText("📋 Como preparar:", 60, y)
      y += 70

      ctx.font = "34px Arial, sans-serif"
      ctx.fillStyle = "#333333"

      if (customization.useType === "topical") {
        ctx.fillText(`1. Coloque ${recipe.carrierMl}ml de óleo carreador`, 90, y)
        y += 50
        ctx.fillText("   no frasco", 90, y)
        y += 55

        ctx.fillText("2. Adicione as gotas conforme receita", 90, y)
        y += 55

        ctx.fillText("3. Misture bem antes de usar", 90, y)
        y += 60
      } else {
        ctx.fillText("1. Não diluir - usar concentrado", 90, y)
        y += 55

        ctx.fillText("2. Adicionar as gotas diretamente no", 90, y)
        y += 50
        ctx.fillText("   difusor ou inalador", 90, y)
        y += 60
      }

      if (customization.usageInstructions) {
        y += 20

        // Calcular altura do box dinamicamente
        ctx.font = "30px Arial, sans-serif"
        const words = customization.usageInstructions.split(" ")
        let line = ""
        const lines: string[] = []
        const maxWidth = canvas.width - 220

        for (const word of words) {
          const testLine = line + word + " "
          const metrics = ctx.measureText(testLine)
          if (metrics.width > maxWidth && line !== "") {
            lines.push(line.trim())
            line = word + " "
          } else {
            line = testLine
          }
        }
        lines.push(line.trim())

        const boxHeight = 90 + lines.length * 45
        const boxY = y

        // Desenhar box
        ctx.fillStyle = "#F8F9FA"
        ctx.fillRect(60, boxY, canvas.width - 120, boxHeight)
        ctx.strokeStyle = "#E0E0E0"
        ctx.lineWidth = 2
        ctx.strokeRect(60, boxY, canvas.width - 120, boxHeight)

        y += 45

        // Título do box
        ctx.fillStyle = "#2D7A4F"
        ctx.font = "bold 36px Arial, sans-serif"
        ctx.fillText("💡 Como usar:", 90, y)
        y += 50

        // Texto das instruções
        ctx.fillStyle = "#333333"
        ctx.font = "30px Arial, sans-serif"
        for (const textLine of lines) {
          ctx.fillText(textLine, 90, y)
          y += 45
        }

        y += 20
      }

      console.log("[v0] Posição Y antes do rodapé:", y, "| Altura canvas:", canvas.height)

      y += 40
      ctx.strokeStyle = "#d1d5db"
      ctx.lineWidth = 2
      ctx.beginPath()
      ctx.moveTo(60, y)
      ctx.lineTo(canvas.width - 60, y)
      ctx.stroke()
      y += 60

      ctx.textAlign = "center"

      // Preparado por (se preenchido)
      if (customization.preparedBy) {
        ctx.font = "30px Arial, sans-serif"
        ctx.fillStyle = "#555555"
        ctx.fillText(`Preparado por: ${customization.preparedBy}`, canvas.width / 2, y)
        y += 50
      }

      // Assinatura Essence
      ctx.font = "32px Arial, sans-serif"
      ctx.fillStyle = "#666666"
      ctx.fillText("Criado no Essence App", canvas.width / 2, y)
      y += 50

      ctx.font = "bold 32px Arial, sans-serif"
      ctx.fillStyle = "#2D7A4F"
      ctx.fillText("essenceapp.com.br", canvas.width / 2, y)

      console.log("[v0] Posição Y final:", y, "| Altura canvas:", canvas.height)
      if (y > canvas.height - 80) {
        console.warn("[v0] ⚠️ CONTEÚDO PODE ESTAR PRÓXIMO DO LIMITE!")
      }

      canvas.toBlob(
        async (blob) => {
          if (!blob) {
            alert("Erro ao gerar imagem")
            setIsGenerating(false)
            return
          }

          const file = new File([blob], "receita-essence.png", {
            type: "image/png",
          })

          if (navigator.share && navigator.canShare && navigator.canShare({ files: [file] })) {
            try {
              await navigator.share({
                files: [file],
                title: customization.title,
                text: "🌿 Minha receita de aromaterapia",
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
            a.download = "receita-essence.png"
            document.body.appendChild(a)
            a.click()
            document.body.removeChild(a)
            URL.revokeObjectURL(url)
            alert("✅ Imagem salva na pasta Downloads!")
          }

          setIsGenerating(false)
          setShowCustomizationModal(false)
        },
        "image/png",
        1.0,
      )
    } catch (error) {
      console.error("Erro:", error)
      alert("Erro ao gerar imagem")
      setIsGenerating(false)
    }
  }

  const handleClickShareImage = () => {
    setCustomization({
      forWhom: "",
      title: recipe.name || "Blend de Óleos Essenciais",
      useType: "topical",
      usageInstructions: "",
      backgroundColor: "#F0F9F4",
      preparedBy: "",
    })
    setShowCustomizationModal(true)
  }

  const colorPresets = [
    { color: "#F0F9F4", label: "Verde" },
    { color: "#F0F7FF", label: "Azul" },
    { color: "#F5F0FF", label: "Roxo" },
    { color: "#FFFBF0", label: "Amarelo" },
    { color: "#FFF0F5", label: "Rosa" },
    { color: "#FFFFFF", label: "Branco" },
  ]

  return (
    <>
      <div className="flex gap-3 w-full">
        <Button
          onClick={shareAsText}
          variant="outline"
          className="flex-1 border-emerald-300 text-emerald-700 hover:bg-emerald-50 bg-transparent"
        >
          <Share2 className="h-4 w-4 mr-2" />
          Texto
        </Button>

        <Button
          onClick={handleClickShareImage}
          disabled={isGenerating}
          variant="outline"
          className="flex-1 border-emerald-300 text-emerald-700 hover:bg-emerald-50 bg-transparent"
        >
          <Share2 className="h-4 w-4 mr-2" />
          Imagem
        </Button>
      </div>

      <Dialog open={showCustomizationModal} onOpenChange={setShowCustomizationModal}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Personalizar Protocolo</DialogTitle>
          </DialogHeader>

          <div className="grid md:grid-cols-2 gap-6">
            <div className="border rounded-lg p-4 bg-gray-50">
              <h3 className="text-sm font-medium mb-3">Preview</h3>
              <div
                className="relative overflow-hidden rounded-lg shadow-lg"
                style={{
                  width: "100%",
                  aspectRatio: "9/16",
                  background: `linear-gradient(180deg, ${customization.backgroundColor} 0%, ${customization.backgroundColor}ee 100%)`,
                }}
              >
                <div className="absolute top-3 right-3 text-xl opacity-70">🌿</div>

                <div className="p-4 text-center">
                  {customization.forWhom && (
                    <p className="text-xs text-gray-600 italic mt-8">Para: {customization.forWhom}</p>
                  )}
                  <h2 className="text-lg font-bold text-gray-900 mt-2">{customization.title}</h2>
                  <p className="text-sm text-gray-700 mt-2">
                    {customization.useType === "topical" ? "🧴 Uso Tópico" : "💨 Uso Aromático"}
                  </p>

                  <div className="mt-4 text-left text-xs">
                    <p className="font-semibold text-emerald-700">Óleos:</p>
                    {recipe.oils
                      .filter((oil) => oil.name.trim())
                      .slice(0, 2)
                      .map((oil, idx) => (
                        <p key={idx} className="text-gray-700">
                          • {oil.name}: {oil.drops} gotas
                        </p>
                      ))}
                    {recipe.oils.filter((oil) => oil.name.trim()).length > 2 && <p className="text-gray-500">...</p>}
                  </div>
                </div>
              </div>
            </div>

            <div className="space-y-4">
              <div>
                <Label htmlFor="forWhom">Para quem é este blend (opcional)</Label>
                <Input
                  id="forWhom"
                  value={customization.forWhom}
                  onChange={(e) => setCustomization((prev) => ({ ...prev, forWhom: e.target.value }))}
                  placeholder="Nome da pessoa"
                  maxLength={50}
                  className="mt-1"
                />
              </div>

              <div>
                <Label htmlFor="title">Título do blend</Label>
                <Input
                  id="title"
                  value={customization.title}
                  onChange={(e) => setCustomization((prev) => ({ ...prev, title: e.target.value }))}
                  placeholder="Blend de Óleos Essenciais"
                  maxLength={60}
                  className="mt-1"
                  required
                />
              </div>

              <div>
                <Label>Tipo de uso</Label>
                <RadioGroup
                  value={customization.useType}
                  onValueChange={(value) =>
                    setCustomization((prev) => ({
                      ...prev,
                      useType: value as "topical" | "aromatic",
                    }))
                  }
                  className="mt-2"
                >
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="topical" id="topical" />
                    <Label htmlFor="topical" className="cursor-pointer font-normal">
                      🧴 Uso Tópico (diluído em óleo carreador)
                    </Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="aromatic" id="aromatic" />
                    <Label htmlFor="aromatic" className="cursor-pointer font-normal">
                      💨 Uso Aromático (concentrado - difusor/inalação)
                    </Label>
                  </div>
                </RadioGroup>
              </div>

              <div>
                <Label htmlFor="usageInstructions">Como usar (opcional)</Label>
                <Textarea
                  id="usageInstructions"
                  value={customization.usageInstructions}
                  onChange={(e) =>
                    setCustomization((prev) => ({
                      ...prev,
                      usageInstructions: e.target.value,
                    }))
                  }
                  placeholder={usagePlaceholder}
                  maxLength={150}
                  rows={3}
                  className="resize-none mt-1"
                />
                <p className="text-xs text-gray-500 mt-1">{customization.usageInstructions.length}/150 caracteres</p>
              </div>

              <div>
                <Label>Cor de fundo</Label>
                <div className="flex gap-2 items-center mt-2">
                  <Input
                    type="color"
                    value={customization.backgroundColor}
                    onChange={(e) =>
                      setCustomization((prev) => ({
                        ...prev,
                        backgroundColor: e.target.value,
                      }))
                    }
                    className="w-20 h-10 cursor-pointer"
                  />
                  <div className="flex gap-1 flex-wrap">
                    {colorPresets.map(({ color, label }) => (
                      <button
                        key={color}
                        onClick={() => setCustomization((prev) => ({ ...prev, backgroundColor: color }))}
                        className="w-8 h-8 rounded border hover:scale-110 transition"
                        style={{ backgroundColor: color }}
                        title={label}
                      />
                    ))}
                  </div>
                </div>
              </div>

              <div>
                <Label htmlFor="preparedBy">Preparado por (opcional)</Label>
                <Input
                  id="preparedBy"
                  value={customization.preparedBy}
                  onChange={(e) => setCustomization((prev) => ({ ...prev, preparedBy: e.target.value }))}
                  placeholder="Seu nome"
                  maxLength={50}
                  className="mt-1"
                />
              </div>
            </div>
          </div>

          <div className="flex gap-3 justify-end mt-4">
            <Button variant="outline" onClick={() => setShowCustomizationModal(false)}>
              Cancelar
            </Button>
            <Button
              onClick={shareAsImage}
              disabled={isGenerating || !customization.title.trim()}
              className="bg-emerald-600 hover:bg-emerald-700"
            >
              {isGenerating ? "⏳ Gerando..." : "Gerar e Compartilhar 🚀"}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </>
  )
}
