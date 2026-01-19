"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { usePhoneSettings } from "@/hooks/use-phone-settings"
import { toast } from "@/hooks/use-toast"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import { Button } from "@/components/ui/button"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Loader2, Phone, Lock, Info, Sparkles, Crown, ChevronDown, Lightbulb } from "lucide-react"

interface PhoneSettingsFormProps {
  userTier: "free" | "premium"
}

export function PhoneSettingsForm({ userTier }: PhoneSettingsFormProps) {
  const router = useRouter()
  const { phone, whatsappOptIn, loading, saving, savePhoneSettings } = usePhoneSettings()

  const [localPhone, setLocalPhone] = useState("")
  const [localOptIn, setLocalOptIn] = useState(false)
  const [hasChanges, setHasChanges] = useState(false)
  const [isFaqOpen, setIsFaqOpen] = useState(false)

  const isPremium = userTier === "premium"

  useEffect(() => {
    if (!loading && phone !== null) {
      const phoneWithoutPrefix = phone && phone.startsWith("+55") ? phone.slice(3) : phone || ""
      setLocalPhone(phoneWithoutPrefix)
      setLocalOptIn(whatsappOptIn)
    }
  }, [loading, phone, whatsappOptIn])

  useEffect(() => {
    const fullPhone = localPhone ? `+55${localPhone}` : ""
    const changed = fullPhone !== (phone || "") || localOptIn !== whatsappOptIn
    setHasChanges(changed)
  }, [localPhone, localOptIn, phone, whatsappOptIn])

  const handleSave = async () => {
    const fullPhone = localPhone ? `+55${localPhone}` : ""
    const result = await savePhoneSettings(fullPhone, localOptIn)

    if (result.success) {
      toast({
        title: "Configurações salvas",
        description: "Suas preferências de notificação foram atualizadas com sucesso.",
      })
      setHasChanges(false)
    } else {
      toast({
        title: "Erro ao salvar",
        description: result.error || "Não foi possível salvar as configurações. Tente novamente.",
        variant: "destructive",
      })
    }
  }

  const isPhoneEmpty = !localPhone.trim()

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    )
  }

  return (
    <Card className="w-full shadow-md">
      <CardHeader>
        <CardTitle className="text-2xl">Configurações de Telefone</CardTitle>
        <CardDescription>Configure seu telefone para receber notificações de alarmes aromáticos</CardDescription>
      </CardHeader>

      <CardContent className="p-6 space-y-6">
        {isPhoneEmpty && (
          <Alert className="border-amber-200 bg-amber-50">
            <Lightbulb className="h-4 w-4 text-amber-600" />
            <AlertDescription className="text-sm text-amber-900">
              Sem telefone cadastrado? Você não poderá receber notificações via WhatsApp
            </AlertDescription>
          </Alert>
        )}

        {!isPhoneEmpty && (
          <Alert className="border-emerald-200 bg-emerald-50">
            <Info className="h-4 w-4 text-emerald-600" />
            <AlertDescription className="text-sm text-emerald-900">
              {isPremium
                ? "Com Premium, receba sugestões de óleos via WhatsApp automaticamente!"
                : "Usuários Free recebem notificações no app mesmo sem telefone."}
            </AlertDescription>
          </Alert>
        )}

        <div className="space-y-2">
          <Label htmlFor="phone" className="text-base font-semibold">
            Telefone (opcional)
          </Label>
          <div className="flex items-center gap-2">
            <div className="flex items-center gap-2 px-3 h-12 bg-muted rounded-md border border-input">
              <Phone className="h-4 w-4 text-muted-foreground" />
              <span className="text-base font-medium text-foreground">+55</span>
            </div>
            <Input
              id="phone"
              type="tel"
              placeholder="11999999999"
              value={localPhone}
              onChange={(e) => {
                const value = e.target.value.replace(/\D/g, "")
                setLocalPhone(value)
              }}
              className="flex-1 h-12 text-base"
              disabled={saving}
              maxLength={11}
            />
          </div>
          <p className="text-sm text-muted-foreground">Digite apenas seu número: 11 99999-9999</p>
        </div>

        <div className="space-y-4">
          <div className="flex items-center justify-between rounded-lg border-2 border-gray-200 p-4 bg-gradient-to-r from-gray-50 to-white">
            <div className="flex-1 space-y-1">
              <div className="flex items-center gap-2">
                <Label htmlFor="whatsapp-opt-in" className="text-base font-semibold cursor-pointer">
                  Receber notificações no WhatsApp
                </Label>
                {!isPremium && <Lock className="h-4 w-4 text-amber-600" />}
              </div>
              <p className="text-xs text-muted-foreground">
                {isPhoneEmpty
                  ? "Adicione um telefone para habilitar esta opção"
                  : isPremium
                    ? "Receba sugestões de óleos direto no seu WhatsApp"
                    : "Exclusivo para assinantes Premium"}
              </p>
            </div>
            <Switch
              id="whatsapp-opt-in"
              checked={localOptIn}
              onCheckedChange={(checked) => setLocalOptIn(checked)}
              disabled={isPhoneEmpty || saving || !isPremium}
              className="data-[state=checked]:bg-emerald-600"
            />
          </div>

          {!isPremium && (
            <div className="rounded-lg border-2 border-amber-200 bg-gradient-to-br from-amber-50 to-yellow-100 p-5 space-y-3">
              <div className="flex items-start gap-3">
                <Crown className="h-6 w-6 text-amber-600 flex-shrink-0 mt-0.5" />
                <div className="space-y-2">
                  <h3 className="font-semibold text-amber-900">Desbloqueie notificações WhatsApp automáticas</h3>
                  <p className="text-sm text-amber-800">
                    Receba sugestões de óleos essenciais por mensagem todos os dias, direto no seu celular!
                  </p>
                </div>
              </div>
              <Button
                onClick={() => router.push("/checkout")}
                className="w-full bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white font-semibold shadow-lg"
              >
                <Sparkles className="mr-2 h-4 w-4" />
                Assinar Premium - R$ 14,90/mês
              </Button>
            </div>
          )}

          {isPremium && localOptIn && !isPhoneEmpty && (
            <Alert className="border-emerald-200 bg-emerald-50">
              <Info className="h-4 w-4 text-emerald-600" />
              <AlertDescription className="text-sm text-emerald-900">
                WhatsApp configurado com sucesso! Você receberá notificações automáticas.
              </AlertDescription>
            </Alert>
          )}
        </div>

        <div className="rounded-lg border-2 border-stone-200 bg-white overflow-hidden">
          <button
            onClick={() => setIsFaqOpen(!isFaqOpen)}
            className="w-full flex items-center justify-between p-4 hover:bg-stone-50 transition-colors"
          >
            <div className="flex items-center gap-2">
              <Info className="h-5 w-5 text-emerald-600" />
              <span className="font-semibold text-stone-900">Por que usar estas ferramentas?</span>
            </div>
            <ChevronDown className={`h-5 w-5 text-stone-600 transition-transform ${isFaqOpen ? "rotate-180" : ""}`} />
          </button>

          {isFaqOpen && (
            <div className="p-4 pt-0 space-y-3 text-sm text-stone-700">
              <div className="flex items-start gap-2">
                <span className="text-emerald-600 font-bold">•</span>
                <p>
                  <strong>Rastreie sensibilidades e alergias:</strong> Mantenha registro de óleos que funcionam bem para
                  você e evite reações indesejadas
                </p>
              </div>
              <div className="flex items-start gap-2">
                <span className="text-emerald-600 font-bold">•</span>
                <p>
                  <strong>Calculadora de diluição segura:</strong> Garanta dosagens corretas e seguras dos óleos
                  essenciais para sua pele
                </p>
              </div>
              <div className="flex items-start gap-2">
                <span className="text-emerald-600 font-bold">•</span>
                <p>
                  <strong>Alarmes personalizados:</strong> Crie lembretes automáticos para usar seus óleos nos momentos
                  certos do dia
                </p>
              </div>
              <div className="flex items-start gap-2">
                <span className="text-emerald-600 font-bold">•</span>
                <p>
                  <strong>Notificações inteligentes:</strong> Receba sugestões de óleos baseadas em seus objetivos e
                  preferências
                </p>
              </div>
              <div className="flex items-start gap-2">
                <span className="text-emerald-600 font-bold">•</span>
                <p>
                  <strong>Biblioteca completa:</strong> Acesse informações detalhadas sobre benefícios, usos e
                  precauções de cada óleo
                </p>
              </div>
              <div className="flex items-start gap-2">
                <span className="text-emerald-600 font-bold">•</span>
                <p>
                  <strong>Controle seu bem-estar:</strong> Acompanhe sua jornada aromática de forma organizada e
                  eficiente
                </p>
              </div>
            </div>
          )}
        </div>

        <Button
          onClick={handleSave}
          disabled={saving || !hasChanges}
          className="w-full h-12 text-base font-semibold bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 transition-all shadow-lg"
        >
          {saving ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Salvando...
            </>
          ) : (
            "Salvar Configurações"
          )}
        </Button>

        {!hasChanges && !saving && (
          <p className="text-sm text-center text-muted-foreground">Nenhuma alteração pendente</p>
        )}
      </CardContent>
    </Card>
  )
}
