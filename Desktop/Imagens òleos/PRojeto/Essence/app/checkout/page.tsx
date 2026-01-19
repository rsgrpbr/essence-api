"use client"

import { useState, useEffect } from "react"
import Image from "next/image"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { useSubscription } from "@/lib/contexts/subscription-context"
import { ArrowLeft, Check, Shield, ChevronDown, ChevronUp, Sparkles, Loader2, Tag } from "lucide-react"
import { useTracking } from "@/hooks/useTracking"

export default function CheckoutPage() {
  const { isLoggedIn, user, upgradeToPremium, isLoading } = useSubscription()
  const router = useRouter()
  const trackingData = useTracking()
  const [showSuccess, setShowSuccess] = useState(false)
  const [selectedPlan, setSelectedPlan] = useState<"monthly" | "quarterly" | "annual">("monthly")
  const [isUpgrading, setIsUpgrading] = useState(false)

  useEffect(() => {
    console.log("📱 [CHECKOUT PAGE] Mounted")
    console.log("📊 [CHECKOUT PAGE] isLoading:", isLoading)
    console.log("🔐 [CHECKOUT PAGE] isLoggedIn:", isLoggedIn)
    console.log("👤 [CHECKOUT PAGE] user:", user?.email)

    if (!isLoading && !isLoggedIn) {
      console.log("❌ [CHECKOUT PAGE] Não logado - redirecionando")
      router.push("/login?redirect=/checkout")
    } else if (isLoggedIn && user) {
      console.log("✅ [CHECKOUT PAGE] Usuário logado - mostrando checkout")
    }
  }, [isLoading, isLoggedIn, user, router])

  const handleSubscribe = async () => {
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

    setIsUpgrading(true)

    try {
      console.log("💳 [CHECKOUT] Criando sessão Stripe para:", selectedPlan)
      
      // Get tracking data from localStorage
      const tracking = JSON.parse(localStorage.getItem("tracking_data") || "{}")
      console.log("📊 [CHECKOUT] Tracking data:", tracking)
      console.log("📦 [CHECKOUT] Payload:", { plan: selectedPlan, userId: user.id, userEmail: user.email, tracking })

      const response = await fetch("/api/create-checkout-session", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          plan: selectedPlan,
          userId: user.id,
          userEmail: user.email,
          couponCode: selectedPlan === "monthly" ? "BEMVINDO" : null,
          tracking,
        }),
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

      <div className="mx-auto max-w-4xl px-4 py-4 sm:px-6">
        <header className="mb-4">
          <Link
            href="/"
            className="inline-flex items-center gap-2 rounded-xl bg-white px-4 py-2 text-sm font-semibold text-emerald-900 shadow-sm border-2 border-emerald-100 transition-all hover:border-emerald-200 hover:shadow-md"
          >
            <ArrowLeft className="h-4 w-4" />
            Voltar
          </Link>
        </header>

        <div className="mb-5 text-center">
          <div className="mb-3 flex justify-center">
            <div className="relative h-16 w-16">
              <Image src="/logo.png" alt="Essence" fill className="object-contain drop-shadow-sm" priority />
            </div>
          </div>
          <h1 className="mb-2 text-2xl font-bold text-emerald-900 font-serif sm:text-4xl">
            Desbloqueie Todo o Conteúdo Premium
          </h1>
        </div>

        <div className="mb-5 rounded-2xl bg-gradient-to-br from-emerald-50 to-teal-50 p-6 shadow-sm border-2 border-emerald-200">
          <ul className="space-y-2.5 max-w-md mx-auto">
            {[
              "Acesso a todos os óleos essenciais",
              "Dicas personalizadas de uso",
              "Psicoaromaterapia completa",
              "Atualizações mensais",
              "Suporte prioritário",
            ].map((benefit, index) => (
              <li key={index} className="flex items-start gap-3">
                <div className="flex-shrink-0 rounded-full bg-emerald-500 p-1 mt-0.5">
                  <Check className="h-4 w-4 text-white" />
                </div>
                <span className="text-base text-emerald-900 font-medium">{benefit}</span>
              </li>
            ))}
          </ul>
        </div>

        <div className="mb-4 grid grid-cols-3 gap-2">
          <button
            onClick={() => setSelectedPlan("monthly")}
            className={`relative rounded-xl p-3 text-left transition-all ${
              selectedPlan === "monthly"
                ? "bg-emerald-600 text-white shadow-lg scale-105 border-2 border-emerald-700"
                : "bg-white text-emerald-900 shadow-sm border-2 border-gray-200 hover:border-emerald-300"
            }`}
          >
            <div className="text-xs font-semibold mb-1">Mensal</div>
            <div className="flex items-baseline gap-1 mb-1">
              <span className="text-2xl font-bold">R$ 9,90</span>
            </div>
            <div className="flex items-center gap-1">
              <span
                className={`text-sm font-semibold line-through ${
                  selectedPlan === "monthly" ? "text-emerald-200" : "text-gray-500"
                }`}
              >
                R$ 14,90
              </span>
              <span className={`text-xs ${selectedPlan === "monthly" ? "text-emerald-100" : "text-gray-600"}`}>
                /mês
              </span>
            </div>
          </button>

          <button
            onClick={() => setSelectedPlan("quarterly")}
            className={`relative rounded-xl p-3 text-left transition-all ${
              selectedPlan === "quarterly"
                ? "bg-purple-600 text-white shadow-lg scale-105 border-2 border-purple-700"
                : "bg-white text-emerald-900 shadow-sm border-2 border-purple-300 hover:border-purple-400"
            }`}
          >
            <div className="absolute -top-2 left-1/2 -translate-x-1/2 rounded-full bg-purple-500 px-2 py-0.5 text-xs font-bold text-white shadow-lg">
              Popular
            </div>
            <div className="text-xs font-semibold mb-1">Trimestral</div>
            <div className="text-2xl font-bold mb-1">R$ 37,00</div>
            <div className={`text-xs ${selectedPlan === "quarterly" ? "text-purple-100" : "text-gray-600"}`}>/3 meses</div>
            <div className={`text-xs mt-1 ${selectedPlan === "quarterly" ? "text-purple-200" : "text-purple-600"}`}>R$ 12,33/mês</div>
          </button>

          <button
            onClick={() => setSelectedPlan("annual")}
            className={`relative rounded-xl p-3 text-left transition-all ${
              selectedPlan === "annual"
                ? "bg-emerald-600 text-white shadow-lg scale-105 border-2 border-emerald-700"
                : "bg-white text-emerald-900 shadow-sm border-2 border-gray-200 hover:border-emerald-300"
            }`}
          >
            <div className="absolute -top-2 -right-1 rounded-full bg-gradient-to-r from-orange-500 to-red-500 px-2 py-0.5 text-xs font-bold text-white shadow-lg">
              -30%
            </div>
            <div className="text-xs font-semibold mb-1">Anual</div>
            <div className="text-2xl font-bold mb-1">R$ 125,00</div>
            <div className={`text-xs ${selectedPlan === "annual" ? "text-emerald-100" : "text-gray-600"}`}>/ano</div>
            <div className={`text-xs mt-1 ${selectedPlan === "annual" ? "text-emerald-200" : "text-emerald-600"}`}>R$ 10,42/mês</div>
          </button>
        </div>

        {selectedPlan === "monthly" && (
          <div className="mb-6 rounded-xl bg-amber-50 p-4 border border-amber-200">
            <div className="flex items-start gap-3">
              <div className="flex-shrink-0 rounded-full bg-amber-100 p-2">
                <Tag className="h-4 w-4 text-amber-600" />
              </div>
              <div>
                <p className="text-sm font-semibold mb-1">Primeiro mês com desconto</p>
                <p className="text-xs text-amber-700">Cupom BEMVINDO aplicado automaticamente</p>
              </div>
            </div>
          </div>
        )}

        <button
          onClick={handleSubscribe}
          disabled={showSuccess || isUpgrading}
          className="w-full rounded-xl bg-emerald-600 px-6 py-4 font-semibold text-white shadow-lg transition-all hover:bg-emerald-700 hover:scale-105 active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 mb-4"
        >
          {isUpgrading ? (
            <>
              <Loader2 className="h-5 w-5 animate-spin" />
              Processando...
            </>
          ) : (
            `Assinar ${selectedPlan === "monthly" ? "Mensal" : selectedPlan === "quarterly" ? "Trimestral" : "Anual"}`
          )}
        </button>

        <div className="mb-5">
          <div className="rounded-xl bg-white p-4 shadow-sm border border-emerald-100 text-center">
            <div className="mb-2 flex justify-center">
              <div className="rounded-full bg-emerald-100 p-2">
                <Shield className="h-5 w-5 text-emerald-600" />
              </div>
            </div>
            <h3 className="text-sm font-bold text-emerald-900 mb-1">Garantia de 7 dias</h3>
            <p className="text-xs text-emerald-700">100% do seu dinheiro de volta se não ficar satisfeito</p>
          </div>
        </div>

        <div>
          <h2 className="mb-3 text-center text-xl font-bold text-emerald-900 font-serif">Perguntas Frequentes</h2>
          <div className="space-y-3">
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
          </div>
        </div>
      </div>
    </div>
  )
}

function FAQItem({ question, answer }: { question: string; answer: string }) {
  const [isOpen, setIsOpen] = useState(false)

  return (
    <div className="rounded-xl bg-white shadow-sm border border-emerald-100 overflow-hidden transition-all hover:border-emerald-200">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-full flex items-center justify-between p-4 text-left transition-all hover:bg-emerald-50/50"
      >
        <h3 className="text-sm font-semibold text-emerald-900">{question}</h3>
        {isOpen ? (
          <ChevronUp className="h-4 w-4 text-emerald-600 flex-shrink-0" />
        ) : (
          <ChevronDown className="h-4 w-4 text-emerald-600 flex-shrink-0" />
        )}
      </button>
      {isOpen && (
        <div className="px-4 pb-4 pt-0">
          <p className="text-xs text-emerald-700">{answer}</p>
        </div>
      )}
    </div>
  )
}
