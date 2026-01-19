"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { createClient } from "@/lib/supabase/client"
import { useSubscription } from "@/lib/contexts/subscription-context"
import { ArrowLeft, User, Mail, Crown, Loader2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"

export function PerfilClient() {
  const router = useRouter()
  const { userTier, isLoading: tierLoading } = useSubscription()
  const [user, setUser] = useState<any>(null)
  const [profile, setProfile] = useState<any>(null)
  const [fullName, setFullName] = useState("")
  const [isLoading, setIsLoading] = useState(true)
  const [isSaving, setIsSaving] = useState(false)
  const [message, setMessage] = useState("")

  useEffect(() => {
    const supabase = createClient()

    supabase.auth.getUser().then(({ data: { user } }) => {
      if (!user) {
        router.push("/login")
        return
      }

      setUser(user)

      supabase
        .from("profiles")
        .select("*")
        .eq("id", user.id)
        .single()
        .then(({ data }) => {
          setProfile(data)
          setFullName(data?.full_name || "")
          setIsLoading(false)
        })
    })
  }, [router])

  const handleSave = async () => {
    if (!user) return

    setIsSaving(true)
    setMessage("")

    const supabase = createClient()
    const { error } = await supabase.from("profiles").update({ full_name: fullName }).eq("id", user.id)

    if (error) {
      setMessage("Erro ao salvar perfil")
    } else {
      setMessage("Perfil atualizado com sucesso!")
      setTimeout(() => setMessage(""), 3000)
    }

    setIsSaving(false)
  }

  if (isLoading || tierLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-teal-50 to-cyan-50 flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-emerald-600" />
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-teal-50 to-cyan-50 pb-20">
      <div className="max-w-2xl mx-auto px-4 py-8">
        <Button
          variant="ghost"
          onClick={() => router.back()}
          className="mb-6 text-emerald-700 hover:text-emerald-900 hover:bg-emerald-100"
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Voltar
        </Button>

        <div className="bg-white rounded-2xl shadow-lg p-6 border border-emerald-100">
          <div className="flex items-center gap-4 mb-6">
            <div className="h-16 w-16 rounded-full bg-gradient-to-br from-emerald-500 to-teal-600 flex items-center justify-center">
              <User className="h-8 w-8 text-white" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-emerald-900">Meu Perfil</h1>
              <p className="text-sm text-emerald-600">
                {userTier === "premium" ? "Plano Premium ⭐" : "Plano Gratuito"}
              </p>
            </div>
          </div>

          <div className="space-y-6">
            <div>
              <Label htmlFor="email" className="text-emerald-900 mb-2 block">
                Email
              </Label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-emerald-600" />
                <Input
                  id="email"
                  type="email"
                  value={user?.email || ""}
                  disabled
                  className="pl-10 bg-gray-50 border-emerald-200"
                />
              </div>
            </div>

            <div>
              <Label htmlFor="fullName" className="text-emerald-900 mb-2 block">
                Nome Completo
              </Label>
              <Input
                id="fullName"
                type="text"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                placeholder="Digite seu nome completo"
                className="border-emerald-200 focus:border-emerald-500"
              />
            </div>

            {message && (
              <div
                className={`p-3 rounded-lg text-sm ${
                  message.includes("sucesso") ? "bg-emerald-100 text-emerald-800" : "bg-red-100 text-red-800"
                }`}
              >
                {message}
              </div>
            )}

            <Button
              onClick={handleSave}
              disabled={isSaving}
              className="w-full bg-emerald-600 hover:bg-emerald-700 text-white"
            >
              {isSaving ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Salvando...
                </>
              ) : (
                "Salvar Alterações"
              )}
            </Button>
          </div>

          {userTier === "free" && (
            <div className="mt-8 p-4 bg-gradient-to-r from-amber-50 to-yellow-50 rounded-xl border border-amber-200">
              <div className="flex items-start gap-3">
                <Crown className="h-6 w-6 text-amber-600 mt-1 flex-shrink-0" />
                <div>
                  <h3 className="font-semibold text-amber-900 mb-1">Upgrade para Premium</h3>
                  <p className="text-sm text-amber-800 mb-3">
                    Tenha acesso ilimitado a todos os óleos essenciais e recursos exclusivos!
                  </p>
                  <Button
                    onClick={() => router.push("/?upgrade=true")}
                    className="bg-amber-600 hover:bg-amber-700 text-white"
                  >
                    Ver Planos
                  </Button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
