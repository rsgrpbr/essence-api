"use client"

import { useEffect, useState } from "react"
import { useParams, useRouter } from "next/navigation"
import { getReceitaBySlug, type Receita } from "@/lib/receitas"
import { ArrowLeft, AlertTriangle, Info } from "lucide-react"
import { ReceitaShare } from "@/components/receita-share"

export default function ReceitaDetalhesPage() {
  const params = useParams()
  const router = useRouter()
  const [receita, setReceita] = useState<Receita | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function carregarReceita() {
      setLoading(true)
      const data = await getReceitaBySlug(params.slug as string)
      setReceita(data)
      setLoading(false)
    }
    carregarReceita()
  }, [params.slug])

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-stone-50 via-amber-50/50 to-emerald-50/30">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-600"></div>
      </div>
    )
  }

  if (!receita) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-stone-50 via-amber-50/50 to-emerald-50/30">
        <div className="text-center">
          <p className="text-lg text-emerald-700 mb-4">Receita não encontrada</p>
          <button
            onClick={() => router.push("/receitas")}
            className="text-sm text-emerald-600 underline hover:text-emerald-900"
          >
            Voltar para receitas
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-stone-50 via-amber-50/50 to-emerald-50/30 pb-24">
      {/* Header with gradient */}
      <div className="relative h-24 bg-gradient-to-br from-emerald-200 to-teal-200">
        <button
          onClick={() => router.back()}
          className="absolute top-4 left-4 bg-white/90 backdrop-blur-sm p-3 rounded-full shadow-md hover:bg-white transition-colors"
        >
          <ArrowLeft className="w-5 h-5 text-emerald-900" />
        </button>
      </div>

      {/* Content */}
      <div className="mx-auto max-w-3xl px-4 -mt-8">
        {/* Main card */}
        <div className="bg-white rounded-2xl shadow-lg border-2 border-emerald-100 p-6 mb-6">
          <h1 className="text-3xl font-bold text-emerald-900 mb-3 text-balance">{receita.nome}</h1>

          <div className="flex items-center gap-4 text-sm text-emerald-700 mb-4 flex-wrap">
            <span className="bg-emerald-100 px-3 py-1 rounded-full font-medium capitalize">{receita.categoria}</span>
            {receita.tempoPreparo && <span className="text-emerald-600">⏱️ {receita.tempoPreparo} min</span>}
            {receita.dificuldade && <span className="text-emerald-600 capitalize">📊 {receita.dificuldade}</span>}
          </div>

          <p className="text-emerald-800 leading-relaxed mb-4">{receita.descricao}</p>

          {/* Benefits */}
          {receita.beneficios && receita.beneficios.length > 0 && (
            <div className="mt-4 p-4 bg-emerald-50 rounded-xl border-2 border-emerald-100">
              <h3 className="font-semibold text-emerald-900 mb-2 flex items-center gap-2">
                <span className="text-lg">✨</span>
                Benefícios
              </h3>
              <ul className="space-y-1">
                {receita.beneficios.map((beneficio, index) => (
                  <li key={index} className="text-sm text-emerald-800 flex items-start gap-2">
                    <span className="text-emerald-600 mt-0.5">•</span>
                    <span>{beneficio}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>

        {/* Ingredients */}
        <div className="bg-white rounded-2xl shadow-sm border-2 border-emerald-100 p-6 mb-6">
          <h2 className="font-bold text-xl text-emerald-900 mb-4 flex items-center gap-2">
            <span className="text-2xl">🧪</span>
            Ingredientes
          </h2>

          <div className="space-y-2">
            {receita.ingredientes?.map((ing, index) => (
              <div
                key={index}
                className="flex items-start gap-3 p-3 bg-emerald-50 rounded-xl border border-emerald-100"
              >
                <span className="text-emerald-700 font-bold text-lg">{index + 1}</span>
                <div className="flex-1">
                  <p className="font-semibold text-emerald-900">
                    {ing.quantidade} de {ing.nome}
                  </p>
                  <p className="text-xs text-emerald-600 capitalize">{ing.tipo.replace("_", " ")}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Preparation steps */}
        <div className="bg-white rounded-2xl shadow-sm border-2 border-emerald-100 p-6 mb-6">
          <h2 className="font-bold text-xl text-emerald-900 mb-4 flex items-center gap-2">
            <span className="text-2xl">📝</span>
            Modo de Preparo
          </h2>

          <div className="space-y-4">
            {receita.modoPreparo?.map((passo) => (
              <div key={passo.passo} className="flex gap-3">
                <div className="flex-shrink-0 w-9 h-9 rounded-full bg-emerald-600 text-white font-bold flex items-center justify-center text-sm">
                  {passo.passo}
                </div>
                <p className="text-emerald-800 leading-relaxed pt-1.5">{passo.texto}</p>
              </div>
            ))}
          </div>
        </div>

        {/* How to use */}
        <div className="bg-white rounded-2xl shadow-sm border-2 border-emerald-100 p-6 mb-6">
          <h2 className="font-bold text-xl text-emerald-900 mb-3 flex items-center gap-2">
            <span className="text-2xl">💡</span>
            Como Usar
          </h2>
          <p className="text-emerald-800 leading-relaxed">{receita.comoUsar}</p>
        </div>

        {/* Precautions */}
        {receita.precaucoes && receita.precaucoes.length > 0 && (
          <div className="bg-amber-50 rounded-2xl border-2 border-amber-200 p-6 mb-6">
            <h3 className="font-bold text-amber-900 mb-3 flex items-center gap-2">
              <Info className="w-5 h-5" />
              Dicas Importantes
            </h3>
            <ul className="space-y-2">
              {receita.precaucoes.map((precaucao, index) => (
                <li key={index} className="text-sm text-amber-800 flex items-start gap-2">
                  <span className="text-amber-600 mt-0.5">•</span>
                  <span>{precaucao}</span>
                </li>
              ))}
            </ul>
          </div>
        )}

        {/* Contraindications */}
        {receita.contraindicacoes && receita.contraindicacoes.length > 0 && (
          <div className="bg-red-50 rounded-2xl border-2 border-red-200 p-6 mb-6">
            <h3 className="font-bold text-red-900 mb-3 flex items-center gap-2">
              <AlertTriangle className="w-5 h-5" />
              Contraindicações
            </h3>
            <ul className="space-y-2">
              {receita.contraindicacoes.map((contra, index) => (
                <li key={index} className="text-sm text-red-800 flex items-start gap-2">
                  <span className="text-red-600 mt-0.5">•</span>
                  <span>{contra}</span>
                </li>
              ))}
            </ul>
          </div>
        )}

        <ReceitaShare receita={receita} />
      </div>
    </div>
  )
}
