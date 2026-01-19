"use client"

import { useState, useEffect } from "react"
import Image from "next/image"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { useSubscription } from "@/lib/contexts/subscription-context"
import { ArrowLeft, Check, Shield, ChevronDown, ChevronUp, Sparkles, Loader2 } from "lucide-react"
import { useTracking } from "@/hooks/useTracking"

export default function CheckoutPage() {
  const { isLoggedIn, user, upgradeToPremium, isLoading } = useSubscription()
  const router = useRouter()
  const trackingData = useTracking()
  const [showSuccess, setShowSuccess] = useState(false)
  const [selectedPlan, setSelectedPlan] = useState<"monthly" | "quarterly" | "annual" | null>(null)
  const [isUpgrading, setIsUpgrading] = useState(false)

  // ========== ADICIONAR AQUI (Estados do Cupom) ==========
  const [appliedCoupon, setAppliedCoupon] = useState<{ code: string; discount: number } | null>(null)
  // ========================================================

  useEffect(() => {
    console.log("📱 [CHECKOUT PAGE] Mounted")
    console.log("📊 [CHECKOUT PAGE] isLoading:", isLoading)
    console.log("🔐 [CHECKOUT PAGE] isLoggedIn:", isLoggedIn)
    console.log("👤 [CHECKOUT PAGE] user:", user?.email)

    // Só redirecionar se definitivamente não está logado
    if (!isLoading && !isLoggedIn) {
      console.log("❌ [CHECKOUT PAGE] Não logado - redirecionando")
      router.push("/login?redirect=/checkout")
    } else if (isLoggedIn && user) {
      console.log("✅ [CHECKOUT PAGE] Usuário logado - mostrando checkout")
    }
  }, [isLoading, isLoggedIn, user, router])

  // ========== ADICIONAR AQUI (Auto-aplicar cupom) ==========
  useEffect(() => {
    // Auto-aplicar cupom BEMVINDO ao carregar
    setAppliedCoupon({
      code: 'BEMVINDO',
      discount: 500 // R$ 5,00 em centavos
    })
    console.log("🎉 [CHECKOUT] Cupom BEMVINDO auto-aplicado")
  }, [])
  // ========================================================

  const handleSubscribe = async (plan: "monthly" | "quarterly" | "annual") => {
    console.log("🔘 [CHECKOUT] Botão clicado!")
    console.log("👤 [CHECKOUT] user:", user)
    console.log("📧 [CHECKOUT] user.id:", user?.id)
    console.log("📧 [CHECKOUT] user.email:", user?.email)

    if (!user || !user.id || !user.email) {
      console.error("❌ [CHECKOUT] Usuário ou email não disponível!")
      alert("Erro: Dados do usuário incompletos. Faça login novamente.")
      setIsUpgrading(false)
      return
    }

    setSelectedPlan(plan)
    setIsUpgrading(true)

    try {
      console.log("💳 [CHECKOUT] Criando sessão Stripe para:", plan)
      
      // Get tracking data from localStorage
      const tracking = JSON.parse(localStorage.getItem("tracking_data") || "{}")
      console.log("📊 [CHECKOUT] Tracking data:", tracking)
      
      const payload = {
        plan: plan,
        userId: user.id,
        userEmail: user.email,
        couponCode: plan === "monthly" && appliedCoupon ? appliedCoupon.code : null,
        tracking,
      }
      
      console.log("📦 [CHECKOUT] Payload:", payload)

      const response = await fetch("/api/create-checkout-session", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      })

      console.log("📡 [CHECKOUT] Response status:", response.status)

      if (!response.ok) {
        const errorData = await response.json()
        console.error("❌ [CHECKOUT] Erro na API:", errorData)
        throw new Error(errorData.error || "Erro ao criar sessão de checkout")
      }

      const { url } = await response.json()

      console.log("✅ [CHECKOUT] Sessão criada, URL:", url)
      console.log("🔄 [CHECKOUT] Redirecionando para Stripe...")

      window.location.href = url
    } catch (err: any) {
      console.error("❌ [CHECKOUT] Erro completo:", err)
      alert("Erro ao processar checkout. Tente novamente.")
      setIsUpgrading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-stone-50 via-amber-50/40 to-emerald-50/60">
      {showSuccess && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm">
          <div className="rounded-2xl bg-white p-8 shadow-2xl border-2 border-emerald-200 max-w-md mx-4 text-center">
            <div className="mb-4 flex justify-center">
              <div className="rounded-full bg-emerald-100 p-4">
                <Sparkles className="h-12 w-12 text-emerald-600" />
              </div>
            </div>
            <h2 className="mb-2 text-2xl font-bold text-emerald-900 font-serif sm:text-5xl">Parabéns!</h2>
            <p className="text-emerald-700">Sua assinatura foi ativada com sucesso</p>
            <p className="mt-4 text-sm text-emerald-600">Redirecionando...</p>
          </div>
        </div>
      )}

      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        <header className="mb-8">
          <Link
            href="/"
            className="inline-flex items-center gap-2 rounded-xl bg-white px-4 py-2 text-sm font-semibold text-emerald-900 shadow-sm border-2 border-emerald-100 transition-all hover:border-emerald-200 hover:shadow-md"
          >
            <ArrowLeft className="h-4 w-4" />
            Voltar
          </Link>
        </header>

        <div className="mb-12 text-center">
          <div className="mb-6 flex justify-center">
            <div className="relative h-32 w-32">
              <Image src="/logo.png" alt="Essence" fill className="object-contain drop-shadow-sm" priority />
            </div>
          </div>
          <h1 className="mb-3 text-4xl font-bold text-emerald-900 font-serif sm:text-5xl">
            Desbloqueie Todo o Conteúdo Premium
          </h1>
          <p className="text-lg text-emerald-700">Acesse todos os óleos essenciais, receitas exclusivas e benefícios</p>
        </div>

        <div className="mb-12 grid grid-cols-1 gap-6 lg:grid-cols-3 max-w-6xl mx-auto">
          {/* CARD MENSAL */}
          <div className="relative rounded-2xl bg-white p-8 shadow-sm border-2 border-emerald-100 transition-all hover:shadow-xl hover:-translate-y-1">
            <div className="mb-6">
              <h3 className="mb-2 text-2xl font-bold text-emerald-900 font-serif">Plano Mensal</h3>
              
              {appliedCoupon ? (
                <>
                  <div className="flex items-baseline gap-2">
                    <span className="text-4xl font-bold text-emerald-600">R$ 9,90</span>
                    <span className="text-xl text-gray-400 line-through">R$ 14,90</span>
                    <span className="text-emerald-700">/mês</span>
                  </div>
                  <p className="mt-1 text-sm text-emerald-600">
                    Primeiro mês com desconto. Depois R$ 14,90/mês
                  </p>
                  <div className="mt-3 inline-block bg-green-50 border border-green-200 rounded-lg px-3 py-1.5">
                    <p className="text-xs text-green-700 font-medium">
                      Cupom {appliedCoupon.code} aplicado
                    </p>
                  </div>
                </>
              ) : (
                <div className="flex items-baseline gap-2">
                  <span className="text-4xl font-bold text-emerald-900">R$ 14,90</span>
                  <span className="text-emerald-700">/mês</span>
                </div>
              )}
            </div>

            <ul className="mb-8 space-y-3">
              {[
                "Acesso a todos os óleos essenciais",
                "Dicas personalizadas de uso",
                "Psicoaromaterapia completa",
                "Atualizações mensais",
              ].map((benefit, index) => (
                <li key={index} className="flex items-start gap-3">
                  <div className="flex-shrink-0 rounded-full bg-emerald-100 p-1">
                    <Check className="h-4 w-4 text-emerald-600" />
                  </div>
                  <span className="text-emerald-800">{benefit}</span>
                </li>
              ))}
            </ul>

            <button
              onClick={() => handleSubscribe("monthly")}
              disabled={showSuccess || isUpgrading}
              className="w-full rounded-xl bg-emerald-600 px-6 py-4 font-semibold text-white shadow-lg transition-all hover:bg-emerald-700 hover:scale-105 active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              {isUpgrading && selectedPlan === "monthly" ? (
                <>
                  <Loader2 className="h-5 w-5 animate-spin" />
                  Processando...
                </>
              ) : (
                "Assinar Mensal"
              )}
            </button>
          </div>

          {/* CARD TRIMESTRAL - DESTAQUE */}
          <div className="relative rounded-2xl bg-white p-8 shadow-sm border-2 border-purple-400 transition-all hover:shadow-xl hover:-translate-y-1">
            <div className="absolute -top-3 left-1/2 -translate-x-1/2 rounded-full bg-purple-500 px-4 py-1 text-sm font-bold text-white shadow-lg">
              Popular
            </div>

            <div className="mb-6">
              <h3 className="mb-2 text-2xl font-bold text-emerald-900 font-serif">Plano Trimestral</h3>
              <div className="flex items-baseline gap-2">
                <span className="text-4xl font-bold text-purple-600">R$ 37,00</span>
                <span className="text-emerald-700">/trimestre</span>
              </div>
              <p className="mt-2 text-sm font-semibold text-purple-700">Apenas R$ 12,33/mês - Economize R$ 7,70</p>
            </div>

            <ul className="mb-8 space-y-3">
              {[
                "Acesso completo por 3 meses",
                "Todos os óleos essenciais",
                "Psicoaromaterapia completa",
                "Atualizações mensais",
                "Suporte prioritário",
              ].map((benefit, index) => (
                <li key={index} className="flex items-start gap-3">
                  <div className="flex-shrink-0 rounded-full bg-purple-100 p-1">
                    <Check className="h-4 w-4 text-purple-600" />
                  </div>
                  <span className="text-emerald-800">{benefit}</span>
                </li>
              ))}
            </ul>

            <button
              onClick={() => handleSubscribe("quarterly")}
              disabled={showSuccess || isUpgrading}
              className="w-full rounded-xl bg-purple-600 px-6 py-4 font-semibold text-white shadow-lg transition-all hover:bg-purple-700 hover:scale-105 active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              {isUpgrading && selectedPlan === "quarterly" ? (
                <>
                  <Loader2 className="h-5 w-5 animate-spin" />
                  Processando...
                </>
              ) : (
                "Assinar Trimestral"
              )}
            </button>
          </div>

          {/* CARD ANUAL */}
          <div className="relative rounded-2xl bg-white p-8 shadow-sm border-2 border-amber-200 transition-all hover:shadow-xl hover:-translate-y-1">
            <div className="absolute top-4 right-4 rounded-full bg-gradient-to-r from-orange-500 to-red-500 px-3 py-1 text-xs font-bold text-white shadow-lg">
              -30%
            </div>

            <div className="mb-6">
              <h3 className="mb-2 text-2xl font-bold text-emerald-900 font-serif">Plano Anual</h3>
              <div className="flex items-baseline gap-2">
                <span className="text-4xl font-bold text-emerald-900">R$ 125</span>
                <span className="text-emerald-700">/ano</span>
              </div>
              <p className="mt-2 text-sm font-semibold text-amber-700">Apenas R$ 10,42/mês</p>
            </div>

            <ul className="mb-8 space-y-3">
              {[
                "Acesso a todos os óleos essenciais",
                "Dicas personalizadas de uso",
                "Psicoaromaterapia completa",
                "Atualizações mensais",
                "Suporte prioritário",
                "Conteúdo exclusivo para assinantes anuais",
              ].map((benefit, index) => (
                <li key={index} className="flex items-start gap-3">
                  <div className="flex-shrink-0 rounded-full bg-emerald-100 p-1">
                    <Check className="h-4 w-4 text-emerald-600" />
                  </div>
                  <span className="text-emerald-800">{benefit}</span>
                </li>
              ))}
            </ul>

            <button
              onClick={() => handleSubscribe("annual")}
              disabled={showSuccess || isUpgrading}
              className="w-full rounded-xl bg-gradient-to-r from-emerald-600 via-teal-600 to-emerald-700 px-6 py-4 font-semibold text-white shadow-lg transition-all hover:scale-105 active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              {isUpgrading && selectedPlan === "annual" ? (
                <>
                  <Loader2 className="h-5 w-5 animate-spin" />
                  Processando...
                </>
              ) : (
                "Assinar Anual"
              )}
            </button>
          </div>
        </div>

        <div className="mb-12 max-w-3xl mx-auto">
          <div className="rounded-2xl bg-white p-6 shadow-sm border-2 border-emerald-100 text-center">
            <div className="mb-4 flex justify-center">
              <div className="rounded-full bg-emerald-100 p-3">
                <Shield className="h-8 w-8 text-emerald-600" />
              </div>
            </div>
            <h3 className="mb-2 text-xl font-bold text-emerald-900 font-serif">Garantia de 7 dias</h3>
            <p className="text-emerald-700">100% do seu dinheiro de volta se não ficar satisfeito</p>
          </div>
        </div>

        <div className="max-w-3xl mx-auto">
          <h2 className="mb-6 text-center text-3xl font-bold text-emerald-900 font-serif">Perguntas Frequentes</h2>
          <div className="space-y-4">
            <FAQItem
              question="Como funciona a assinatura?"
              answer="Você escolhe entre o plano mensal ou anual e tem acesso imediato a todo o conteúdo premium. A cobrança é automática e você pode cancelar a qualquer momento."
            />
            <FAQItem
              question="Posso cancelar a qualquer momento?"
              answer="Sim! Você pode cancelar sua assinatura a qualquer momento sem taxas ou multas. Seu acesso continuará até o final do período pago."
            />
            <FAQItem
              question="Quais formas de pagamento?"
              answer="Aceitamos cartão de crédito, débito, PIX e boleto bancário. Todas as transações são seguras e criptografadas."
            />
            <FAQItem
              question="O que está incluído?"
              answer="Acesso completo a todos os óleos essenciais, receitas exclusivas, análise de sentimentos ilimitada, atualizações constantes e suporte prioritário."
            />
          </div>
        </div>
      </div>
    </div>
  )
}

function FAQItem({ question, answer }: { question: string; answer: string }) {
  const [isOpen, setIsOpen] = useState(false)

  return (
    <div className="rounded-2xl bg-white shadow-sm border-2 border-emerald-100 overflow-hidden transition-all hover:border-emerald-200">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-full flex items-center justify-between p-6 text-left transition-all hover:bg-emerald-50/50"
      >
        <h3 className="font-semibold text-emerald-900">{question}</h3>
        {isOpen ? (
          <ChevronUp className="h-5 w-5 text-emerald-600 flex-shrink-0" />
        ) : (
          <ChevronDown className="h-5 w-5 text-emerald-600 flex-shrink-0" />
        )}
      </button>
      {isOpen && (
        <div className="px-6 pb-6 pt-0">
          <p className="text-emerald-700">{answer}</p>
        </div>
      )}
    </div>
  )
}
