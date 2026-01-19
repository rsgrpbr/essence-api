"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Wrench, ArrowLeft, Bell, Sparkles, ChevronDown, BookOpen, X } from "lucide-react"
import Image from "next/image"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent } from "@/components/ui/dialog"

export default function FerramentasPage() {
  const router = useRouter()
  const [isExpanded, setIsExpanded] = useState(false)
  const [showEbookModal, setShowEbookModal] = useState(false)

  return (
    <div className="min-h-screen bg-gradient-to-br from-stone-50 via-amber-50/50 to-emerald-50/30 pb-20">
      <div className="max-w-4xl mx-auto px-4 py-8">
        <Button
          variant="ghost"
          onClick={() => router.back()}
          className="mb-6 text-emerald-700 hover:text-emerald-900 hover:bg-emerald-100"
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Voltar
        </Button>

        <div className="flex items-center gap-3 mb-8">
          <div className="rounded-full bg-gradient-to-br from-emerald-100 to-teal-100 p-4">
            <Wrench className="h-8 w-8 text-emerald-600" />
          </div>
          <div>
            <h1 className="text-3xl font-bold text-emerald-900">Ferramentas</h1>
            <p className="text-emerald-700">Recursos para usar óleos essenciais com segurança</p>
          </div>
        </div>

        <div className="grid gap-4 md:grid-cols-2">
          <button
            onClick={() => router.push("/teste-sensibilidade")}
            className="flex items-center gap-4 p-6 rounded-2xl bg-white hover:bg-emerald-50 transition-all border-2 border-emerald-100 hover:border-emerald-300 group shadow-sm hover:shadow-xl hover:-translate-y-1"
          >
            <div className="rounded-full bg-gradient-to-br from-emerald-100 to-teal-100 shadow-sm group-hover:shadow-md transition-shadow w-[72px] h-[72px] flex items-center justify-center flex-shrink-0 overflow-hidden">
              <Image
                src="/teste-sensibilidade-icon.png"
                alt="Teste de Sensibilidade"
                width={68}
                height={68}
                className="object-cover scale-110"
              />
            </div>
            <div className="flex-1 text-left">
              <h3 className="font-bold text-xl text-emerald-900 mb-2">Teste de Sensibilidade</h3>
              <p className="text-sm text-emerald-700">Aprenda a testar óleos essenciais com segurança antes de usar</p>
            </div>
          </button>

          <button
            onClick={() => router.push("/calculadora")}
            className="flex items-center gap-4 p-6 rounded-2xl bg-white hover:bg-amber-50 transition-all border-2 border-amber-100 hover:border-amber-300 group shadow-sm hover:shadow-xl hover:-translate-y-1"
          >
            <div className="rounded-full shadow-sm group-hover:shadow-md transition-shadow w-[72px] h-[72px] flex items-center justify-center flex-shrink-0 overflow-hidden">
              <Image
                src="/calculadora-icon.png"
                alt="Calculadora"
                width={72}
                height={72}
                className="object-cover w-full h-full"
              />
            </div>
            <div className="flex-1 text-left">
              <h3 className="font-bold text-xl text-amber-900 mb-2">Calculadora de Diluição</h3>
              <p className="text-sm text-amber-700">
                Calcule a quantidade perfeita de óleo carreador para suas receitas
              </p>
            </div>
          </button>

          <button
            onClick={() => router.push("/alarmes")}
            className="flex items-center gap-4 p-6 rounded-2xl bg-white hover:bg-teal-50 transition-all border-2 border-teal-100 hover:border-teal-300 group shadow-sm hover:shadow-xl hover:-translate-y-1"
          >
            <div className="rounded-full bg-gradient-to-br from-teal-100 to-cyan-100 p-4 shadow-sm group-hover:shadow-md transition-shadow w-[72px] h-[72px] flex items-center justify-center flex-shrink-0">
              <Bell className="h-10 w-10 text-teal-600" />
            </div>
            <div className="flex-1 text-left">
              <h3 className="font-bold text-xl text-teal-900 mb-2">Alarmes Aromáticos</h3>
              <p className="text-sm text-teal-700">Configure lembretes para usar seus óleos essenciais diariamente</p>
            </div>
          </button>

          {/* 
          <button
            onClick={() => router.push("/configuracoes")}
            className="flex items-center gap-4 p-6 rounded-2xl bg-white hover:bg-stone-50 transition-all border-2 border-stone-200 hover:border-stone-300 group shadow-sm hover:shadow-xl hover:-translate-y-1"
          >
            <div className="rounded-full bg-gradient-to-br from-stone-100 to-slate-100 p-4 shadow-sm group-hover:shadow-md transition-shadow w-[72px] h-[72px] flex items-center justify-center flex-shrink-0">
              <Settings className="h-10 w-10 text-stone-600" />
            </div>
            <div className="flex-1 text-left">
              <h3 className="font-bold text-xl text-stone-900 mb-2">Configurações</h3>
              <p className="text-sm text-stone-700">Configure seu telefone para receber notificações</p>
            </div>
          </button>
          */}

          <button
            onClick={() => setShowEbookModal(true)}
            className="flex items-center gap-4 p-6 rounded-2xl bg-white hover:bg-purple-50 transition-all border-2 border-purple-100 hover:border-purple-300 group shadow-sm hover:shadow-xl hover:-translate-y-1"
          >
            <div className="rounded-full bg-gradient-to-br from-purple-100 to-indigo-100 p-4 shadow-sm group-hover:shadow-md transition-shadow w-[72px] h-[72px] flex items-center justify-center flex-shrink-0">
              <BookOpen className="h-10 w-10 text-purple-600" />
            </div>
            <div className="flex-1 text-left">
              <h3 className="font-bold text-xl text-purple-900 mb-2">E-book</h3>
              <p className="text-sm text-purple-700">Guia completo sobre óleos essenciais e aromaterapia</p>
            </div>
          </button>
        </div>

        <div className="mt-8 rounded-2xl bg-white border-2 border-emerald-100 shadow-sm overflow-hidden transition-shadow hover:shadow-md">
          <button
            onClick={() => setIsExpanded(!isExpanded)}
            className="w-full flex items-center justify-between p-6 text-left hover:bg-emerald-50/30 transition-colors"
          >
            <div className="flex items-center gap-3">
              <Sparkles className="h-5 w-5 text-emerald-600" />
              <h2 className="text-lg font-bold text-emerald-900">Por que usar o Essence?</h2>
            </div>
            <ChevronDown
              className={`h-5 w-5 text-emerald-600 transition-transform duration-300 ${isExpanded ? "rotate-180" : ""}`}
            />
          </button>

          <div
            className={`overflow-hidden transition-all duration-300 ease-in-out ${
              isExpanded ? "max-h-[600px] opacity-100" : "max-h-0 opacity-0"
            }`}
          >
            <div className="px-6 pb-6 pt-2 border-t border-emerald-100">
              <ul className="space-y-3 text-emerald-700">
                <li className="flex items-start gap-2">
                  <span className="text-emerald-600 font-bold mt-0.5">•</span>
                  <span>Alarmes aromáticos criam rotina consistente de bem-estar diário</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-emerald-600 font-bold mt-0.5">•</span>
                  <span>Receba sugestões personalizadas de óleos por WhatsApp ou no app</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-emerald-600 font-bold mt-0.5">•</span>
                  <span>Aprenda sobre benefícios da aromaterapia com dicas educativas</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-emerald-600 font-bold mt-0.5">•</span>
                  <span>Teste de sensibilidade evita reações alérgicas e garante segurança</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-emerald-600 font-bold mt-0.5">•</span>
                  <span>Calculadora de diluição para uso correto e seguro dos óleos</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-emerald-600 font-bold mt-0.5">•</span>
                  <span>Notificações inteligentes que se adaptam à sua rotina</span>
                </li>
              </ul>
            </div>
          </div>
        </div>
      </div>

      <Dialog open={showEbookModal} onOpenChange={setShowEbookModal}>
        <DialogContent className="sm:max-w-md bg-white border-2 border-purple-200 rounded-3xl p-0 overflow-hidden">
          <div className="relative">
            <button
              onClick={() => setShowEbookModal(false)}
              className="absolute top-4 right-4 z-10 rounded-full p-2 bg-white/80 backdrop-blur-sm hover:bg-white transition-all shadow-sm"
              aria-label="Fechar"
            >
              <X className="h-4 w-4 text-purple-800" />
            </button>

            <div className="flex flex-col items-center justify-center px-8 py-16 text-center">
              <div className="mb-6 rounded-full bg-gradient-to-br from-purple-100 to-indigo-100 p-6">
                <BookOpen className="h-16 w-16 text-purple-600" />
              </div>

              <h2 className="text-4xl font-bold text-purple-900 mb-4">Em breve...</h2>

              <p className="text-purple-700 text-lg max-w-xs">Estamos preparando conteúdos incríveis para você!</p>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}
