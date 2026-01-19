"use client"

import { useRouter } from "next/navigation"
import { ArrowLeft } from "lucide-react"
import { Button } from "@/components/ui/button"
import { PhoneSettingsForm } from "@/components/phone-settings-form"
import { useSubscription } from "@/lib/contexts/subscription-context"
import { Loader2 } from "lucide-react"

export default function ConfiguracoesPage() {
  const router = useRouter()
  const { userTier, isLoading } = useSubscription()

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-stone-50 via-amber-50/50 to-emerald-50/30 pb-20">
        <div className="max-w-[600px] mx-auto px-4 py-8">
          <div className="flex items-center justify-center p-8">
            <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-stone-50 via-amber-50/50 to-emerald-50/30 pb-20">
      <div className="max-w-[600px] mx-auto px-4 py-8">
        <Button
          variant="ghost"
          onClick={() => router.back()}
          className="mb-6 text-emerald-700 hover:text-emerald-900 hover:bg-emerald-100/80"
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Voltar
        </Button>

        <PhoneSettingsForm userTier={userTier} />
      </div>
    </div>
  )
}
