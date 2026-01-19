'use client'

import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import Image from 'next/image'
import { Mail, ArrowLeft } from 'lucide-react'

export default function ForgotPassword() {
  const [email, setEmail] = useState('')
  const [loading, setLoading] = useState(false)
  const [sent, setSent] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const router = useRouter()
  const supabase = createClient()

  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError(null)

    try {
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/reset-password`,
      })

      if (error) throw error
      setSent(true)
    } catch (error: any) {
      setError(error.message || 'Erro ao enviar email de recuperação')
    } finally {
      setLoading(false)
    }
  }

  if (sent) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-stone-50 via-amber-50/50 to-emerald-50/30">
        <div className="flex min-h-screen items-center justify-center px-4 py-12">
          <div className="w-full max-w-md">
            <div className="rounded-2xl border-2 border-emerald-100 bg-white p-8 shadow-lg text-center">
              <div className="mb-6 flex justify-center">
                <div className="rounded-full bg-emerald-100 p-4">
                  <Mail className="h-12 w-12 text-emerald-600" />
                </div>
              </div>
              <h1 className="text-3xl font-bold text-emerald-900 font-serif mb-3">
                Email enviado!
              </h1>
              <p className="text-emerald-700 mb-6">
                Verifique sua caixa de entrada em <strong>{email}</strong> e clique no link para redefinir sua senha.
              </p>
              <button
                onClick={() => router.push('/login')}
                className="inline-flex items-center gap-2 rounded-xl bg-emerald-600 px-6 py-3 font-semibold text-white transition-all hover:bg-emerald-700"
              >
                <ArrowLeft className="h-5 w-5" />
                Voltar para login
              </button>
            </div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-stone-50 via-amber-50/50 to-emerald-50/30">
      <div className="flex min-h-screen items-center justify-center px-4 py-12">
        <div className="w-full max-w-md">
          <div className="mb-8 text-center">
            <Link href="/" className="inline-block">
              <Image src="/logo.png" alt="Essence Logo" width={180} height={180} className="mx-auto mb-4" />
            </Link>
          </div>

          <form onSubmit={handleResetPassword} className="rounded-2xl border-2 border-emerald-100 bg-white p-8 shadow-lg">
            <div className="text-center mb-6">
              <div className="text-5xl mb-3">🔑</div>
              <h1 className="text-3xl font-bold text-emerald-900 font-serif mb-2">
                Esqueci minha senha
              </h1>
              <p className="text-sm text-emerald-600">
                Digite seu email para receber o link de recuperação
              </p>
            </div>

            {error && (
              <div className="mb-4 p-3 bg-red-50 border-2 border-red-200 rounded-xl">
                <p className="text-sm text-red-700">{error}</p>
              </div>
            )}

            <div className="space-y-5">
              <div>
                <label htmlFor="email" className="mb-2 block text-sm font-semibold text-emerald-900">
                  Email
                </label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-emerald-600" />
                  <input
                    id="email"
                    type="email"
                    placeholder="seu@email.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    disabled={loading}
                    className="w-full rounded-xl border-2 border-emerald-200 py-3 pl-11 pr-4 transition-all focus:border-emerald-400 focus:outline-none focus:ring-4 focus:ring-emerald-100"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 px-6 py-3.5 font-semibold text-white shadow-md transition-all hover:shadow-lg hover:scale-[1.02] disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100"
              >
                {loading ? 'Enviando...' : 'Enviar link de recuperação'}
              </button>

              <button
                type="button"
                onClick={() => router.push('/login')}
                className="w-full py-3 text-emerald-600 hover:text-emerald-700 font-semibold transition-colors flex items-center justify-center gap-2"
              >
                <ArrowLeft className="h-5 w-5" />
                Voltar para login
              </button>
            </div>
          </form>

          <div className="mt-6 text-center">
            <Link
              href="/"
              className="text-sm text-emerald-600 hover:text-emerald-700 hover:underline transition-colors"
            >
              ← Voltar para página inicial
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}
