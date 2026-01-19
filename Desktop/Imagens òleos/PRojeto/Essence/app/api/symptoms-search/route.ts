import { NextRequest, NextResponse } from 'next/server'
import { fetchOleos, type Oleo } from '@/lib/data/oleos'

// Mapa de sintomas e suas palavras-chave relacionadas
const SYMPTOM_KEYWORDS: Record<string, string[]> = {
  // Emocionais
  'ansiedade': ['ansiedade', 'ansioso', 'nervosismo', 'preocupação', 'estresse', 'tensão'],
  'depressão': ['depressão', 'tristeza', 'melancolia', 'desânimo'],
  'insônia': ['insônia', 'sono', 'dormir', 'insonia'],
  'estresse': ['estresse', 'stress', 'tensão', 'pressão'],
  'raiva': ['raiva', 'irritação', 'ira', 'fúria'],
  'medo': ['medo', 'pavor', 'temor', 'fobia'],
  
  // Físicos
  'dor de cabeça': ['dor de cabeça', 'cefaleia', 'enxaqueca', 'cabeça'],
  'dor muscular': ['dor muscular', 'músculo', 'dor nas costas', 'lombar'],
  'digestão': ['digestão', 'estômago', 'intestino', 'má digestão'],
  'respiratório': ['respiratório', 'tosse', 'resfriado', 'gripe', 'nariz'],
  'pele': ['pele', 'acne', 'irritação cutânea', 'dermatite'],
  'inflamação': ['inflamação', 'inflamatório', 'inchaço'],
  
  // Cognitivos
  'concentração': ['concentração', 'foco', 'atenção', 'memória'],
  'energia': ['energia', 'cansaço', 'fadiga', 'vigor'],
}

// Função para normalizar texto
function normalizeText(text: string): string {
  return text
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .trim()
}

// Função para calcular relevância do óleo para um sintoma
function calculateRelevance(query: string, oleo: Oleo): number {
  const normalizedQuery = normalizeText(query)
  let score = 0
  
  // Buscar em propriedades positivas (psicoaromaterapia)
  if (oleo.psico.propriedadesPositivas) {
    oleo.psico.propriedadesPositivas.forEach(prop => {
      if (normalizeText(prop).includes(normalizedQuery)) {
        score += 3
      }
    })
  }
  
  // Buscar em emoções negativas que o óleo trata
  if (oleo.psico.emocoesNegativas) {
    oleo.psico.emocoesNegativas.forEach(emocao => {
      if (normalizeText(emocao).includes(normalizedQuery)) {
        score += 3
      }
    })
  }
  
  // Buscar no texto principal de psicoaromaterapia
  if (oleo.psico.textoPrincipal) {
    const textoPrincipal = normalizeText(oleo.psico.textoPrincipal)
    if (textoPrincipal.includes(normalizedQuery)) {
      score += 2
    }
  }
  
  // Buscar nas dicas de uso
  if (oleo.dicasUso) {
    oleo.dicasUso.forEach(dica => {
      const categoria = normalizeText(dica.categoria)
      if (categoria.includes(normalizedQuery)) {
        score += 2
      }
      dica.dicas.forEach(dicaTexto => {
        if (normalizeText(dicaTexto).includes(normalizedQuery)) {
          score += 1
        }
      })
    })
  }
  
  // Buscar nas tags
  if (oleo.tags) {
    oleo.tags.forEach(tag => {
      if (normalizeText(tag).includes(normalizedQuery)) {
        score += 2
      }
    })
  }
  
  // Verificar sintomas mapeados
  Object.entries(SYMPTOM_KEYWORDS).forEach(([symptom, keywords]) => {
    if (keywords.some(kw => normalizedQuery.includes(kw))) {
      // Se o óleo trata esse sintoma
      const symptomInOleo = [
        ...oleo.psico.propriedadesPositivas,
        ...oleo.psico.emocoesNegativas,
        oleo.psico.textoPrincipal,
        ...oleo.tags
      ].some(text => normalizeText(text).includes(symptom))
      
      if (symptomInOleo) {
        score += 5
      }
    }
  })
  
  return score
}

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams
  const query = searchParams.get('q')
  
  if (!query || query.trim().length < 3) {
    return NextResponse.json({ 
      success: false, 
      error: 'Query deve ter pelo menos 3 caracteres' 
    })
  }
  
  try {
    const allOleos = await fetchOleos()
    
    // Calcular relevância para cada óleo
    const oleosWithScore = allOleos.map(oleo => ({
      oleo,
      score: calculateRelevance(query, oleo)
    }))
    
    // Filtrar óleos com score > 0 e ordenar por relevância
    const relevantOleos = oleosWithScore
      .filter(item => item.score > 0)
      .sort((a, b) => b.score - a.score)
      .slice(0, 10) // Limitar a 10 resultados
      .map(item => ({
        ...item.oleo,
        relevanceScore: item.score
      }))
    
    return NextResponse.json({
      success: true,
      query,
      results: relevantOleos,
      count: relevantOleos.length
    })
    
  } catch (error) {
    console.error('[SYMPTOMS-SEARCH] Erro:', error)
    return NextResponse.json({ 
      success: false, 
      error: 'Erro ao buscar óleos' 
    }, { status: 500 })
  }
}
