"use client"

import type React from "react"

import { useState } from "react"
import type { useAlarms } from "@/hooks/use-alarms"
import { useToast } from "@/hooks/use-toast"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Sunrise, Moon, Settings, Loader2 } from "lucide-react"
import type { AlarmType } from "@/types/alarm.types"

interface AlarmFormProps {
  alarmsHook: ReturnType<typeof useAlarms>
}

const DAYS = [
  { label: "D", value: 0 },
  { label: "S", value: 1 },
  { label: "T", value: 2 },
  { label: "Q", value: 3 },
  { label: "Q", value: 4 },
  { label: "S", value: 5 },
  { label: "S", value: 6 },
]

const ALARM_TYPES = [
  { value: "morning" as AlarmType, label: "Manhã", icon: Sunrise, color: "text-orange-500" },
  { value: "night" as AlarmType, label: "Noite", icon: Moon, color: "text-indigo-500" },
  { value: "custom" as AlarmType, label: "Personalizado", icon: Settings, color: "text-purple-500" },
]

function getDefaultAlarmName(type: AlarmType, time: string): string {
  const names = {
    morning: "Despertar Energético",
    night: "Relaxamento Noturno",
    custom: `Alarme ${time}`,
  }
  return names[type] || `Alarme ${time}`
}

export function AlarmForm({ alarmsHook }: AlarmFormProps) {
  const [time, setTime] = useState("07:00")
  const [alarmName, setAlarmName] = useState("")
  const [alarmType, setAlarmType] = useState<AlarmType>("morning")
  const [selectedDays, setSelectedDays] = useState<number[]>([1, 2, 3, 4, 5])
  const [isSubmitting, setIsSubmitting] = useState(false)

  const { createAlarm, fetchAlarms } = alarmsHook
  const { toast } = useToast()

  const toggleDay = (day: number) => {
    setSelectedDays((prev) =>
      prev.includes(day) ? prev.filter((d) => d !== day) : [...prev, day].sort((a, b) => a - b),
    )
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    console.log("🟢 [FORM-1] Submit iniciado")
    console.log("🟢 [FORM-2] Valores do form:", { time, alarmName, alarmType, selectedDays })

    // Validate at least one day selected
    if (selectedDays.length === 0) {
      console.warn("⚠️ [FORM-3] Nenhum dia selecionado")
      toast({
        title: "Erro",
        description: "Selecione pelo menos um dia da semana",
        variant: "destructive",
      })
      return
    }

    setIsSubmitting(true)

    try {
      const payload = {
        time,
        days_of_week: selectedDays,
        alarm_type: alarmType,
        alarm_name: alarmName || null,
      }

      console.log("🟢 [FORM-4] Chamando createAlarm com:", payload)

      const result = await createAlarm(payload)

      console.log("🟢 [FORM-5] Resultado de createAlarm:", result)

      if (result.success) {
        console.log("✅ [FORM-6] Alarme criado com sucesso!")
        toast({
          title: "Alarme criado!",
          description: "Seu alarme aromático foi configurado com sucesso",
        })

        // Reset form
        setTime("07:00")
        setAlarmName("")
        setAlarmType("morning")
        setSelectedDays([1, 2, 3, 4, 5])

        // Refresh alarms list
        fetchAlarms()
      } else {
        console.error("❌ [FORM-7] Erro:", result.error)
        toast({
          title: "Erro ao criar alarme",
          description: result.error || "Tente novamente",
          variant: "destructive",
        })
      }
    } catch (error) {
      console.error("❌ [FORM-8] Exception:", error)
      toast({
        title: "Erro",
        description: "Ocorreu um erro inesperado",
        variant: "destructive",
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <Card className="w-full shadow-md">
      <CardHeader>
        <CardTitle className="text-2xl">Criar Alarme Aromático</CardTitle>
        <CardDescription>Configure um lembrete para usar seus óleos essenciais</CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Time Picker */}
          <div className="space-y-2">
            <Label htmlFor="time">Horário</Label>
            <Input
              id="time"
              type="time"
              value={time}
              onChange={(e) => setTime(e.target.value)}
              className="text-lg"
              required
            />
          </div>

          {/* Alarm Name */}
          <div className="space-y-2">
            <Label htmlFor="alarmName">Nome do alarme (opcional)</Label>
            <Input
              id="alarmName"
              type="text"
              placeholder="Ex: Despertar"
              value={alarmName}
              onChange={(e) => setAlarmName(e.target.value)}
              maxLength={50}
            />
          </div>

          {/* Type Selector */}
          <div className="space-y-3">
            <Label>Tipo de alarme</Label>
            <RadioGroup value={alarmType} onValueChange={(value) => setAlarmType(value as AlarmType)}>
              <div className="grid grid-cols-3 gap-2 sm:gap-3">
                {ALARM_TYPES.map(({ value, label, icon: Icon, color }) => (
                  <label key={value} className="relative cursor-pointer">
                    <RadioGroupItem value={value} id={value} className="sr-only" />
                    <div
                      className={`
                        flex flex-col items-center gap-2 p-2 sm:p-3 rounded-lg border-2 transition-all
                        ${
                          alarmType === value
                            ? "border-emerald-600 bg-emerald-50 shadow-sm"
                            : "border-stone-200 hover:border-emerald-300 hover:bg-stone-50"
                        }
                      `}
                    >
                      <Icon className={`w-5 h-5 sm:w-7 sm:h-7 ${color}`} />
                      <span className="font-medium text-xs sm:text-sm">{label}</span>
                    </div>
                  </label>
                ))}
              </div>
            </RadioGroup>
          </div>

          {/* Days Selector */}
          <div className="space-y-3">
            <Label>Dias da semana</Label>
            <div className="grid grid-cols-7 gap-1 sm:gap-1.5">
              {DAYS.map(({ label, value }) => (
                <button
                  key={value}
                  type="button"
                  onClick={() => toggleDay(value)}
                  className={`
                    aspect-square w-full rounded-full font-semibold transition-all text-sm sm:text-base
                    ${
                      selectedDays.includes(value)
                        ? "bg-gradient-to-br from-emerald-500 to-teal-600 text-white shadow-md scale-105"
                        : "bg-stone-200 text-stone-600 hover:bg-stone-300"
                    }
                  `}
                >
                  {label}
                </button>
              ))}
            </div>
            {selectedDays.length === 0 && (
              <p className="text-sm text-destructive text-center">Selecione pelo menos um dia</p>
            )}
          </div>

          {/* Submit Button */}
          <Button
            type="submit"
            disabled={isSubmitting || selectedDays.length === 0}
            className="w-full bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white font-semibold py-6 text-lg shadow-lg"
          >
            {isSubmitting ? (
              <>
                <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                Criando...
              </>
            ) : (
              "Criar Alarme"
            )}
          </Button>
        </form>
      </CardContent>
    </Card>
  )
}
