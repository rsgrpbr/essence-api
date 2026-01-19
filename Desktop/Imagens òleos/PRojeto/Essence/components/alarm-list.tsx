"use client"

import { useState } from "react"
import { useToast } from "@/hooks/use-toast"
import { Switch } from "@/components/ui/switch"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import { Skeleton } from "@/components/ui/skeleton"
import { Sunrise, Moon, Settings, Trash2, AlarmClock } from "lucide-react"
import type { useAlarms } from "@/hooks/use-alarms"

const DAYS_NAMES = ["Dom", "Seg", "Ter", "Qua", "Qui", "Sex", "Sáb"]

const TYPE_CONFIG = {
  morning: { label: "Manhã", icon: Sunrise, gradient: "from-amber-500 to-orange-500", borderColor: "border-amber-200" },
  night: { label: "Noite", icon: Moon, gradient: "from-indigo-500 to-purple-500", borderColor: "border-indigo-200" },
  custom: {
    label: "Personalizado",
    icon: Settings,
    gradient: "from-teal-500 to-cyan-500",
    borderColor: "border-teal-200",
  },
}

interface AlarmListProps {
  alarmsHook: ReturnType<typeof useAlarms>
}

export function AlarmList({ alarmsHook }: AlarmListProps) {
  const { alarms, loading, toggleAlarm, deleteAlarm } = alarmsHook
  const { toast } = useToast()
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [alarmToDelete, setAlarmToDelete] = useState<string | null>(null)

  const formatDays = (days: number[]) => {
    return days
      .sort((a, b) => a - b)
      .map((day) => DAYS_NAMES[day])
      .join(", ")
  }

  const handleToggle = async (id: string, enabled: boolean) => {
    const result = await toggleAlarm(id, enabled)
    if (result.success) {
      toast({
        title: enabled ? "Alarme ativado" : "Alarme desativado",
        description: enabled ? "Você receberá notificações neste horário." : "O alarme foi pausado.",
      })
    } else {
      toast({
        title: "Erro ao atualizar alarme",
        description: result.error || "Tente novamente.",
        variant: "destructive",
      })
    }
  }

  const handleDeleteClick = (id: string) => {
    setAlarmToDelete(id)
    setDeleteDialogOpen(true)
  }

  const handleDeleteConfirm = async () => {
    if (!alarmToDelete) return

    const result = await deleteAlarm(alarmToDelete)
    if (result.success) {
      toast({
        title: "Alarme excluído",
        description: "O alarme foi removido com sucesso.",
      })
    } else {
      toast({
        title: "Erro ao excluir alarme",
        description: result.error || "Tente novamente.",
        variant: "destructive",
      })
    }

    setDeleteDialogOpen(false)
    setAlarmToDelete(null)
  }

  // Loading state
  if (loading) {
    return (
      <div className="space-y-4">
        {[1, 2, 3].map((i) => (
          <Card key={i} className="p-6">
            <div className="flex items-center justify-between gap-4">
              <div className="flex-1 space-y-3">
                <Skeleton className="h-12 w-24" />
                <Skeleton className="h-4 w-32" />
                <Skeleton className="h-6 w-48" />
              </div>
              <div className="flex items-center gap-2">
                <Skeleton className="h-6 w-12" />
                <Skeleton className="h-10 w-10" />
              </div>
            </div>
          </Card>
        ))}
      </div>
    )
  }

  // Empty state
  if (alarms.length === 0) {
    return (
      <Card className="p-12">
        <div className="flex flex-col items-center gap-4 text-center">
          <div className="rounded-full bg-emerald-100 p-4">
            <AlarmClock className="h-8 w-8 text-emerald-600" />
          </div>
          <div>
            <h3 className="font-semibold text-lg mb-2">Nenhum alarme criado</h3>
            <p className="text-muted-foreground text-sm">Crie seu primeiro alarme aromático para começar!</p>
          </div>
        </div>
      </Card>
    )
  }

  // Alarm list
  return (
    <>
      <div className="space-y-4">
        {alarms.map((alarm) => {
          const config = TYPE_CONFIG[alarm.alarm_type]
          const Icon = config.icon

          return (
            <Card
              key={alarm.id}
              className={`
                p-4 sm:p-6 transition-all hover:shadow-lg border-2 ${config.borderColor}
                hover:border-opacity-100 border-opacity-50
              `}
            >
              <div className="flex items-start justify-between gap-3 sm:gap-4">
                {/* Left: Time, name, days, type */}
                <div className="flex-1 space-y-2 sm:space-y-3 min-w-0">
                  {/* Time */}
                  <div className="text-3xl sm:text-5xl font-bold tabular-nums text-foreground">
                    {alarm.time.slice(0, 5)}
                  </div>

                  {/* Name */}
                  {alarm.alarm_name && (
                    <div className="text-sm sm:text-base font-medium text-muted-foreground truncate">
                      {alarm.alarm_name}
                    </div>
                  )}

                  {/* Days chips */}
                  <div className="flex gap-1 sm:gap-1.5 flex-wrap">
                    {alarm.days_of_week.map((day) => (
                      <div
                        key={day}
                        className="text-xs px-2 sm:px-2.5 py-1 bg-emerald-100 text-emerald-700 rounded-full font-medium whitespace-nowrap"
                      >
                        {DAYS_NAMES[day]}
                      </div>
                    ))}
                  </div>

                  {/* Type badge */}
                  <div className="flex items-center gap-2">
                    <div
                      className={`bg-gradient-to-r ${config.gradient} text-white rounded-lg px-2.5 sm:px-3 py-1.5 flex items-center gap-1.5 sm:gap-2 text-xs sm:text-sm font-medium`}
                    >
                      <Icon className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
                      {config.label}
                    </div>
                  </div>
                </div>

                {/* Right: Switch and delete */}
                <div className="flex flex-col items-end gap-3 sm:gap-4 flex-shrink-0">
                  <Switch checked={alarm.enabled} onCheckedChange={(checked) => handleToggle(alarm.id, checked)} />
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => handleDeleteClick(alarm.id)}
                    className="text-destructive hover:text-destructive hover:bg-destructive/10 h-8 w-8 sm:h-10 sm:w-10"
                  >
                    <Trash2 className="h-4 w-4 sm:h-5 sm:w-5" />
                  </Button>
                </div>
              </div>
            </Card>
          )
        })}
      </div>

      {/* Delete confirmation dialog */}
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Excluir alarme?</AlertDialogTitle>
            <AlertDialogDescription>
              Esta ação não pode ser desfeita. O alarme será permanentemente removido.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDeleteConfirm}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Excluir
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  )
}
