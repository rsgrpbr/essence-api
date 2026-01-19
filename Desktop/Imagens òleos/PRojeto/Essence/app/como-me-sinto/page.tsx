"use client"

import { useEffect } from "react"
import { useState } from "react"
import type React from "react"
import { Sparkles, Loader2, ChevronRight, Lock } from "lucide-react"
import Link from "next/link"
import { fetchOleos, type Oleo } from "@/lib/data/oleos"
import { UserMenu } from "@/components/user-menu"
import { createBrowserClient } from "@supabase/ssr"
import { PremiumButton } from "@/components/premium-button"

type OleoRecomendacao = {
  slug: string
  beneficios: string
  comoUsar: string
}

type SentimentoAnalise = {
  sentimento: string
  palavrasChave: string[]
  oleosRecomendados: OleoRecomendacao[]
}

const SENTIMENTOS_MAPA: SentimentoAnalise[] = [
  {
    sentimento: "Estresse e Ansiedade",
    palavrasChave: ["estressad", "ansios", "nervos", "tens", "preocupad", "sobrecarregad", "ansiedad", "angustiad"],
    oleosRecomendados: [
      {
        slug: "lavender",
        beneficios: "Acalma o sistema nervoso, reduz ansiedade e promove relaxamento profundo",
        comoUsar: "Difusor (5-7 gotas) ou aplicar diluído nas têmporas e pulsos",
      },
      {
        slug: "bergamot",
        beneficios: "Alivia tensão emocional e ajuda a equilibrar o humor",
        comoUsar: "Difusor (4-6 gotas) ou inalar diretamente do frasco",
      },
      {
        slug: "balance",
        beneficios: "Promove sensação de calma e equilíbrio emocional",
        comoUsar: "Aplicar diluído na nuca ou difusor (4-5 gotas)",
      },
    ],
  },
  {
    sentimento: "Tristeza e Melancolia",
    palavrasChave: ["trist", "melanc", "deprimid", "desanimat", "abatid", "chateado", "chorando", "down"],
    oleosRecomendados: [
      {
        slug: "wild-orange",
        beneficios: "Eleva o ânimo, traz alegria e energia positiva",
        comoUsar: "Difusor (6-8 gotas) ou aplicar no peito diluído",
      },
      {
        slug: "cheer",
        beneficios: "Combate sentimentos de tristeza e promove bem-estar emocional",
        comoUsar: "Difusor (3-5 gotas) ou inalar profundamente",
      },
      {
        slug: "tangerine",
        beneficios: "Traz leveza e alegria ao coração",
        comoUsar: "Aplicar diluído sobre o coração ou pulsos",
      },
    ],
  },
  {
    sentimento: "Cansaço e Fadiga",
    palavrasChave: ["cansad", "fadigad", "exaust", "sem energia", "esgotad", "sonolent", "fraco"],
    oleosRecomendados: [
      {
        slug: "peppermint",
        beneficios: "Estimula a mente, aumenta energia e clareza mental",
        comoUsar: "Difusor (3-4 gotas) ou inalar diretamente",
      },
      {
        slug: "lemon",
        beneficios: "Energiza, purifica o ambiente e melhora o humor",
        comoUsar: "Difusor (5-7 gotas) pela manhã",
      },
      {
        slug: "wild-orange",
        beneficios: "Revitaliza e traz energia positiva",
        comoUsar: "Difusor (6-8 gotas) ou aplicar nas têmporas diluído",
      },
    ],
  },
  {
    sentimento: "Dificuldade de Foco",
    palavrasChave: ["distraíd", "sem foco", "desconcentrad", "confus", "disperso", "mente agitada"],
    oleosRecomendados: [
      {
        slug: "peppermint",
        beneficios: "Melhora concentração e clareza mental",
        comoUsar: "Difusor (4-6 gotas) durante trabalho ou estudo",
      },
      {
        slug: "lemon",
        beneficios: "Clareia a mente e ajuda na concentração",
        comoUsar: "Difusor (4-5 gotas) ou inalar",
      },
      {
        slug: "thinker",
        beneficios: "Promove foco e clareza de pensamento",
        comoUsar: "Aplicar diluído na nuca ou têmporas",
      },
    ],
  },
  {
    sentimento: "Insônia e Agitação",
    palavrasChave: ["insônia", "não consigo dormir", "agitad", "inquiet", "acordado", "sem sono"],
    oleosRecomendados: [
      {
        slug: "lavender",
        beneficios: "Induz sono profundo e reparador",
        comoUsar: "Difusor no quarto (5-7 gotas) ou travesseiro",
      },
      {
        slug: "peace",
        beneficios: "Acalma mente agitada e promove sono tranquilo",
        comoUsar: "Difusor (3-5 gotas) 30min antes de dormir",
      },
      {
        slug: "calmer",
        beneficios: "Relaxante profundo que facilita o adormecer",
        comoUsar: "Aplicar diluído nos pés antes de dormir",
      },
    ],
  },
  {
    sentimento: "Raiva e Irritação",
    palavrasChave: ["raiva", "irritad", "com raiva", "furioso", "bravo", "com ódio"],
    oleosRecomendados: [
      {
        slug: "lavender",
        beneficios: "Acalma emoções intensas e reduz irritabilidade",
        comoUsar: "Difusor (3-5 gotas) ou inalar profundamente",
      },
      {
        slug: "frankincense",
        beneficios: "Promove paz interior e equilíbrio emocional",
        comoUsar: "Aplicar diluído no peito ou difusor (4-6 gotas)",
      },
      {
        slug: "bergamot",
        beneficios: "Transforma emoções negativas em positivas",
        comoUsar: "Difusor (4-6 gotas) ou massagem nas mãos",
      },
    ],
  },
  {
    sentimento: "Felicidade e Bem-estar",
    palavrasChave: ["feliz", "alegre", "grat", "contente", "bem", "animad", "ótimo"],
    oleosRecomendados: [
      {
        slug: "wild-orange",
        beneficios: "Amplifica sentimentos de alegria e gratidão",
        comoUsar: "Difusor (6-8 gotas) para celebrar o momento",
      },
      {
        slug: "cheer",
        beneficios: "Mantém energia positiva e vibrante",
        comoUsar: "Difusor (5-7 gotas) pela manhã",
      },
      {
        slug: "tangerine",
        beneficios: "Celebra a vida e intensifica emoções positivas",
        comoUsar: "Aplicar diluído no coração",
      },
    ],
  },
]

