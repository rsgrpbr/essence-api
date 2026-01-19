"use client"

import type React from "react"
import { useRef } from "react"
import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import Image from "next/image"
import Link from "next/link"
import { Mail, Lock, User, Eye, EyeOff, Loader2, AlertCircle } from "lucide-react"
import { useSubscription } from "@/lib/contexts/subscription-context"

export default function LoginPage() {
  const router = useRouter()
  const { signUp, signIn, user, isLoggedIn, isInitialized } = useSubscription()
  const [showCadastro, setShowCadastro] = useState(false)
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [pendingOilName, setPendingOilName] = useState<string | null>(null)
  const hasRedirected = useRef(false)

  const [loginEmail, setLoginEmail] = useState("")
  const [loginPassword, setLoginPassword] = useState("")
  const [loginError, setLoginError] = useState<string | null>(null)

  const [cadastroNome, setCadastroNome] = useState("")
  const [cadastroEmail, setCadastroEmail] = useState("")
  const [cadastroPassword, setCadastroPassword] = useState("")
  const [cadastroConfirmPassword, setCadastroConfirmPassword] = useState("")
  const [acceptTerms, setAcceptTerms] = useState(false)
  const [cadastroErrors, setCadastroErrors] = useState<{
    nome?: string
    email?: string
    password?: string
    confirmPassword?: string
    terms?: string
    general?: string
  }>({})
  const [signUpSuccess, setSignUpSuccess] = useState(false)

  const validateEmail = (email: string) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    return emailRegex.test(email)
  }

  useEffect(() => {
    const oilName = sessionStorage.getItem("oilName")
    if (oilName) {
      setPendingOilName(oilName)
    }
  }, [])

  useEffect(() => {
    if (isLoggedIn && user && isInitialized && !hasRedirected.current) {
      console.log("✅ [LOGIN PAGE] User logged in, redirecting...")
      hasRedirected.current = true

      const redirectUrl = sessionStorage.getItem("redirectAfterLogin")

      if (redirectUrl) {
        console.log("🔄 [LOGIN PAGE] Redirecting to:", redirectUrl)
        sessionStorage.removeItem("redirectAfterLogin")
        sessionStorage.removeItem("oilName")
        router.push(redirectUrl)
      } else {
        console.log("🔄 [LOGIN PAGE] Redirecting to home")
        router.push("/")
      }
    }
  }, [isLoggedIn, user, isInitialized, router])

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoginError(null)
    setIsLoading(true)

    console.log("[v0] 🔐 [LOGIN PAGE] Starting login process...")

    if (!loginEmail || !validateEmail(loginEmail)) {
      setLoginError("Por favor, insira um email válido")
      setIsLoading(false)
      return
    }

    if (!loginPassword) {
      setLoginError("Por favor, insira sua senha")
      setIsLoading(false)
      return
    }

    console.log("[v0] 📱 User Agent:", navigator.userAgent)
    console.log("[v0] 🖥️  Display Mode:", window.matchMedia("(display-mode: standalone)").matches ? "PWA" : "Browser")

    const { error } = await signIn(loginEmail.trim(), loginPassword)

    if (error) {
      console.error("[v0] ❌ [LOGIN PAGE] Error:", error.message)
      setLoginError(error.message || "Erro ao fazer login. Verifique suas credenciais.")
      setIsLoading(false)
      hasRedirected.current = false
      return
    }

    console.log("[v0] ✅ [LOGIN PAGE] Login successful, context will handle redirect")
  }

  const handleCadastro = async (e: React.FormEvent) => {
    e.preventDefault()
    const errors: {
      nome?: string
      email?: string
      password?: string
      confirmPassword?: string
      terms?: string
      general?: string
    } = {}

    if (!cadastroNome) {
      errors.nome = "Nome completo é obrigatório"
    }

    if (!cadastroEmail) {
      errors.email = "Email é obrigatório"
    } else if (!validateEmail(cadastroEmail)) {
      errors.email = "Email inválido"
    }

    if (!cadastroPassword) {
      errors.password = "Senha é obrigatória"
    } else if (cadastroPassword.length < 6) {
      errors.password = "Senha deve ter no mínimo 6 caracteres"
    }

    if (!cadastroConfirmPassword) {
      errors.confirmPassword = "Confirme sua senha"
    } else if (cadastroPassword !== cadastroConfirmPassword) {
      errors.confirmPassword = "As senhas não coincidem"
    }

    if (!acceptTerms) {
      errors.terms = "Você deve aceitar os termos de uso"
    }

    if (Object.keys(errors).length > 0) {
      setCadastroErrors(errors)
      return
    }

    setIsLoading(true)
    setCadastroErrors({})

    const { error } = await signUp(cadastroEmail, cadastroPassword, cadastroNome)

    if (error) {
      setCadastroErrors({
        general: error.message || "Erro ao criar conta. Tente novamente.",
      })
      setIsLoading(false)
      return
    }

    setSignUpSuccess(true)
    setIsLoading(false)
  }

  if (signUpSuccess) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-stone-50 via-amber-50/50 to-emerald-50/30 flex items-center justify-center px-4">
        <div className="w-full max-w-md">
          <div className="rounded-2xl border-2 border-emerald-100 bg-white p-8 shadow-lg text-center">
            <div className="mb-6 flex justify-center">
              <div className="rounded-full bg-emerald-100 p-4">
                <Mail className="h-12 w-12 text-emerald-600" />
              </div>
            </div>
            <h2 className="mb-3 text-2xl font-bold text-emerald-900 font-serif">Confirme seu email</h2>
            <p className="mb-6 text-emerald-700">
              Enviamos um link de confirmação para <strong>{cadastroEmail}</strong>. Por favor, verifique sua caixa de
              entrada e confirme seu email para continuar.
            </p>
            <button
              onClick={() => {
                setSignUpSuccess(false)
                setShowCadastro(false)
              }}
              className="inline-block rounded-xl bg-emerald-600 px-6 py-3 font-semibold text-white transition-all hover:bg-emerald-700"
            >
              Voltar para Login
            </button>
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

          <div className="rounded-2xl border-2 border-emerald-100 bg-white p-8 shadow-lg">
            <div className="mb-6 text-center">
              <h2 className="text-3xl font-bold text-emerald-900 font-serif mb-2">
                {showCadastro ? "Criar Conta" : "Acesse o app"}
              </h2>
              <p className="text-sm text-emerald-600">
                {showCadastro ? "Preencha os dados abaixo para começar" : "Entre com suas credenciais para continuar"}
              </p>
            </div>

            {!showCadastro && pendingOilName && (
              <div className="mb-4 p-3 bg-blue-50 border-2 border-blue-200 rounded-xl">
                <p className="text-sm text-blue-700">
                  Faça login para acessar: <strong>{pendingOilName}</strong>
                </p>
              </div>
            )}

            {!showCadastro && (
              <form onSubmit={handleLogin} className="space-y-5">
                {loginError && (
                  <div className="flex items-start gap-2 rounded-xl bg-red-50 p-3 border-2 border-red-200">
                    <AlertCircle className="h-5 w-5 text-red-600 flex-shrink-0 mt-0.5" />
                    <p className="text-sm text-red-700">{loginError}</p>
                  </div>
                )}

                <div>
                  <label htmlFor="login-email" className="mb-2 block text-sm font-semibold text-emerald-900">
                    Email
                  </label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-emerald-600" />
                    <input
                      id="login-email"
                      type="email"
                      value={loginEmail}
                      onChange={(e) => {
                        setLoginEmail(e.target.value)
                        setLoginError(null)
                      }}
                      className="w-full rounded-xl border-2 border-emerald-200 py-3 pl-11 pr-4 transition-all focus:border-emerald-400 focus:outline-none focus:ring-4 focus:ring-emerald-100"
                      placeholder="seu@email.com"
                      disabled={isLoading}
                    />
                  </div>
                </div>

                <div>
                  <label htmlFor="login-password" className="mb-2 block text-sm font-semibold text-emerald-900">
                    Senha
                  </label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-emerald-600" />
                    <input
                      id="login-password"
                      type={showPassword ? "text" : "password"}
                      value={loginPassword}
                      onChange={(e) => {
                        setLoginPassword(e.target.value)
                        setLoginError(null)
                      }}
                      className="w-full rounded-xl border-2 border-emerald-200 py-3 pl-11 pr-11 transition-all focus:border-emerald-400 focus:outline-none focus:ring-4 focus:ring-emerald-100"
                      placeholder="••••••••"
                      disabled={isLoading}
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-emerald-600 hover:text-emerald-700"
                      disabled={isLoading}
                    >
                      {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                    </button>
                  </div>
                  <div className="mt-2">
                    <Link
                      href="/forgot-password"
                      className="text-sm text-emerald-600 hover:text-emerald-700 hover:underline transition-colors inline-block"
                    >
                      Esqueci minha senha
                    </Link>
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={isLoading}
                  className="w-full rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 px-6 py-3.5 font-semibold text-white shadow-md transition-all hover:shadow-lg hover:scale-[1.02] disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100 flex items-center justify-center gap-2"
                >
                  {isLoading ? (
                    <>
                      <Loader2 className="h-5 w-5 animate-spin" />
                      Entrando...
                    </>
                  ) : (
                    "Entrar"
                  )}
                </button>

                <div className="text-center pt-2">
                  <p className="text-sm text-emerald-700">
                    Não tem conta?{" "}
                    <button
                      type="button"
                      onClick={() => setShowCadastro(true)}
                      className="font-bold text-emerald-600 hover:text-emerald-700 hover:underline underline-offset-2 transition-colors"
                      disabled={isLoading}
                    >
                      Crie sua conta
                    </button>
                  </p>
                </div>
              </form>
            )}

            {showCadastro && (
              <form onSubmit={handleCadastro} className="space-y-5">
                {cadastroErrors.general && (
                  <div className="flex items-start gap-2 rounded-xl bg-red-50 p-3 border-2 border-red-200">
                    <AlertCircle className="h-5 w-5 text-red-600 flex-shrink-0 mt-0.5" />
                    <p className="text-sm text-red-700">{cadastroErrors.general}</p>
                  </div>
                )}

                <div>
                  <label htmlFor="cadastro-nome" className="mb-2 block text-sm font-semibold text-emerald-900">
                    Nome completo
                  </label>
                  <div className="relative">
                    <User className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-emerald-600" />
                    <input
                      id="cadastro-nome"
                      type="text"
                      value={cadastroNome}
                      onChange={(e) => {
                        setCadastroNome(e.target.value)
                        setCadastroErrors({ ...cadastroErrors, nome: undefined })
                      }}
                      className="w-full rounded-xl border-2 border-emerald-200 py-3 pl-11 pr-4 transition-all focus:border-emerald-400 focus:outline-none focus:ring-4 focus:ring-emerald-100"
                      placeholder="Seu nome completo"
                      disabled={isLoading}
                    />
                  </div>
                  {cadastroErrors.nome && <p className="mt-1 text-sm text-red-600">{cadastroErrors.nome}</p>}
                </div>

                <div>
                  <label htmlFor="cadastro-email" className="mb-2 block text-sm font-semibold text-emerald-900">
                    Email
                  </label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-emerald-600" />
                    <input
                      id="cadastro-email"
                      type="email"
                      value={cadastroEmail}
                      onChange={(e) => {
                        setCadastroEmail(e.target.value)
                        setCadastroErrors({ ...cadastroErrors, email: undefined })
                      }}
                      className="w-full rounded-xl border-2 border-emerald-200 py-3 pl-11 pr-4 transition-all focus:border-emerald-400 focus:outline-none focus:ring-4 focus:ring-emerald-100"
                      placeholder="seu@email.com"
                      disabled={isLoading}
                    />
                  </div>
                  {cadastroErrors.email && <p className="mt-1 text-sm text-red-600">{cadastroErrors.email}</p>}
                </div>

                <div>
                  <label htmlFor="cadastro-password" className="mb-2 block text-sm font-semibold text-emerald-900">
                    Senha
                  </label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-emerald-600" />
                    <input
                      id="cadastro-password"
                      type={showPassword ? "text" : "password"}
                      value={cadastroPassword}
                      onChange={(e) => {
                        setCadastroPassword(e.target.value)
                        setCadastroErrors({ ...cadastroErrors, password: undefined })
                      }}
                      className="w-full rounded-xl border-2 border-emerald-200 py-3 pl-11 pr-11 transition-all focus:border-emerald-400 focus:outline-none focus:ring-4 focus:ring-emerald-100"
                      placeholder="Mínimo 6 caracteres"
                      disabled={isLoading}
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-emerald-600 hover:text-emerald-700"
                      disabled={isLoading}
                    >
                      {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                    </button>
                  </div>
                  {cadastroErrors.password && <p className="mt-1 text-sm text-red-600">{cadastroErrors.password}</p>}
                </div>

                <div>
                  <label
                    htmlFor="cadastro-confirm-password"
                    className="mb-2 block text-sm font-semibold text-emerald-900"
                  >
                    Confirmar senha
                  </label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-emerald-600" />
                    <input
                      id="cadastro-confirm-password"
                      type={showConfirmPassword ? "text" : "password"}
                      value={cadastroConfirmPassword}
                      onChange={(e) => {
                        setCadastroConfirmPassword(e.target.value)
                        setCadastroErrors({ ...cadastroErrors, confirmPassword: undefined })
                      }}
                      className="w-full rounded-xl border-2 border-emerald-200 py-3 pl-11 pr-11 transition-all focus:border-emerald-400 focus:outline-none focus:ring-4 focus:ring-emerald-100"
                      placeholder="Digite a senha novamente"
                      disabled={isLoading}
                    />
                    <button
                      type="button"
                      onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-emerald-600 hover:text-emerald-700"
                      disabled={isLoading}
                    >
                      {showConfirmPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                    </button>
                  </div>
                  {cadastroErrors.confirmPassword && (
                    <p className="mt-1 text-sm text-red-600">{cadastroErrors.confirmPassword}</p>
                  )}
                </div>

                {/* ← ATUALIZADO: Checkbox com links reais para os termos */}
                <div>
                  <label className="flex items-start gap-2">
                    <input
                      type="checkbox"
                      checked={acceptTerms}
                      onChange={(e) => {
                        setAcceptTerms(e.target.checked)
                        setCadastroErrors({ ...cadastroErrors, terms: undefined })
                      }}
                      className="mt-0.5 h-4 w-4 rounded border-emerald-300 text-emerald-600 focus:ring-2 focus:ring-emerald-100"
                      disabled={isLoading}
                      required
                    />
                    <span className="text-sm text-emerald-700">
                      Li e aceito os{" "}
                      <Link 
                        href="/termos-de-uso" 
                        target="_blank"
                        rel="noopener noreferrer"
                        className="font-semibold text-emerald-600 hover:underline"
                        onClick={(e) => e.stopPropagation()}
                      >
                        Termos de Uso
                      </Link>{" "}
                      e a{" "}
                      <Link 
                        href="/politica-de-privacidade" 
                        target="_blank"
                        rel="noopener noreferrer"
                        className="font-semibold text-emerald-600 hover:underline"
                        onClick={(e) => e.stopPropagation()}
                      >
                        Política de Privacidade
                      </Link>
                    </span>
                  </label>
                  {cadastroErrors.terms && (
                    <p className="mt-1 text-sm text-red-600">{cadastroErrors.terms}</p>
                  )}
                </div>

                <button
                  type="submit"
                  disabled={isLoading}
                  className="w-full rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 px-6 py-3.5 font-semibold text-white shadow-md transition-all hover:shadow-lg hover:scale-[1.02] disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100 flex items-center justify-center gap-2"
                >
                  {isLoading ? (
                    <>
                      <Loader2 className="h-5 w-5 animate-spin" />
                      Criando conta...
                    </>
                  ) : (
                    "Criar Conta"
                  )}
                </button>

                <div className="text-center pt-2">
                  <p className="text-sm text-emerald-700">
                    Já tem conta?{" "}
                    <button
                      type="button"
                      onClick={() => setShowCadastro(false)}
                      className="font-bold text-emerald-600 hover:text-emerald-700 hover:underline underline-offset-2 transition-colors"
                      disabled={isLoading}
                    >
                      Faça login
                    </button>
                  </p>
                </div>
              </form>
            )}
          </div>

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
