"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { useSubscription } from "@/lib/contexts/subscription-context"
import { createClient } from "@/lib/supabase/client"
import { MoreVertical, User, Crown, LogOut, Loader2 } from "lucide-react"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"

export function UserMenu() {
  const router = useRouter()
  const { userTier, user, profile, signOut, isMobile } = useSubscription()
  const [isLoggingOut, setIsLoggingOut] = useState(false)
  const [isOpeningPortal, setIsOpeningPortal] = useState(false)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    if (user !== undefined) {
      setIsLoading(false)
    }
  }, [user])

  const handleLogout = async () => {
    setIsLoggingOut(true)
    console.log("🚪 [USERMENU] Iniciando logout...")
    try {
      await signOut()
    } catch (error) {
      console.error("❌ [USERMENU] Erro ao sair:", error)
      alert("Erro ao sair. Tente novamente.")
    } finally {
      setIsLoggingOut(false)
    }
  }

  const handleOpenPortal = async () => {
    setIsOpeningPortal(true)
    console.log(`🔄 [PORTAL] Abrindo portal ${isMobile ? "(mobile)" : ""}...`)

    try {
      // Obter token de autenticação do Supabase
      const supabase = createClient()
      const {
        data: { session },
        error: sessionError,
      } = await supabase.auth.getSession()

      if (sessionError || !session?.access_token) {
        console.error("❌ [PORTAL] Erro ao obter sessão:", sessionError)
        alert("Você precisa estar logado para acessar o portal.")
        setIsOpeningPortal(false)
        return
      }

      console.log("🔑 [PORTAL] Token obtido, chamando API...")

      // Chamar API com token de autenticação
      const response = await fetch("/api/fix-portal", {
        method: "GET",
        headers: {
          Authorization: `Bearer ${session.access_token}`,
          "Content-Type": "application/json",
        },
      })

      // Verificar se a resposta tem conteúdo
      const responseText = await response.text()

      if (!responseText) {
        console.error("❌ [PORTAL] Resposta vazia da API")
        alert("Erro ao abrir portal: resposta vazia. Tente novamente.")
        setIsOpeningPortal(false)
        return
      }

      let data
      try {
        data = JSON.parse(responseText)
      } catch (parseError) {
        console.error("❌ [PORTAL] Erro ao parsear resposta:", responseText)
        alert("Erro ao abrir portal: resposta inválida. Tente novamente.")
        setIsOpeningPortal(false)
        return
      }

      if (!response.ok || !data.sucesso) {
        console.error("❌ [PORTAL] Erro na API:", data)
        alert("Erro ao abrir portal: " + (data.erro || "Tente novamente"))
        setIsOpeningPortal(false)
        return
      }

      if (data.portal_url) {
        console.log(`✅ [PORTAL] Redirecionando ${isMobile ? "(mobile)" : ""}...`)

        if (isMobile) {
          // Salvar tier antes de sair para verificar ao voltar
          sessionStorage.setItem("tier_before_portal", userTier)
          console.log("[PORTAL] Tier salvo antes de abrir portal:", userTier)
        }

        window.location.href = data.portal_url
      } else {
        console.error("❌ [PORTAL] URL não retornada:", data)
        alert("Erro ao abrir portal. Tente novamente.")
        setIsOpeningPortal(false)
      }
    } catch (error: any) {
      console.error("❌ [PORTAL] Exception:", error)
      alert("Erro ao abrir portal: " + (error.message || "Tente novamente"))
      setIsOpeningPortal(false)
    }
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-10 w-10">
        <Loader2 className="h-5 w-5 animate-spin text-emerald-600" />
      </div>
    )
  }

  if (!user) {
    console.log("[v0] UserMenu: Rendering login button")
    return (
      <a
        href="/login"
        className="flex items-center justify-center h-10 px-6 rounded-full bg-emerald-600 text-white shadow-lg transition-all hover:bg-emerald-700 hover:scale-105 text-sm font-semibold"
      >
        Entrar
      </a>
    )
  }

  console.log("[v0] UserMenu: Rendering menu dropdown")
  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <button
            className="flex items-center justify-center h-10 w-10 rounded-full bg-emerald-600 text-white shadow-lg transition-all hover:bg-emerald-700 hover:scale-105 focus:outline-none focus:ring-2 focus:ring-emerald-400 focus:ring-offset-2"
            aria-label="Menu do usuário"
          >
            <MoreVertical className="h-5 w-5" />
          </button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-56 bg-white border-emerald-200">
          <div className="px-3 py-2 border-b border-emerald-100">
            <p className="text-sm font-semibold text-emerald-900">{profile?.full_name || user?.email?.split("@")[0]}</p>
            <p className="text-xs text-emerald-600">{user?.email}</p>
            <p className="text-xs font-medium text-emerald-700 mt-1">
              Plano: {userTier === "premium" ? "Premium ⭐" : "Gratuito"}
            </p>
          </div>

          <DropdownMenuItem
            onClick={() => router.push("/perfil")}
            className="cursor-pointer focus:bg-emerald-50 focus:text-emerald-900"
          >
            <User className="h-4 w-4 mr-2" />
            Perfil
          </DropdownMenuItem>

          {userTier === "premium" && (
            <DropdownMenuItem
              onClick={handleOpenPortal}
              disabled={isOpeningPortal}
              className="cursor-pointer focus:bg-emerald-50 focus:text-emerald-900 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <Crown className="h-4 w-4 mr-2" />
              {isOpeningPortal ? "Abrindo..." : "Gerenciar Assinatura"}
            </DropdownMenuItem>
          )}

          <DropdownMenuItem
            onClick={(e) => {
              e.preventDefault()
              const email = "contato@essenceapp.com.br"
              const subject = "Suporte - Essence App"
              const body = "Olá, preciso de ajuda com:\n\n"
              const mailtoLink = `mailto:${email}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`

              // Criar link temporário e clicar nele (mais confiável no mobile)
              const link = document.createElement("a")
              link.href = mailtoLink
              link.target = "_blank"
              link.rel = "noopener noreferrer"
              document.body.appendChild(link)
              link.click()
              document.body.removeChild(link)
            }}
            className="cursor-pointer focus:bg-emerald-50 focus:text-emerald-900"
          >
            <span className="mr-2">📧</span>
            Enviar Feedback
          </DropdownMenuItem>

          <DropdownMenuItem
            onClick={() => {
              window.open("https://forms.gle/THLNB5jVAMKWPPge7", "_blank")
            }}
            className="cursor-pointer focus:bg-emerald-50 focus:text-emerald-900"
          >
            <span className="mr-2">⭐</span>
            Avaliar o App
          </DropdownMenuItem>

          <DropdownMenuSeparator className="bg-emerald-100" />

          <DropdownMenuItem
            onClick={handleLogout}
            disabled={isLoggingOut}
            className="cursor-pointer text-red-600 focus:bg-red-50 focus:text-red-700 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isLoggingOut ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Saindo...
              </>
            ) : (
              <>
                <LogOut className="h-4 w-4 mr-2" />
                Sair
              </>
            )}
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </>
  )
}
