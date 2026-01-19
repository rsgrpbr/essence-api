// components/SymptomsSearch.tsx
import React, { useState, useCallback, useRef } from 'react'
import { debounce } from 'lodash'
import { Search, AlertTriangle, Clock, Heart } from 'lucide-react'

interface OilRecommendation {
  id: number
  name: string
  slug: string
  image?: string
  is_free: boolean
  priority: number
  confidence: number
}

interface SymptomMatch {
  symptom_name: string
  body_system: string
  confidence_score: number
  recommended_oils: OilRecommendation[]
  match_score: number
}

interface SearchResponse {
  success: boolean
  query: string
  results: SymptomMatch[]
  total: number
  disclaimer: {
    pt: string
    legal: string
  }
}

export default function SymptomsSearch() {
  const [query, setQuery] = useState('')
  const [results, setResults] = useState<SymptomMatch[]>([])
  const [loading, setLoading] = useState(false)
  const [disclaimer, setDisclaimer] = useState<any>(null)
  const [showResults, setShowResults] = useState(false)
  
  const searchTimeoutRef = useRef<NodeJS.Timeout>()

  // Busca com debounce para evitar muitas requisições
  const debouncedSearch = useCallback(
    debounce(async (searchQuery: string) => {
      if (searchQuery.length < 2) {
        setResults([])
        setShowResults(false)
        return
      }

      setLoading(true)
      try {
        const response = await fetch('/api/symptoms-search', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            query: searchQuery,
            limit: 5
          })
        })

        const data: SearchResponse = await response.json()

        if (data.success) {
          setResults(data.results)
          setDisclaimer(data.disclaimer)
          setShowResults(true)
        } else {
          console.error('Erro na busca:', data)
          setResults([])
        }
      } catch (error) {
        console.error('Erro ao buscar sintomas:', error)
        setResults([])
      } finally {
        setLoading(false)
      }
    }, 500),
    []
  )

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value
    setQuery(value)
    debouncedSearch(value)
  }

  const clearSearch = () => {
    setQuery('')
    setResults([])
    setShowResults(false)
  }

  return (
    <div className="w-full max-w-2xl mx-auto p-4">
      {/* Input de Busca */}
      <div className="relative mb-6">
        <div className="relative">
          <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
          <input
            type="text"
            placeholder="Como você está se sentindo? Ex: dor de cabeça, ansioso, não consigo dormir..."
            value={query}
            onChange={handleSearchChange}
            className="w-full pl-12 pr-12 py-4 border-2 border-gray-200 rounded-xl focus:border-green-500 focus:outline-none text-lg"
          />
          {query && (
            <button
              onClick={clearSearch}
              className="absolute right-4 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
            >
              ✕
            </button>
          )}
        </div>

        {/* Loading indicator */}
        {loading && (
          <div className="absolute right-4 top-1/2 transform -translate-y-1/2">
            <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-green-500"></div>
          </div>
        )}
      </div>

      {/* Sugestões de busca */}
      {!query && !showResults && (
        <div className="mb-6">
          <p className="text-sm text-gray-600 mb-3">Tente pesquisar por:</p>
          <div className="flex flex-wrap gap-2">
            {[
              "ansiedade", "dor de cabeça", "insônia", "stress", 
              "resfriado", "dor muscular", "digestão"
            ].map((suggestion) => (
              <button
                key={suggestion}
                onClick={() => setQuery(suggestion)}
                className="px-3 py-1 bg-gray-100 hover:bg-gray-200 rounded-full text-sm text-gray-700 transition-colors"
              >
                {suggestion}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Disclaimer Importante */}
      {showResults && disclaimer && (
        <div className="bg-amber-50 border-l-4 border-amber-400 p-4 mb-6 rounded-r-lg">
          <div className="flex items-start">
            <AlertTriangle className="text-amber-400 w-5 h-5 mt-0.5 mr-3 flex-shrink-0" />
            <div>
              <p className="text-sm text-amber-800 font-medium">
                {disclaimer.pt}
              </p>
              <p className="text-xs text-amber-700 mt-1">
                {disclaimer.legal}
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Resultados da Busca */}
      {showResults && results.length > 0 && (
        <div className="space-y-6">
          <h3 className="text-lg font-semibold text-gray-800">
            Sugestões para "{query}"
          </h3>

          {results.map((match, index) => (
            <SymptomCard key={index} match={match} />
          ))}
        </div>
      )}

      {/* Nenhum resultado */}
      {showResults && results.length === 0 && !loading && (
        <div className="text-center py-12">
          <div className="text-gray-400 mb-4">
            <Search className="w-16 h-16 mx-auto" />
          </div>
          <h3 className="text-lg font-medium text-gray-600 mb-2">
            Nenhuma sugestão encontrada
          </h3>
          <p className="text-gray-500 text-sm">
            Tente palavras diferentes ou mais específicas
          </p>
        </div>
      )}
    </div>
  )
}

// Componente para cada resultado de sintoma
function SymptomCard({ match }: { match: SymptomMatch }) {
  return (
    <div className="bg-white border border-gray-200 rounded-xl p-6 shadow-sm hover:shadow-md transition-shadow">
      {/* Header do sintoma */}
      <div className="flex items-start justify-between mb-4">
        <div>
          <h4 className="font-semibold text-gray-800 text-lg">
            {match.symptom_name}
          </h4>
          <div className="flex items-center mt-1">
            <Heart className="w-4 h-4 text-green-500 mr-1" />
            <span className="text-sm text-gray-600">{match.body_system}</span>
          </div>
        </div>
        
        <div className="text-right">
          <div className="text-xs text-gray-500">Confiança</div>
          <div className="text-sm font-medium text-green-600">
            {Math.round(match.match_score * 100)}%
          </div>
        </div>
      </div>

      {/* Lista de óleos recomendados */}
      <div className="space-y-3">
        <p className="text-sm font-medium text-gray-700">Óleos recomendados:</p>
        
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {match.recommended_oils.slice(0, 4).map((oil) => (
            <OilRecommendationCard key={oil.id} oil={oil} />
          ))}
        </div>
      </div>
    </div>
  )
}

// Componente para cada óleo recomendado
function OilRecommendationCard({ oil }: { oil: OilRecommendation }) {
  const handleOilClick = () => {
    // Navegar para página do óleo ou abrir modal
    window.location.href = `/oleos/${oil.slug}`
  }

  return (
    <div
      onClick={handleOilClick}
      className="flex items-center p-3 bg-gray-50 hover:bg-gray-100 rounded-lg cursor-pointer transition-colors group"
    >
      {/* Imagem do óleo */}
      <div className="w-12 h-12 bg-gradient-to-br from-green-400 to-green-600 rounded-lg flex-shrink-0 mr-3 flex items-center justify-center">
        {oil.image ? (
          <img 
            src={oil.image} 
            alt={oil.name}
            className="w-8 h-8 object-cover rounded"
          />
        ) : (
          <span className="text-white text-xs font-medium">
            {oil.name.charAt(0)}
          </span>
        )}
      </div>

      {/* Info do óleo */}
      <div className="flex-1 min-w-0">
        <div className="flex items-center justify-between">
          <p className="font-medium text-gray-800 truncate group-hover:text-green-600 transition-colors">
            {oil.name}
          </p>
          {!oil.is_free && (
            <span className="ml-2 px-2 py-0.5 bg-amber-100 text-amber-800 text-xs rounded-full">
              Premium
            </span>
          )}
        </div>
        <p className="text-xs text-gray-500 mt-0.5">
          Prioridade #{oil.priority} • {Math.round(oil.confidence * 100)}% match
        </p>
      </div>
    </div>
  )
}
