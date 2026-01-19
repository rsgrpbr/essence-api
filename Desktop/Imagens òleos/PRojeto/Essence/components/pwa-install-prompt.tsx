"use client"

import { useState, useEffect } from "react"
import { Download, X, Share } from "lucide-react"

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>
  userChoice: Promise<{ outcome: "accepted" | "dismissed" }>
}

export function PWAInstallPrompt() {
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null)
  const [showInstallBanner, setShowInstallBanner] = useState(false)
  const [isInstalled, setIsInstalled] = useState(false)
  const [dismissed, setDismissed] = useState(false)
  const [isIOS, setIsIOS] = useState(false)

  useEffect(() => {
    const isStandalone = window.matchMedia("(display-mode: standalone)").matches
    const isIOSStandalone = (window.navigator as any).standalone === true
    const isAndroidApp = document.referrer.includes("android-app://")

    if (isStandalone || isIOSStandalone || isAndroidApp) {
      setIsInstalled(true)
      return
    }

    const wasDismissed = sessionStorage.getItem("pwa-install-dismissed")
    if (wasDismissed) {
      setDismissed(true)
      return
    }

    const iOS = /iPad|iPhone|iPod/.test(navigator.userAgent)
    setIsIOS(iOS)

    // Handler for Android/Desktop
    const handleBeforeInstallPrompt = (e: Event) => {
      e.preventDefault()
      setDeferredPrompt(e as BeforeInstallPromptEvent)
      setShowInstallBanner(true)
    }

    window.addEventListener("beforeinstallprompt", handleBeforeInstallPrompt)

    // For iOS, show banner after 3 seconds
    if (iOS && !isIOSStandalone) {
      const timer = setTimeout(() => {
        setShowInstallBanner(true)
      }, 3000)
      return () => clearTimeout(timer)
    }

    return () => {
      window.removeEventListener("beforeinstallprompt", handleBeforeInstallPrompt)
    }
  }, [])

  const handleInstallClick = async () => {
    if (!deferredPrompt) {
      // For iOS, already showing visual instructions, just return
      return
    }

    deferredPrompt.prompt()
    const { outcome } = await deferredPrompt.userChoice

    if (outcome === "accepted") {
      setShowInstallBanner(false)
      setIsInstalled(true)
    }

    setDeferredPrompt(null)
  }

  const handleDismiss = () => {
    setShowInstallBanner(false)
    setDismissed(true)
    sessionStorage.setItem("pwa-install-dismissed", "true")
  }

  if (isInstalled || !showInstallBanner || dismissed) {
    return null
  }

  return (
    <div className="fixed bottom-24 left-4 right-4 z-40 animate-in slide-in-from-bottom-5">
      <div className="mx-auto max-w-md bg-gradient-to-r from-emerald-600 to-teal-600 text-white rounded-2xl shadow-2xl p-4 border-2 border-emerald-400">
        <button
          onClick={handleDismiss}
          className="absolute top-2 right-2 p-1 hover:bg-white/20 rounded-full transition-colors"
          aria-label="Fechar"
        >
          <X className="w-4 h-4" />
        </button>

        <div className="flex items-center gap-4">
          <div className="flex-shrink-0 w-12 h-12 bg-white/20 backdrop-blur-sm rounded-xl flex items-center justify-center">
            <Download className="w-6 h-6" />
          </div>

          <div className="flex-1 min-w-0">
            <p className="font-bold text-sm mb-1">Instalar Essence App</p>
            <p className="text-xs text-emerald-50 line-clamp-2">
              Acesse rapidamente seus óleos essenciais direto da tela inicial!
            </p>
          </div>

          <button
            onClick={handleInstallClick}
            className="flex-shrink-0 bg-white text-emerald-700 px-4 py-2 rounded-xl font-bold text-sm hover:bg-emerald-50 transition-colors shadow-lg"
          >
            Instalar
          </button>
        </div>

        {isIOS && !deferredPrompt && (
          <div className="mt-4 pt-4 border-t border-white/20">
            <div className="flex items-start gap-3 text-xs text-emerald-50">
              <Share className="w-5 h-5 flex-shrink-0 mt-0.5" />
              <div>
                <p className="font-semibold mb-1">Para instalar no iOS:</p>
                <ol className="space-y-1 list-decimal list-inside">
                  <li>Toque no ícone Compartilhar (abaixo)</li>
                  <li>Role e toque em "Adicionar à Tela Inicial"</li>
                  <li>Confirme tocando em "Adicionar"</li>
                </ol>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
