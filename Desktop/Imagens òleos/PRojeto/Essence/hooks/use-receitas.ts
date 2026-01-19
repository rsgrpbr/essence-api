"use client"

import { useEffect, useState } from "react"
import { getReceitas, type Receita } from "@/lib/receitas"

export function useReceitas() {
  const [receitas, setReceitas] = useState<Receita[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<Error | null>(null)

  useEffect(() => {
    async function load() {
      try {
        setLoading(true)
        const data = await getReceitas()
        setReceitas(data)
      } catch (err) {
        setError(err as Error)
      } finally {
        setLoading(false)
      }
    }

    load()
  }, [])

  return { receitas, loading, error }
}
