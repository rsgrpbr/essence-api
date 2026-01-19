"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card } from "@/components/ui/card"
import { Minus, Plus, X, RotateCcw, ArrowLeft } from "lucide-react"
import Link from "next/link"
import Image from "next/image"
import { ShareRecipeButton } from "@/components/share-recipe-button"

type Purpose = {
  id: string
  name: string
  icon: string
  percentage: number
}

type Oil = {
  id: string
  name: string
  drops: number
}

const purposes: Purpose[] = [
  { id: "facial", name: "Facial", icon: "/facial-icon.png", percentage: 0.5 },
  { id: "children", name: "Crianças", icon: "/criancas-icon.png", percentage: 1 },
  { id: "sensitive", name: "Sensível", icon: "/sensivel-icon.png", percentage: 2 },
  { id: "cosmetic", name: "Cosméticos", icon: "/cosmetico-icon.png", percentage: 3 },
  { id: "massage", name: "Massagem", icon: "/massagem-icon.png", percentage: 4 },
  { id: "pain", name: "Dor", icon: "/dor-icon.png", percentage: 5 },
  { id: "concentrated", name: "Concentrado", icon: "/concentrado-icon.png", percentage: 10 },
]

export default function CalculadoraPage() {
  const [selectedPurpose, setSelectedPurpose] = useState<Purpose>(purposes[4])
  const [oils, setOils] = useState<Oil[]>([{ id: "1", name: "", drops: 1 }])
  const [blendName, setBlendName] = useState("")

  const addOil = () => {
    const newId = (Math.max(...oils.map((o) => Number.parseInt(o.id))) + 1).toString()
    setOils([...oils, { id: newId, name: "", drops: 1 }])
  }

  const removeOil = (id: string) => {
    if (oils.length > 1) {
      setOils(oils.filter((o) => o.id !== id))
    }
  }

  const updateOilName = (id: string, name: string) => {
    setOils(oils.map((o) => (o.id === id ? { ...o, name } : o)))
  }

  const updateOilDrops = (id: string, drops: number) => {
    const clamped = Math.max(1, Math.min(50, drops))
    setOils(oils.map((o) => (o.id === id ? { ...o, drops: clamped } : o)))
  }

  const clearAll = () => {
    setSelectedPurpose(purposes[4])
    setOils([{ id: "1", name: "", drops: 1 }])
    setBlendName("")
  }

  // Cálculos
  const totalDrops = oils.reduce((sum, oil) => sum + oil.drops, 0)
  const carrierMl = Math.ceil((totalDrops / 20 / selectedPurpose.percentage) * 100)
  const isConcentrated = totalDrops > 100

  return (
    <div className="min-h-screen bg-gradient-to-br from-stone-50 via-amber-50/50 to-emerald-50/30 pb-24 pt-6 px-4">
      <div className="max-w-2xl mx-auto space-y-6">
        <div className="max-w-md mx-auto mb-3">
          <Link href="/">
            <Button variant="ghost" size="sm" className="mb-2 text-emerald-700 hover:text-emerald-800">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Voltar
            </Button>
          </Link>

          <div className="bg-white rounded-2xl shadow-md p-4 text-center">
            <div className="flex items-center justify-center gap-3 mb-1">
              <div className="w-12 h-12 rounded-full overflow-hidden flex-shrink-0">
                <Image
                  src="/calculadora-icon.png"
                  alt="Calculadora"
                  width={48}
                  height={48}
                  className="w-full h-full object-cover"
                />
              </div>
              <h1 className="text-xl md:text-2xl font-bold text-emerald-800">Calculadora de Diluição</h1>
            </div>
            <p className="text-sm text-gray-600">Calcule a proporção ideal de óleos essenciais</p>
          </div>
        </div>

        <Card className="overflow-hidden">
          {/* Seção 1 - Escolher Finalidade */}
          <div className="p-6 space-y-4">
            <h2 className="text-lg font-semibold text-emerald-900">1. Escolha a finalidade</h2>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              {purposes.map((purpose) => (
                <button
                  key={purpose.id}
                  onClick={() => setSelectedPurpose(purpose)}
                  className={`p-4 rounded-lg border-2 transition-all ${
                    selectedPurpose.id === purpose.id
                      ? "border-emerald-600 bg-emerald-50"
                      : "border-gray-200 hover:border-emerald-300"
                  }`}
                >
                  <div className="mb-2 flex justify-center">
                    <Image
                      src={purpose.icon || "/placeholder.svg"}
                      alt={purpose.name}
                      width={96}
                      height={96}
                      className="object-contain"
                    />
                  </div>
                  <div className="text-sm font-medium text-gray-900">{purpose.name}</div>
                  <div className="text-xs text-gray-500">{purpose.percentage}%</div>
                </button>
              ))}
            </div>
          </div>

          {/* Seção 2 - Adicionar Óleos */}
          <div className="px-6 pb-6 space-y-4">
            <h2 className="text-lg font-semibold text-emerald-900">2. Adicione os óleos essenciais</h2>
            <div className="space-y-3">
              {oils.map((oil) => (
                <div key={oil.id} className="flex items-center gap-3 p-4 bg-gray-50 rounded-lg">
                  <Input
                    type="text"
                    placeholder="Ex: Lavanda"
                    value={oil.name}
                    onChange={(e) => updateOilName(oil.id, e.target.value)}
                    className="flex-1"
                  />
                  <div className="flex items-center gap-2 bg-white rounded-lg border px-3 py-2">
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => updateOilDrops(oil.id, oil.drops - 1)}
                      disabled={oil.drops <= 1}
                      className="h-7 w-7 p-0"
                    >
                      <Minus className="h-4 w-4" />
                    </Button>
                    <div className="flex flex-col items-center">
                      <span className="font-semibold text-base leading-none">{oil.drops}</span>
                      <span className="text-[10px] text-gray-500 leading-none">gotas</span>
                    </div>
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => updateOilDrops(oil.id, oil.drops + 1)}
                      disabled={oil.drops >= 50}
                      className="h-7 w-7 p-0"
                    >
                      <Plus className="h-4 w-4" />
                    </Button>
                  </div>
                  {oils.length > 1 && (
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => removeOil(oil.id)}
                      className="h-9 w-9 p-0 text-red-500 hover:text-red-700 hover:bg-red-50"
                    >
                      <X className="h-5 w-5" />
                    </Button>
                  )}
                </div>
              ))}
              <Button
                variant="outline"
                onClick={addOil}
                className="w-full border-dashed border-2 border-emerald-300 text-emerald-700 hover:bg-emerald-50 bg-transparent"
              >
                <Plus className="h-4 w-4 mr-2" />
                Adicionar outro óleo
              </Button>
            </div>
          </div>

          {/* Seção 3 - Resultado */}
          <div className="px-6 pb-6">
            <div className="bg-emerald-50 border-2 border-emerald-200 rounded-xl p-6 space-y-3">
              <h2 className="text-lg font-semibold text-emerald-900 mb-4">3. Resultado</h2>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <div className="text-sm text-emerald-700">🌿 Total de gotas</div>
                  <div className="text-2xl font-bold text-emerald-900">{totalDrops} gotas</div>
                </div>
                <div>
                  <div className="text-sm text-emerald-700">🥥 Óleo carreador</div>
                  <div className="text-2xl font-bold text-emerald-900">{carrierMl}ml</div>
                </div>
                <div>
                  <div className="text-sm text-emerald-700">📊 Concentração</div>
                  <div className="text-2xl font-bold text-emerald-900">{selectedPurpose.percentage}%</div>
                </div>
                <div>
                  <div className="text-sm text-emerald-700">✅ Indicado para</div>
                  <div className="text-lg font-bold text-emerald-900">{selectedPurpose.name}</div>
                </div>
              </div>
              {isConcentrated && (
                <div className="mt-4 p-3 bg-amber-100 border border-amber-300 rounded-lg text-sm text-amber-900">
                  ⚠️ Receita muito concentrada. Considere reduzir o número de gotas.
                </div>
              )}
            </div>
          </div>

          {/* Seção 4 - Instruções */}
          <div className="px-6 pb-6">
            <div className="bg-blue-50 border-2 border-blue-200 rounded-xl p-6">
              <h3 className="text-lg font-semibold text-blue-900 mb-3">📝 Como preparar:</h3>
              <ol className="space-y-2 text-sm text-blue-900">
                <li className="flex gap-2">
                  <span className="font-bold">1.</span>
                  <span>Coloque {carrierMl}ml de óleo carreador (coco/jojoba) no frasco</span>
                </li>
                <li className="flex gap-2">
                  <span className="font-bold">2.</span>
                  <div className="flex-1">
                    <div className="mb-1">Adicione as gotas:</div>
                    <ul className="ml-4 space-y-1">
                      {oils
                        .filter((o) => o.name.trim())
                        .map((oil) => (
                          <li key={oil.id}>
                            • {oil.name}: {oil.drops} gotas
                          </li>
                        ))}
                      {oils.every((o) => !o.name.trim()) && (
                        <li className="text-gray-400">• (Nomeie os óleos acima)</li>
                      )}
                    </ul>
                  </div>
                </li>
                <li className="flex gap-2">
                  <span className="font-bold">3.</span>
                  <span>Misture bem e use conforme necessário</span>
                </li>
              </ol>
            </div>
          </div>

          {/* Botões de Ação */}
          <div className="px-6 pb-6 space-y-3">
            <Button variant="outline" onClick={clearAll} className="w-full bg-transparent">
              <RotateCcw className="h-4 w-4 mr-2" />
              Limpar Receita
            </Button>

            <ShareRecipeButton
              recipe={{
                name: blendName.trim() || "Blend de Óleos Essenciais",
                purpose: selectedPurpose.name,
                percentage: selectedPurpose.percentage,
                oils: oils,
                carrierMl: carrierMl,
              }}
            />
          </div>
        </Card>
      </div>
    </div>
  )
}
