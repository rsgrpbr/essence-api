"use client"

import { useRouter } from "next/navigation"
import { ArrowLeft } from "lucide-react"
import { Button } from "@/components/ui/button"
import { AlarmForm } from "@/components/alarm-form"
import { AlarmList } from "@/components/alarm-list"
import { PendingTriggersModal } from "@/components/pending-triggers-modal"
import { useAlarms } from "@/hooks/use-alarms"

export default function AlarmesPage() {
  const router = useRouter()
  const alarmsHook = useAlarms()

  return (
    <div className="min-h-screen bg-gradient-to-br from-stone-50 via-amber-50/50 to-emerald-50/30 pb-20">
      <div className="max-w-[800px] mx-auto px-3 sm:px-6 py-6 sm:py-8">
        <Button
          variant="ghost"
          onClick={() => router.back()}
          className="mb-6 text-emerald-700 hover:text-emerald-900 hover:bg-emerald-100/80"
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Voltar
        </Button>

        <div className="space-y-6">
          {/* Alarm Form */}
          <div>
            <AlarmForm alarmsHook={alarmsHook} />
          </div>

          {/* Alarm List */}
          <div>
            <AlarmList alarmsHook={alarmsHook} />
          </div>
        </div>
      </div>

      {/* Pending Triggers Modal */}
      <PendingTriggersModal />
    </div>
  )
}