export default function ComoMeSintoPage() {
  const [texto, setTexto] = useState("")
  const [resultados, setResultados] = useState<Array<Oleo & { beneficios: string; comoUsar: string }>>([])
  const [sentimentoDetectado, setSentimentoDetectado] = useState("")
  const [analisando, setAnalisando] = useState(false)
  const [analisado, setAnalisado] = useState(false)
  const [oleos, setOleos] = useState<Oleo[]>([])
  const [loadingOleos, setLoadingOleos] = useState(true)
  const [isSintomaFisico, setIsSintomaFisico] = useState(false)
  const [mensagemSintoma, setMensagemSintoma] = useState("")
  const [sugestaoBusca, setSugestaoBusca] = useState("")

  // Estados para controle de acesso premium
  const [userTier, setUserTier] = useState<"free" | "premium">("free")
  const [showUpgradeModal, setShowUpgradeModal] = useState(false)
  const [selectedPlan, setSelectedPlan] = useState<"monthly" | "annual">("annual")
  const [isProcessing, setIsProcessing] = useState(false)

  // ✅ CORREÇÃO 1: user agora é tipado corretamente
  const [user, setUser] = useState<any>(null)

  // Estados de limite de perguntas
  const [questionsRemaining, setQuestionsRemaining] = useState<number | null>(null)
  const [showLimitModal, setShowLimitModal] = useState(false)
  const [loadingQuestionLimit, setLoadingQuestionLimit] = useState(true)

  // ✅ CORREÇÃO 2: Criar cliente Supabase uma única vez
  const supabase = createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
  )

  useEffect(() => {
    const loadOleos = async () => {
      setLoadingOleos(true)
      const data = await fetchOleos()
      setOleos(data)
      setLoadingOleos(false)
    }
    loadOleos()
  }, [])

  // ✅ CORREÇÃO 3: Verificar subscription_tier corretamente (APAGADAS as linhas com .user())
  useEffect(() => {
    async function checkUserTier() {
      // ✅ CORRETO: usar getUser() ao invés de user()
      const {
        data: { user: currentUser },
      } = await supabase.auth.getUser()

      setUser(currentUser)

      if (currentUser) {
        const { data: profile } = await supabase
          .from("profiles")
          .select("subscription_tier")
          .eq("id", currentUser.id)
          .single()

        console.log("🔍 [COMO-ME-SINTO] Profile tier:", profile?.subscription_tier)

        if (profile?.subscription_tier === "premium") {
          setUserTier("premium")
        } else {
          setUserTier("free")
        }
      }
    }

    checkUserTier()

    const handleVisibilityChange = () => {
      if (document.visibilityState === "visible") {
        console.log("👁️ [COMO-ME-SINTO] Página voltou a ficar visível - recarregando tier...")
        checkUserTier()
      }
    }

    const handleFocus = () => {
      console.log("🎯 [COMO-ME-SINTO] Window focus - recarregando tier...")
      checkUserTier()
    }

    document.addEventListener("visibilitychange", handleVisibilityChange)
    window.addEventListener("focus", handleFocus)

    return () => {
      document.removeEventListener("visibilitychange", handleVisibilityChange)
      window.removeEventListener("focus", handleFocus)
    }
  }, [])

  // Verificar limite de perguntas
  useEffect(() => {
    async function checkQuestionLimit() {
      try {
        const response = await fetch("/api/ai-questions")
        if (response.ok) {
          const data = await response.json()
          setQuestionsRemaining(data.questionsRemaining)
        }
      } catch (error) {
        console.error("Erro ao verificar limite:", error)
      } finally {
        setLoadingQuestionLimit(false)
      }
    }

    checkQuestionLimit()
  }, [])

  // ✅ CORREÇÃO 4: handleDirectCheckout DENTRO do componente
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

  const analisarSentimento = async () => {
    const textoNormalizado = texto.toLowerCase().trim()

    if (!textoNormalizado) {
      return
    }

    setAnalisando(true)

    // Verificar limite de perguntas ANTES de processar
    try {
      const limitResponse = await fetch("/api/ai-questions", {
        method: "POST",
      })

      const limitData = await limitResponse.json()

      // Se atingiu o limite
      if (!limitResponse.ok && limitData.needsUpgrade) {
        setShowLimitModal(true)
        setAnalisando(false)
        return
      }

      // Atualizar contador local
      if (limitData.questionsRemaining !== undefined) {
        setQuestionsRemaining(limitData.questionsRemaining)
      }
    } catch (error) {
      console.error("Erro ao verificar limite:", error)
      // Continua mesmo se falhar (graceful degradation)
    }

    try {
      const oleosDisponiveis = oleos
        .filter((oleo) => oleo.psico?.textoPrincipal && oleo.is_free !== undefined && oleo.psico?.emocoesNegativas)
        .map((oleo) => ({
          slug: oleo.slug,
          nome: oleo.nome,
          psico_texto_principal: oleo.psico?.textoPrincipal || "",
          psico_emocoes_negativas: oleo.psico?.emocoesNegativas || "",
        }))

      const response = await fetch("https://essence-api-xrz6.vercel.app/api/ai-sugestoes", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "X-API-Key": process.env.NEXT_PUBLIC_ESSENCE_API_SECRET!,
        },
        body: JSON.stringify({
          sentimento: texto,
          oleos: oleosDisponiveis,
        }),
      })

      if (response.ok) {
        const data = await response.json()

        if (data.tipo === "sintoma_fisico") {
          setIsSintomaFisico(true)
          setMensagemSintoma(data.mensagem || "")
          setSugestaoBusca(data.sugestao_busca || "")
          setSentimentoDetectado("")
          setResultados([])
          setAnalisando(false)
          setAnalisado(true)
          return
        } else if (data.tipo === "psicoaromaterapia") {
          setIsSintomaFisico(false)
          setMensagemSintoma("")
          setSugestaoBusca("")

          if (data.sentimento_detectado && data.sugestoes && data.sugestoes.length > 0) {
            setSentimentoDetectado(data.sentimento_detectado)

            const oleosEncontrados = data.sugestoes
              .slice(0, 3)
              .map((sugestao: any) => {
                const oleo = oleos.find((o) => o.slug === sugestao.slug)
                if (oleo) {
                  return {
                    ...oleo,
                    beneficios: sugestao.beneficios || "Benefícios personalizados para seu estado emocional",
                    comoUsar: sugestao.comoUsar || "Difusor (4-6 gotas) ou aplicar diluído",
                  }
                }
                return null
              })
              .filter((o): o is Oleo & { beneficios: string; comoUsar: string } => o !== null)

            setResultados(oleosEncontrados)
            setAnalisando(false)
            setAnalisado(true)
            return
          }
        }
      }

      throw new Error("API did not return valid results")
    } catch (error) {
      setIsSintomaFisico(false)
      setMensagemSintoma("")
      setSugestaoBusca("")

      setTimeout(() => {
        const sentimentosEncontrados: { sentimento: string; count: number; recomendacoes: OleoRecomendacao[] }[] = []

        SENTIMENTOS_MAPA.forEach((mapa) => {
          let count = 0
          mapa.palavrasChave.forEach((palavra) => {
            if (textoNormalizado.includes(palavra)) {
              count++
            }
          })

          if (count > 0) {
            sentimentosEncontrados.push({
              sentimento: mapa.sentimento,
              count,
              recomendacoes: mapa.oleosRecomendados,
            })
          }
        })

        sentimentosEncontrados.sort((a, b) => b.count - a.count)

        if (sentimentosEncontrados.length > 0) {
          const principal = sentimentosEncontrados[0]
          setSentimentoDetectado(principal.sentimento)

          const recomendacoesUnicas = principal.recomendacoes.slice(0, 3)

          const oleosEncontrados = recomendacoesUnicas
            .map((rec) => {
              const oleo = oleos.find((o) => o.slug === rec.slug)
              if (oleo) {
                return {
                  ...oleo,
                  beneficios: rec.beneficios,
                  comoUsar: rec.comoUsar,
                }
              }
              return null
            })
            .filter((o): o is Oleo & { beneficios: string; comoUsar: string } => o !== null)

          setResultados(oleosEncontrados)
        } else {
          setSentimentoDetectado("Bem-estar geral")
          const versateis = [
            {
              slug: "lavender",
              beneficios: "Óleo versátil que ajuda em diversos estados emocionais",
              comoUsar: "Difusor (5-7 gotas) ou aplicar diluído",
            },
            {
              slug: "frankincense",
              beneficios: "Promove equilíbrio emocional e bem-estar geral",
              comoUsar: "Difusor (4-6 gotas) ou meditação",
            },
          ]

          const oleosEncontrados = versateis
            .map((rec) => {
              const oleo = oleos.find((o) => o.slug === rec.slug)
              if (oleo) {
                return {
                  ...oleo,
                  beneficios: rec.beneficios,
                  comoUsar: rec.comoUsar,
                }
              }
              return null
            })
            .filter((o): o is Oleo & { beneficios: string; comoUsar: string } => o !== null)

          setResultados(oleosEncontrados)
        }

        setAnalisando(false)
        setAnalisado(true)
      }, 500)
    }
  }

  const limpar = () => {
    setTexto("")
    setResultados([])
    setSentimentoDetectado("")
    setAnalisado(false)
    setIsSintomaFisico(false)
    setMensagemSintoma("")
    setSugestaoBusca("")
  }

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault()
      analisarSentimento()
    }
  }

  if (loadingOleos) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-stone-50 via-amber-50/50 to-emerald-50/30 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="h-12 w-12 animate-spin text-emerald-600 mx-auto mb-4" />
          <p className="text-lg text-emerald-600">Carregando óleos essenciais...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-stone-50 via-amber-50/50 to-emerald-50/30 pb-24">
      <div className="fixed top-4 right-4 z-50 flex items-center gap-3">
        <PremiumButton />
        <UserMenu />
      </div>

      <div className="mx-auto max-w-4xl px-4 py-12 sm:px-6 lg:px-8">
        <header className="mb-8 text-center">
          <div className="mb-4 flex justify-center">
            <Sparkles className="h-12 w-12 text-emerald-600" />
          </div>
          <h1 className="mb-3 font-serif text-4xl font-bold text-emerald-900 sm:text-5xl text-balance">
            Como você está se sentindo?
          </h1>
          <p className="text-lg text-emerald-700 text-balance">
            Compartilhe seus sentimentos e vou sugerir o óleo essencial perfeito para você
          </p>
        </header>

        <div className="mb-8 rounded-2xl bg-white p-6 shadow-sm border-2 border-emerald-100">
          <label htmlFor="sentimento-textarea" className="mb-3 block text-sm font-semibold text-emerald-900">
            Descreva como você está se sentindo hoje
          </label>
          <textarea
            id="sentimento-textarea"
            value={texto}
            onChange={(e) => setTexto(e.target.value)}
            onKeyDown={handleKeyPress}
            placeholder="Ex: Estou me sentindo muito ansioso e estressado com o trabalho..."
            className="w-full rounded-xl border-2 border-emerald-200 bg-white p-4 text-base text-emerald-900 placeholder:text-emerald-400 focus:border-emerald-400 focus:outline-none focus:ring-4 focus:ring-emerald-100 min-h-[150px] resize-y"
            rows={6}
          />

          {!loadingQuestionLimit &&
            questionsRemaining !== null &&
            questionsRemaining >= 0 &&
            questionsRemaining <= 3 && (
              <div className="mt-4 rounded-2xl bg-gradient-to-br from-amber-50 to-amber-100 border-2 border-amber-300 p-5 shadow-sm">
                <div className="flex items-start gap-4">
                  <div className="flex-shrink-0 mt-1">
                    <div className="w-10 h-10 rounded-full bg-amber-400 flex items-center justify-center">
                      <svg className="w-5 h-5 text-white" fill="currentColor" viewBox="0 0 20 20">
                        <path
                          fillRule="evenodd"
                          d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z"
                          clipRule="evenodd"
                        />
                      </svg>
                    </div>
                  </div>
                  <div className="flex-1 space-y-2">
                    {questionsRemaining === 3 && (
                      <>
                        <p className="text-base font-bold text-amber-900 leading-tight">
                          Você tem {questionsRemaining} consultas restantes
                        </p>
                        <p className="text-sm text-amber-700 leading-snug">
                          Continue aproveitando suas consultas gratuitas!
                        </p>
                      </>
                    )}
                    {questionsRemaining === 2 && (
                      <>
                        <p className="text-base font-bold text-amber-900 leading-tight">
                          Você tem {questionsRemaining} consultas restantes
                        </p>
                        <p className="text-sm text-amber-700 leading-snug">
                          Continue aproveitando suas consultas gratuitas!
                        </p>
                      </>
                    )}
                    {questionsRemaining === 1 && (
                      <>
                        <p className="text-base font-bold text-red-700 leading-tight">Última consulta gratuita!</p>
                        <p className="text-sm text-red-600 leading-snug">
                          Após esta, você precisará assinar o Premium para continuar usando esta ferramenta.
                        </p>
                      </>
                    )}
                    {questionsRemaining === 0 && (
                      <>
                        <p className="text-base font-bold text-red-700 leading-tight">
                          Você atingiu o limite de consultas gratuitas
                        </p>
                        <p className="text-sm text-red-600 leading-snug">
                          Assine o Premium para continuar usando esta ferramenta.
                        </p>
                      </>
                    )}

                    <div className="pt-3 border-t-2 border-amber-300/50 mt-3">
                      <div className="flex items-center gap-2">
                        <Lock className="w-4 h-4 text-amber-700" />
                        <p className="text-sm font-semibold text-amber-800">Assinantes Premium: consultas ilimitadas</p>
                      </div>
                    </div>

                    <Link
                      href="/checkout"
                      className="mt-3 w-full inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-semibold text-sm transition-colors shadow-md hover:shadow-lg"
                    >
                      <Sparkles className="w-4 h-4" />
                      Assinar Premium
                    </Link>
                  </div>
                </div>
              </div>
            )}

          <div className="mt-4 flex gap-3">
            {!analisado ? (
              <button
                onClick={analisarSentimento}
                disabled={!texto.trim() || analisando}
                className="w-full rounded-xl bg-emerald-600 px-6 py-3 font-semibold text-white shadow-sm transition-all hover:bg-emerald-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                {analisando ? (
                  <>
                    <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    Analisando seus sentimentos...
                  </>
                ) : (
                  <>
                    <ChevronRight className="h-5 w-5" />
                    Encontrar meu óleo ideal
                  </>
                )}
              </button>
            ) : (
              <button
                onClick={limpar}
                className="w-full rounded-xl bg-emerald-600 px-6 py-3 font-semibold text-white shadow-sm transition-all hover:bg-emerald-700 flex items-center justify-center gap-2"
              >
                <ChevronRight className="h-5 w-5" />
                Nova análise
              </button>
            )}
          </div>
        </div>

        {analisado && isSintomaFisico && (
          <div className="mb-4 rounded-2xl bg-gradient-to-br from-blue-50 to-indigo-50 border-2 border-blue-200 p-4 shadow-sm">
            <div className="flex items-start gap-4">
              <div className="flex-shrink-0">
                <svg className="w-8 h-8 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                  />
                </svg>
              </div>
              <div className="flex-1">
                <h3 className="text-xl font-bold text-blue-900 mb-2">Sintoma Físico Detectado</h3>
                <p className="text-blue-800 mb-4">{mensagemSintoma}</p>
                {sugestaoBusca && (
                  <div className="bg-white rounded-xl p-4 border-2 border-blue-200">
                    <p className="text-sm font-semibold text-blue-900 mb-2">💡 Sugestão:</p>
                    <p className="text-blue-800 mb-3">{sugestaoBusca}</p>
                    <Link
                      href="/buscar"
                      className="inline-flex items-center gap-2 text-blue-600 hover:text-blue-700 font-semibold"
                    >
                      Ir para Busca de Sintomas
                      <ChevronRight className="h-4 w-4" />
                    </Link>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {analisado && !isSintomaFisico && sentimentoDetectado && (
          <div className="mb-4 rounded-2xl bg-gradient-to-br from-emerald-50 to-teal-50 border-2 border-emerald-200 p-4 shadow-sm">
            <h2 className="text-lg font-bold text-emerald-900 mb-1">Sentimento Identificado</h2>
            <p className="text-base text-emerald-700">{sentimentoDetectado}</p>
          </div>
        )}

        {analisado && !isSintomaFisico && resultados.length > 0 && (
          <div>
            <h2 className="mb-6 text-2xl font-bold text-emerald-900">Óleos Essenciais Recomendados para Você</h2>
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {resultados.map((oleo) => {
                const isPremiumLocked = !oleo.is_free && userTier === "free"

                const beneficiosSentences = oleo.beneficios.match(/[^.!?]+[.!?]+/g) || [oleo.beneficios]
                const firstSentence = beneficiosSentences.slice(0, 1).join(" ")
                const remainingSentences = beneficiosSentences.slice(1).join(" ")

                return (
                  <div
                    key={oleo.slug}
                    className="group relative overflow-hidden rounded-2xl bg-white p-6 shadow-sm transition-all hover:shadow-md border-2 border-emerald-100 hover:border-emerald-300"
                    style={{ borderTop: `4px solid ${oleo.cor || "#10b981"}` }}
                  >
                    <div className="mb-4 flex items-center justify-between">
                      <h3 className="text-xl font-bold text-emerald-900 group-hover:text-emerald-700">{oleo.nome}</h3>
                    </div>

                    {isPremiumLocked ? (
                      <div className="space-y-4">
                        <div className="relative min-h-[200px]">
                          <div className="mb-4 space-y-3">
                            <div>
                              <p className="text-sm font-semibold text-emerald-800 mb-1">💚 Benefícios:</p>
                              <p className="text-sm text-emerald-700 leading-relaxed">{firstSentence}</p>
                              {remainingSentences && (
                                <div className="relative mt-2">
                                  <p className="text-sm text-emerald-700 blur-sm">{remainingSentences}</p>
                                  <div className="absolute inset-0 bg-gradient-to-b from-transparent via-white/40 to-white/90 pointer-events-none" />
                                </div>
                              )}
                            </div>

                            <div className="relative">
                              <div className="blur-sm">
                                <p className="text-sm font-semibold text-emerald-800 mb-1">🌿 Como usar:</p>
                                <p className="text-sm text-emerald-700">Aplicação tópica ou difusão...</p>
                              </div>
                              <div className="absolute inset-0 bg-gradient-to-b from-transparent via-white/50 to-white/95 pointer-events-none" />
                            </div>
                          </div>

                          <div className="absolute inset-0 flex items-center justify-center pt-16">
                            <button
                              onClick={(e) => {
                                e.preventDefault()
                                setShowUpgradeModal(true)
                              }}
                              className="flex items-center gap-2 rounded-full bg-gradient-to-r from-amber-500 to-orange-500 px-6 py-3 font-semibold text-white shadow-lg transition-all hover:shadow-xl hover:scale-105"
                            >
                              <Lock className="h-5 w-5" />
                              Desbloquear Premium
                            </button>
                          </div>
                        </div>
                      </div>
                    ) : (
                      <>
                        <div className="mb-4 space-y-3">
                          <div>
                            <p className="text-sm font-semibold text-emerald-800 mb-1">💚 Benefícios:</p>
                            <p className="text-sm text-emerald-700">{oleo.beneficios}</p>
                          </div>
                          <div>
                            <p className="text-sm font-semibold text-emerald-800 mb-1">🌿 Como usar:</p>
                            <p className="text-sm text-emerald-700">{oleo.comoUsar}</p>
                          </div>
                        </div>

                        <Link
                          href={`/oleo/${oleo.slug}`}
                          className="flex items-center text-sm font-semibold text-emerald-600 group-hover:text-emerald-700"
                        >
                          Ver detalhes completos
                          <ChevronRight className="ml-1 h-4 w-4" />
                        </Link>
                      </>
                    )}
                  </div>
                )
              })}
            </div>
          </div>
        )}
      </div>

      {showLimitModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="w-full max-w-lg rounded-2xl bg-white p-8 shadow-xl">
            <div className="mb-6 text-center">
              <div className="mb-4 flex justify-center">
                <svg className="w-16 h-16 text-amber-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
                  />
                </svg>
              </div>
              <h2 className="mb-3 text-2xl font-bold text-emerald-900">Limite de Consultas Atingido</h2>
              <p className="text-lg text-emerald-700 mb-2">Você atingiu o limite de 30 consultas gratuitas por mês.</p>
              <p className="text-emerald-600">
                Assine o Premium para ter consultas ilimitadas e acesso a todos os óleos!
              </p>
            </div>

            <div className="space-y-3 mb-6">
              <div className="flex items-start gap-3 text-emerald-700">
                <svg className="w-5 h-5 text-emerald-600 flex-shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                  <path
                    fillRule="evenodd"
                    d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                    clipRule="evenodd"
                  />
                </svg>
                <span>Consultas ilimitadas de IA</span>
              </div>
              <div className="flex items-start gap-3 text-emerald-700">
                <svg className="w-5 h-5 text-emerald-600 flex-shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                  <path
                    fillRule="evenodd"
                    d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                    clipRule="evenodd"
                  />
                </svg>
                <span>Acesso a todos os 40+ óleos essenciais</span>
              </div>
              <div className="flex items-start gap-3 text-emerald-700">
                <svg className="w-5 h-5 text-emerald-600 flex-shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                  <path
                    fillRule="evenodd"
                    d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                    clipRule="evenodd"
                  />
                </svg>
                <span>Suporte prioritário</span>
              </div>
            </div>

            <div className="flex gap-4">
              <button
                onClick={() => setShowLimitModal(false)}
                className="flex-1 rounded-xl border-2 border-emerald-200 px-6 py-3 font-semibold text-emerald-600 transition-all hover:bg-emerald-50"
              >
                Voltar
              </button>
              <button
                onClick={() => {
                  setShowLimitModal(false)
                  window.location.href = "/checkout"
                }}
                className="flex-1 rounded-xl bg-emerald-600 px-6 py-3 font-semibold text-white shadow-sm transition-all hover:bg-emerald-700"
              >
                Assinar Premium
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
