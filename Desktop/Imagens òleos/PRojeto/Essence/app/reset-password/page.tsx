'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import Link from 'next/link'
import Image from 'next/image'
import { Lock, Eye, EyeOff, CheckCircle } from 'lucide-react'

export default function ResetPassword() {
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [loading, setLoading] = useState(false)
  const [success, setSuccess] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const router = useRouter()
  const supabase = createClient()

  const handleUpdatePassword = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)

    if (password !== confirmPassword) {
      setError('As senhas não coincidem')
      return
    }

    if (password.length < 6) {
      setError('A senha deve ter pelo menos 6 caracteres')
      return
    }

    setLoading(true)

    try {
      const { error } = await supabase.auth.updateUser({
        password: password
      })

      if (error) throw error
      setSuccess(true)

      setTimeout(() => {
        router.push('/login')
      }, 2000)
    } catch (error: any) {
      setError(error.message || 'Erro ao atualizar senha')
    } finally {
      setLoading(false)
    }
  }

  if (success) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-stone-50 via-amber-50/50 to-emerald-50/30">
        <div className="flex min-h-screen items-center justify-center px-4 py-12">
          <div className="w-full max-w-md">
            <div className="rounded-2xl border-2 border-emerald-100 bg-white p-8 shadow-lg text-center">
              <div className="mb-6 flex justify-center">
                <div className="rounded-full bg-emerald-100 p-4">
                  <CheckCircle className="h-12 w-12 text-emerald-600" />
                </div>
              </div>
              <h1 className="text-3xl font-bold text-emerald-900 font-serif mb-3">
                Senha atualizada!
              </h1>
              <p className="text-emerald-700 mb-6">
                Sua senha foi alterada com sucesso. Redirecionando para o login...
              </p>
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

          <form onSubmit={handleUpdatePassword} className="rounded-2xl border-2 border-emerald-100 bg-white p-8 shadow-lg">
            <div className="text-center mb-6">
              <div className="text-5xl mb-3">🔐</div>
              <h1 className="text-3xl font-bold text-emerald-900 font-serif mb-2">
                Nova senha
              </h1>
              <p className="text-sm text-emerald-600">
                Escolha uma senha forte e segura
              </p>
            </div>

            {error && (
              <div className="mb-4 p-3 bg-red-50 border-2 border-red-200 rounded-xl">
                <p className="text-sm text-red-700">{error}</p>
              </div>
            )}

            <div className="space-y-5">
              <div>
                <label htmlFor="password" className="mb-2 block text-sm font-semibold text-emerald-900">
                  Nova senha
                </label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-emerald-600" />
                  <input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    placeholder="Mínimo 6 caracteres"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    minLength={6}
                    disabled={loading}
                    className="w-full rounded-xl border-2 border-emerald-200 py-3 pl-11 pr-11 transition-all focus:border-emerald-400 focus:outline-none focus:ring-4 focus:ring-emerald-100"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-emerald-600 hover:text-emerald-700"
                    disabled={loading}
                  >
                    {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                  </button>
                </div>
              </div>

              <div>
                <label htmlFor="confirmPassword" className="mb-2 block text-sm font-semibold text-emerald-900">
                  Confirmar senha
                </label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-emerald-600" />
                  <input
                    id="confirmPassword"
                    type={showConfirmPassword ? "text" : "password"}
                    placeholder="Digite novamente"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    required
                    minLength={6}
                    disabled={loading}
                    className="w-full rounded-xl border-2 border-emerald-200 py-3 pl-11 pr-11 transition-all focus:border-emerald-400 focus:outline-none focus:ring-4 focus:ring-emerald-100"
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-emerald-600 hover:text-emerald-700"
                    disabled={loading}
                  >
                    {showConfirmPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                  </button>
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 px-6 py-3.5 font-semibold text-white shadow-md transition-all hover:shadow-lg hover:scale-[1.02] disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100"
              >
                {loading ? 'Atualizando...' : 'Atualizar senha'}
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
