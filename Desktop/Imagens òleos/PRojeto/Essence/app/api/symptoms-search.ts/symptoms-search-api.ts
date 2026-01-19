// pages/api/symptoms-search.ts
import { NextApiRequest, NextApiResponse } from 'next'
import { supabase } from '@/lib/supabase'

interface SymptomSearchRequest {
  query: string
  limit?: number
}

interface OilRecommendation {
  id: number
  name: string
  priority: number
  confidence: number
  is_free: boolean
  image?: string
  slug: string
}

interface SymptomMatch {
  symptom_name: string
  body_system: string
  confidence_score: number
  recommended_oils: OilRecommendation[]
  match_score: number
}

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' })
  }

  try {
    const { query, limit = 5 } = req.body as SymptomSearchRequest

    // Validação básica
    if (!query || query.trim().length < 2) {
      return res.status(400).json({ 
        error: 'Query deve ter pelo menos 2 caracteres' 
      })
    }

    // Sanitização da query
    const sanitizedQuery = query.trim().toLowerCase()
    
    // Busca fuzzy nos sintomas da ANVISA
    const { data: symptomMatches, error } = await supabase
      .from('anvisa_symptoms_database')
      .select(`
        symptom_name,
        symptom_keywords,
        recommended_oils,
        body_system,
        confidence_score
      `)
      .textSearch('symptom_keywords', sanitizedQuery, {
        type: 'websearch',
        config: 'portuguese'
      })
      .order('confidence_score', { ascending: false })
      .limit(limit * 2) // Pega mais para filtrar depois

    if (error) {
      console.error('Erro na busca de sintomas:', error)
      return res.status(500).json({ error: 'Erro interno do servidor' })
    }

    // Processa os resultados e busca dados dos óleos
    const processedResults: SymptomMatch[] = []
    
    for (const match of symptomMatches || []) {
      // Calcula score de match (quão bem a query bate com as keywords)
      const matchScore = calculateMatchScore(sanitizedQuery, match.symptom_keywords)
      
      if (matchScore < 0.3) continue // Skip matches fracos
      
      // Busca detalhes dos óleos recomendados
      const oilIds = match.recommended_oils?.map((oil: any) => oil.name) || []
      const oilDetails = await getOilDetails(oilIds)
      
      processedResults.push({
        symptom_name: match.symptom_name,
        body_system: match.body_system,
        confidence_score: match.confidence_score,
        recommended_oils: oilDetails,
        match_score: matchScore
      })
    }

    // Ordena por relevância
    const sortedResults = processedResults
      .sort((a, b) => b.match_score - a.match_score)
      .slice(0, limit)

    // Resposta com disclaimer obrigatório
    return res.status(200).json({
      success: true,
      query: sanitizedQuery,
      results: sortedResults,
      total: sortedResults.length,
      disclaimer: {
        pt: "⚠️ Sugestões educacionais baseadas em dados da ANVISA. Não substituem orientação médica profissional. Em caso de sintomas persistentes, procure um médico.",
        legal: "Produto não destinado a diagnosticar, tratar, curar ou prevenir doenças."
      },
      timestamp: new Date().toISOString()
    })

  } catch (error) {
    console.error('Erro na API de busca de sintomas:', error)
    return res.status(500).json({ 
      error: 'Erro interno do servidor',
      success: false 
    })
  }
}

// Função auxiliar para calcular score de match
function calculateMatchScore(query: string, keywords: string[]): number {
  if (!keywords || keywords.length === 0) return 0

  const queryWords = query.split(' ')
  let totalMatches = 0
  let totalWords = queryWords.length

  for (const word of queryWords) {
    if (word.length < 2) continue
    
    for (const keyword of keywords) {
      if (keyword.toLowerCase().includes(word) || word.includes(keyword.toLowerCase())) {
        totalMatches += 1
        break // Uma match por palavra da query
      }
    }
  }

  return totalMatches / totalWords
}

// Função auxiliar para buscar detalhes dos óleos
async function getOilDetails(oilNames: string[]): Promise<OilRecommendation[]> {
  if (!oilNames || oilNames.length === 0) return []

  try {
    const { data: oils, error } = await supabase
      .from('essential_oils')
      .select(`
        id,
        nome,
        slug,
        imagem,
        is_free,
        is_active
      `)
      .in('nome', oilNames)
      .eq('is_active', true)

    if (error) {
      console.error('Erro ao buscar detalhes dos óleos:', error)
      return []
    }

    return (oils || []).map((oil, index) => ({
      id: oil.id,
      name: oil.nome,
      slug: oil.slug,
      image: oil.imagem,
      is_free: oil.is_free || false,
      priority: index + 1,
      confidence: Math.round((1 - index * 0.1) * 100) / 100
    }))

  } catch (error) {
    console.error('Erro ao buscar óleos:', error)
    return []
  }
}
