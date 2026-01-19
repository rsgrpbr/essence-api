"use client"

import { useState } from "react"
import { Search, BookOpen } from "lucide-react"
import Link from "next/link"
import { useReceitas } from "@/hooks/use-receitas"
import { UserMenu } from "@/components/user-menu"
import { PremiumButton } from "@/components/premium-button"
import type { Receita } from "@/lib/receitas"

const CATEGORIAS = [
  { id: "todas", label: "Todas", emoji: "🌿" },
  { id: "difusor", label: "Difusor", emoji: "💨" },
  { id: "roll-on", label: "Roll-on", emoji: "🌀" },
  { id: "massagem", label: "Massagem", emoji: "💆" },
  { id: "banho", label: "Banho", emoji: "🛁" },
  { id: "spray", label: "Spray", emoji: "💦" },
  { id: "pet", label: "Pet", emoji: "🐾" },
  { id: "home", label: "Home", emoji: "🏠" },
  { id: "casal", label: "Casal", emoji: "💑" },
]

export default function ReceitasPage() {
  const { receitas, loading } = useReceitas()
  const [query, setQuery] = useState("")
  const [categoriaAtiva, setCategoriaAtiva] = useState("todas")

  const receitasFiltradas = receitas.filter((receita) => {
    const matchQuery = query
      ? receita.nome.toLowerCase().includes(query.toLowerCase()) ||
        receita.descricao.toLowerCase().includes(query.toLowerCase()) ||
        receita.tags.some((tag) => tag.toLowerCase().includes(query.toLowerCase()))
      : true

    const matchCategoria = categoriaAtiva === "todas" || receita.categoria === categoriaAtiva

    return matchQuery && matchCategoria
  })

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-stone-50 via-amber-50/50 to-emerald-50/30">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-600 mx-auto mb-4"></div>
          <p className="text-emerald-700">Carregando receitas...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-stone-50 via-amber-50/50 to-emerald-50/30 pb-24">
      {/* Fixed header with user menu */}
      <div className="fixed top-4 right-4 z-50 flex items-center gap-3">
        <PremiumButton />
        <UserMenu />
      </div>

      <div className="bg-white/80 backdrop-blur-sm border-b-2 border-emerald-100 sticky top-0 z-10">
        <div className="mx-auto max-w-7xl px-4 py-4 sm:px-6">
          <div className="text-center mb-3">
            <div className="mb-2 flex justify-center">
              <BookOpen className="h-8 w-8 text-emerald-600" />
            </div>
            <h1 className="font-serif text-2xl font-bold text-emerald-900 text-balance">Receitas</h1>
            <p className="text-xs text-emerald-700 mt-0.5">Blends e preparações com óleos essenciais</p>
          </div>

          {/* Search bar */}
          <div className="relative mx-auto max-w-2xl mb-3">
            <Search className="absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-emerald-600" />
            <input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Busque por nome ou tags..."
              className="w-full rounded-2xl border-2 border-emerald-200 bg-white py-2.5 pl-12 pr-4 text-sm shadow-sm transition-all placeholder:text-emerald-400 focus:border-emerald-400 focus:outline-none focus:ring-4 focus:ring-emerald-100"
            />
          </div>

          <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide -mx-4 px-4">
            {CATEGORIAS.map((cat) => (
              <button
                key={cat.id}
                onClick={() => setCategoriaAtiva(cat.id)}
                className={`
                  flex items-center gap-2 px-4 py-2 rounded-full 
                  whitespace-nowrap text-sm font-medium transition-all flex-shrink-0
                  ${
                    categoriaAtiva === cat.id
                      ? "bg-emerald-600 text-white shadow-md"
                      : "bg-white text-emerald-700 border-2 border-emerald-200 hover:bg-emerald-50"
                  }
                `}
              >
                <span>{cat.emoji}</span>
                <span>{cat.label}</span>
              </button>
            ))}
          </div>

          <p className="text-xs text-emerald-600 mt-2 text-center font-medium">
            {receitasFiltradas.length} receita{receitasFiltradas.length !== 1 ? "s" : ""} disponível
            {receitasFiltradas.length !== 1 ? "is" : ""}
          </p>
        </div>
      </div>

      {/* Recipe grid */}
      <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6">
        {receitasFiltradas.length === 0 ? (
          <div className="text-center py-16">
            <p className="text-lg text-emerald-600 mb-2">Nenhuma receita encontrada</p>
            <button
              onClick={() => {
                setQuery("")
                setCategoriaAtiva("todas")
              }}
              className="text-sm text-emerald-700 underline hover:text-emerald-900"
            >
              Limpar filtros
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {receitasFiltradas.map((receita) => (
              <ReceitaCard key={receita.id} receita={receita} />
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

function ReceitaCard({ receita }: { receita: Receita }) {
  const categoria = CATEGORIAS.find((c) => c.id === receita.categoria)

  return (
    <Link href={`/receita/${receita.slug}`} className="block group">
      <div className="bg-white rounded-2xl shadow-sm border-2 border-emerald-100 overflow-hidden hover:shadow-xl hover:-translate-y-1 transition-all">
        <div className="h-20 flex items-center justify-center bg-gradient-to-br from-emerald-100 to-teal-100">
          <div className="text-center">
            <span className="text-4xl mb-1 block">{categoria?.emoji || "🌿"}</span>
            <span className="inline-block rounded-full bg-white px-2.5 py-0.5 text-xs font-semibold text-emerald-700">
              {categoria?.label || receita.categoria}
            </span>
          </div>
        </div>

        <div className="p-4">
          <h3 className="font-bold text-base text-emerald-900 mb-2 text-balance line-clamp-2">{receita.nome}</h3>
          <p className="text-sm text-emerald-700 mb-3 line-clamp-2">{receita.descricao}</p>

          {/* Tags */}
          {receita.tags.length > 0 && (
            <div className="flex flex-wrap gap-1.5">
              {receita.tags.slice(0, 4).map((tag) => (
                <span key={tag} className="text-xs text-emerald-600 bg-emerald-50 px-2.5 py-1 rounded-full font-medium">
                  #{tag}
                </span>
              ))}
            </div>
          )}
        </div>
      </div>
    </Link>
  )
}
