'use client'

import { useEffect, useState } from 'react'

export default function SuccessPage() {
  const [countdown, setCountdown] = useState(5)

  useEffect(() => {
    // Countdown de 5 segundos
    const timer = setInterval(() => {
      setCountdown(prev => {
        if (prev <= 1) {
          clearInterval(timer)
          window.location.href = '/?payment=success'
          return 0
        }
        return prev - 1
      })
    }, 1000)

    return () => clearInterval(timer)
  }, [])

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-emerald-50 to-white p-4">
      <div className="max-w-md w-full bg-white rounded-2xl shadow-xl p-8 text-center border-2 border-emerald-200">
        {/* Ícone de Sucesso */}
        <div className="w-24 h-24 bg-emerald-100 rounded-full flex items-center justify-center mx-auto mb-6">
          <svg className="w-12 h-12 text-emerald-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
          </svg>
        </div>
        
        {/* Título */}
        <h1 className="text-3xl font-bold text-gray-900 mb-3">
          Pagamento Realizado<br/>com Sucesso!
        </h1>
        
        {/* Subtítulo */}
        <p className="text-xl text-emerald-600 font-semibold mb-8">
          Sua assinatura premium foi ativada!
        </p>
        
        {/* Benefícios */}
        <div className="bg-emerald-50 rounded-xl p-6 mb-8">
          <p className="text-sm font-semibold text-emerald-800 mb-4">
            Benefícios Desbloqueados:
          </p>
          <ul className="text-left space-y-3">
            <li className="flex items-center gap-3 text-gray-700">
              <span className="text-emerald-600 text-lg">✓</span>
              <span>Acesso a todos os óleos essenciais</span>
            </li>
            <li className="flex items-center gap-3 text-gray-700">
              <span className="text-emerald-600 text-lg">✓</span>
              <span>Receitas exclusivas e blends</span>
            </li>
            <li className="flex items-center gap-3 text-gray-700">
              <span className="text-emerald-600 text-lg">✓</span>
              <span>Análise de sentimentos ilimitada</span>
            </li>
            <li className="flex items-center gap-3 text-gray-700">
              <span className="text-emerald-600 text-lg">✓</span>
              <span>Atualizações constantes</span>
            </li>
            <li className="flex items-center gap-3 text-gray-700">
              <span className="text-emerald-600 text-lg">✓</span>
              <span>Suporte prioritário</span>
            </li>
          </ul>
        </div>

        {/* Countdown */}
        <div className="mb-6">
          <p className="text-emerald-600 font-medium mb-2">
            Redirecionando...
          </p>
          <p className="text-sm text-gray-500">
            Redirecionando em {countdown} segundos...
          </p>
        </div>
        
        {/* Botão */}
        <button
          onClick={() => window.location.href = '/?payment=success'}
          className="w-full bg-emerald-600 text-white py-4 px-6 rounded-xl font-semibold text-lg hover:bg-emerald-700 transition-colors shadow-lg hover:shadow-xl"
        >
          Ir para o App
        </button>
      </div>
    </div>
  )
}
