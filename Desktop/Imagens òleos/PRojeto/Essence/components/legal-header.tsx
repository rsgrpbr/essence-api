"use client"

import { ArrowLeft } from "lucide-react"
import { useRouter } from "next/navigation"

export function LegalHeader() {
  const router = useRouter()

  return (
    <header className="sticky top-0 z-50 bg-white shadow-md">
      <div className="max-w-4xl mx-auto px-4 py-4 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-full bg-gradient-to-br from-emerald-500 to-teal-600 flex items-center justify-center">
            <span className="text-white font-bold text-lg">E</span>
          </div>
          <span className="font-semibold text-emerald-900 text-lg">Essence</span>
        </div>

        <button
          onClick={() => router.push("/login")}
          className="flex items-center gap-2 px-4 py-2 text-emerald-700 hover:text-emerald-900 hover:bg-emerald-50 rounded-lg transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Voltar</span>
        </button>
      </div>
    </header>
  )
}
