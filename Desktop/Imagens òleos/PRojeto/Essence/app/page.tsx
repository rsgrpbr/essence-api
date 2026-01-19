"use client"

import { useState, useEffect, useCallback } from "react"
import Image from "next/image"
import Link from "next/link"
import { fetchOleos, FORMAS_USO, type Oleo } from "@/lib/data/oleos"
import { Search, Droplet, ChevronDown, ChevronUp, Lock, Loader2, Sparkles, AlertCircle } from "lucide-react"
import { useSubscription } from "@/lib/contexts/subscription-context"
import { useRouter } from "next/navigation"
import { createClient } from "@/lib/supabase/client"
import { useSymptomSearch } from "@/lib/hooks/useSymptomSearch"
import { PWAInstallPrompt } from "@/components/pwa-install-prompt"
import { PremiumButton } from "@/components/premium-button"
import { UserMenu } from "@/components/user-menu"
import { OilCardImage } from "./oil-card-image"

type OleoWithRelevance = Oleo & {
  relevanceScore?: number
}

export default function HomePage() {
  const [query, setQuery] = useState("")
  const [isLegendExpanded, setIsLegendExpanded] = useState(false)
  const { userTier, isLoggedIn, user, profile, isLoading, signOut } = useSubscription()
  const router = useRouter()
  const [isLoggingOut, setIsLoggingOut] = useState(false)
  const [loadingPortal, setLoadingPortal] = useState(false)
  const [diagnosticando, setDiagnosticando] = useState(false)
  const [oleos, setOleos] = useState<Oleo[]>([])
  const [loadingOleos, setLoadingOleos] = useState(true)
  const [selectedPlan, setSelectedPlan] = useState<"monthly" | "annual">("annual")
  const [isProcessing, setIsProcessing] = useState(false)
  const [isRedirecting, setIsRedirecting] = useState(false)

  const { results: symptomResults, loading: searchingSymptoms, error: searchError } = useSymptomSearch(query)

  const handleDirectCheckout = async () => {
    if (!user || !user.id || !user.email) {
      alert("Erro: Dados do usuário incompletos. Faça login novamente.")
      return
    }

    setIsProcessing(true)

    try {
      const response = await fetch("/api/create-checkout-session", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          plan: selectedPlan,
          userId: user.id,
          userEmail: user.email,
        }),
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || "Erro ao criar sessão de checkout")
      }

      const { url } = await response.json()
      window.location.href = url
    } catch (err: any) {
      console.error("Erro ao processar checkout:", err)
      alert("Erro ao processar checkout. Tente novamente.")
      setIsProcessing(false)
    }
  }

  useEffect(() => {
    const loadOleos = async () => {
      setLoadingOleos(true)
      const data = await fetchOleos()
      setOleos(data)
      setLoadingOleos(false)
    }
    loadOleos()
  }, [])

  useEffect(() => {
    const checkPaymentSuccess = async () => {
      const params = new URLSearchParams(window.location.search)

      if (params.get("payment") === "success") {
        console.log("✅ [SUCCESS] Pagamento detectado, atualizando sessão...")

        window.history.replaceState({}, "", "/")

        await new Promise((resolve) => setTimeout(resolve, 2000))

        const supabase = createClient()
        const { data } = await supabase.auth.refreshSession()

        if (data.session) {
          console.log("✅ [SUCCESS] Sessão atualizada, recarregando...")
          window.location.reload()
        }
      }
    }

    checkPaymentSuccess()
  }, [])

  useEffect(() => {
    const savedQuery = localStorage.getItem("aroma-query")
    if (savedQuery) setQuery(savedQuery)
  }, [])

  useEffect(() => {
    localStorage.setItem("aroma-query", query)
  }, [query])

  const handleKeyDown = useCallback((e: KeyboardEvent) => {
    if (e.key === "/" && document.activeElement?.tagName !== "INPUT") {
      e.preventDefault()
      document.getElementById("search-input")?.focus()
    }
    if (e.key === "Escape") {
      setQuery("")
      ;(document.getElementById("search-input") as HTMLInputElement)?.blur()
    }
  }, [])

  useEffect(() => {
    document.addEventListener("keydown", handleKeyDown)
    return () => document.removeEventListener("keydown", handleKeyDown)
  }, [handleKeyDown])

  const handleLogout = async () => {
    setIsLoggingOut(true)
    try {
      await signOut()
    } catch (error) {
      console.error("[v0] Logout error:", error)
      localStorage.clear()
      window.location.href = "/login"
    }
  }

  const handleDiagnosticar = async () => {
    try {
      setDiagnosticando(true)

      const supabase = createClient()
      const {
        data: { session },
      } = await supabase.auth.getSession()

      if (!session?.access_token) {
        alert("Você precisa fazer login primeiro")
        return
      }

      const response = await fetch("/api/fix-portal", {
        headers: {
          Authorization: `Bearer ${session.access_token}`,
        },
      })
      const data = await response.json()

      console.log("📊 Diagnóstico:", data)

      if (data.sucesso && data.portal_url) {
        window.location.href = data.portal_url
      } else {
        alert(`Erro: ${data.erro}`)
        console.error("Diagnóstico:", data.diagnostico)
      }
    } catch (error: any) {
      console.error("Erro:", error)
      alert("Erro: " + error.message)
    } finally {
      setDiagnosticando(false)
    }
  }

  const handleOilClick = (oil: Oleo) => {
    console.log("👆 [HOME] Clicou em:", oil.nome)
    console.log("🔍 [HOME] isLoggedIn:", isLoggedIn)
    console.log("👤 [HOME] user:", user?.email)

    if (!isLoggedIn || !user) {
      console.log("❌ [HOME] NÃO está logado - redirecionando para login")
      sessionStorage.setItem("redirectAfterLogin", `/oleo/${oil.slug}`)
      sessionStorage.setItem("oilName", oil.nome)
      router.push("/login")
      return
    }

    console.log("✅ [HOME] Está logado - abrindo óleo")
    router.push(`/oleo/${oil.slug}`)
  }

  const filteredOleos =
    symptomResults.length > 0
      ? symptomResults.flatMap((result) =>
          result.oils
            .filter((oil) => oil.available)
            .map((oil) => oleos.find((o) => o.slug === oil.oil_slug))
            .filter((oleo): oleo is Oleo => oleo !== undefined),
        )
      : oleos.filter((oleo) => {
          const normalizedQuery = query.toLowerCase().trim()

          if (normalizedQuery) {
            const searchableText = [oleo.nome, oleo.nota, ...oleo.tags, ...oleo.categorias].join(" ").toLowerCase()
            return searchableText.includes(normalizedQuery)
          }

          return true
        })

  return (
    <div className="min-h-screen bg-gradient-to-br from-stone-50 via-amber-50/50 to-emerald-50/30">
      <div className="fixed top-4 right-4 z-50 flex items-center gap-3">
        <PremiumButton />
        {isLoggedIn ? (
          <UserMenu />
        ) : (
          <Link
            href="/login"
            className="rounded-full bg-emerald-600 px-6 py-2 text-sm font-semibold text-white shadow-lg transition-all hover:bg-emerald-700 hover:scale-105"
          >
            Entrar
          </Link>
        )}
      </div>

      <div className="mx-auto max-w-7xl max-w-full overflow-x-hidden px-4 pt-4 pb-8 sm:px-6 lg:px-8">
        <header className="mb-1 text-center">
          <div className="mb-1 flex justify-center">
            <div className="relative h-80 w-80 sm:h-[435px] sm:w-[435px]">
              <Image src="/logo.png" alt="Essence" fill className="object-contain drop-shadow-sm" priority />
            </div>
          </div>
        </header>

        <div className="mb-6">
          <div className="relative mx-auto max-w-2xl">
            {symptomResults.length > 0 ? (
              <Sparkles className="absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-purple-600" />
            ) : (
              <Search className="absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-emerald-600" />
            )}
            <input
              id="search-input"
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Buscar óleo ou sintoma (ex: ansiedade, dor de cabeça)"
              className={`w-full rounded-2xl border-2 bg-white py-4 pl-12 pr-4 text-base shadow-sm transition-all placeholder:text-emerald-400 focus:outline-none focus:ring-4 ${
                symptomResults.length > 0
                  ? "border-purple-300 focus:border-purple-400 focus:ring-purple-100"
                  : "border-emerald-200 focus:border-emerald-400 focus:ring-emerald-100"
              }`}
              aria-label="Buscar óleos essenciais ou sintomas"
            />
            {symptomResults.length > 0 && !searchingSymptoms && (
              <div className="absolute right-4 top-1/2 -translate-y-1/2 text-xs font-semibold text-purple-600 bg-purple-50 px-2 py-1 rounded-full">
                Busca por sintoma
              </div>
            )}
          </div>

          {searchError && (
            <div className="mx-auto max-w-2xl mt-2 p-3 bg-red-50 border border-red-200 rounded-lg flex items-center gap-2 text-sm text-red-700">
              <AlertCircle className="w-4 h-4 flex-shrink-0" />
              <span>{searchError}</span>
            </div>
          )}

          {query.trim().length >= 2 &&
            !searchingSymptoms &&
            symptomResults.length === 0 &&
            filteredOleos.length === 0 && (
              <div className="mx-auto max-w-2xl mt-2 p-4 bg-blue-50 border border-blue-200 rounded-lg text-sm text-blue-700">
                <p className="font-medium mb-1">Nenhum resultado para "{query}"</p>
                <p className="text-xs">
                  Tente variações como "dor cabeca" (sem acento) ou termos mais simples como "ansiedade" ou "sono"
                </p>
              </div>
            )}
        </div>

        <div className="mb-8 mx-auto max-w-2xl">
          <button
            onClick={() => setIsLegendExpanded(!isLegendExpanded)}
            className="w-full rounded-2xl bg-white p-4 shadow-sm border-2 border-emerald-100 hover:border-emerald-200 transition-all"
          >
            <div className="flex flex-col gap-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Droplet className="h-5 w-5 text-emerald-600" />
                  <h2 className="text-base font-semibold text-emerald-900">Métodos de Uso</h2>
                </div>
                <div className="flex-shrink-0">
                  {isLegendExpanded ? (
                    <ChevronUp className="h-5 w-5 text-emerald-600" />
                  ) : (
                    <ChevronDown className="h-5 w-5 text-emerald-600" />
                  )}
                </div>
              </div>

              {!isLegendExpanded && (
                <div className="flex items-center justify-center gap-2 flex-wrap">
                  {Object.values(FORMAS_USO).map((forma) => (
                    <div
                      key={forma.code}
                      className="flex h-8 w-8 items-center justify-center rounded-full text-sm font-bold text-white shadow-sm flex-shrink-0"
                      style={{ backgroundColor: forma.color }}
                      title={forma.label}
                    >
                      {forma.code}
                    </div>
                  ))}
                </div>
              )}
            </div>

            {isLegendExpanded && (
              <div className="mt-4 pt-4 border-t border-emerald-100">
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                  {Object.values(FORMAS_USO).map((forma) => (
                    <div key={forma.code} className="flex items-center gap-2">
                      <div
                        className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full text-sm font-bold text-white shadow-sm"
                        style={{ backgroundColor: forma.color }}
                      >
                        {forma.code}
                      </div>
                      <span className="text-sm font-medium text-emerald-800">{forma.label}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </button>
        </div>

        {loadingOleos ? (
          <div className="py-16 text-center">
            <Loader2 className="h-12 w-12 animate-spin text-emerald-600 mx-auto mb-4" />
            <p className="text-lg text-emerald-600">Carregando óleos essenciais...</p>
          </div>
        ) : (
          <>
            {symptomResults.length > 0 && (
              <div className="mb-6 space-y-4">
                {symptomResults.map((result, idx) => {
                  console.log("[v0] Rendering result:", result)
                  console.log("[v0] Result oils:", result.oils)

                  const oilsArray = Array.isArray(result.oils) ? result.oils : []
                  console.log("[v0] Oils array to render:", oilsArray)

                  return (
                    <div key={idx} className="bg-white rounded-xl p-4 shadow-sm border-2 border-purple-100">
                      <div className="flex items-center justify-between mb-3">
                        <div className="flex items-center gap-2">
                          <Sparkles className="w-5 h-5 text-purple-600" />
                          <h3 className="font-semibold text-purple-900">{result.symptom}</h3>
                        </div>
                        <span className="text-xs font-medium bg-blue-100 text-blue-700 px-2 py-1 rounded-full">
                          {result.category}
                        </span>
                      </div>

                      <div className="flex flex-wrap gap-2">
                        {oilsArray.length > 0 ? (
                          oilsArray.map((oil, oilIdx) => (
                            <span
                              key={oilIdx}
                              className={`text-xs font-medium px-3 py-1 rounded-full ${
                                oil.available
                                  ? "bg-emerald-100 text-emerald-700 border border-emerald-200"
                                  : "bg-gray-100 text-gray-500 border border-gray-200"
                              }`}
                            >
                              {oil.oil_name || oil.name || "Sem nome"} {!oil.available && "(indisponível)"}
                            </span>
                          ))
                        ) : (
                          <span className="text-sm text-gray-500 italic">Nenhum óleo disponível para este sintoma</span>
                        )}
                      </div>
                    </div>
                  )
                })}
              </div>
            )}

            {filteredOleos.length > 0 && (
              <div className="mb-6 text-center">
                <p className="text-sm font-medium text-emerald-700">
                  {filteredOleos.length} {filteredOleos.length === 1 ? "resultado" : "resultados"}
                </p>
              </div>
            )}

            {filteredOleos.length > 0 ? (
              <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
                {filteredOleos.map((oleo, index) => (
                  <OleoCard
                    key={oleo.slug}
                    oleo={oleo}
                    index={index}
                    userTier={userTier}
                    isLoggedIn={isLoggedIn}
                    onOilClick={handleOilClick}
                    showRelevance={false}
                    selectedPlan={selectedPlan}
                    setSelectedPlan={setSelectedPlan}
                    handleDirectCheckout={handleDirectCheckout}
                    isProcessing={isProcessing}
                    setIsProcessing={setIsProcessing}
                    isRedirecting={isRedirecting}
                    setIsRedirecting={setIsRedirecting}
                  />
                ))}
              </div>
            ) : (
              query && (
                <div className="py-16 text-center">
                  <button
                    onClick={() => setQuery("")}
                    className="px-8 py-4 bg-emerald-600 text-white font-semibold rounded-xl hover:bg-emerald-700 transition-all shadow-md hover:shadow-lg"
                  >
                    Limpar busca
                  </button>
                </div>
              )
            )}
          </>
        )}
      </div>
      <PWAInstallPrompt />
    </div>
  )
}

function OleoCard({
  oleo,
  onOilClick,
  selectedPlan,
  setSelectedPlan,
  handleDirectCheckout,
  isProcessing,
  setIsProcessing,
  isRedirecting,
  setIsRedirecting,
}: {
  oleo: Oleo
  onOilClick: (oleo: Oleo) => void
  selectedPlan: "monthly" | "annual"
  setSelectedPlan: (plan: "monthly" | "annual") => void
  handleDirectCheckout: () => void
  isProcessing: boolean
  setIsProcessing: (processing: boolean) => void
  isRedirecting: boolean
  setIsRedirecting: (redirecting: boolean) => void
}) {
  const { userTier } = useSubscription()
  const router = useRouter()
  const isLocked = !oleo.is_free && userTier === "free"

  return (
    <div className="relative">
      {isLocked && (
        <div className="absolute top-3 right-3 z-20 rounded-full bg-gradient-to-r from-amber-500 to-orange-500 px-2.5 py-1 text-[10px] font-bold text-white shadow-md flex items-center gap-1">
          <Lock className="w-2.5 h-2.5" />
          Premium
        </div>
      )}

      <div
        onClick={() => {
          if (isLocked) {
            router.push('/checkout')
          } else {
            onOilClick(oleo)
          }
        }}
        className={`group block overflow-hidden rounded-2xl bg-white shadow-sm transition-all hover:shadow-xl hover:-translate-y-1 ${
          isLocked ? "cursor-pointer" : "cursor-pointer"
        }`}
        style={{ borderTop: `4px solid ${oleo.cor}` }}
      >
        <div className={isLocked ? "relative" : ""}>
          {isLocked && (
            <div className="absolute inset-0 bg-gradient-to-b from-white/40 via-white/30 to-white/50 backdrop-blur-[1px] z-10 rounded-2xl" />
          )}
          <div className="relative">
            <div className="relative aspect-square overflow-hidden bg-gradient-to-br from-emerald-100 to-teal-100">
              <OilCardImage slug={oleo.slug} nome={oleo.nome} isLocked={isLocked} />
            </div>
            <div className="p-5 max-w-full">
              <h3 className="mb-3 text-xl font-bold text-emerald-900 text-balance">{oleo.nome}</h3>

              <div className={`space-y-3 ${isLocked ? "blur-[0.5px] opacity-60" : ""}`}>
                <div>
                  <p className="text-xs font-medium text-emerald-900 mb-1">Origem:</p>
                  <p className="text-sm text-emerald-700 break-words">{oleo.origem}</p>
                </div>

                {oleo.composicao.length > 0 && (
                  <div>
                    <p className="text-xs font-medium text-emerald-900 mb-1">Composição:</p>
                    <p className="text-sm text-emerald-700 break-words line-clamp-2">{oleo.composicao.join(", ")}</p>
                  </div>
                )}

                <div>
                  <p className="text-xs font-medium text-emerald-900 mb-2">Métodos de uso:</p>
                  <div className="overflow-x-auto -mx-1 px-1">
                    <div className="flex gap-2 min-w-max">
                      {oleo.formasUso.map((code) => {
                        const forma = Object.values(FORMAS_USO).find((f) => f.code === code)
                        return forma ? (
                          <div
                            key={code}
                            className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full text-sm font-bold text-white shadow-sm"
                            style={{ backgroundColor: forma.color }}
                            title={forma.label}
                          >
                            {code}
                          </div>
                        ) : null
                      })}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
          {isLocked && (
            <div className="absolute inset-0 flex items-center justify-center z-20 pointer-events-none">
              <div className="rounded-full bg-gradient-to-r from-amber-500 to-orange-500 p-3 shadow-xl">
                <Lock className="w-6 h-6 text-white" />
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
