"use client"

import { useState, useEffect } from "react"
import { supabase } from "@/lib/supabase"

export interface SymptomResult {
  symptom: string
  category: string
  oils: Array<{
    oil_slug: string
    oil_name: string
    available: boolean
  }>
  application_methods: string[]
  confidence_score: number
}

function normalizeSearchText(text: string): string {
  return (
    text
      .toLowerCase()
      .trim()
      // Remove acentos
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      // Normaliza espaços múltiplos para um só
      .replace(/\s+/g, " ")
      // Remove pontuação e caracteres especiais
      .replace(/[^\w\s]/g, " ")
      // Limpa espaços extras novamente
      .replace(/\s+/g, " ")
      .trim()
  )
}

const synonymMapping: Record<string, string[]> = {
  cabeca: ["cabeça", "cefalica", "cranio", "craniana"],
  estomago: ["estômago", "barriga", "abdomen", "abdominal"],
  ansiedade: ["ansioso", "nervoso", "nervosismo", "preocupacao", "preocupação"],
  tristeza: ["triste", "depressao", "depressão", "deprimido", "melancolia"],
  dor: ["dores", "dolorido", "dolorosa"],
  muscular: ["musculo", "músculos", "musculatura"],
  digestao: ["digestão", "digestivo", "digestiva"],
}

function expandWithSynonyms(query: string): string[] {
  const normalized = normalizeSearchText(query)
  for (const [key, synonyms] of Object.entries(synonymMapping)) {
    if (normalized.includes(key)) {
      return [...synonyms, normalized]
    }
  }
  return [normalized]
}

export function useSymptomSearch(query: string) {
  const [results, setResults] = useState<SymptomResult[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (query.trim().length < 2) {
      setResults([])
      setLoading(false)
      setError(null)
      return
    }

    const searchSymptoms = async () => {
      setLoading(true)
      setError(null)

      try {
        console.log("[v0] 🔍 Query original:", query)

        const normalizedQuery = normalizeSearchText(query)
        console.log("[v0] 📝 Query normalizada:", normalizedQuery)

        const words = normalizedQuery.split(" ").filter((w) => w.length > 1)
        console.log("[v0] 🔤 Palavras extraídas:", words)

        let data = null
        let searchError = null

        // BUSCA 1: Termo normalizado completo
        console.log("[v0] 🎯 BUSCA 1: Termo completo normalizado")
        ;({ data, error: searchError } = await supabase
          .from("anvisa_symptoms")
          .select("*")
          .ilike("symptom", `%${normalizedQuery}%`)
          .order("confidence_score", { ascending: false })
          .limit(8))

        console.log("[v0] ✅ Busca 1 resultado:", data?.length || 0, "resultados")

        // BUSCA 2: Se não encontrou, busca por palavras individuais
        if ((!data || data.length === 0) && words.length > 1) {
          console.log("[v0] 🎯 BUSCA 2: Palavras individuais:", words)

          const conditions = words.map((word) => `symptom.ilike.%${word}%`).join(",")
          ;({ data, error: searchError } = await supabase
            .from("anvisa_symptoms")
            .select("*")
            .or(conditions)
            .order("confidence_score", { ascending: false })
            .limit(8))

          console.log("[v0] ✅ Busca 2 resultado:", data?.length || 0, "resultados")
        }

        // BUSCA 3: Busca com sinônimos
        if ((!data || data.length === 0) && words.length >= 1) {
          console.log("[v0] 🎯 BUSCA 3: Tentando sinônimos")
          const expandedTerms = expandWithSynonyms(normalizedQuery)
          console.log("[v0] 📚 Termos expandidos com sinônimos:", expandedTerms)

          const synonymConditions = expandedTerms.map((term) => `symptom.ilike.%${term}%`).join(",")
          ;({ data, error: searchError } = await supabase
            .from("anvisa_symptoms")
            .select("*")
            .or(synonymConditions)
            .order("confidence_score", { ascending: false })
            .limit(8))

          console.log("[v0] ✅ Busca 3 resultado:", data?.length || 0, "resultados")
        }

        // BUSCA 4: Palavra principal apenas (fallback final)
        if ((!data || data.length === 0) && words.length >= 2) {
          const mainWord = words[0]
          console.log("[v0] 🎯 BUSCA 4: Palavra principal apenas:", mainWord)
          ;({ data, error: searchError } = await supabase
            .from("anvisa_symptoms")
            .select("*")
            .ilike("symptom", `%${mainWord}%`)
            .order("confidence_score", { ascending: false })
            .limit(5))

          console.log("[v0] ✅ Busca 4 resultado:", data?.length || 0, "resultados")
        }

        if (searchError) {
          throw searchError
        }

        console.log("[v0] 📊 Raw Supabase data:", data)

        const parsedResults = (data || []).map((result) => {
          let parsedOils = result.oils
          if (typeof result.oils === "string") {
            try {
              parsedOils = JSON.parse(result.oils)
            } catch (e) {
              console.error("[v0] ❌ Failed to parse oils JSON:", e)
              parsedOils = []
            }
          }

          if (!Array.isArray(parsedOils)) {
            parsedOils = []
          }

          return {
            ...result,
            oils: parsedOils,
          }
        })

        console.log("[v0] ✅ Final parsed results:", parsedResults.length, "resultados")
        setResults(parsedResults)
      } catch (err) {
        console.error("[v0] ❌ Symptom search error:", err)
        setError(err instanceof Error ? err.message : "Erro ao buscar sintomas")
        setResults([])
      } finally {
        setLoading(false)
      }
    }

    const timer = setTimeout(() => {
      searchSymptoms()
    }, 300)

    return () => clearTimeout(timer)
  }, [query])

  return { results, loading, error }
}
