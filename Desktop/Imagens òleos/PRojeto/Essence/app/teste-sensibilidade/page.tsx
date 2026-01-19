"use client"

import type React from "react"

import { useState } from "react"
import Image from "next/image"
import { ChevronLeft, ChevronRight, ArrowLeft, CheckCircle } from "lucide-react"
import { Button } from "@/components/ui/button"
import { useRouter } from "next/navigation"

export default function TesteSensibilidadePage() {
  const router = useRouter()
  const [currentCard, setCurrentCard] = useState(0)
  const totalCards = 5

  const goToPrevious = () => {
    if (currentCard > 0) {
      setCurrentCard(currentCard - 1)
    }
  }

  const goToNext = () => {
    if (currentCard < totalCards - 1) {
      setCurrentCard(currentCard + 1)
    }
  }

  const resetTutorial = () => {
    setCurrentCard(0)
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "ArrowLeft") goToPrevious()
    if (e.key === "ArrowRight") goToNext()
  }

  return (
    <div
      className="min-h-screen bg-gradient-to-b from-stone-50 via-amber-50/50 to-emerald-50/30 py-3 px-3"
      onKeyDown={handleKeyDown}
      tabIndex={0}
    >
      {/* Header */}
      <div className="max-w-md mx-auto mb-3">
        <Button
          variant="ghost"
          size="sm"
          onClick={() => router.back()}
          className="mb-2 text-emerald-700 hover:text-emerald-800"
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Voltar
        </Button>

        <div className="bg-white rounded-2xl shadow-md p-4 text-center">
          <div className="flex items-center justify-center gap-3 mb-1">
            <div className="w-12 h-12 rounded-full bg-gradient-to-br from-teal-100 to-emerald-100 flex items-center justify-center flex-shrink-0 overflow-hidden">
              <Image
                src="/teste-sensibilidade-icon.png"
                alt="Teste de Sensibilidade"
                width={40}
                height={40}
                className="w-10 h-10 object-cover scale-110"
              />
            </div>
            <h1 className="text-xl md:text-3xl font-bold text-emerald-800">Teste de Sensibilidade</h1>
          </div>
          <p className="text-sm text-gray-600">Aprenda a testar óleos essenciais com segurança antes de usar</p>
        </div>
      </div>

      {/* Carousel Container */}
      <div className="max-w-md mx-auto">
        <div className="relative overflow-hidden">
          {/* Cards */}
          <div
            className="flex transition-transform duration-300 ease-in-out"
            style={{ transform: `translateX(-${currentCard * 100}%)` }}
          >
            {/* Card 1 */}
            <div className="w-full flex-shrink-0 px-2">
              <div className="border-[12px] border-[#2D7A4F] rounded-3xl bg-gradient-to-b from-[#D4EDDA] to-[#E8F5E9] shadow-xl">
                <div className="p-3">
                  <div className="bg-white rounded-2xl p-2 mb-3">
                    <Image
                      src="/etapa-1.png"
                      alt="Preparando mistura de óleo essencial com óleo vegetal"
                      width={400}
                      height={200}
                      className="w-full h-40 object-cover rounded-xl"
                    />
                  </div>

                  <div className="px-2 pb-2">
                    <h2 className="text-xl md:text-3xl font-bold text-gray-900 mb-2">Prepare a Mistura</h2>

                    <p className="text-base font-semibold text-gray-800 mb-2">
                      Se nunca usou óleo essencial na pele, faça o teste de sensibilidade! 💧
                    </p>

                    <div className="bg-white/50 rounded-xl p-2 mb-2">
                      <p className="font-bold text-sm text-gray-800 mb-1">⚡ Receita Segura:</p>
                      <ul className="space-y-0.5 text-sm text-gray-700">
                        <li>• 1 gota do Óleo Essencial</li>
                        <li>• A diluição que vai usar</li>
                      </ul>
                    </div>

                    <p className="text-sm text-gray-700 font-medium">Misture bem antes de aplicar.</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Card 2 */}
            <div className="w-full flex-shrink-0 px-2">
              <div className="border-[12px] border-[#2D7A4F] rounded-3xl bg-gradient-to-b from-[#D4EDDA] to-[#E8F5E9] shadow-xl">
                <div className="p-3">
                  <div className="bg-white rounded-2xl p-2 mb-3">
                    <Image
                      src="/etapa-2.png"
                      alt="Aplicando óleo na parte interna do antebraço"
                      width={400}
                      height={200}
                      className="w-full h-40 object-cover rounded-xl"
                    />
                  </div>

                  <div className="px-2 pb-2">
                    <h2 className="text-xl md:text-3xl font-bold text-gray-900 mb-2">Aplique na Pele</h2>

                    <div className="mb-3">
                      <p className="font-bold text-sm text-gray-800 mb-1">ONDE:</p>
                      <p className="text-sm text-gray-700">A parte interna do antebraço é o local ideal.</p>
                    </div>

                    <div className="bg-white/50 rounded-xl p-2">
                      <p className="font-bold text-sm text-gray-800 mb-1">AÇÃO:</p>
                      <ol className="space-y-0.5 text-sm text-gray-700">
                        <li>1. Lave e seque bem o local.</li>
                        <li>2. Aplique uma pequena quantidade.</li>
                        <li>3. Espalhe suavemente.</li>
                      </ol>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Card 3 */}
            <div className="w-full flex-shrink-0 px-2">
              <div className="border-[12px] border-[#2D7A4F] rounded-3xl bg-gradient-to-b from-[#D4EDDA] to-[#E8F5E9] shadow-xl">
                <div className="p-3">
                  <div className="bg-white rounded-2xl p-2 mb-3">
                    <Image
                      src="/etapa-3.png"
                      alt="Relógio mostrando 24 horas e braço com curativo"
                      width={400}
                      height={200}
                      className="w-full h-40 object-cover rounded-xl"
                    />
                  </div>

                  <div className="px-2 pb-2">
                    <h2 className="text-xl md:text-3xl font-bold text-gray-900 mb-2">Aguarde 24 Horas</h2>

                    <p className="text-base font-semibold text-gray-800 mb-2">O corpo precisa de tempo.</p>

                    <div className="bg-white/50 rounded-xl p-2">
                      <p className="font-bold text-sm text-gray-800 mb-1">⏰ Regras:</p>
                      <ul className="space-y-0.5 text-sm text-gray-700">
                        <li>• Mantenha a área seca.</li>
                        <li>• Cubra com curativo se preferir.</li>
                        <li>• Sentiu ardor? Remova na hora!</li>
                      </ul>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Card 4 */}
            <div className="w-full flex-shrink-0 px-2">
              <div className="border-[12px] border-[#2D7A4F] rounded-3xl bg-gradient-to-b from-[#D4EDDA] to-[#E8F5E9] shadow-xl">
                <div className="p-3">
                  <div className="bg-white rounded-2xl p-2 mb-3">
                    <Image
                      src="/etapa-4.png"
                      alt="Comparação de pele normal aprovada e pele irritada reprovada"
                      width={400}
                      height={200}
                      className="w-full h-40 object-cover rounded-xl"
                    />
                  </div>

                  <div className="px-2 pb-2">
                    <h2 className="text-xl md:text-3xl font-bold text-gray-900 mb-3">Verifique o Resultado</h2>

                    <div className="space-y-2">
                      <div className="bg-[#D4EDDA] border-2 border-[#28A745] rounded-xl p-2">
                        <p className="text-sm text-gray-800 font-medium">
                          ✅ <span className="font-bold">APROVADO:</span> Pele normal, pode usar.
                        </p>
                      </div>

                      <div className="bg-[#F8D7DA] border-2 border-[#DC3545] rounded-xl p-2">
                        <p className="text-sm text-gray-800 font-medium">
                          ❌ <span className="font-bold">REPROVADO:</span> Irritação. Não use.
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Card 5 */}
            <div className="w-full flex-shrink-0 px-2">
              <div className="border-[12px] border-[#2D7A4F] rounded-3xl bg-gradient-to-b from-[#D4EDDA] to-[#E8F5E9] shadow-xl">
                <div className="p-3">
                  <div className="bg-white rounded-2xl p-2 mb-3">
                    <Image
                      src="/etapa-5.png"
                      alt="Óleo vegetal correto e água proibida para tratar irritação"
                      width={400}
                      height={200}
                      className="w-full h-40 object-cover rounded-xl"
                    />
                  </div>

                  <div className="px-2 pb-2">
                    <h2 className="text-xl md:text-3xl font-bold text-gray-900 mb-2">⚠️ SOS: Ardeu! E agora?</h2>

                    <div className="bg-[#F8D7DA] border-2 border-[#DC3545] rounded-xl p-2 mb-2">
                      <p className="text-sm text-gray-800 font-bold">NÃO jogue água!</p>
                    </div>

                    <div className="bg-white/50 rounded-xl p-2">
                      <p className="font-bold text-sm text-gray-800 mb-1">FAÇA:</p>
                      <ol className="space-y-0.5 text-sm text-gray-700">
                        <li>1. Passe Óleo Vegetal puro.</li>
                        <li>2. Limpe com papel toalha.</li>
                        <li>3. Lave com sabão neutro.</li>
                      </ol>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Navigation Controls */}
        <div className="mt-4 space-y-3">
          {/* Buttons */}
          <div className="flex items-center justify-between gap-3">
            <Button
              onClick={goToPrevious}
              disabled={currentCard === 0}
              variant="outline"
              size="sm"
              className="flex-1 bg-white hover:bg-emerald-50 border-emerald-600 text-emerald-700 disabled:opacity-50 disabled:cursor-not-allowed"
              aria-label="Card anterior"
            >
              <ChevronLeft className="w-4 h-4 mr-1" />
              Anterior
            </Button>

            <Button
              onClick={currentCard === totalCards - 1 ? resetTutorial : goToNext}
              size="sm"
              className="flex-1 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white"
              aria-label={currentCard === totalCards - 1 ? "Concluir" : "Próximo card"}
            >
              {currentCard === totalCards - 1 ? (
                <>
                  <CheckCircle className="w-4 h-4 mr-1" />
                  Concluir
                </>
              ) : (
                <>
                  Próximo
                  <ChevronRight className="w-4 h-4 ml-1" />
                </>
              )}
            </Button>
          </div>

          {/* Progress Indicators */}
          <div className="flex flex-col items-center gap-1.5">
            <div className="flex gap-2">
              {Array.from({ length: totalCards }).map((_, index) => (
                <button
                  key={index}
                  onClick={() => setCurrentCard(index)}
                  className={`w-2 h-2 rounded-full transition-all ${
                    index === currentCard ? "bg-emerald-600 scale-125" : "bg-gray-300 hover:bg-gray-400"
                  }`}
                  aria-label={`Ir para card ${index + 1}`}
                />
              ))}
            </div>
            <p className="text-xs text-gray-600">
              Card {currentCard + 1} de {totalCards}
            </p>
          </div>
        </div>

        {/* Completion Message */}
        {currentCard === totalCards - 1 && (
          <div className="mt-4 bg-white rounded-2xl shadow-md p-4 text-center animate-in fade-in duration-300">
            <p className="text-base font-semibold text-emerald-800 mb-3">✨ Parabéns! Você aprendeu a fazer o teste.</p>
            <div className="flex gap-2">
              <Button
                onClick={resetTutorial}
                variant="outline"
                size="sm"
                className="flex-1 border-emerald-600 text-emerald-700 hover:bg-emerald-50 bg-transparent"
              >
                🔄 Ver Novamente
              </Button>
              <Button
                onClick={() => router.back()}
                size="sm"
                className="flex-1 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white"
              >
                ✓ Entendi
              </Button>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
